1. Depo: `npx create-next-app@latest` yerine bu iskeleti kullan.
2. `.env` dosyasını `.env.example`'dan oluştur, DATABASE_URL ve Upstash bilgilerini doldur.
3. `npm i`
4. `npx prisma migrate dev` → tablolar oluşur.
5. `npm run reindex` → ilk coin dizinini çek.
6. `npm run dev` → http://localhost:3000
7. Vercel'de `CRON_SECRET` ekle ve Scheduler ile günde 1 kez `POST /api/reindex` çağır.

> Hukuk: Ana sayfaya ve footer'a "Finansal tavsiye değildir" banner'ı, `/terms` ve `/privacy` sayfaları ekleyin. Sponsorlu/işbirliği içerikleri rozetleyin. Bot oyu/spam için rate limit + (ileride) cüzdanla giriş eklenebilir.