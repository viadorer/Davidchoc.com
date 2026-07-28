// Jednotný příjem leadů z davidchoc.cz → CRM PTF (ptf.cz/admin).
//
// Proč přes server a ne přímo z prohlížeče: klíče a adresa CRM nemají
// co dělat ve zdrojovém kódu stránky, který si stáhne každý návštěvník.
//
// Odhady zůstávají v Realvisoru — ty sem nechodí.

const PTF_BACKEND = process.env.PTF_BACKEND_URL || 'https://ptf-production.up.railway.app';
const PTF_TENANT = process.env.PTF_TENANT_SLUG || 'ptf-reality';

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
  'pripad-pro-agenta':  { source: 'web_formular', popis: 'Případ pro agenta' },
  'chci-prodat':        { source: 'web_formular', popis: 'Chci prodat (landing page)' },
  'vycvik-pdf':         { source: 'web_formular', popis: 'Kniha Výcvik — PDF ke stažení' },
  'vycvik-zkouska':     { source: 'web_formular', popis: 'Kniha Výcvik — výsledek zkoušky' },
  'vycvik-posudek':     { source: 'web_formular', popis: 'Kniha Výcvik — posouzení inzerátu' },
  'nabidka-detail':     { source: 'web_formular', popis: 'Poptávka z detailu nabídky' },
  'newsletter':         { source: 'web_formular', popis: 'Přihlášení k odběru' },
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

  const jmeno = rozdelitJmeno(body.name);
  const email = ocistit(body.email, 100).toLowerCase();
  const telefon = ocistit(body.phone, 30);

  if (!jmeno) {
    return res.status(400).json({ error: 'Vyplňte prosím jméno.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Zadejte prosím platnou e-mailovou adresu.' });
  }
  if (telefon && !PHONE_RE.test(telefon)) {
    return res.status(400).json({ error: 'Telefonní číslo nemá platný formát.' });
  }
  if (body.gdpr !== true && body.gdpr !== 'true' && body.gdpr !== 'on') {
    return res.status(400).json({ error: 'Bez souhlasu se zpracováním údajů zprávu odeslat nelze.' });
  }

  const { text: zprava, odkazy } = vytahnoutOdkazy(ocistit(body.message, 5000));

  // Cokoli navíc, co formulář poslal, uložíme do metadat — v CRM se
  // podle nich dá filtrovat, aniž bychom sahali na enum `source`.
  const metadata = {
    origin: 'davidchoc.cz',
    form: formular,
    form_label: konfig.popis,
    submitted_at: new Date().toISOString(),
  };
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

  const payload = {
    first_name: jmeno.first_name,
    last_name: jmeno.last_name,
    email,
    phone: telefon || undefined,
    message: zprava || konfig.popis,
    source: konfig.source,
    property_id: UUID_RE.test(propertyId) ? propertyId : undefined,
    gdpr_consent: true,
    marketing_consent: body.marketing === true,
    metadata,
    visitor_data: {
      ip,
      user_agent: (req.headers['user-agent'] || '').slice(0, 500),
      referrer: ocistit(body.referrer, 500) || undefined,
    },
  };

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

    return res.status(200).json({ success: true, id: data.id });
  } catch (chyba) {
    console.error('[lead] Chyba při odesílání do CRM:', chyba.message);
    return res.status(500).json({ error: 'Došlo k chybě při odesílání. Zkuste to prosím znovu.' });
  }
}
