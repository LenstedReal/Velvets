"""
Sexy character portrait overrides — candy.ai CDN + curated lingerie/boudoir/model Pexels.
"""

CANDY_CDN = "https://cdn.candy.ai/cdn-cgi/image/format=webp,quality=90"

def px(pid, ext="jpeg"):
    return f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.{ext}?auto=compress&cs=tinysrgb&w=600&h=800"


IMAGE_OVERRIDES = {
    # Candy.ai CDN — top characters (real candy.ai promo images)
    "Solene":      f"{CANDY_CDN}/9048d2c4-2c1d-4d0c-91de-ed0efd67ded2",
    "Mona":        f"{CANDY_CDN}/5c72b813-b57c-4038-938e-a41d18204a90",
    "Emilia":      f"{CANDY_CDN}/58f9d498-aa83-4206-8f87-756d2ba2866c",
    "Amanda":      f"{CANDY_CDN}/126777d5-b6db-4094-b27c-ddcc5a581a3a",
    "Chloe":       f"{CANDY_CDN}/bd1c3259-a615-40d3-97ce-7db82bf43549",
    "Holly":       f"{CANDY_CDN}/4e427e45-a09e-473d-b907-42361d071afa",
    "Polina":      f"{CANDY_CDN}/0085917e-0082-4124-8bdd-5885890d26a2",
    "Darkangel666": f"{CANDY_CDN}/cde06f1c-b9f4-47a5-ab8e-bf479dff096c",
    "Dasha":       f"{CANDY_CDN}/0c84c76c-726b-419c-89ee-ff69e25c21d8",
    "Sanyae":      f"{CANDY_CDN}/a1516ee3-3eff-4ad3-a8b1-0ed300cb9988",
    "Sakura":      f"{CANDY_CDN}/b4c9ffa7-f57c-49d5-8fdf-dfd7de8c6e7a",
    "Yuki":        f"{CANDY_CDN}/f5843a19-d389-4f23-a9db-939cc374f5aa",
    "Hinata":      f"{CANDY_CDN}/26bf25f4-440c-4382-af34-06c1f0e39f1d",
    "Rias":        f"{CANDY_CDN}/10d89043-ec08-404d-b79a-ea4756ccecda",
    "Natasha":     f"{CANDY_CDN}/2e69ce28-99bf-40e6-bce1-c86507676f42",
    "Aria":        f"{CANDY_CDN}/66975aea-98f3-4447-a827-354c93137058",
    "Damien":      f"{CANDY_CDN}/0dff5f7e-84e4-42de-b826-027fdc10523b",
    "Alessandro":  f"{CANDY_CDN}/7a077393-e9df-4908-90dd-20bf011f370c",
    "Kai":         f"{CANDY_CDN}/ab3db2f2-c49e-494d-9efa-2ef019857c8e",
    "Elias":       f"{CANDY_CDN}/b317d894-9f5b-406c-805e-31b20194ed6e",
    "Victoria":    f"{CANDY_CDN}/e3769231-54e5-4333-9f0a-19ec47b56d1b",
    "Violet":      f"{CANDY_CDN}/460eb719-b01f-4b6e-9c82-406664b4af77",
    "Zara":        f"{CANDY_CDN}/4eaabf67-99b9-4bb2-b0c6-8bbbd4523428",
    "Jade":        px(7659571),

    # Sexy lingerie/boudoir Pexels for remaining characters
    "Scarlett":    px(6120554),   # confident woman in red lace lingerie
    "Raven":       px(11415285),  # woman in black lingerie on floor
    "Luna":        px(26761372),  # smiling brunette in bra
    "Isabella":    px(32286040),  # woman in red lingerie on bed
    "Katarina":    px(13111271),  # woman in pink lace lingerie
    "Mila":        px(16955583),  # studio portrait
    "Ember":       px(9162889),   # boudoir style
}


async def upgrade_character_images(db):
    updated = 0
    for name, url in IMAGE_OVERRIDES.items():
        res = await db.characters.update_many(
            {"name": name, "owner_id": None},
            {"$set": {"image": url, "cover_image": url}},
        )
        updated += res.modified_count
    return updated
