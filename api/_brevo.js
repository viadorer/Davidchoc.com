// Odesílání e-mailů a zakládání kontaktů v Brevu.
//
// Klíč čteme z prostředí (BREVO_API_KEY na Vercelu) — nikdy nesmí být
// v kódu stránky ani v repozitáři.
//
// Časování sekvence neřídíme odsud. Statický web nemá kde držet stav
// ani co by ho po pěti dnech probudilo, takže kontakt vložíme do
// seznamu s atributy a odstupy si hlídá automatizace v Brevu.

const API = 'https://api.brevo.com/v3';

export function brevoNastaveno() {
  return Boolean(process.env.BREVO_API_KEY);
}

function hlavicky() {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'api-key': process.env.BREVO_API_KEY,
  };
}

function odesilatel() {
  return {
    email: process.env.BREVO_SENDER_EMAIL || 'david.choc@ptf.cz',
    name: process.env.BREVO_SENDER_NAME || 'David Choc',
  };
}

/**
 * Odeslání transakčního e-mailu.
 * Buď `templateId` (šablona v Brevu), nebo `subject` + `htmlContent`.
 */
export async function odeslatEmail({ to, jmeno, subject, htmlContent, templateId, params, replyTo }) {
  if (!brevoNastaveno()) {
    console.warn('[brevo] BREVO_API_KEY není nastaven — e-mail se neodesílá');
    return { preskoceno: true };
  }

  const telo = {
    sender: odesilatel(),
    to: [{ email: to, name: jmeno || undefined }],
    replyTo: replyTo || odesilatel(),
  };

  if (templateId) {
    telo.templateId = Number(templateId);
    if (params) telo.params = params;
  } else {
    telo.subject = subject;
    telo.htmlContent = htmlContent;
  }

  const r = await fetch(`${API}/smtp/email`, {
    method: 'POST',
    headers: hlavicky(),
    body: JSON.stringify(telo),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Brevo smtp/email ${r.status}: ${text.slice(0, 200)}`);
  }
  return r.json().catch(() => ({}));
}

/**
 * Vloží nebo aktualizuje kontakt a zařadí ho do seznamu.
 * Na tenhle seznam se v Brevu navěsí automatizace se sekvencí.
 */
export async function ulozitKontakt({ email, jmeno, prijmeni, listIds, atributy }) {
  if (!brevoNastaveno()) return { preskoceno: true };

  const telo = {
    email,
    updateEnabled: true,
    attributes: Object.assign(
      {},
      jmeno ? { JMENO: jmeno } : null,
      prijmeni ? { PRIJMENI: prijmeni } : null,
      atributy || {},
    ),
  };
  if (listIds && listIds.length) telo.listIds = listIds;

  const r = await fetch(`${API}/contacts`, {
    method: 'POST',
    headers: hlavicky(),
    body: JSON.stringify(telo),
  });

  // 400 s kódem duplicate_parameter znamená, že kontakt existuje —
  // to není chyba, jen ho doplníme.
  if (r.status === 400) {
    const data = await r.json().catch(() => ({}));
    if (data.code === 'duplicate_parameter') {
      return aktualizovatKontakt({ email, telo });
    }
    throw new Error(`Brevo contacts 400: ${JSON.stringify(data).slice(0, 200)}`);
  }
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Brevo contacts ${r.status}: ${text.slice(0, 200)}`);
  }
  return r.json().catch(() => ({}));
}

async function aktualizovatKontakt({ email, telo }) {
  const uprava = { attributes: telo.attributes };
  if (telo.listIds) uprava.listIds = telo.listIds;

  const r = await fetch(`${API}/contacts/${encodeURIComponent(email)}`, {
    method: 'PUT',
    headers: hlavicky(),
    body: JSON.stringify(uprava),
  });
  if (!r.ok && r.status !== 204) {
    const text = await r.text();
    throw new Error(`Brevo contacts PUT ${r.status}: ${text.slice(0, 200)}`);
  }
  return { aktualizovan: true };
}
