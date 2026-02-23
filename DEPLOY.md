# Deployment Guide - Vercel

## Quick Deploy

```bash
# 1. Nainstaluj Vercel CLI (pokud ještě nemáš)
npm install -g vercel

# 2. Login do Vercel
vercel login

# 3. První deploy (vytvoří projekt)
vercel

# 4. Production deploy
vercel --prod
```

---

## Krok za krokem

### 1. Příprava před deployem

Zkontroluj, že máš:
- ✅ Všechna média nahraná v R2 (`npm run migrate:r2`)
- ✅ Cesty aktualizované v HTML (`npm run update:paths`)
- ✅ Duplicitní URL opraveny (`npm run fix:urls`)
- ✅ `.env.local` s R2 credentials
- ✅ Realvisor API klíč

### 2. První deploy

```bash
vercel
```

Průvodce se zeptá:
```
? Set up and deploy "~/Cascade projekty/Davidchoc.com"? [Y/n] y
? Which scope do you want to deploy to? [Vyber svůj účet]
? Link to existing project? [N/y] n
? What's your project's name? davidchoc-com
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

### 3. Nastavení Environment Variables

Přes Vercel Dashboard:

1. Otevři https://vercel.com/dashboard
2. Vyber projekt `davidchoc-com`
3. Settings → Environment Variables
4. Přidej:

```
REALVISOR_API_KEY = [tvůj-api-klíč]
```

**Nebo přes CLI:**

```bash
vercel env add REALVISOR_API_KEY
```

### 4. Production Deploy

```bash
vercel --prod
```

Vercel ti vrátí production URL, např:
```
✅  Production: https://davidchoc-com.vercel.app
```

### 5. Custom Domain

#### V Vercel Dashboard:

1. Project → Settings → Domains
2. Add Domain: `www.davidchoc.cz`
3. Zkopíruj CNAME hodnotu (např. `cname.vercel-dns.com`)

#### U registrátora domény:

1. Přihlaš se k DNS správě
2. **Smaž** starý CNAME na GitHub Pages:
   ```
   www CNAME viadorer.github.io
   ```
3. **Přidej** nový CNAME na Vercel:
   ```
   www CNAME cname.vercel-dns.com
   ```
4. Počkej 5-60 minut na propagaci DNS

#### Ověření:

```bash
# Zkontroluj DNS
dig www.davidchoc.cz CNAME

# Mělo by vrátit:
# www.davidchoc.cz. 300 IN CNAME cname.vercel-dns.com.
```

### 6. Automatický deploy z Gitu

Propoj Vercel s GitHub repozitářem:

1. Vercel Dashboard → Project → Settings → Git
2. Connect Git Repository
3. Vyber: `viadorer/Davidchoc.com`
4. Production Branch: `main`

**Od teď:**
- Každý push do `main` = automatický production deploy
- Každý pull request = preview deploy

---

## Continuous Deployment

### Workflow

```bash
# Lokální vývoj
git checkout -b feature/nova-funkce

# Proveď změny...
git add .
git commit -m "Přidána nová funkce"

# Push do GitHub
git push origin feature/nova-funkce

# Vercel automaticky vytvoří preview deploy
# URL: https://davidchoc-com-git-feature-nova-funkce.vercel.app

# Po schválení mergni do main
git checkout main
git merge feature/nova-funkce
git push origin main

# Vercel automaticky deployuje na production
# URL: https://www.davidchoc.cz
```

---

## Rollback

Pokud něco pokazíš:

### Přes Dashboard:
1. Vercel Dashboard → Deployments
2. Najdi předchozí funkční deploy
3. Klikni na "..." → Promote to Production

### Přes CLI:
```bash
# Zobraz seznam deployů
vercel ls

# Rollback na konkrétní deploy
vercel rollback [deployment-url]
```

---

## Monitoring

### Logs

```bash
# Real-time logs
vercel logs --follow

# Logs konkrétního deploye
vercel logs [deployment-url]
```

### Analytics

Vercel Dashboard → Analytics:
- Page views
- Top pages
- Devices
- Locations
- Performance metrics

---

## Troubleshooting

### Formulář nefunguje

```bash
# Zkontroluj logs
vercel logs --follow

# Zkontroluj env vars
vercel env ls
```

### Média se nenačítají

1. Zkontroluj R2 bucket v Cloudflare Dashboard
2. Ověř public URL: https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/
3. Zkontroluj CORS nastavení v R2

### 404 na stránkách

Zkontroluj `vercel.json` rewrites:
```json
{
  "rewrites": [
    { "source": "/", "destination": "/index.html" },
    { "source": "/blog", "destination": "/blog/index.html" }
  ]
}
```

---

## Performance Tips

### 1. Enable Vercel Analytics

```bash
npm install @vercel/analytics
```

V `index.html`:
```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

### 2. Edge Caching

Již nakonfigurováno v `vercel.json`:
- Statické assety: 1 rok cache
- HTML: revalidace při každém requestu

### 3. Compression

Vercel automaticky komprimuje:
- Brotli pro moderní browsery
- Gzip pro starší browsery

---

## Costs

**Hobby Plan (Zdarma):**
- ✅ 100GB bandwidth/měsíc
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Edge Network
- ✅ Serverless Functions (100GB-Hrs)

**Pro Plan ($20/měsíc):**
- 1TB bandwidth
- Advanced analytics
- Team collaboration
- Priority support

**Současný projekt:**
- Bandwidth: ~5-10GB/měsíc (odhad)
- **Hobby plan je dostatečný**
