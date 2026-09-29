# Candy.ai vs. Velvet-Cake — Kapsamlı Derinlemesine Analiz Raporu

> **Hazırlayan:** E1 (Emergent Agent)
> **Tarih:** Ocak 2026
> **Kapsam:** candy.ai özellik haritası + sizin projeniz için boşluk (gap) analizi + öncelikli yol haritası

---

## 0. Durum Tespiti (Önemli)

İki kritik nokta tespit ettim — bunlar olmadan "kod karşılaştırması" yapamam:

| # | Tespit | Detay |
|---|--------|-------|
| 1 | **GitHub repo erişilemez** | `https://github.com/LenstedReal/Velvet-cake` → **HTTP 404**. LenstedReal kullanıcısının public repo'ları: `banbansports`, `Just-marry-me`, `love-matrix`, `Mernis`, `Netcoordinate.dev`, `QuantumTerminal`, `Wormdemon`. **`Velvet-cake` adında public bir repo yok.** Muhtemelen `Private` veya isim farklı. |
| 2 | **/app çalışma alanı boş** | Sadece React + FastAPI "Hello World" boilerplate var (`App.js` tek `<a>` etiketi, `server.py` sadece `/api/status` endpoint'i). Velvet-Cake kodu burada yok. |

**Çözüm yolları (sizin aksiyonunuz):**
- (a) Repo'yu **Public** yapın → tekrar analiz edebilirim
- (b) Repo'nun `.zip` dosyasını yükleyin (chat'e sürükleyip bırakın)
- (c) Doğru repo adı / URL'sini paylaşın

Bu rapor, kod tarafını **henüz görmeden** candy.ai'nin tam özellik anatomisini ve sektör standartlarına göre tipik eksiklikleri içerir. Kod paylaşıldıktan sonra dosya-bazlı diff raporu çıkaracağım.

---

## 1. Candy.ai — Tam Anatomi (Frontend, Backend, AI, Ürün)

### 1.1. Üst Seviye Ürün Kimliği
- **Konum:** EverAI Limited (Malta) — yasal/finans Avrupa merkezli
- **Pazar:** AI Girlfriend / Boyfriend / Anime companion (NSFW dahil)
- **Discreet billing:** Banka ekstresinde nötr isim
- **Ödeme:** Visa, Mastercard + Kripto (BTC, ETH, USDC, Litecoin)
- **Diller:** EN/FR/DE/ES (full chat) + DA/FI/IT/JP/NL/NO/PL/PT-BR/SV (UI-only)
- **PWA:** Hem iOS hem Android için "Add to Home Screen" akışı
- **Hukuk:** GDPR uyumlu, end-to-end şifreleme, 2FA

### 1.2. Sayfa / Route Haritası

| Route | İşlev |
|-------|-------|
| `/` | Home — carousel, "New Experiences", live companions feed |
| `/ai-girlfriend` | Tüm kız karakterler listesi |
| `/ai-boyfriend` | Tüm erkek karakterler |
| `/ai-anime` | Anime karakter kategorisi |
| `/ai-girlfriend/[slug]` | Karakter detay sayfası (bio, foto, seri, live) |
| `/ai-girlfriend/[slug]/live-actions` | LIVE interaktif mod (joystick) |
| `/ai-girlfriend/[slug]/live-audio` | Sesli LIVE mod |
| `/characters/new` / `/characters/new2` | Karakter oluşturucu (create-your-AI) |
| `/characters` | Kullanıcının kendi yarattığı karakterler ("My AI") |
| `/conversations/[id]` | Chat ekranı (multimodal) |
| `/conversations/none` | Boş/yeni chat |
| `/generate-image` | Bağımsız AI görsel üretme studio'su |
| `/collection` | Galeri — üretilmiş tüm görseller/videolar |
| `/candy-shorts` | Kısa video feed'i (TikTok-vari) |
| `/roulette/plays` | "Candy Roulette" — rastgele karakterle eşleşme |
| `/feed/posts` | Discover/sosyal feed |
| `/subscriptions` | Plan satın alma |
| `/legal-information` | Hukuki |

### 1.3. Çekirdek Özellik Setleri

#### A. Karakter Sistemi
- **Hazır karakterler:** 100+ önceden tasarlanmış (kız/erkek/anime)
- **Karakter meta-verisi:** İsim, yaş, etnisite, kişilik tipi, hikaye/scenaryo (örn: "Your rebellious stepsister...")
- **Series:** Bazı karakterlerin senaryo-tabanlı çoklu hikaye serileri var
- **Custom Builder:** Etnisite, yaş, göz rengi, saç stili+rengi, vücut özellikleri, kişilik, ses, hobi seçimleri
- **NEW rozeti:** Yeni karakterler için
- **LIVE rozeti:** Online interaktif karakterler

#### B. Sohbet (Chat) Sistemi
- **Memory:** Kullanıcı tercihlerini, hikayeleri, tonunu hatırlar
- **Adaptive personality:** Konuşma stilinize göre evrim
- **Roleplay:** Çoklu senaryo, dinamik adaptasyon
- **Token sistemi:** Her mesaj/resim/ses/video token harcar
- **Multimodal cevap:** AI metin + resim + ses + video gönderebiliyor

#### C. Görsel Üretimi
- **In-chat:** "Bana selfie at" / "bikinili foto" → karakterin tutarlı yüzüyle görsel
- **Generate Image studio:** Prompt'la bağımsız üretim
- **Outfit/poz/background değiştirme:** Karakter sabit, sahne değişiyor
- **Character consistency:** LoRA/embedding tabanlı (muhtemelen Stable Diffusion XL + IP-Adapter veya Flux)

#### D. Ses (Voice)
- **Voice notes:** Karakter sesli mesaj gönderiyor
- **Live audio:** Gerçek zamanlı sesli konuşma modu
- **Ses seçenekleri:** Yumuşak, güvenli, kalın vs. (TTS — ElevenLabs benzeri)

#### E. Video
- **AI video üretimi:** Karakter hareket eden, tepki veren video
- **In-conversation:** Sohbet sırasında video yanıt

#### F. Yeni Deneyimler
- **Candy Shorts:** TikTok-vari NSFW kısa video feed'i
- **Candy Roulette:** Random karakterle eşleşme (Omegle ruhu)
- **Live Actions:** Joystick ile karaktere yön verme (etkileşimli sahneler)
- **Stories:** Karakterler "story" atıyor (Instagram-vari)

#### G. Sosyal / Discover
- **Feed/posts:** Discover sekmesi, karakterlerin post'ları
- **Profile Name + zaman damgası:** Sosyal medya tarzı

#### H. Monetizasyon
- **7-günlük free trial**
- **Aylık / Çeyreklik / Yıllık** abonelik
- **Token top-up:** Ekstra token satın alma
- **Premium rozet:** UI'da Premium butonu
- **Promotions:** Indirim/kampanya banner'ları

#### I. Güvenlik / Yasal
- **GDPR**
- **End-to-end encryption** (mesajlaşmada)
- **2FA**
- **Discreet billing**
- **Community Guidelines:** Belirli sınırlar (child safety vb.)
- **Geo-blocking:** Bazı ülkeler

#### J. Bildirim / Engagement
- **PWA Push Notifications:** Yeni mesaj, yeni özellik, kampanya
- **Re-engagement:** Karakter kendiliğinden mesaj atabiliyor

### 1.4. Teknik Stack Tahmini (Public sinyallere göre)

| Katman | Tahmin |
|--------|--------|
| Frontend | **Ruby on Rails + Stimulus/Hotwire** (asset url'lerinde `.svg-{hash}` ve Rails fingerprint pattern'i belirgin) — bazı görünümler React/Vue olabilir |
| CDN | Cloudflare (`cdn.candy.ai/cdn-cgi/image/...` — Cloudflare Image Resizing) |
| LLM | Karma — muhtemelen fine-tuned LLaMA/Mixtral veya OpenRouter üzerinden uncensored modeller (NSFW olduğu için OpenAI/Anthropic değil) |
| Görsel | Stable Diffusion XL veya Flux + IP-Adapter/LoRA (karakter tutarlılığı için) |
| Video | AnimateDiff / SVD / Sora-tarzı modeller |
| Ses | ElevenLabs benzeri TTS (veya self-hosted XTTS-v2) |
| Ödeme | Stripe + Coinbase Commerce / NowPayments (kripto) |
| Destek | Zendesk |
| Analitik | Muhtemelen Mixpanel/Amplitude |

---

## 2. Sektör Standardı AI-Companion Mimarisi (Velvet-Cake için referans)

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                     │
│  Home │ Discover │ Chat │ Create │ Gallery │ Subscriptions    │
└────────────┬─────────────────────────────────────┬───────────┘
             │                                     │
             │ REST + SSE/WebSocket                │
             │                                     │
┌────────────▼─────────────┐   ┌───────────────────▼──────────┐
│   API Gateway (FastAPI)  │   │   Realtime (WebSocket/SSE)   │
│   Auth │ Users │ Billing │   │   Chat stream │ Voice stream │
└────────────┬─────────────┘   └────────────┬─────────────────┘
             │                              │
   ┌─────────┼──────────────────────────────┼──────────┐
   │         │                              │          │
┌──▼──┐  ┌──▼──────┐  ┌────────────┐  ┌────▼──────┐  ┌▼────────┐
│ DB  │  │ Vector  │  │   LLM      │  │ Image Gen │  │ TTS/STT │
│Mongo│  │ (Qdrant)│  │ Provider   │  │ (SDXL/Flux)│  │(ElevenLabs)│
└─────┘  └─────────┘  └────────────┘  └───────────┘  └─────────┘
             ▲                              ▲
             │                              │
       (Long-term memory)            (LoRA / IP-Adapter
        per-character +                per character)
        per-user)
```

---

## 3. Velvet-Cake — Tahmini Eksiklikler (Sektör Karşılaştırması)

Repo'nuzu görmeden bile, candy.ai seviyesine ulaşmak için **mutlaka olması gereken** özellikleri 5 olgunluk seviyesine ayırdım. Kodu paylaşırsanız hangilerinin var/yok olduğunu işaretlerim.

### Seviye 0 — MVP Temeli
- [ ] Kullanıcı kayıt/giriş (email + şifre, opsiyonel Google OAuth)
- [ ] JWT veya session-based auth
- [ ] Şifre reset
- [ ] Yaş doğrulama (NSFW için zorunlu — 18+ gate)
- [ ] Kullanım şartları + onay checkbox'ları
- [ ] Temel kullanıcı profili (avatar, görünen ad)

### Seviye 1 — Karakter & Sohbet Çekirdeği
- [ ] Karakter veri modeli (name, age, ethnicity, personality, bio, system_prompt, avatar_url, gallery_urls, tags)
- [ ] Önceden tanımlı karakter seed'i (10–30 hazır karakter)
- [ ] Karakter kart grid + detay sayfası
- [ ] Karakter detayında: bio, foto galerisi, "Chat with me" CTA
- [ ] Chat ekranı (mesaj listesi, input, gönder)
- [ ] Mesaj kalıcılığı (DB'de conversation + messages koleksiyonu)
- [ ] LLM entegrasyonu (uncensored: OpenRouter/Together/Replicate — **NOT:** OpenAI/Anthropic NSFW yasaklı)
- [ ] System prompt'a karakter persona'sı enjekte etme
- [ ] Streaming yanıt (SSE/WebSocket)
- [ ] Mesaj limit'i (free vs. premium)

### Seviye 2 — Hafıza & Kişiselleştirme
- [ ] Konuşma özeti (her N mesajda LLM ile özet üret → context'e ekle)
- [ ] Vektör DB ile long-term memory (Qdrant/Pinecone/pgvector)
- [ ] Kullanıcı tercihlerini extract eden "memory extractor" agent
- [ ] Karakter mood/affection state machine ("affection_score": 0–100)
- [ ] Önceki sohbete dayalı proaktif mesaj (cron job — "kullanıcı 24 saat yoksa mesaj at")

### Seviye 3 — Multimodal İçerik
- [ ] Görsel üretim (Replicate/Fal.ai → SDXL veya Flux)
- [ ] Karakter consistency: her karakter için LoRA veya IP-Adapter referans foto seti
- [ ] In-chat "/image" komutu veya butonu → karakterin selfie/sahnesi
- [ ] Galeri sayfası (kullanıcının ürettiği tüm görseller)
- [ ] Görsel için ekstra token harcaması
- [ ] TTS — karakter sesli mesaj (ElevenLabs Voice ID per character)
- [ ] STT — kullanıcı sesli mesaj atabilsin
- [ ] Video üretim (opsiyonel — Replicate üzerinde Sora/SVD)
- [ ] NSFW görsel filtreleme/moderasyon (en azından çocuk/illegal içerik tespiti — CSAM tarayıcı zorunlu)

### Seviye 4 — Custom Karakter Oluşturucu
- [ ] Step-by-step wizard (Etnisite → Yaş → Göz → Saç → Vücut → Kişilik → Ses → Hobi → İsim)
- [ ] Her seçimde anlık önizleme görseli (SDXL ile)
- [ ] Karakter kaydetme, yeniden eğitme, paylaşma
- [ ] "My AI" — kullanıcının oluşturdukları sayfası
- [ ] Public/Private toggle

### Seviye 5 — Engagement & Monetizasyon
- [ ] Token ekonomisi (mesaj: 1, görsel: 10, video: 100, ses: 5 vb.)
- [ ] Subscription planları (Free trial / Monthly / Quarterly / Yearly)
- [ ] **Stripe entegrasyonu** (kart) — Türkiye için iyzico/Paddle alternatifi
- [ ] Kripto ödeme (Coinbase Commerce / NowPayments)
- [ ] **Discreet billing** — bank statement'ta nötr isim
- [ ] Top-up token paketleri
- [ ] Promo code / kampanya sistemi
- [ ] Email/push bildirim (re-engagement)
- [ ] PWA support (manifest.json + service worker)

### Seviye 6 — Sosyal & İleri Özellikler
- [ ] Discover/Feed sayfası (karakter post'ları, story'ler)
- [ ] Candy Shorts benzeri short video feed
- [ ] "Roulette" — rastgele karakter eşleşmesi
- [ ] Live Actions / Live Audio (gerçek zamanlı interaktif mod)
- [ ] Karakter "stories" (Instagram-vari, 24 saat)
- [ ] Çoklu dil desteği (i18n — en az TR/EN/DE/ES)
- [ ] Geo-detection + dil otomatik seçme

### Seviye 7 — Güvenlik & Compliance
- [ ] **18+ age gate** (zorunlu — eksikse Stripe hesabınız kapatılır)
- [ ] CSAM tarama (Microsoft PhotoDNA veya Hive AI) — **HUKUKİ ZORUNLULUK**
- [ ] Content moderation pipeline (her LLM output'u taranır)
- [ ] Rate limiting (DDoS + abuse koruması)
- [ ] GDPR — veri silme/indirme endpoint'leri
- [ ] 2FA
- [ ] End-to-end şifreleme (en azından at-rest)
- [ ] Terms of Service + Privacy Policy + Community Guidelines sayfaları
- [ ] Kayıt için DMCA / Report abuse formu
- [ ] Yasaklı kelime filtresi (çocuk, hayvan, reel kişi vs.)

### Seviye 8 — Operasyonel
- [ ] Admin panel (karakter ekle/sil, kullanıcı ban, içerik moderasyon)
- [ ] Analitik (PostHog/Mixpanel — funnel, retention, ARPU)
- [ ] Error tracking (Sentry)
- [ ] Loglama (structured logs)
- [ ] CDN (Cloudflare image resizing — candy.ai aynısını kullanıyor)
- [ ] Background job queue (Celery/BullMQ — görsel/video üretim async)
- [ ] Webhooks (Stripe payment success, refund)
- [ ] Customer support chat (Zendesk/Intercom/Crisp)

---

## 4. UI/UX Eksiklikleri (Tahmini — Sektör Karşılaştırması)

candy.ai'nin görsel dilini analiz ettim:

| UI Öğesi | candy.ai standardı | Velvet-Cake'te olması gereken |
|----------|---------------------|-------------------------------|
| Renk paleti | Koyu zemin (#0F0B14 tonları) + sıcak pembe/mor accent | Brand-specific bir koyu tema. Beyaz arka plan **kesinlikle olmamalı** (NSFW kategorisinin distinctive code'u koyu) |
| Tipografi | Custom display + sans-serif | Inter/Roboto **kullanmayın** — Satoshi, General Sans, Clash Display gibi distinctive font |
| Kart tasarımı | Portre orantısı (2:3), gradient overlay, name+age+tag chip | Senin de aynı formatta olmalı |
| Carousel | Snap scroll, sol/sağ ok, otomatik geçiş | Embla Carousel (zaten package.json'da var ✓) |
| Mobile nav | Bottom tab (Home, Discover, Create, Chat, Premium) | PWA için bottom nav şart |
| Loading | Skeleton + shimmer | NSFW görsel yüklenirken blur-up gerekli |
| Animasyon | Hover scale, fade-in, story playback | Framer Motion (zaten kurulu ✓) |
| Cursor | Custom (özellikle landing) | Distinctive cursor |
| Story preview | Instagram-vari daire avatar + halka | Gerekli |

---

## 5. Backend Mimari Eksiklikleri (Tahmini)

Eğer `/app` boilerplate'i baz alıyorsa muhtemel eksikler:

```python
# Olması gereken backend yapısı
/app/backend/
├── server.py              # Şu an sadece /api/status var → değiştirilmeli
├── core/
│   ├── config.py         # Settings (pydantic-settings)
│   ├── security.py       # JWT, password hashing
│   └── deps.py           # FastAPI dependencies
├── models/               # Pydantic + Mongo modelleri
│   ├── user.py
│   ├── character.py
│   ├── conversation.py
│   ├── message.py
│   ├── subscription.py
│   └── transaction.py
├── routers/
│   ├── auth.py           # /api/auth/register, /login, /reset
│   ├── users.py          # /api/users/me, profile
│   ├── characters.py     # /api/characters, /api/characters/{id}
│   ├── conversations.py  # /api/conversations (CRUD + stream)
│   ├── chat.py           # /api/chat/stream (SSE)
│   ├── images.py         # /api/images/generate
│   ├── voice.py          # /api/voice/tts, /stt
│   ├── billing.py        # /api/billing/checkout, /webhook
│   └── admin.py
├── services/
│   ├── llm_service.py    # OpenRouter/Together client
│   ├── image_service.py  # Fal.ai/Replicate client
│   ├── tts_service.py    # ElevenLabs client
│   ├── memory_service.py # Vector DB (Qdrant)
│   └── moderation.py     # CSAM + NSFW filter
├── workers/              # Celery tasks
│   ├── image_gen.py
│   └── video_gen.py
└── seed/
    └── characters.py     # 20–30 hazır karakter seed
```

**Şu anki /app/backend/server.py'de eksikler:**
- ❌ Auth endpoint'leri
- ❌ Karakter modeli/endpoint'i
- ❌ Conversation/Message modeli
- ❌ LLM entegrasyonu
- ❌ Streaming (SSE)
- ❌ Görsel üretim entegrasyonu
- ❌ Ses entegrasyonu
- ❌ Stripe/billing
- ❌ Rate limiting
- ❌ Vector memory
- ❌ Moderation

---

## 6. Frontend Mimari Eksiklikleri (Tahmini)

`/app/frontend/src/App.js` şu an sadece bir "Hello World" + GitHub avatar. Olması gereken:

```
/app/frontend/src/
├── App.js
├── pages/                  # Route bileşenleri
│   ├── Home.jsx
│   ├── Discover.jsx
│   ├── CharacterList.jsx
│   ├── CharacterDetail.jsx
│   ├── CharacterCreate.jsx
│   ├── Chat.jsx
│   ├── Gallery.jsx
│   ├── GenerateImage.jsx
│   ├── Subscriptions.jsx
│   ├── Profile.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── AgeGate.jsx
├── components/
│   ├── ui/                # zaten var ✓
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── BottomNav.jsx
│   ├── character/
│   │   ├── CharacterCard.jsx
│   │   ├── CharacterGrid.jsx
│   │   └── CharacterCarousel.jsx
│   ├── chat/
│   │   ├── MessageList.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── ChatInput.jsx
│   │   ├── TypingIndicator.jsx
│   │   └── VoicePlayer.jsx
│   ├── creator/           # Karakter oluşturucu wizard
│   │   ├── EthnicityStep.jsx
│   │   ├── HairStep.jsx
│   │   ├── BodyStep.jsx
│   │   └── PersonalityStep.jsx
│   └── billing/
│       ├── PricingCard.jsx
│       └── TokenBalance.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useChat.js          # SSE stream hook
│   ├── useCharacters.js    # SWR/React Query
│   └── useTokens.js
├── lib/
│   ├── api.js              # Axios instance + interceptor
│   ├── auth.js
│   └── analytics.js
└── store/                  # Zustand veya Context
    ├── authStore.js
    └── chatStore.js
```

---

## 7. Önceliklendirilmiş Yol Haritası (Velvet-Cake için)

### Sprint 1 — MVP (1–2 hafta)
1. 18+ Age gate + ToS
2. Auth (email/şifre + JWT)
3. Karakter veri modeli + 10 seed karakter
4. Karakter listesi + detay sayfası
5. Chat (LLM streaming) — OpenRouter (uncensored model)
6. Tasarım sistemi (koyu tema, distinctive font)

### Sprint 2 — Multimodal & Hafıza (1–2 hafta)
7. Görsel üretim (Fal.ai / Replicate — SDXL + IP-Adapter)
8. Galeri sayfası
9. Konuşma hafızası (Qdrant + özetleyici)
10. Token sistemi (free quota + limit)

### Sprint 3 — Monetizasyon (1 hafta)
11. Stripe abonelik + webhook
12. Token top-up
13. Premium gate'ler
14. Email bildirimleri

### Sprint 4 — Engagement (1–2 hafta)
15. TTS (ElevenLabs — karakter sesi)
16. Custom karakter wizard
17. PWA + push notification
18. Discover feed

### Sprint 5 — Compliance & Ölçeklendirme
19. CSAM tarama (Hive AI / PhotoDNA)
20. Content moderation pipeline
21. Admin panel
22. Sentry + analitik
23. Rate limiting + Cloudflare
24. i18n (TR/EN/DE)

### Sprint 6 — Wow Faktörü
25. Video üretim
26. Live Actions (interaktif)
27. Roulette
28. Stories
29. Candy Shorts-style feed

---

## 8. Kritik Risk Notları

| Risk | Açıklama | Çözüm |
|------|----------|-------|
| 🔴 **Ödeme sağlayıcı** | Stripe NSFW'i kategorik olarak yasaklar (TOS). İlk ihbarda hesap kapanır. | **CCBill, Segpay, Epoch, Paxum** veya kripto-only başlayın |
| 🔴 **LLM sağlayıcı** | OpenAI/Anthropic/Gemini NSFW içeriği yasaklar. Hesabınız ban olur. | **OpenRouter** üzerinden `mythomax`, `mlewd`, `nous-hermes` veya Together.ai uncensored modeller |
| 🔴 **Görsel sağlayıcı** | OpenAI gpt-image, Gemini Nano Banana NSFW yasaklı | **Fal.ai** (Flux uncensored LoRA'lar), **Replicate** (custom SDXL), self-hosted ComfyUI |
| 🔴 **CSAM yasal zorunluluk** | Çocuk içeriği için **hapis cezası** riski. | Hive AI / Microsoft PhotoDNA **DAY 1** entegrasyonu — opsiyonel değil |
| 🟡 **Hosting** | AWS/GCP/Azure NSFW'i ToS'ta yasaklayabilir | **OVH, Hetzner, Vultr, BunnyCDN** gibi adult-friendly sağlayıcılar |
| 🟡 **App store** | iOS/Android NSFW yasaklı → native app yok | **PWA-only** stratejisi (candy.ai da bunu yapıyor) |
| 🟡 **Yaş gate** | Sadece "I am 18+" checkbox yeterli değil | Yoti / Persona / Stripe Identity gibi KYC entegrasyonu (özellikle UK/AB) |

---

## 9. Sonraki Adımlar — Sizden Beklenenler

Tam dosya-bazlı analiz çıkarmam için:

1. **Velvet-Cake repo'sunu paylaşın** (Public yapın VEYA zip yükleyin VEYA doğru URL'yi verin)
2. Hangi seviyeden başlamak istediğinizi belirtin (Sprint 1'den mi, yoksa belirli bir özellikten mi?)
3. Integration tercihleri:
   - LLM: OpenRouter mı, Together.ai mi, self-hosted mı?
   - Görsel: Fal.ai mi, Replicate mi?
   - Ödeme: CCBill mi, Segpay mi, kripto-only mi?
   - TTS: ElevenLabs mı?

---

**Bu rapor, candy.ai'nin tam ürün dökümünü ve sektör best-practice'lerini içeriyor. Repo'yu paylaşırsanız bunu Velvet-Cake'in mevcut kodlarına karşı satır-satır eşleyip "şu dosyada şu fonksiyon eksik" seviyesinde teknik rapor çıkartırım.**
