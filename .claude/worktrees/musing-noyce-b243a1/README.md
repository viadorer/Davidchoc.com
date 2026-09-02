# David Choc - Realitní agent

Osobní web realitního agenta Davida Choce.

## Tech Stack

- **Frontend**: Statické HTML/CSS/JS
- **Hosting**: Vercel (edge network)
- **CDN**: Cloudflare R2 pro média
- **API**: Vercel Serverless Functions
- **Analytics**: Google Analytics + Meta Pixel

## Struktura projektu

```
.
├── api/                    # Vercel Serverless funkce
│   └── contact.js         # Realvisor API endpoint
├── blog/                  # Blog sekce
│   ├── posts/            # Jednotlivé články
│   └── posts.json        # Blog data
├── common/               # Sdílené komponenty
│   ├── navbar.html
│   ├── footer.html
│   └── common.js
├── images/               # Lokální obrázky (fallback)
├── scripts/              # Utility skripty
│   ├── migrate-to-r2.js
│   └── update-media-paths.js
├── *.html               # HTML stránky
├── styles.css           # Globální styly
├── script.js            # Hlavní JS
└── vercel.json          # Vercel konfigurace
```

## Lokální vývoj

```bash
# Instalace závislostí
npm install

# Spuštění lokálního serveru
npx serve
# nebo
python3 -m http.server 8000
```

## Migrace médií

Všechna videa a obrázky jsou hostovány na Cloudflare R2 pro optimální výkon.

```bash
# Nahrát média do R2
npm run migrate:r2

# Aktualizovat cesty v HTML
npm run update:paths
```

## Deploy

```bash
# První deploy
vercel

# Production deploy
vercel --prod
```

## Environment Variables

Vytvořte `.env.local` soubor:

```env
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_ACCOUNT_ID="..."
R2_BUCKET_NAME="..."
R2_ENDPOINT="..."
R2_PUBLIC_URL="..."

REALVISOR_API_KEY="..."
REALVISOR_API_ENDPOINT="..."
```

## Kontaktní formulář

Formulář používá vlastní API endpoint `/api/contact`, který přeposílá data do Realvisor API.

## Dokumentace

Detailní migrační průvodce najdete v `MIGRATION.md`.

## Licence

© 2026 David Choc. All rights reserved.
