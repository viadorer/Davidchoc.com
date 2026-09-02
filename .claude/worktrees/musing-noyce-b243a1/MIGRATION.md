# Migrace na Vercel + Cloudflare R2

## Přehled změn

### Před migrací
- **Hosting**: GitHub Pages (zdarma)
- **Média**: Hardcoded v repo (~159MB videa + obrázky)
- **Formulář**: ECM Widget (externí)

### Po migraci
- **Hosting**: Vercel (zdarma, edge network)
- **Média**: Cloudflare R2 + CDN
- **Formulář**: Vlastní API přes Vercel Serverless

---

## Krok za krokem

### 1. Instalace závislostí

```bash
npm install
```

### 2. Migrace médií do Cloudflare R2

```bash
npm run migrate:r2
```

Tento příkaz nahraje všechna videa a obrázky do R2 bucketu.

**Co se nahraje:**
- 3× MP4 videa (159MB) → `/videos/`
- Všechny AVIF obrázky → `/images/`
- Všechny PNG obrázky → `/images/`
- Blog obrázky → `/images/blog/`
- Steps obrázky → `/images/steps/`

### 3. Aktualizace cest v HTML souborech

```bash
npm run update:paths
```

Tento příkaz projde všechny HTML soubory a nahradí lokální cesty za R2 CDN URL.

**Příklad změny:**
```html
<!-- Před -->
<img src="davidchocagent.avif" alt="David Choc">

<!-- Po -->
<img src="https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/images/davidchocagent.avif" alt="David Choc">
```

### 4. Nastavení Realvisor API

V `.env.local` doplň svůj API klíč:

```env
REALVISOR_API_KEY="tvůj_api_klíč_zde"
```

**Poznámka**: Endpoint je již nastaven v `/api/contact.js` na:
- `https://api-production-88cf.up.railway.app/api/v1/public/api-leads/submit`
- Pipeline: `kontaktni-formu-87433` (kontaktní formulář)
- Pipeline: `newsletter-prih-96266` (newsletter)

### 5. Deploy na Vercel

#### První deploy (nový projekt)

```bash
npm install -g vercel
vercel
```

Postupuj podle průvodce:
1. Set up and deploy? **Yes**
2. Which scope? **Vyber svůj účet**
3. Link to existing project? **No**
4. Project name? **davidchoc-com** (nebo vlastní)
5. Directory? **./** (Enter)
6. Override settings? **No**

#### Nastavení environment variables

```bash
vercel env add REALVISOR_API_KEY
vercel env add REALVISOR_API_ENDPOINT
```

Nebo přes Vercel Dashboard:
1. Project Settings → Environment Variables
2. Přidej `REALVISOR_API_KEY` a `REALVISOR_API_ENDPOINT`

#### Production deploy

```bash
vercel --prod
```

### 6. Nastavení custom domény

V Vercel Dashboard:
1. Project → Settings → Domains
2. Přidej: **www.davidchoc.cz**
3. Zkopíruj CNAME hodnotu

V DNS (u registrátora domény):
1. Smaž starý CNAME na GitHub Pages
2. Přidej nový CNAME:
   - Name: `www`
   - Value: `cname.vercel-dns.com` (nebo hodnota z Vercelu)

### 7. Ověření

Zkontroluj:
- ✅ Stránka běží na www.davidchoc.cz
- ✅ Videa se načítají z R2 CDN (`https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/videos/`)
- ✅ Obrázky se načítají z R2 CDN (`https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/images/`)
- ✅ Kontaktní formulář se zobrazuje správně
- ✅ Formulář odesílá data do Realvisor API
- ✅ V Realvisor se vytváří nové leady
- ✅ HTTPS je aktivní
- ✅ Google Analytics funguje
- ✅ Facebook Pixel funguje

**Test formuláře:**
1. Otevři www.davidchoc.cz/#kontakt
2. Vyplň formulář
3. Odešli
4. Zkontroluj v Realvisor dashboard, zda se vytvořil nový lead
5. Zkontroluj browser console - neměly by být žádné chyby

---

## Cloudflare R2 Custom Domain (volitelné)

Pro vlastní doménu místo `pub-xxx.r2.dev`:

1. V Cloudflare Dashboard → R2 → Bucket → Settings
2. Custom Domains → Add domain
3. Přidej: `cdn.davidchoc.cz` nebo `media.davidchoc.cz`
4. Aktualizuj `.env.local`:
   ```env
   R2_PUBLIC_URL="https://cdn.davidchoc.cz"
   ```
5. Znovu spusť `npm run update:paths`

---

## Rollback plán

Pokud něco selže:

1. **Vrátit DNS na GitHub Pages**
   ```
   CNAME: www → viadorer.github.io
   ```

2. **Vrátit cesty v HTML**
   - Git checkout před změnami
   - Nebo manuálně nahradit R2 URL za lokální cesty

3. **Smazat Vercel projekt**
   - Vercel Dashboard → Delete Project

---

## Náklady

### Cloudflare R2
- Storage: 159MB × $0.015/GB = **~$0.002/měsíc**
- Requests: Class A (1M free), Class B (10M free)
- Egress: **$0** (žádné poplatky)

### Vercel
- Hobby plan: **Zdarma**
- Bandwidth: 100GB/měsíc zdarma
- Serverless funkce: 100GB-Hrs zdarma

**Celkem: ~$0.01/měsíc** (prakticky zdarma)

---

## Kontaktní formulář - nová implementace

### Co se změnilo

**Před migrací:**
- ECM Widget (externí služba)
- Hardcoded script v HTML
- Závislost na třetí straně

**Po migraci:**
- Vlastní formulář (`contact-form-handler.js`)
- Volání vlastního API endpointu `/api/contact`
- Plná kontrola nad daty a UX
- Stejný vzhled jako původní formulář

### Jak to funguje

1. Uživatel vyplní formulář v `index.html` (kontejner `#f-21-125ab233e4603d4d7c84f5cbf8130258`)
2. JavaScript `contact-form-handler.js` odešle data na `/api/contact`
3. Serverless funkce `/api/contact.js` zpracuje data a pošle do Realvisor API
4. Realvisor vytvoří lead v projektu s pipeline `kontaktni-formu-87433`

### Formát dat odesílaných do Realvisor

```json
{
  "firstName": "Jan",
  "lastName": "Novák",
  "email": "jan@example.com",
  "phone": "+420 123 456 789",
  "message": "Mám zájem o vaše služby",
  "data": {
    "source": "davidchoc.com",
    "formType": "contact",
    "pipeline": "kontaktni-formu-87433",
    "timestamp": "2026-02-23T12:00:00.000Z"
  }
}
```

---

## Troubleshooting

### Videa se nenačítají
- Zkontroluj R2_PUBLIC_URL v `.env.local`
- Ověř, že migrace proběhla: `npm run migrate:r2`

### Formulář nefunguje
- Zkontroluj environment variables ve Vercelu
- Otevři browser console a zkontroluj chyby

### 404 na stránkách
- Zkontroluj `vercel.json` rewrites
- Ověř, že HTML soubory jsou v rootu projektu

---

## Podpora

Jakékoli problémy řeš přes:
- Vercel Dashboard → Logs
- Cloudflare Dashboard → R2 → Metrics
