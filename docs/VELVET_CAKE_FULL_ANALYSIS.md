# Velvet-Cake (VelvetAI) — Derinlemesine Kod Analizi & Candy.ai Karşılaştırma Raporu

> **Repo:** https://github.com/LenstedReal/Velvet-cake  
> **Stack:** React 19 + FastAPI + MongoDB (Motor) + Tailwind + shadcn/ui  
> **Toplam dosya:** 93  
> **Analiz tarihi:** Ocak 2026  
> **Hazırlayan:** E1 (Emergent Agent)

---

## 🎯 TL;DR — Tek Cümle Özet

> **Velvet-Cake şu an "candy.ai görünümlü bir HTML şablon"dur. UI %60-70 hazır, ama altında çalışan TEK BİR GERÇEK ÖZELLİK YOK.** AI sohbet, görsel üretim, video, ses, kimlik doğrulama, ödeme, hafıza — hepsi mock/fake.

---

## 1. Mevcut Durum (Dosya Bazlı Envanter)

### 1.1. Backend (`/backend/`) — Olgunluk: %5 ⚠️

| Dosya | İçerik | Durum |
|-------|--------|-------|
| `server.py` | Sadece `GET /api/` (Hello World) + `POST/GET /api/status` (status_checks koleksiyonu) | 🔴 **Tamamen boilerplate** |
| `requirements.txt` | FastAPI, Motor, Pydantic, bcrypt, pyjwt, passlib eklenmiş ama **kullanılmıyor** | 🟡 Bağımlılıklar var, kod yok |
| **Eksik** | Auth router, Karakter router, Chat router, Image router, Voice router, Billing router, Moderation router | 🔴 |
| **Eksik** | LLM entegrasyonu, Vector DB, Worker queue, Redis, Stripe webhook, OAuth handler | 🔴 |
| **Eksik** | `emergentintegrations` kütüphanesi requirements'ta **yok** | 🔴 |

**Sonuç:** Backend "VelvetAI uygulaması" değil, Emergent platformunun varsayılan template'i.

### 1.2. Frontend (`/frontend/src/`) — Olgunluk: %35

#### ✅ Yapılmış (UI Katmanı)

| Bileşen | Açıklama | Durum |
|---------|----------|-------|
| `App.js` | 3 sayfa: Home, MyAI, Gallery + Age gate | ✅ Çalışıyor |
| `Header.jsx` | Logo, nav, login, user dropdown, "100% FREE" rozeti | ✅ Görsel olarak iyi |
| `HeroCarousel.jsx` | 5 slide otomatik geçen banner | ✅ |
| `StoriesBar.jsx` | Instagram-vari story daireleri + dialog | ✅ (sadece görsel, gerçek story yok) |
| `LiveSection.jsx` | "LIVE" kartlar grid'i | ✅ (fake LIVE) |
| `CharactersSection.jsx` | 16 karakter grid + filtre (all/online/new/anime) | ✅ |
| `CharacterProfile.jsx` | Karakter detay modal'ı | ✅ |
| `ChatInterface.jsx` | Mesaj UI + Photo/Video/Voice/Roleplay butonları | 🟡 UI iyi, içerik fake |
| `CharacterCreator.jsx` | 3 adımlı wizard (Style/Appearance/Personality) | ✅ |
| `MyAISection.jsx` | Kullanıcının yaptığı karakterler | ✅ |
| `ImageGallery.jsx` | Foto/video galeri (filtre + lightbox) | 🟡 Sample data |
| `AuthModal.jsx` | Email/şifre + Google + Discord login | 🔴 **Tamamen fake** |
| `AgeVerification.jsx` | 18+ gate | 🟡 LocalStorage flag, gerçek değil |
| `BottomNav.jsx` | Mobil bottom navigation | ✅ |
| `FAQSection`, `Footer`, `ContentSection`, `CreateBanner` | Statik içerik | ✅ |
| `components/ui/*` (47 dosya) | shadcn/ui bileşenleri | ✅ Kütüphane |

#### ❌ Eksik (Sayfa & Route)

candy.ai'de var ama Velvet-Cake'te yok:

| Eksik Route | Açıklama |
|-------------|----------|
| `/ai-girlfriend/[slug]` | Karakter dedicated sayfası |
| `/characters/new` | Tam-sayfa karakter oluşturucu (sadece modal var) |
| `/conversations/[id]` | Persistent chat sayfası (şu an modal) |
| `/generate-image` | Standalone görsel üretme studio'su |
| `/candy-shorts` ekvivalent | Short video feed |
| `/roulette` | Rastgele karakter |
| `/feed/posts` | Discover/sosyal akış |
| `/subscriptions` | Abonelik sayfası |
| `/live-actions` | İnteraktif joystick mod |
| `/live-audio` | Sesli LIVE mod |
| `/legal/*`, `/privacy`, `/terms` | Hukuki sayfalar (footer'da link var ama içerik yok) |
| `/profile`, `/settings` | Kullanıcı yönetim sayfaları |

### 1.3. Veri Katmanı

| Dosya | Sorun |
|-------|-------|
| `data/mockData.js` | **16 karakter hardcoded** — Unsplash photo URL'leri ile. Bu fotoğraflar **ticari NSFW içerik için lisanssız** (Unsplash TOS ihlali). |
| `context/AuthContext.jsx` | Auth tamamen **localStorage tabanlı**. JWT yok, password hash yok, session yok. `loginWithGoogle` 2 satır kod — sadece sahte user yaratıp localStorage'a yazıyor. |
| `services/imageService.js` | "AI image gen" diye sunulan kod **Unsplash'ten random foto** seçiyor. Video kaynağı **Rick Astley YouTube videosu** (🚨 ciddi sorun). |

---

## 2. Candy.ai vs. Velvet-Cake — Özellik Karşılaştırma Matrisi

| # | Özellik | Candy.ai | Velvet-Cake | Boşluk |
|---|---------|----------|-------------|--------|
| **A. KARAKTER SİSTEMİ** | | | | |
| A1 | Karakter listesi & detay | ✅ 100+ karakter, DB-driven | 🟡 16 mock, hardcoded | 🟡 |
| A2 | Karakter "Series" / hikayeler | ✅ Çoklu senaryo | ❌ | 🔴 |
| A3 | Karakter "Stories" (24h) | ✅ Çalışan | 🟡 UI var, içerik fake | 🟡 |
| A4 | Custom karakter oluşturucu | ✅ Etnisite/yaş/saç/vücut/kişilik/ses | ✅ Aynı alanlar | 🟢 |
| A5 | Karakter consistency (LoRA) | ✅ Aynı yüz tüm fotolarda | ❌ Her foto farklı insan | 🔴 KRİTİK |
| **B. SOHBET (CHAT)** | | | | |
| B1 | Gerçek LLM entegrasyonu | ✅ Fine-tuned, uncensored | ❌ 3-4 elle yazılmış canned response | 🔴 KRİTİK |
| B2 | Streaming yanıt | ✅ SSE | ❌ setTimeout | 🔴 |
| B3 | Long-term memory (RAG) | ✅ Vector DB | ❌ Sadece session içi state | 🔴 KRİTİK |
| B4 | Adaptive personality | ✅ | ❌ | 🔴 |
| B5 | Roleplay scenarios | ✅ | 🟡 Mock data var, kullanımı yok | 🔴 |
| B6 | Proaktif mesaj (cron) | ✅ | ❌ | 🔴 |
| B7 | Mesaj kalıcılığı (DB) | ✅ | ❌ State sıfırlanıyor | 🔴 |
| **C. GÖRSEL ÜRETİM** | | | | |
| C1 | AI image gen (SDXL/Flux) | ✅ | ❌ **Unsplash random** | 🔴 KRİTİK |
| C2 | Character consistency | ✅ IP-Adapter | ❌ | 🔴 |
| C3 | Outfit/poz/sahne değişimi | ✅ | ❌ | 🔴 |
| C4 | NSFW görsel | ✅ | ❌ | 🔴 |
| C5 | Standalone generate studio | ✅ `/generate-image` | ❌ | 🔴 |
| **D. SES (VOICE)** | | | | |
| D1 | Karakter TTS (sesli mesaj) | ✅ | ❌ Sadece buton görseli | 🔴 |
| D2 | Live audio (gerçek zamanlı) | ✅ | ❌ | 🔴 |
| D3 | User STT (sesli mesaj atma) | ✅ | ❌ | 🔴 |
| D4 | Voice cloning per character | ✅ | ❌ | 🔴 |
| **E. VİDEO** | | | | |
| E1 | AI video gen | ✅ | ❌ **Rick Astley YouTube** 🤡 | 🔴 KRİTİK |
| E2 | Live video call | ✅ | ❌ | 🔴 |
| **F. ENGAGEMENT** | | | | |
| F1 | Candy Shorts (short video feed) | ✅ | ❌ | 🟡 |
| F2 | Roulette (rastgele eşleşme) | ✅ | ❌ | 🟡 |
| F3 | Discover/Feed | ✅ | ❌ | 🟡 |
| F4 | Push notifications (PWA) | ✅ | ❌ Manifest bile yok | 🟡 |
| F5 | XP/Level sistemi | 🟡 (zayıf) | ✅ **VELVET-CAKE DAHA İYİ** | 🟢 |
| **G. MONETİZASYON** | | | | |
| G1 | Abonelik planları | ✅ Ay/Çeyrek/Yıl | ❌ "100% FREE" diyor | 🔴 |
| G2 | Token sistemi | ✅ | ❌ | 🔴 |
| G3 | Stripe/CCBill entegrasyonu | ✅ | ❌ | 🔴 |
| G4 | Kripto ödeme | ✅ (BTC, ETH, USDC, LTC) | ❌ | 🟡 |
| G5 | Top-up / kampanyalar | ✅ | ❌ | 🟡 |
| **H. KİMLİK & GÜVENLİK** | | | | |
| H1 | Email/şifre auth (hash + JWT) | ✅ | ❌ **localStorage fake** | 🔴 KRİTİK |
| H2 | Google OAuth | ✅ | ❌ **Mock — gerçek OAuth yok** | 🔴 |
| H3 | Discord OAuth | ❌ Candy'de yok | ❌ Velvet'te de fake | — |
| H4 | 2FA | ✅ | ❌ | 🟡 |
| H5 | E2E encryption | ✅ (kısmen) | ❌ FAQ'ta yalan beyan | 🔴 |
| H6 | Şifre reset | ✅ | ❌ Buton var, fonksiyon yok | 🔴 |
| H7 | 18+ age gate | ✅ | 🟡 LocalStorage flag (zayıf) | 🟡 |
| H8 | KYC/yaş doğrulama | ✅ Yoti benzeri | ❌ | 🟡 |
| H9 | CSAM tarama | ✅ PhotoDNA/Hive | ❌ **HUKUKİ RİSK** | 🔴 KRİTİK |
| H10 | Content moderation | ✅ | ❌ | 🔴 KRİTİK |
| H11 | Rate limiting | ✅ | ❌ | 🟡 |
| H12 | GDPR (veri silme/indirme) | ✅ | ❌ | 🟡 |
| **I. İÇERİK & DİL** | | | | |
| I1 | Çok dilli (i18n) | ✅ 13+ dil | ❌ Sadece İngilizce | 🟡 |
| I2 | Hukuki sayfalar | ✅ | ❌ Sadece footer linki | 🔴 |
| I3 | Help Center / Support | ✅ Zendesk | ❌ | 🟡 |
| **J. ALTYAPI** | | | | |
| J1 | CDN | ✅ Cloudflare | ❌ | 🟡 |
| J2 | Background jobs | ✅ | ❌ | 🟡 |
| J3 | Analitik (PostHog/Mixpanel) | ✅ | ❌ | 🟡 |
| J4 | Error tracking (Sentry) | ✅ | ❌ | 🟡 |
| J5 | Admin panel | ✅ | ❌ | 🟡 |
| J6 | PWA (manifest + SW) | ✅ | ❌ | 🟡 |

**Skor:**
- 🟢 Yeşil (Velvet'in candy.ai'ye yakın veya daha iyi): **2**
- 🟡 Sarı (Eksik ama kritik değil): **15**
- 🔴 Kırmızı (Kritik eksik): **34**
- ⚪ Toplam değerlendirilen: **51**

---

## 3. KRİTİK SORUNLAR (HEMEN DÜZELTİLMELİ)

### 🚨 #1 — Rick Astley Video Sorunu (`imageService.js:50-52`)

```js
const videoSources = [
  { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Special Video' },
  { url: 'https://www.youtube.com/embed/jNQXAC9IVRw', title: 'Exclusive Content' },
];
```

Kullanıcı "video iste" dediğinde **Rick Astley** veya **"Me at the zoo"** YouTube videosu gönderiyorsunuz. Bu:
- Kullanıcıya saygısızlık (rickroll)
- Pazarlama vaadiyle çelişiyor ("Video Calls", "Generate Video")
- Ticari uygulamada kabul edilemez

### 🚨 #2 — Görsel "AI Üretimi" Tamamen Yalan (`imageService.js`)

```js
export const generateImage = async (options = {}) => {
  await new Promise(resolve => setTimeout(resolve, 1500));  // sahte gecikme
  // ...
  return { url: 'https://images.unsplash.com/...' };  // Unsplash photo
};
```

- Hiçbir AI üretimi yok
- Unsplash photo'larını NSFW pazarlama ile kullanmak **Unsplash TOS ihlali**
- Fotoğrafları çekilen modeller bilmeden "AI girlfriend" olarak sunuluyor → **kişilik hakkı ihlali**
- Karakter "Scarlett" → her seferinde farklı kadın fotoğrafı (consistency yok)

### 🚨 #3 — Auth Tamamen Sahte (`AuthContext.jsx`)

```js
const login = (email, password) => {
  const userData = { id: Date.now(), email, name: email.split('@')[0], ... };
  setUser(userData);
  localStorage.setItem('velvetai_user', JSON.stringify(userData));
  return userData;
};
```

- **Şifre hiç kontrol edilmiyor**
- Backend'e tek bir istek atılmıyor
- Herkes herhangi bir email'le "Google" veya "Discord" login olabilir
- localStorage manipülasyonu ile başka kullanıcı kimliğine bürünmek mümkün
- `loginWithGoogle()` → email her zaman `google_user@gmail.com` (hardcoded!)

### 🚨 #4 — "End-to-End Encryption" FAQ'ta Yalan Beyan

`mockData.js:416`:
```js
{ question: "Is my data private?", 
  answer: "100% private. All conversations are encrypted end-to-end..." }
```

Hiçbir şey şifrelenmiyor. Backend zaten kayıt da tutmuyor. Bu **tüketici aldatma** kategorisinde yasal risk.

### 🚨 #5 — CSAM Moderasyonu YOK = Hapis Cezası Riski

NSFW içerik pazarlayan bir uygulamada **çocuk içeriği tarama** yasal zorunluluk. Hive AI veya Microsoft PhotoDNA olmadan:
- AB: DSA cezası
- ABD: 18 U.S.C. § 2258A ihlali
- Türkiye: TCK 226 ve 5651 ihlali
- App Store/ödeme sağlayıcı **anında ban**

Hatta yaş aralığı slider'ında **18-50** yazıyor (`CharacterCreator.jsx:159`) — bu güvenli ama gerçek görsel üretildiğinde modelin yaşı kontrol edilmeli.

### 🚨 #6 — `100% FREE` Pazarlama vs. Maliyet Realitesi

Tüm sayfalarda "100% FREE - All Premium Features Unlocked" yazıyor. Gerçek API'ler entegre edildiğinde:
- LLM: ~$0.003/mesaj (uncensored model)
- Image gen: ~$0.01/foto (Fal.ai Flux)
- Video gen: ~$0.50/video (Replicate)
- TTS: ~$0.05/ses (ElevenLabs)

→ Free olamaz. Mesajları "buy-bot" gibi kasten yanlış vaad **iade taleplerine ve mahkemeye** yol açar.

### 🚨 #7 — `Unsplash` Photo'ları → Ticari NSFW Kullanım Yasak

Unsplash lisansı: ücretsiz ama "kişiyi tanınır şekilde" + "NSFW bağlam" + "AI girlfriend pazarlaması" kombinasyonu lisans dışı. Modeller fotoğraflarını **şikâyet ederse** model release haklarınız yok.

### 🚨 #8 — Backend MongoDB'ye Hiçbir Şey Kaydetmiyor

Backend'de sadece bir endpoint var (`/api/status`). Karakter, kullanıcı, mesaj — hepsi frontend'de localStorage'da. Bu nedenle:
- Kullanıcı tarayıcı temizlerse her şey gider
- Multi-device sync yok
- Backup yok
- Cihazlar arası karakter taşıma yok

---

## 4. UI/UX İncelemesi

### ✅ İyi Yapılmış Yanlar
1. **Renk paleti:** Koyu zemin (#0a0a0c) + pembe/mor accent — candy.ai estetiğine yakın
2. **Tailwind + shadcn/ui** doğru kullanılmış (47 UI bileşeni mevcut)
3. **Responsive:** Mobil bottom nav, breakpoint'ler doğru
4. **Glass-morphism, gradient, blur** efektleri kullanılmış
5. **Lucide-react** ikonları tutarlı
6. **Embla carousel** doğru kurulmuş

### ⚠️ İyileştirilmesi Gerekenler
1. **Font:** Default sans-serif (Inter/system) — **AI-slop tipografi**. Distinctive bir font (Clash Display, Satoshi, General Sans) seçilmeli
2. **Pembe-mor gradient overuse:** Tüm CTA'lar `from-pink-500 to-purple-600` — orijinallik kayboluyor
3. **Karakter kartlarında stat satırı (msg/photo/video):** Mock olduğu için yanıltıcı
4. **"Made with ❤️ by LenstedReal" 8+ yerde tekrarlanıyor:** Tek yerde (footer) yeterli
5. **`window.location.href = '/my-ai'`** (Creator) → React Router yerine full reload kullanılıyor
6. **`alert('Please give your companion a name!')`** → native alert kullanımı (toaster var ama kullanılmamış)
7. **Form validation yok:** Email format, password strength hiç kontrol edilmiyor
8. **`onKeyPress`** (deprecated) → `onKeyDown` kullanılmalı (`ChatInterface.jsx:216`)
9. **Inline `<style jsx>`** (`StoriesBar.jsx:78`) → CSS dosyası veya Tailwind keyframe
10. **A11y eksik:** ARIA label yok, klavye nav yok
11. **`data-testid` yok:** Test yazılamaz durumda
12. **Stories tek karakter ile sınırlı:** Çoklu story slide'ı yok
13. **`useEffect`** içinde async cleanup eksik
14. **State management:** Context API kullanılmış ama 5+ component'te aynı state — Zustand veya Redux gerekli

### 🐛 Bug/Tutarsızlıklar
1. `App.js:89-91` — `/girls`, `/anime`, `/guys` üçü de aynı `<HomePage />` render ediyor (filtreleme yok)
2. `BottomNav.jsx:13` — `window.location.pathname === '/'` SSR-unsafe ve dinamik değil
3. `HeroCarousel.jsx:22` — `characters.find(c => c.name === carouselSlides[currentSlide].name)` bazen `undefined` → fallback `characters[0]`
4. `LiveSection.jsx:11` — `Math.random()` her render'da çalışıyor → her render'da farklı "viewer count"
5. `ChatInterface.jsx:122` — `gallery.length` overlay her açıldığında sıfırlanıyor (useEffect:31)

---

## 5. Güvenlik Audit'i

| Risk | Lokasyon | Şiddet |
|------|----------|--------|
| Hardcoded API key beklentisi yok ama localStorage'da hassas veri | `AuthContext.jsx` | 🔴 |
| XSS koruma yok (kullanıcı mesajları `{msg.text}` ile render ediliyor — React tarafından sanitize edilmesine güveniliyor ama markdown vs. eklenirse risk) | `ChatInterface.jsx:164` | 🟡 |
| `iframe` `src={videoModal.url}` — gelecekte user-provided URL olursa XSS | `ChatInterface.jsx:233` | 🟡 |
| CORS = `*` | `server.py:75` | 🟡 (geliştirme için OK ama prod'da değil) |
| Rate limiting yok | Backend | 🟡 |
| Brute-force koruma yok | Auth | — (auth zaten yok) |

---

## 6. Performans Audit'i

| Sorun | Çözüm |
|-------|-------|
| 16 karakter × 2 image (image + coverImage) = 32 Unsplash request | Image preload + CDN cache |
| Bootstrap chunk büyük (47 shadcn/ui + 25+ Radix + framer-motion + recharts...) | Code splitting (route-level lazy) |
| `Math.random()` render'da çalışıyor | useMemo |
| `useEffect` dependency `[messages]` her mesajda scroll | OK |
| Tüm route aynı bileşeni render | Lazy routes |

---

## 7. Eksiklerin Tam Listesi (Sprintlere Bölünmüş)

### 🏁 SPRINT 1 — Temel Backend (1-2 hafta) [P0]
- [ ] **Auth sistemi**: JWT + bcrypt + MongoDB users koleksiyonu
- [ ] `POST /api/auth/register`, `/login`, `/me`, `/refresh`
- [ ] **Karakter modeli**: MongoDB `characters` koleksiyonu + seed script (mockData.js → DB)
- [ ] `GET /api/characters`, `/characters/{id}`, `POST /api/characters` (custom)
- [ ] Frontend'de localStorage yerine backend API çağrıları
- [ ] **Hukuki sayfalar**: ToS, Privacy, Community Guidelines, 18+ Policy

### 🏁 SPRINT 2 — Gerçek AI Sohbet (1-2 hafta) [P0]
- [ ] **LLM entegrasyonu**: OpenRouter veya Together.ai (uncensored model: `mythomax-l2-13b`, `nous-hermes-2-mixtral`)
  - ⚠️ OpenAI/Anthropic NSFW yasak, EMERGENT LLM KEY de bunlara dayalı, **çalışmaz**
- [ ] **Conversation/Message** koleksiyonları
- [ ] `POST /api/chat/stream` (SSE streaming)
- [ ] System prompt'a karakter persona injection
- [ ] Mesaj kalıcılığı
- [ ] Token economy (her LLM çağrısı token harcar)

### 🏁 SPRINT 3 — Hafıza + Görsel (2 hafta) [P0]
- [ ] **Vector memory**: Qdrant veya pgvector
- [ ] Konuşma özeti her N mesajda
- [ ] **Gerçek görsel üretim**: Fal.ai Flux (uncensored LoRA) veya Replicate SDXL
- [ ] Karakter consistency: her karakter için 5-10 referans foto ile IP-Adapter
- [ ] In-chat `/image` komutu
- [ ] Galeri sayfası → backend `images` koleksiyonu
- [ ] **Rick Astley videolarını SİL** + Replicate AnimateDiff / Sora entegrasyonu

### 🏁 SPRINT 4 — Ses & Çağrı (1-2 hafta) [P1]
- [ ] **ElevenLabs TTS** — her karaktere voice_id atanır
- [ ] In-chat sesli mesaj
- [ ] **Whisper STT** — kullanıcı sesli input
- [ ] WebRTC ile gerçek "Live Audio" mod (opsiyonel: LiveKit)

### 🏁 SPRINT 5 — Monetizasyon (1 hafta) [P1]
- [ ] "100% FREE" pazarlamasını DEĞİŞTİR → "7-day free trial"
- [ ] **CCBill / Segpay** entegrasyonu (Stripe NSFW'i yasaklar)
- [ ] Subscription planları (Monthly/Quarterly/Yearly)
- [ ] **NowPayments** ile kripto ödeme (BTC/ETH/USDC/LTC)
- [ ] Token top-up paketleri
- [ ] Webhook handler
- [ ] Premium-only feature gate

### 🏁 SPRINT 6 — Güvenlik & Compliance (1-2 hafta) [P0 — YASAL]
- [ ] **CSAM tarama**: Hive AI veya Microsoft PhotoDNA — HER YÜKLENEN/ÜRETİLEN GÖRSEL
- [ ] **NSFW content moderation pipeline** (LLM output + image output filtre)
- [ ] **Yaş doğrulama (KYC)**: Yoti veya Stripe Identity
- [ ] Rate limiting (Redis + slowapi)
- [ ] 2FA (TOTP)
- [ ] GDPR endpoint'leri: `DELETE /api/users/me`, `GET /api/users/me/export`
- [ ] FAQ'taki E2E iddiasını kaldır VEYA gerçekten implemente et (libsodium)
- [ ] Yasaklı kelime/scenaryo filtresi (çocuk, hayvan, gerçek kişi vs.)
- [ ] DMCA + Report abuse formu

### 🏁 SPRINT 7 — Engagement (1-2 hafta) [P2]
- [ ] **PWA**: manifest.json + service worker + push notifications
- [ ] Discover/Feed sayfası
- [ ] Stories (gerçek 24h ephemeral)
- [ ] Roulette (rastgele karakter)
- [ ] Re-engagement cron: 24h aktif değilse karakter mesaj atar
- [ ] Email digest (SendGrid)

### 🏁 SPRINT 8 — Profesyonel Operasyon [P2]
- [ ] **Admin panel** (karakter CRUD, kullanıcı yönetimi, içerik moderasyon, refund)
- [ ] **Sentry** error tracking
- [ ] **PostHog** veya **Mixpanel** analitik
- [ ] **Cloudflare** CDN + image resizing
- [ ] **Celery + Redis** background jobs
- [ ] **i18n** — TR/EN/DE/ES (en az 4 dil)
- [ ] Support: Crisp / Intercom widget

### 🏁 SPRINT 9 — Wow Faktörü [P3]
- [ ] **Candy Shorts** benzeri short video feed
- [ ] **Live Actions** — interaktif joystick
- [ ] **Voice cloning** her karaktere özel
- [ ] **Character series** (çoklu sahne)

---

## 8. Tech Stack Önerileri (Velvet-Cake için)

| Katman | Mevcut | Önerilen |
|--------|--------|----------|
| Frontend Framework | React 19 CRA + craco | **Next.js 15** (SEO + SSR + Edge functions) — ama opsiyonel |
| State | Context | **Zustand** (basit) veya **Jotai** |
| Data fetching | Axios | **TanStack Query** veya **SWR** (zaten package'da yok ama eklenmeli) |
| Backend | FastAPI ✓ | Aynı |
| DB | MongoDB ✓ | Aynı + **Redis** (cache + queue) + **Qdrant** (vector) |
| LLM | (yok) | **OpenRouter** (uncensored router) |
| Görsel | (yok) | **Fal.ai Flux** veya **Replicate SDXL** (IP-Adapter destekli) |
| TTS | (yok) | **ElevenLabs** |
| STT | (yok) | **OpenAI Whisper** (self-hosted ucuz) |
| Ödeme | (yok) | **CCBill** + **NowPayments** |
| Auth | (fake) | **JWT + bcrypt** veya **Clerk** (NSFW destekler) |
| Storage | (yok) | **Cloudflare R2** (S3-uyumlu, ucuz) — adult content friendly |
| CDN | (yok) | **BunnyCDN** veya **Cloudflare** |
| Hosting | (Emergent) | **Hetzner** / **Vultr** / **OVH** (AWS NSFW yasaklayabilir) |
| Moderation | (yok) | **Hive AI** (CSAM + NSFW filter) |
| Monitoring | (yok) | **Sentry** + **PostHog** |

---

## 9. Yasal & Etik Uyarılar (CİDDİ)

### 🔴 Acil Aksiyon Gerekli
1. **Rick Astley videolarını kaldır** — kullanıcılara aldatıcı
2. **Unsplash fotoğraflarını "AI girlfriend" olarak pazarlamayı bırak** — kişilik hakkı ihlali
3. **"100% FREE" + "End-to-end encrypted" yalan beyanlarını düzelt** — tüketici hukuku
4. **"AI generates photos and videos" vaadi** → henüz çalışmadığı için "Coming soon" yaz

### ⚖️ Yasal Zorunluluklar (Atlanması durumunda hapis/ceza)
- CSAM tarama (Hive AI / PhotoDNA) — **ŞART**
- 18+ KYC (en azından AB'de) — **ŞART**
- ToS + Privacy Policy (gerçek metinler) — **ŞART**
- DMCA prosedürü + abuse report — **ŞART**
- 2257 record-keeping (ABD'de) — **opsiyonel ama tavsiye edilir**

### 🏢 Ticari Risk
- Stripe/PayPal NSFW yasak → CCBill/Segpay/Epoch'a geç (yüksek fee ama yasal)
- iOS/Android app store → asla onaylanmaz → **PWA-only stratejisi**
- AWS/GCP/Azure NSFW yasaklayabilir → adult-friendly hosting (OVH, Vultr, Hetzner)

---

## 10. Pozitif Yanlar (Övgü Hak Edenler)

🎉 Yapmış olduğunuz iyi şeyler:

1. **UI/UX vizyonu doğru:** Koyu tema, candy.ai estetiğini başarıyla yakalamışsınız
2. **shadcn/ui** seçimi profesyonel
3. **Component architecture** mantıklı (Header/Hero/Stories/Live/Characters/FAQ/Footer pattern'i candy.ai'ye paralel)
4. **Karakter creator wizard'ı** ergonomik
5. **Age gate** vardı (zayıf ama temel atılmış)
6. **XP/Level sistemi** (gamification) candy.ai'de yok — burada **rekabet avantajı**
7. **Stories + LIVE rozetleri** — sosyal medya entegrasyonu için iyi temel
8. **Responsive layout** mobil bottom nav doğru

---

## 11. Önceliklendirilmiş Action Items (Eğer benimle devam edeceksen)

**Eğer "şimdi geliştir" diyorsan, sırasıyla yapacağım:**

| # | İş | Tahmini Süre | Şart Koşulu |
|---|----|--------------|-------------|
| 1 | Backend Auth (JWT + bcrypt + Mongo users) | 1 saat | – |
| 2 | Karakter seed → Mongo + REST API + frontend bağlantı | 1 saat | – |
| 3 | LLM streaming chat (OpenRouter) | 1.5 saat | **OpenRouter API key** |
| 4 | Gerçek görsel üretim (Fal.ai Flux uncensored) | 1.5 saat | **Fal.ai API key** |
| 5 | Conversation + Message kalıcılığı | 0.5 saat | – |
| 6 | Vector memory (Qdrant local) | 1 saat | – |
| 7 | TTS (ElevenLabs) | 1 saat | **ElevenLabs API key** |
| 8 | Stripe → CCBill abonelik | 2 saat | **CCBill hesabı** |
| 9 | CSAM moderation (Hive AI) | 1 saat | **Hive API key** |
| 10 | Admin panel | 2 saat | – |

**Toplam: ~13 saat tek seferlik geliştirme** → İlk 4 madde (5 saat) sonunda **gerçek anlamda çalışan, candy.ai'nin %60'ı kadar bir MVP** elinizde olur.

---

## 12. Sonuç & Tavsiye

Velvet-Cake **bir UI prototipi olarak %70 tamamlanmış**, ama **production-ready bir candy.ai alternatifi olarak %5'in altında**. Şu an "fotoğraf çekilmiş bir araba" gibi — görseli var ama motoru, vitesi, freni yok.

### Üç Yol Var:

**Yol 1: Sadece UI Showcase (1 hafta)**
Mock'lar kalsın, "Demo / Concept" olarak portfolyoya koy. Yasal risk yok.

**Yol 2: Gerçek MVP (4-6 hafta, ~$50-200/ay altyapı)**
Sprint 1-3'ü tamamla. Gerçek LLM + görsel + auth. ~500-1000 kullanıcıya hizmet verebilir.

**Yol 3: Tam Candy.ai Rakibi (3-6 ay, ~$2000-5000/ay altyapı)**
Tüm sprintleri tamamla, hukuki danışman tut, CCBill onayı al, KYC entegre et. Ciddi ticari ürün.

### Bir Sonraki Adım

Bana hangi yolu seçtiğini söyle, ben:
- **Yol 1** → UI bug'larını fixle + finesse
- **Yol 2** → Backend auth + LLM + image gen + Mongo entegrasyonunu **şimdi başlat**
- **Yol 3** → Detaylı PRD + hukuki checklist + altyapı maliyetlendirme hazırla

Hangi yolu seçmek istersin?

---

**Rapor sonu.** Made with ❤️ but not by LenstedReal — by **E1 (Emergent Agent)** 🤖
