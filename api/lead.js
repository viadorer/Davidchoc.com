// Jednotný příjem leadů z davidchoc.cz → CRM PTF (ptf.cz/admin).
//
// Proč přes server a ne přímo z prohlížeče: klíče a adresa CRM nemají
// co dělat ve zdrojovém kódu stránky, který si stáhne každý návštěvník.
//
// Odhady zůstávají v Realvisoru — ty sem nechodí.

import { odeslatEmail, ulozitKontakt, nactiKontakt, brevoNastaveno } from './_brevo.js';
import { potvrzeniPro } from './_emaily.js';

const PTF_BACKEND = process.env.PTF_BACKEND_URL || 'https://ptf-production.up.railway.app';
const PTF_TENANT = process.env.PTF_TENANT_SLUG || 'ptf-reality';

// Všechno, co přijde z davidchoc.cz, vyřizuje David — přiřadíme rovnou,
// ať lead nečeká v adminu na to, až si ho někdo všimne.
// U poptávky ke konkrétní nemovitosti si CRM přiřadí makléře podle té
// nemovitosti; to je správně a nepřebíjíme to.
const DAVID_TEAM_ID = process.env.PTF_DEFAULT_AGENT_ID || '0773a73d-9192-4120-95b7-0fe4a8de8edf';

const ALLOWED_ORIGINS = [
  'https://www.davidchoc.cz',
  'https://davidchoc.cz',
  'http://localhost:3000',
  'http://localhost:8000',
  'http://localhost:8899',
  'http://127.0.0.1:8000',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PHONE_RE = /^[+0-9 ()\-]{6,20}$/;

// Formuláře, které smí zapisovat, a jak se mají v CRM projevit.
// `source` musí být hodnota z databázového enumu lead_source —
// jemnější rozlišení nese metadata.form.
const FORMULARE = {
  'kontakt':            { source: 'web_formular', popis: 'Kontaktní formulář' },
  // Klíč zůstává historický, protože se drží u kontaktů v CRM.
  // Stránka se jmenuje Chci si to jen ověřit.
  'pripad-pro-agenta':  { source: 'web_formular', popis: 'Chci si to jen ověřit' },
  'chci-prodat':        { source: 'web_formular', popis: 'Chci prodat (landing page)' },
  // Plánovač rekonstrukce — lead nese v metadatech parametry bytu,
  // takže je z něj rovnou vidět rozsah zakázky i rozpočet.
  'planovac-rekonstrukce': { source: 'web_formular', popis: 'Plánovač rekonstrukce bytu' },
  'vycvik-pdf':         { source: 'web_formular', popis: 'Kniha Výcvik — PDF ke stažení' },
  'vycvik-zkouska':     { source: 'web_formular', popis: 'Kniha Výcvik — výsledek dotazníku' },
  'vycvik-plan':        { source: 'web_formular', popis: 'Kniha Výcvik — rozpis krok za krokem' },
  'vycvik-posudek':     { source: 'web_formular', popis: 'Kniha Výcvik — posouzení inzerátu' },
  // Zkratka pro toho, kdo dotazník nedodělal. Je to slabší signál než
  // dokončený dotazník — nemá skóre — ale silnější než nic, což byla
  // dosud jediná stopa, kterou po sobě odpadlík nechal.
  'vycvik-zkouska-nedokonceny': { source: 'web_formular',
                          popis: 'Kniha Výcvik — nedokončený dotazník, zkratka' },
  // Brány přímo v kapitolách. Metadata nesou cestu, takže je zpětně
  // vidět, u které kapitoly se čtenář zastavil — a to je jiná informace
  // než skóre z dotazníku.
  'vycvik-kapitola-cena':    { source: 'web_formular',
                          popis: 'Kniha Výcvik — kapitola 1, tři zdroje k ceně' },
  'vycvik-kapitola-fotky':   { source: 'web_formular',
                          popis: 'Kniha Výcvik — kapitola 3, seznam záběrů' },
  'vycvik-kapitola-smlouvy': { source: 'web_formular',
                          popis: 'Kniha Výcvik — kapitola 7, na co pozor u úschovy' },
  // Základní brána sekce: rozpis deseti fází s hodinami a náklady.
  // Je to nabídka pro člověka, který zatím nic nevyplnil — stojí na
  // začátku a ptá se, co ho čeká.
  'vycvik-rozpis':      { source: 'web_formular', popis: 'Kniha Výcvik — rozpis deseti fází' },
  // Eskalace. Kdo označí právní překážku, je nejcennější lead celé
  // sekce a rozhoduje se u něj rychlost, ne skóre.
  'vycvik-rizika':      { source: 'web_formular', popis: 'Kniha Výcvik — riziková situace' },
  // Dlouhý ocas: člověk, který teď neprodává. Dedup schválně — kdo se
  // přihlásí podruhé, nemá zakládat druhý případ.
  'hlidani-ceny':       { source: 'web_formular', dedup: true,
                          popis: 'Hlídání ceny — čtvrtletní přehled' },
  // Nabídka navázaná na konkrétní výsledek diagnostiky. Metadata nesou
  // `verdikt`, takže se dá zpětně zjistit, který závěr lidi přiměl napsat.
  'vycvik-diagnostika': { source: 'web_formular', popis: 'Kniha Výcvik — diagnostika inzerátu' },
  'nabidka-detail':     { source: 'web_formular', popis: 'Poptávka z detailu nabídky' },
  'posudek-inzeratu':   { source: 'web_formular', popis: 'Posouzení inzerátu — zaseknutý samoprodejce' },
  // Rozbor k odhadu ceny. Stránka ho slibovala ve FAQ, ale neměla
  // formulář, kterým by si o něj šlo říct.
  'ocenit-rozbor':      { source: 'web_formular', popis: 'Odhad ceny — rozbor k výsledku' },
  'newsletter':         { source: 'web_formular', popis: 'Přihlášení k odběru' },
  // Přímý odkup panelákových bytů. Prodávající, ne kupující — proto bez
  // kampaně milionarem. metadata.verdikt nese výsledek kvalifikačního testu.
  'bytvpanelaku':       { source: 'web_formular', popis: 'Byt v paneláku — poptávka odkupu' },

  // ── KUPUJÍCÍ ────────────────────────────────────────────────────────
  // Jiná cílovka než výcvik: ten mluví k prodávajícím, tohle ke kupujícím.
  // `kampan` se propisuje do utm_campaign, podle kterého se v adminu
  // filtruje panel Zdroj — `source` je pevný enum a rozšířit ho z webu
  // nejde.
  //
  // `dedup: true` znamená, že tentýž e-mail nezaloží druhý případ na
  // tentýž formulář. Nový formulář od stejného člověka případ založí,
  // protože to je nový signál — někdo, kdo si stáhl průvodce a pak si
  // řekl o servis, se posunul.
  'milionarem-pdf':     { source: 'web_formular', kampan: 'milionarem', dedup: true,
                          popis: 'Milionářem — stažení výcviku' },
  'milionarem-servis':  { source: 'web_formular', kampan: 'milionarem', dedup: true,
                          popis: 'Milionářem — poptávka služby' },
  'milionarem-mapa':    { source: 'web_formular', kampan: 'milionarem', dedup: true,
                          popis: 'Milionářem — Cihla 1, zájem o další díly' },
  'milionarem-strop':   { source: 'web_formular', kampan: 'milionarem', dedup: true,
                          popis: 'Milionářem — Cihla 2, zájem o další díly' },
  'milionarem-lokality': { source: 'web_formular', kampan: 'milionarem', dedup: true,
                          popis: 'Milionářem — Cihla 3, zájem o další díly' },
  'milionarem-proverka': { source: 'web_formular', kampan: 'milionarem', dedup: true,
                          popis: 'Milionářem — Cihla 4, zájem o další díly' },
  'milionarem-rezervace': { source: 'web_formular', kampan: 'milionarem', dedup: true,
                          popis: 'Milionářem — Cihla 5, zájem o další díly' },
  'milionarem-cerpani': { source: 'web_formular', kampan: 'milionarem', dedup: true,
                          popis: 'Milionářem — Cihla 6, zájem o další díly' },
  'milionarem-vybaveni': { source: 'web_formular', kampan: 'milionarem', dedup: true,
                          popis: 'Milionářem — Cihla 7, zájem o další díly' },
  'milionarem-najemnik': { source: 'web_formular', kampan: 'milionarem', dedup: true,
                          popis: 'Milionářem — Cihla 8, zájem o další díly' },
  'milionarem-sprava':  { source: 'web_formular', kampan: 'milionarem', dedup: true,
                          popis: 'Milionářem — Cihla 9, zájem o další díly' },

  // Konverze u výsledku simulátoru. Dva typy podle toho, co člověk
  // odpověděl v kvalifikaci — a hlavně podle toho, co mu na té stránce
  // opravdu slíbíme. Kdo je do tří měsíců a má vyřízené financování,
  // dostane konkrétní byty; ostatní posouzení vlastního zadání. Jeden
  // společný typ by znamenal, že polovině lidí slíbíme něco jiného,
  // než co jim přijde.
  //
  // Vlastní kampaň, ne 'milionarem'. Na tu je v CRM navěšená obecná
  // šestidílná sekvence a její první krok (0 h) by přebil potvrzení
  // z webu — člověk, kterému jsme slíbili tři konkrétní byty, by místo
  // toho dostal úvod do kurzu. Dokud pro simulátor nebude vlastní
  // sekvence, chodí odsud jen potvrzení z api/_emaily.js, a to sedí
  // na to, co bylo slíbeno.
  'milionarem-simulator-byty':  { source: 'web_formular', kampan: 'milionarem-simulator', dedup: true,
                                  popis: 'Milionářem — simulátor, nabídka konkrétních bytů' },
  'milionarem-simulator-cisla': { source: 'web_formular', kampan: 'milionarem-simulator', dedup: true,
                                  popis: 'Milionářem — simulátor, posouzení zadání' },

  'investovat-pdf':                { source: 'web_formular', kampan: 'milionarem', dedup: true,
                                     popis: 'Milionářem — kompletní průvodce' },
  'investovat-servis':             { source: 'web_formular', kampan: 'milionarem', dedup: true,
                                     popis: 'Milionářem — poptávka služby' },
  'investovat-mapa-cihel':         { source: 'web_formular', kampan: 'milionarem', dedup: true,
                                     popis: 'Milionářem — pracovní list Mapa cihel' },
  'investovat-financni-strop':     { source: 'web_formular', kampan: 'milionarem', dedup: true,
                                     popis: 'Milionářem — pracovní list Finanční strop' },
  'investovat-srovnani-lokalit':   { source: 'web_formular', kampan: 'milionarem', dedup: true,
                                     popis: 'Milionářem — pracovní list Srovnání lokalit' },
  'investovat-proverka':           { source: 'web_formular', kampan: 'milionarem', dedup: true,
                                     popis: 'Milionářem — pracovní list Prověrka před koupí' },
  'investovat-rezervacni-smlouva': { source: 'web_formular', kampan: 'milionarem', dedup: true,
                                     popis: 'Milionářem — pracovní list Rezervační smlouva' },
};

const buckets = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;

function rateLimit(ip) {
  const now = Date.now();
  const arr = (buckets.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  arr.push(now);
  buckets.set(ip, arr);
  return arr.length <= RATE_MAX;
}

function ocistit(str, max = 2000) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, max);
}

// Zpráva se v adminu vykresluje s whitespace-pre-wrap, takže konce
// řádků nesou strukturu — na rozdíl od ostatních polí je tady nesmíme
// zahodit. Necháme tabulátor, LF a CR, zbytek řídicích znaků pryč.
function ocistitZpravu(str, max = 5000) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

// CRM odmítá zprávy obsahující odkaz jako spam — a vrátí přitom 201,
// takže by lead tiše zmizel. Odkazy proto ze zprávy vytáhneme a
// předáme je zvlášť v metadatech, kde je antispam neřeší.
const URL_RE = /https?:\/\/[^\s]+|www\.[^\s]+/gi;

function vytahnoutOdkazy(text) {
  if (!text) return { text: '', odkazy: [] };
  const odkazy = text.match(URL_RE) || [];
  let cisty = text;
  odkazy.forEach((u, i) => {
    cisty = cisty.replace(u, '[odkaz ' + (i + 1) + ' — viz metadata]');
  });
  // I po odstranění odkazů může zbýt ".com/" apod.
  cisty = cisty.replace(/\.(com|ru|cn)\//gi, '. ');
  return { text: cisty.trim(), odkazy };
}

// CRM vyžaduje jméno i příjmení. Jednoslovné jméno by skončilo
// oslovením „Vážený pane —," takže raději necháme příjmení prázdné
// a odmítneme až tehdy, když nemáme vůbec nic.
function rozdelitJmeno(cele) {
  const casti = ocistit(cele, 100).split(/\s+/).filter(Boolean);
  if (!casti.length) return null;
  if (casti.length === 1) return { first_name: casti[0], last_name: casti[0] };
  return { first_name: casti[0], last_name: casti.slice(1).join(' ') };
}

/**
 * Náhradní jméno z e-mailu.
 *
 * Většina bran v knize schválně jméno nechce — jedno pole navíc stojí
 * část lidí, kteří by e-mail nechali. Server ale jméno vyžadoval, takže
 * každá taková brána vracela „Vyplňte prosím jméno." a lead tiše mizel.
 * Odhadnout jméno z adresy je horší než ho mít, ale nesrovnatelně lepší
 * než přijít o kontakt. Že je odhadnuté, nese metadata.jmeno_odhadnute.
 */
function jmenoZEmailu(email) {
  const misto = String(email || '').split('@')[0];
  const casti = misto
    .replace(/[._\-+]+/g, ' ')
    .replace(/\d+/g, ' ')
    .split(/\s+/)
    .filter(c => c.length > 1)
    .slice(0, 2)
    .map(c => c.charAt(0).toUpperCase() + c.slice(1));

  if (casti.length >= 2) return { first_name: casti[0], last_name: casti[1] };
  if (casti.length === 1) return { first_name: casti[0], last_name: 'z webu' };
  return { first_name: 'Zájemce', last_name: 'z webu' };
}

// Zpráva, jak ji uvidí makléř v adminu. Vlastní text klienta nahoře,
// pod čarou odkud lead přišel — ať je to poznat i bez klikání do metadat.
function slozitZpravu(text, konfig, odkazy, metadata) {
  const casti = [];
  casti.push(text || '(bez zprávy)');

  const patka = ['Odesláno z webu davidchoc.cz — ' + konfig.popis];

  // Odkaz je v metadatech, protože v textu by ho antispam CRM zabil.
  // Do patičky ho ale vypíšeme, ať ho makléř nemusí hledat.
  const vsechnyOdkazy = odkazy.slice();
  if (metadata.listing_url && vsechnyOdkazy.indexOf(metadata.listing_url) === -1) {
    vsechnyOdkazy.unshift(metadata.listing_url);
  }
  if (vsechnyOdkazy.length === 1) {
    patka.push('Odkaz: ' + vsechnyOdkazy[0]);
  } else if (vsechnyOdkazy.length > 1) {
    vsechnyOdkazy.forEach((u, i) => patka.push('Odkaz ' + (i + 1) + ': ' + u));
  }

  casti.push('────────────');
  casti.push(patka.join('\n'));
  return casti.join('\n\n');
}

// Seznamy v Brevu, na které se věší automatizace se sekvencí.
// ID se nastavují v prostředí — bez nich se kontakt jen založí.
function seznamyPro(formular) {
  const konfig = FORMULARE[formular];

  // Kupující mají vlastní seznam — píše se jim něco jiného než
  // prodávajícím z výcviku, takže nesmí spadnout do jedné sekvence.
  if (konfig && konfig.kampan === 'milionarem') {
    const idM = Number(process.env.BREVO_LIST_MILIONAR);
    return Number.isFinite(idM) && idM > 0 ? [idM] : undefined;
  }

  const mapa = {
    'posudek-inzeratu': process.env.BREVO_LIST_POSUDEK,
    'vycvik-pdf': process.env.BREVO_LIST_KNIHA,
    'vycvik-zkouska': process.env.BREVO_LIST_KNIHA,
    'vycvik-plan': process.env.BREVO_LIST_KNIHA,
    // Zaseknutý samoprodejce patří do stejné sekvence jako ze samostatné
    // stránky — je to tentýž člověk v téže situaci, jen přišel z knihy.
    'vycvik-posudek': process.env.BREVO_LIST_POSUDEK,
    'vycvik-rozpis': process.env.BREVO_LIST_KNIHA,
    // Nedokončený dotazník a brány v kapitolách patří do téže sekvence
    // jako dokončený dotazník — je to tentýž člověk, jen se zastavil dřív.
    'vycvik-zkouska-nedokonceny': process.env.BREVO_LIST_KNIHA,
    'vycvik-kapitola-cena': process.env.BREVO_LIST_KNIHA,
    'vycvik-kapitola-fotky': process.env.BREVO_LIST_KNIHA,
    'vycvik-kapitola-smlouvy': process.env.BREVO_LIST_KNIHA,
    // Zaseknutá nabídka — stejná situace jako posouzení inzerátu.
    'vycvik-diagnostika': process.env.BREVO_LIST_POSUDEK,
    // Hlídání ceny má vlastní seznam: chodí do něj jeden e-mail za
    // čtvrt roku a nic jiného. Kdyby spadlo do sekvence knihy, dostal
    // by člověk pět e-mailů, o které si neřekl.
    'ocenit-rozbor': process.env.BREVO_LIST_KNIHA,
    'hlidani-ceny': process.env.BREVO_LIST_HLIDANI,
  };
  const id = Number(mapa[formular]);
  return Number.isFinite(id) && id > 0 ? [id] : undefined;
}

/**
 * Kontrola duplicity přes Brevo.
 *
 * V atributu FORMULARE si u kontaktu držíme čárkou oddělený seznam
 * formulářů, které už odeslal. Když přijde tentýž formulář podruhé,
 * do CRM ho nepustíme — jinak by se z jednoho člověka, který si stáhne
 * tři pracovní listy, staly tři případy.
 *
 * Když Brevo neodpoví nebo není nastavené, duplicitu radši propustíme.
 * Ztratit lead je horší než mít v adminu jeden navíc.
 */
async function jeDuplicita(formular, email) {
  const konfig = FORMULARE[formular];
  if (!konfig || !konfig.dedup || !brevoNastaveno()) return false;

  try {
    const kontakt = await nactiKontakt(email);
    if (!kontakt || !kontakt.attributes) return false;
    const odeslane = String(kontakt.attributes.FORMULARE || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    return odeslane.indexOf(formular) !== -1;
  } catch (e) {
    console.warn('[lead] kontrola duplicity selhala:', e.message);
    return false;
  }
}

/** Přidá formulář do seznamu odeslaných, bez duplicit a bez ztráty historie. */
function pripojFormular(stavajici, formular) {
  const seznam = String(stavajici || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (seznam.indexOf(formular) === -1) seznam.push(formular);
  return seznam.join(',').slice(0, 500);
}

async function poslatPotvrzeni({ formular, email, jmeno, metadata, preskocitEmail }) {
  if (!brevoNastaveno()) return;

  // Historii odeslaných formulářů udržujeme u kontaktu — je to zároveň
  // paměť pro kontrolu duplicit a přehled o tom, kudy člověk prošel.
  let historie = formular;
  try {
    const kontakt = await nactiKontakt(email);
    historie = pripojFormular(kontakt && kontakt.attributes && kontakt.attributes.FORMULARE, formular);
  } catch (e) { /* první kontakt nebo výpadek — zapíšeme aspoň tenhle */ }

  await ulozitKontakt({
    email,
    jmeno: jmeno.first_name,
    prijmeni: jmeno.last_name,
    listIds: seznamyPro(formular),
    atributy: {
      ZDROJ: 'davidchoc.cz',
      FORMULAR: formular,
      FORMULARE: historie,
      KAMPAN: (FORMULARE[formular] && FORMULARE[formular].kampan) || '',
      SEGMENT: metadata.segment || '',
      INZERAT_URL: metadata.listing_url || '',
      // Skóre z dotazníku „Zvládnete to sami?". Bez něj by se sekvence
      // v Brevu nedala větvit — a psát stejně člověku s osmi body jako
      // tomu se dvěma je horší než nepsat vůbec.
      SKORE: typeof metadata.score === 'number' ? metadata.score : '',
    },
  });

  if (preskocitEmail) return;

  const sablona = potvrzeniPro(formular);
  if (!sablona) return;

  // Šablona dostane metadata formuláře — potvrzení, které má vrátit něco
  // konkrétního (skóre z dotazníku, chybějící kapitoly), si z nich postaví
  // obsah. Starší šablony argument ignorují.
  const subject = typeof sablona.subject === 'function'
    ? sablona.subject(metadata)
    : sablona.subject;

  await odeslatEmail({
    to: email,
    jmeno: [jmeno.first_name, jmeno.last_name].filter(Boolean).join(' '),
    subject,
    htmlContent: sablona.html(metadata),
  });
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://www.davidchoc.cz';

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .toString().split(',')[0].trim();

  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Příliš mnoho požadavků. Zkuste to prosím za chvíli.' });
  }

  const body = req.body || {};

  // Past na roboty — vyplněné pole tiše spolkneme
  if (typeof body.website === 'string' && body.website.length > 0) {
    return res.status(200).json({ success: true });
  }

  const formular = ocistit(body.form, 40);
  const konfig = FORMULARE[formular];
  if (!konfig) {
    return res.status(400).json({ error: 'Neznámý formulář' });
  }

  const email = ocistit(body.email, 100).toLowerCase();
  const telefon = ocistit(body.phone, 30);

  // E-mail se ověřuje první: je to jediné pole, které chceme po všech.
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Zadejte prosím platnou e-mailovou adresu.' });
  }

  // Jméno je nepovinné. Formuláře, které ho sbírají, si ho ohlídají samy
  // na stránce; brány v knize ho schválně nechtějí.
  const zadaneJmeno = rozdelitJmeno(body.name);
  const jmeno = zadaneJmeno || jmenoZEmailu(email);
  if (telefon && !PHONE_RE.test(telefon)) {
    return res.status(400).json({ error: 'Telefonní číslo nemá platný formát.' });
  }
  if (body.gdpr !== true && body.gdpr !== 'true' && body.gdpr !== 'on') {
    return res.status(400).json({ error: 'Bez souhlasu se zpracováním údajů zprávu odeslat nelze.' });
  }

  const { text: zprava, odkazy } = vytahnoutOdkazy(ocistitZpravu(body.message));

  // Cokoli navíc, co formulář poslal, uložíme do metadat — v CRM se
  // podle nich dá filtrovat, aniž bychom sahali na enum `source`.
  // `kampan` je tu kvůli sekvencím v CRM: podmínka kroku pak zní
  // {"metadata.kampan": "milionarem"} místo výčtu všech formulářů, takže
  // další cihly do sekvence spadnou samy, bez zásahu v adminu.
  const metadata = {
    origin: 'davidchoc.cz',
    form: formular,
    form_label: konfig.popis,
    submitted_at: new Date().toISOString(),
  };
  // Ať je v adminu na první pohled poznat, že jméno nikdo nenapsal —
  // oslovit člověka odhadem z adresy je horší než ho neoslovit vůbec.
  if (!zadaneJmeno) metadata.jmeno_odhadnute = true;
  if (konfig.kampan) metadata.kampan = konfig.kampan;
  if (odkazy.length) metadata.links = odkazy;
  if (odkazy.length) metadata.listing_url = odkazy[0];
  if (body.meta && typeof body.meta === 'object') {
    for (const [k, v] of Object.entries(body.meta)) {
      if (typeof v === 'string') metadata[k] = v.slice(0, 500);
      else if (typeof v === 'number' || typeof v === 'boolean') metadata[k] = v;
    }
  }

  const propertyId = ocistit(body.property_id, 40);
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // Panel „Zdroj" v adminu čte utm_* a referrer_url — ne metadata.
  // Když návštěvník přišel z reklamy, jeho vlastní UTM mají přednost.
  const utm = (body.utm && typeof body.utm === 'object') ? body.utm : {};
  const IP_RE = /^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-f:]+$/i;

  const payload = {
    first_name: jmeno.first_name,
    last_name: jmeno.last_name,
    email,
    phone: telefon || undefined,
    message: slozitZpravu(zprava, konfig, odkazy, metadata),
    source: konfig.source,
    property_id: UUID_RE.test(propertyId) ? propertyId : undefined,
    assigned_to: DAVID_TEAM_ID,
    gdpr_consent: true,
    marketing_consent: body.marketing === true,
    metadata,
    utm_source: ocistit(utm.source, 100) || 'davidchoc.cz',
    utm_medium: ocistit(utm.medium, 100) || 'web',
    // Panel Zdroj v adminu filtruje podle kampaně. Vlastní UTM návštěvníka
    // mají přednost — když přišel z reklamy, chceme vidět tu reklamu.
    // Jinak sáhneme po značce sekce, ať jdou kupující oddělit od výcviku.
    utm_campaign: ocistit(utm.campaign, 100) || konfig.kampan || formular,
    referrer_url: ocistit(body.referrer, 500) || undefined,
    ip_address: IP_RE.test(ip) ? ip : undefined,
    user_agent: (req.headers['user-agent'] || '').slice(0, 500) || undefined,
  };

  // Tentýž člověk na tentýž formulář podruhé nezakládá druhý případ.
  // Do Brevo ho ale zapíšeme — potvrzení mu přijde a v sekvenci zůstává.
  if (await jeDuplicita(formular, email)) {
    console.info('[lead] duplicita, případ se nezakládá:', formular, email);
    try {
      await poslatPotvrzeni({ formular, email, jmeno, metadata, preskocitEmail: false });
    } catch (e) {
      console.error('[lead] Brevo selhalo u duplicity:', e.message);
    }
    return res.status(200).json({ success: true, duplicita: true });
  }

  try {
    const odpoved = await fetch(`${PTF_BACKEND}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': PTF_TENANT,
      },
      body: JSON.stringify(payload),
    });

    if (!odpoved.ok) {
      const text = await odpoved.text();
      console.error('[lead] CRM odmítlo lead:', odpoved.status, text.slice(0, 300));
      return res.status(502).json({ error: 'Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.' });
    }

    const data = await odpoved.json().catch(() => ({}));

    // CRM vrací 201 i tehdy, když lead vyhodnotí jako spam a zahodí ho —
    // pozná se podle náhradního id 'ok'. My past na roboty ani časový
    // test nespouštíme, takže tohle znamená vždy zabraný antispam.
    // Nejčastější příčina: české příjmení bez diakritiky delší než
    // devět písmen (Prokopcova, Svobodnikova) spadne pod detektor
    // náhodných znaků v leads.routes.ts.
    //
    // Návštěvníkovi proto neukážeme falešný úspěch — lead by se tiše
    // ztratil a nikdo by o tom nevěděl.
    if (data.id === 'ok') {
      console.warn('[lead] CRM lead zahodilo (antispam):', {
        form: formular,
        last_name: jmeno.last_name,
        ma_odkaz: odkazy.length > 0,
      });
      return res.status(502).json({
        error: 'Zprávu se nepodařilo uložit. Napište mi prosím přímo na david.choc@ptf.cz nebo zavolejte na 774 052 232 — ozvu se obratem.',
      });
    }

    // Potvrzení a zařazení do sekvence. Běží až po zápisu do CRM a
    // nesmí ho shodit — když Brevo zlobí, lead je pořád uložený
    // a člověk dostal na stránce potvrzení.
    // Když uvítací e-mail odeslalo CRM — ať už sekvencí, nebo vlastní
    // šablonou podle metadata.form — svoje potvrzení neposíláme; jinak
    // by člověku přišly dva naráz.
    //
    // `welcome_sent` je novější a přesnější: CRM od migrace 253 posílá
    // e-maily z knihy Výcvik samo, a to i když je sekvence prázdná.
    // Samotné `sequences` by na to nestačilo. Starší CRM ho neposílá,
    // pak zůstává původní chování.
    const resilaSekvence = Number(data.sequences) > 0 || data.welcome_sent === true;

    await poslatPotvrzeni({ formular, email, jmeno, metadata, preskocitEmail: resilaSekvence }).catch((e) => {
      console.error('[lead] Brevo selhalo (lead je v CRM uložený):', e.message);
    });

    return res.status(200).json({ success: true, id: data.id });
  } catch (chyba) {
    console.error('[lead] Chyba při odesílání do CRM:', chyba.message);
    return res.status(500).json({ error: 'Došlo k chybě při odesílání. Zkuste to prosím znovu.' });
  }
}
