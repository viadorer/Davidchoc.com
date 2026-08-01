// Potvrzovací e-maily, které odcházejí hned po odeslání formuláře.
//
// Jsou to e-maily „E0" — potvrzují, co jsem slíbil na stránce, a nic
// nenabízejí. Navazující kroky sekvence řídí automatizace v Brevu.

function obal(nadpis, telo) {
  return `<!doctype html>
<html lang="cs"><body style="margin:0;padding:0;background:#f4f1ea;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;border:1px solid #e6e0d4;">
<tr><td style="padding:34px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<h1 style="margin:0 0 20px;font-size:21px;line-height:1.25;color:#1a1a1a;font-weight:800;">${nadpis}</h1>
${telo}
<p style="margin:28px 0 0;padding-top:20px;border-top:1px solid #eee7da;font-size:13px;line-height:1.6;color:#8a8378;">
David Choc · realitní agent · PTF reality, s.r.o.<br>
<a href="tel:+420774052232" style="color:#8B7D61;">774 052 232</a> ·
<a href="mailto:david.choc@ptf.cz" style="color:#8B7D61;">david.choc@ptf.cz</a>
</p>
</td></tr></table>
</td></tr></table>
</body></html>`;
}

const P = 'margin:0 0 15px;font-size:15px;line-height:1.7;color:#444;';

function tlacitko(href, text, barva) {
  const pozadi = barva === 'zelena' ? '#1F6B4A' : '#FFBF00';
  const pismo = barva === 'zelena' ? '#ffffff' : '#1a1a1a';
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px;">
<tr><td style="background:${pozadi};border-radius:4px;">
<a href="${href}" style="display:inline-block;padding:13px 26px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:15px;font-weight:700;color:${pismo};text-decoration:none;">${text}</a>
</td></tr></table>`;
}

// Formulář → potvrzovací e-mail. Co tu není, potvrzení nedostane.
export const POTVRZENI = {
  'posudek-inzeratu': {
    subject: 'Mám váš inzerát',
    html: () => obal('Mám váš inzerát', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">odkaz mi dorazil. Podívám se na něj a <strong style="color:#1a1a1a;">do dvou pracovních dnů</strong> vám napíšu, co bych změnil jako první.</p>
<p style="${P}">Než se ozvu, může se vám hodit diagnostický list z deváté kapitoly. Je to sedm čísel a když je vyplníte, polovina odpovědi z nich obvykle vypadne sama.</p>
${tlacitko('https://www.davidchoc.cz/vycvik/diagnostika', 'Otevřít diagnostický list')}
<p style="${P}margin-top:22px;">David Choc</p>
`),
  },

  'vycvik-pdf': {
    subject: 'Kniha Výcvik ziskového prodeje',
    html: () => obal('Kniha je na cestě', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">díky za zájem. Celou knihu si můžete číst online — bez registrace a bez čekání.</p>
${tlacitko('https://www.davidchoc.cz/vycvik/uvod', 'Začít číst')}
<p style="${P}margin-top:22px;">Kdyby cokoli, napište. Odpovídám osobně.</p>
<p style="${P}">David Choc</p>
`),
  },
};

// ── KUPUJÍCÍ ──────────────────────────────────────────────────────────
// Jiný tón než výcvik a jiná barva tlačítka. Žádný z těchhle e-mailů
// neslibuje PDF — dokud neexistuje, posíláme lidi na to, co existuje
// a je lepší: na simulátor, ve kterém si spočítají vlastní číslo.
const MILIONAREM_PRUVODCE = {
  subject: 'Deset zlatých cihel',
  html: () => obal('Máte to u mě', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">díky. Výcvik se píše a <strong style="color:#1a1a1a;">dám vám vědět, jakmile bude první cihla venku</strong>. Do té doby vám odsud nic jiného nepřijde — žádný newsletter, žádné upomínky.</p>
<p style="${P}">Než se ozvu, udělejte jednu věc. Zabere dvě minuty a je to jediné číslo, které potřebujete, než začnete cokoli počítat:</p>
${tlacitko('https://www.davidchoc.cz/milionarem/simulator', 'Spočítat si to na svých číslech', 'zelena')}
<p style="${P}margin-top:22px;">Uvidíte, co s vaším majetkem udělá jeden byt za dvacet let — a hlavně kdy se přestane živit z vaší výplaty a začne se živit sám.</p>
<p style="${P}">Kdyby cokoli, napište. Odpovídám osobně.</p>
<p style="${P}">David Choc</p>
`),
};

const MILIONAREM_LIST = {
  subject: 'Váš pracovní list',
  html: () => obal('Mám to', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">díky za zájem. Tištěná verze se dokončuje a pošlu vám ji, jakmile bude hotová.</p>
<p style="${P}">Nemusíte na ni ale čekat — <strong style="color:#1a1a1a;">totéž si můžete vyplnit rovnou online</strong>, spočítá se to samo a uloží se vám to v prohlížeči:</p>
${tlacitko('https://www.davidchoc.cz/milionarem/simulator', 'Otevřít nástroj', 'zelena')}
<p style="${P}margin-top:22px;">David Choc</p>
`),
};

const MILIONAREM_SERVIS = {
  subject: 'Ozvu se vám do 24 hodin',
  html: () => obal('Mám vaši zprávu', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">zpráva dorazila. <strong style="color:#1a1a1a;">Ozvu se vám do 24 hodin</strong> — osobně, ne šablonou.</p>
<p style="${P}">Než se ozvu, hodí se, když budete mít spočítaná svoje čísla. Mluví se pak úplně jinak:</p>
${tlacitko('https://www.davidchoc.cz/milionarem/simulator', 'Spustit simulátor', 'zelena')}
<p style="${P}margin-top:22px;">David Choc</p>
`),
};

POTVRZENI['milionarem-mapa'] = MILIONAREM_PRUVODCE;
POTVRZENI['milionarem-pdf'] = MILIONAREM_PRUVODCE;
POTVRZENI['investovat-pdf'] = MILIONAREM_PRUVODCE;
POTVRZENI['milionarem-servis'] = MILIONAREM_SERVIS;
POTVRZENI['investovat-servis'] = MILIONAREM_SERVIS;
POTVRZENI['investovat-mapa-cihel'] = MILIONAREM_LIST;
POTVRZENI['investovat-financni-strop'] = MILIONAREM_LIST;
POTVRZENI['investovat-srovnani-lokalit'] = MILIONAREM_LIST;
POTVRZENI['investovat-proverka'] = MILIONAREM_LIST;
POTVRZENI['investovat-rezervacni-smlouva'] = MILIONAREM_LIST;

export function potvrzeniPro(formular) {
  return POTVRZENI[formular] || null;
}
