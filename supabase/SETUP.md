# Supabase Kurulum Rehberi

Bu adımları **Supabase web panelinde** yapacaksın. Kod tarafında ekstra bir şey gerekmiyor.

## 1. Proje oluştur
1. https://supabase.com adresine gir, ücretsiz hesap aç / giriş yap.
2. **New project** → bir isim ver (ör. `ingilizce-platform`).
3. **Database Password** oluştur ve bir yere kaydet (lazım olabilir).
4. Region: sana en yakın olanı seç (ör. Frankfurt / Central EU).
5. **Create new project** → kurulum ~1-2 dakika sürer.

## 2. API anahtarlarını .env dosyasına gir
1. Sol menüde **Project Settings** (dişli) → **API**.
2. Şu iki değeri kopyala:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
3. Projedeki `.env` dosyasını aç ve bu değerleri yapıştır:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
   > `anon` key tarayıcıda kullanılmak için güvenlidir (RLS onu koruyor). **service_role** key'i ASLA kullanma / paylaşma.

## 3. Tabloları ve güvenlik politikalarını oluştur
1. Sol menüde **SQL Editor** → **New query**.
2. `supabase/migrations/0001_initial_schema.sql` dosyasının **tamamını** kopyala, editöre yapıştır.
3. Sağ altta **Run** (veya Ctrl+Enter).
4. "Success. No rows returned" görürsen tamamdır.

## 4. Doğrulama
- **Table Editor**'de `flashcards`, `materials`, `daily_stats`, `quiz_results` tablolarını görmelisin.
- Her tablonun yanında **RLS enabled** (kilit ikonu) yazmalı.
- **Authentication → Policies** altında her tablo için 4 politika (select/insert/update/delete) görünmeli.

## 5. E-posta doğrulamasını kapat (opsiyonel, geliştirme kolaylığı)
Kişisel/geliştirme kullanımında e-posta onayını beklememek için:
1. **Authentication → Sign In / Providers → Email**.
2. **Confirm email** seçeneğini **kapat** (böylece kayıt olur olmaz giriş yapabilirsin).
3. Üretime geçerken tekrar açman önerilir.

---

Bu adımları bitirince kodda auth ekranları (Stage 3) devreye girecek ve gerçek kayıt/giriş çalışacak.
