"""
Postgres JSONB document store — drop-in replacement for the Motor API subset
used by server.py. Works with any Postgres (local, Neon on Vercel, Supabase).
"""
import json
import asyncpg

TABLES = ["users", "characters", "conversations", "messages", "media", "status_checks"]


class OpResult:
    def __init__(self, deleted=0, modified=0):
        self.deleted_count = deleted
        self.modified_count = modified


def _cond(flt: dict, args: list) -> str:
    parts = []
    for k, v in flt.items():
        if k == "$or":
            subs = ["(" + _cond(sub, args) + ")" for sub in v]
            parts.append("(" + " OR ".join(subs) + ")")
        elif v is None:
            parts.append(f"(data->'{k}' IS NULL OR data->'{k}' = 'null'::jsonb)")
        else:
            args.append(json.dumps({k: v}))
            parts.append(f"data @> ${len(args)}::jsonb")
    return " AND ".join(parts) if parts else "TRUE"


class Cursor:
    def __init__(self, db, table, flt):
        self._db, self._table, self._flt = db, table, flt
        self._sort, self._limit, self._skip = None, None, 0

    def sort(self, key, direction=1):
        self._sort = (key, direction)
        return self

    def limit(self, n):
        self._limit = n
        return self

    def skip(self, n):
        self._skip = n
        return self

    async def to_list(self, length):
        limit = self._limit if self._limit is not None else length
        args = []
        sql = f"SELECT data FROM {self._table} WHERE {_cond(self._flt, args)}"
        if self._sort:
            k, d = self._sort
            sql += f" ORDER BY data->>'{k}' {'ASC' if d >= 0 else 'DESC'}"
        sql += f" LIMIT {int(limit)} OFFSET {int(self._skip)}"
        rows = await self._db.pool.fetch(sql, *args)
        return [json.loads(r["data"]) for r in rows]


class Collection:
    def __init__(self, db, table):
        self._db, self._table = db, table

    def find(self, flt=None, projection=None):
        return Cursor(self._db, self._table, flt or {})

    async def find_one(self, flt=None, projection=None):
        rows = await self.find(flt).to_list(1)
        return rows[0] if rows else None

    async def insert_one(self, doc: dict):
        await self._db.pool.execute(
            f"INSERT INTO {self._table} (data) VALUES ($1::jsonb)", json.dumps(doc)
        )

    async def _update(self, flt, update):
        args = []
        where = _cond(flt, args)
        expr = "data"
        if "$set" in update:
            args.append(json.dumps(update["$set"]))
            expr = f"({expr} || ${len(args)}::jsonb)"
        for k, v in update.get("$inc", {}).items():
            args.append(v)
            expr = (
                f"jsonb_set({expr}, '{{{k}}}', "
                f"to_jsonb(COALESCE((data->>'{k}')::numeric, 0) + ${len(args)}::numeric))"
            )
        tag = await self._db.pool.execute(
            f"UPDATE {self._table} SET data = {expr} WHERE {where}", *args
        )
        return OpResult(modified=int(tag.split()[-1]))

    async def update_one(self, flt, update):
        return await self._update(flt, update)

    async def update_many(self, flt, update):
        return await self._update(flt, update)

    async def delete_one(self, flt):
        args = []
        where = _cond(flt, args)
        tag = await self._db.pool.execute(
            f"DELETE FROM {self._table} WHERE ctid IN "
            f"(SELECT ctid FROM {self._table} WHERE {where} LIMIT 1)", *args
        )
        return OpResult(deleted=int(tag.split()[-1]))

    async def delete_many(self, flt):
        args = []
        tag = await self._db.pool.execute(
            f"DELETE FROM {self._table} WHERE {_cond(flt, args)}", *args
        )
        return OpResult(deleted=int(tag.split()[-1]))

    async def count_documents(self, flt=None):
        args = []
        row = await self._db.pool.fetchrow(
            f"SELECT COUNT(*) AS c FROM {self._table} WHERE {_cond(flt or {}, args)}", *args
        )
        return row["c"]


class Database:
    def __init__(self, dsn: str):
        self._dsn = dsn
        self.pool = None

    async def connect(self):
        self.pool = await asyncpg.create_pool(self._dsn, min_size=1, max_size=5)
        async with self.pool.acquire() as conn:
            for t in TABLES:
                await conn.execute(
                    f"CREATE TABLE IF NOT EXISTS {t} (pk BIGSERIAL PRIMARY KEY, data JSONB NOT NULL)"
                )
                await conn.execute(
                    f"CREATE INDEX IF NOT EXISTS {t}_gin ON {t} USING GIN (data jsonb_path_ops)"
                )
                await conn.execute(
                    f"CREATE UNIQUE INDEX IF NOT EXISTS {t}_id_uniq ON {t} ((data->>'id'))"
                )

    async def close(self):
        if self.pool:
            await self.pool.close()

    def __getattr__(self, name):
        if name in TABLES:
            return Collection(self, name)
        raise AttributeError(name)
