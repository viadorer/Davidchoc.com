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

  // Původní znění slibovalo PDF, které se nikdy neposílalo. Kniha zůstává
  // online a zdarma — tenhle e-mail tedy neslibuje přílohu, ale říká, kudy
  // do ní vstoupit, aby si ji člověk nemusel číst celou popořadě.
  'vycvik-pdf': {
    subject: 'Kniha Výcvik ziskového prodeje — kudy do ní',
    html: () => obal('Kniha je celá venku', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">kniha je celá online, zdarma a bez registrace — nic vám nechodí v příloze a nic nemusíte stahovat. Zůstane tam i za dva roky.</p>
<p style="${P}">Číst popořadě je nejpoctivější, ale nejpomalejší způsob. <strong style="color:#1a1a1a;">Rychlejší je začít dotazníkem</strong> — osm otázek, dvě minuty — a nechat si říct, které kapitoly se týkají zrovna vás.</p>
${tlacitko('https://www.davidchoc.cz/vycvik/zvladnete-to-sami', 'Zvládnete to sami? (2 minuty)')}
<p style="${P}margin-top:22px;">Kdybyste chtěl číst od začátku, <a href="https://www.davidchoc.cz/vycvik/uvod" style="color:#8B7D61;">úvod je tady</a>. A kdyby cokoli, napište — odpovídám osobně.</p>
<p style="${P}">David Choc</p>
`),
  },

  'bytvpanelaku': {
    subject: 'Mám vaši zprávu — ozvu se do 24 hodin',
    html: () => obal('Mám vaši zprávu', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">zpráva o vašem bytě dorazila. <strong style="color:#1a1a1a;">Ozvu se vám do 24 hodin</strong> — domluvíme termín prohlídky a do 48 hodin od ní budete znát cenové pásmo, doložené srovnáním prodejů v domě a okolí.</p>
<p style="${P}">Do té doby nic nepodepisujete a nikomu nic neplatíte. Nabídka vás k ničemu nezavazuje — klidně si ji nechte jen pro porovnání.</p>
<p style="${P}margin-top:22px;">David Choc</p>
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
${tlacitko('https://www.davidchoc.cz/milionar', 'Spočítat si to na svých číslech', 'zelena')}
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
${tlacitko('https://www.davidchoc.cz/milionar', 'Otevřít nástroj', 'zelena')}
<p style="${P}margin-top:22px;">David Choc</p>
`),
};

const MILIONAREM_SERVIS = {
  subject: 'Ozvu se vám do 24 hodin',
  html: () => obal('Mám vaši zprávu', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">zpráva dorazila. <strong style="color:#1a1a1a;">Ozvu se vám do 24 hodin</strong> — osobně, ne šablonou.</p>
<p style="${P}">Než se ozvu, hodí se, když budete mít spočítaná svoje čísla. Mluví se pak úplně jinak:</p>
${tlacitko('https://www.davidchoc.cz/milionar', 'Spustit simulátor', 'zelena')}
<p style="${P}margin-top:22px;">David Choc</p>
`),
};

// ── SIMULÁTOR ─────────────────────────────────────────────────────────
// Tohle je jediná konverze celé sekce, a proto jediná, kde se posílá
// vlastní e-mail podle toho, co jsme na stránce slíbili. Kdo řeší koupi
// do tří měsíců a má financování, dostal nabídku konkrétních bytů — ten
// slib musí být v potvrzení doslova, jinak jsme první větou po odeslání
// zbourali všechno, co stránka nad tím poctivě postavila.
//
// POZN.: až bude výcvik v PDF přepracovaný do vyplnitelné podoby (mapa
// cihel, kontrolní otázky k bytu, pět vět ze smlouvy), patří sem odkaz
// na něj jako první zásilka. Dokud v PDF ty části nejsou, neslibuje se.
const MILIONAREM_SIM_BYTY = {
  subject: 'Vaše zadání mám — byty pošlu do dvou pracovních dnů',
  html: () => obal('Mám vaše zadání', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">čísla ze simulátoru mi dorazila. <strong style="color:#1a1a1a;">Do dvou pracovních dnů vám pošlu tři konkrétní byty</strong>, které tomu zadání odpovídají — a u každého napíšu i to, co se mi na něm nelíbí. Kdyby žádný takový zrovna nebyl, napíšu vám i to; vymýšlet si nebudu.</p>
<p style="${P}">Abych to nemusel odhadovat: <strong style="color:#1a1a1a;">stačí odpovědět na tenhle e-mail</strong> a připsat, jestli jde o první investiční byt, nebo další v pořadí. Mění to, co má smysl vám posílat.</p>
<p style="${P}">A rovnou na férovku: jsem realitní makléř, byty prodávám a na zprostředkování vydělávám. Proto vám u každého napíšu i to, co bych na něm nekupoval — je to jediný způsob, jak vám k něčemu budu.</p>
<p style="${P}margin-top:22px;">David Choc</p>
`),
};

const MILIONAREM_SIM_CISLA = {
  subject: 'Vaše zadání mám',
  html: () => obal('Mám vaše zadání', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">čísla ze simulátoru mi dorazila. <strong style="color:#1a1a1a;">Do dvou pracovních dnů se na ně podívám a napíšu vám, co bych na tom zadání změnil</strong> dřív, než začnete hledat konkrétní byt. Bez závazku — když si to pak postavíte celé sami, mám z toho stejně dobrý pocit.</p>
<p style="${P}">Nejčastěji se mění dvě věci: lokalita a poměr vlastních zdrojů. Obojí umí s výsledkem udělat víc než cena bytu, o které se přitom smlouvá nejvíc.</p>
<p style="${P}">Mezitím si klidně pohrajte s posuvníky — uložené to máte v prohlížeči:</p>
${tlacitko('https://www.davidchoc.cz/milionar', 'Zpět do simulátoru', 'zelena')}
<p style="${P}margin-top:22px;">David Choc</p>
`),
};

POTVRZENI['milionarem-simulator-byty'] = MILIONAREM_SIM_BYTY;
POTVRZENI['milionarem-simulator-cisla'] = MILIONAREM_SIM_CISLA;

POTVRZENI['milionarem-mapa'] = MILIONAREM_PRUVODCE;
POTVRZENI['milionarem-strop'] = MILIONAREM_PRUVODCE;
POTVRZENI['milionarem-lokality'] = MILIONAREM_PRUVODCE;
POTVRZENI['milionarem-proverka'] = MILIONAREM_PRUVODCE;
POTVRZENI['milionarem-rezervace'] = MILIONAREM_PRUVODCE;
POTVRZENI['milionarem-cerpani'] = MILIONAREM_PRUVODCE;
POTVRZENI['milionarem-vybaveni'] = MILIONAREM_PRUVODCE;
POTVRZENI['milionarem-najemnik'] = MILIONAREM_PRUVODCE;
POTVRZENI['milionarem-sprava'] = MILIONAREM_PRUVODCE;
POTVRZENI['milionarem-pdf'] = MILIONAREM_PRUVODCE;
POTVRZENI['investovat-pdf'] = MILIONAREM_PRUVODCE;
POTVRZENI['milionarem-servis'] = MILIONAREM_SERVIS;
POTVRZENI['investovat-servis'] = MILIONAREM_SERVIS;
POTVRZENI['investovat-mapa-cihel'] = MILIONAREM_LIST;
POTVRZENI['investovat-financni-strop'] = MILIONAREM_LIST;
POTVRZENI['investovat-srovnani-lokalit'] = MILIONAREM_LIST;
POTVRZENI['investovat-proverka'] = MILIONAREM_LIST;
POTVRZENI['investovat-rezervacni-smlouva'] = MILIONAREM_LIST;

/* ══════════════════════════════════════════════════════════════════════
   VÝCVIK — vstupní dotazník „Zvládnete to sami?"

   Tohle je jediná brána celé sekce a e-mail za ní musí unést, co brána
   slíbila: ne odkaz na obsah, který je stejně celý venku zdarma, ale
   plán postavený z toho, co člověk sám označil za nezvládnuté.

   Pořadí kroků v plánu není libovolné — je to pořadí prodeje. Kdo
   nemá cenu, nemá co fotit; kdo nemá fotky, nemá co inzerovat. Proto
   se kroky řadí podle čísla otázky a ne podle závažnosti.
   ══════════════════════════════════════════════════════════════════════ */

// Ke každé otázce dotazníku patří jeden konkrétní úkol a kapitola, kde
// je rozepsaný. Klíč je číslo otázky, ne kapitoly — otázky 7 a 8 vedou
// do stejné kapitoly, ale každá znamená jinou práci.
const ZKOUSKA_KROKY = {
  1: {
    kapitola: 'Kapitola 1 — Cena',
    url: 'https://www.davidchoc.cz/vycvik/kapitola-1-cena',
    ukol: 'Sežeňte tři nezávislé zdroje a napište si tři částky: optimistickou, realistickou a nejnižší přijatelnou. Dokud je nemáte na papíře, nikam nevolejte — první číslo, které vyslovíte, se pak už jen snižuje.',
  },
  2: {
    kapitola: 'Kapitola 2 — Příprava nemovitosti',
    url: 'https://www.davidchoc.cz/vycvik/kapitola-2-priprava',
    ukol: 'Nechte nemovitost projít někým zvenčí, kdo vám neřekne jen to hezké. Vy ji vidíte deset let a přestal jste vidět, co vidí kupující za prvních deset vteřin.',
  },
  3: {
    kapitola: 'Kapitola 3 — Fotografie',
    url: 'https://www.davidchoc.cz/vycvik/kapitola-3-fotografie',
    ukol: 'Osm dobrých fotek, půdorys a virtuální prohlídka. O tom, jestli si vás někdo vůbec otevře, rozhoduje jediný náhled mezi dvaceti jinými.',
  },
  4: {
    kapitola: 'Kapitola 4 — Inzerát',
    url: 'https://www.davidchoc.cz/vycvik/kapitola-4-inzerat',
    ukol: 'Doplňte konkrétní čísla, měsíční náklady, energetickou třídu — a jednu přiznanou nevýhodu. Ta přiznaná nevýhoda vám udělá víc než tři superlativy, protože zbytku textu dá důvěryhodnost.',
  },
  5: {
    kapitola: 'Kapitola 5 — Inzerce a kanály',
    url: 'https://www.davidchoc.cz/vycvik/kapitola-5-inzerce',
    ukol: 'Víc než jeden kanál, cedule přímo na nemovitosti a poznámka u každého zájemce, odkud přišel. Bez toho posledního po měsíci nevíte, co vypnout a do čeho přidat.',
  },
  6: {
    kapitola: 'Kapitola 6 — Telefonáty a prohlídky',
    url: 'https://www.davidchoc.cz/vycvik/kapitola-6-prohlidky',
    ukol: 'Kvalifikujte každého volajícího — hlavně jestli musí nejdřív sám něco prodat. A na prohlídku nechoďte sám, nikdy.',
  },
  7: {
    kapitola: 'Kapitola 7 — Smlouvy a úschova',
    url: 'https://www.davidchoc.cz/vycvik/kapitola-7-smlouvy',
    ukol: 'Vyberte advokáta nebo notáře a trvejte na úschově kupní ceny. Tohle je jediné místo v celém prodeji, kde se chybou nepřichází o peníze, ale o peníze i o nemovitost zároveň.',
  },
  8: {
    kapitola: 'Kapitola 7 — Smlouvy a úschova',
    url: 'https://www.davidchoc.cz/vycvik/kapitola-7-smlouvy',
    ukol: 'Vyřešte vlastní hypotéku, sepište konkrétní vady do kupní smlouvy a zjistěte, jak to u vás bude s daní z příjmu. Všechny tři věci se řeší předem — po podpisu už se neřeší, jen platí.',
  },
};

// Verdikt musí být stejný jako na stránce. Kdyby se lišil, první, co
// člověk po odeslání formuláře zjistí, je že mu web říká něco jiného
// než e-mail — a to je konec důvěry v cokoli dalšího.
function zkouskaVerdikt(skore) {
  if (skore >= 8) return {
    titul: 'Prošel jste.',
    text: 'Máte to srovnané líp než většina lidí, kteří prodávají sami, a upřímně líp než část makléřů. Jděte do toho. Držte se svých tří čísel a nenechte si ujet sedmou kapitolu.',
  };
  if (skore >= 6) return {
    titul: 'Chybí vám kus.',
    text: 'Nic dramatického. Ale to, co chybí, doplňte dřív, než uděláte další krok — ne až se to připomene samo. Je to práce na jedno odpoledne.',
  };
  if (skore >= 4) return {
    titul: 'Stojíte na hraně.',
    text: 'Prodat to zvládnete. Otázka je za kolik a s jakými nervy. Většina toho, co vám chybí, se dá dohnat za týden — pokud víte, v jakém pořadí. Proto je ten seznam níž seřazený a ne jen vyjmenovaný.',
  };
  return {
    titul: 'Nedělejte to sám.',
    text: 'Neříkám to proto, abych vám nabídl služby. Říkám to proto, že přesně v tomhle stavu se nemovitosti prodávají pod cenou a podepisují smlouvy, které se pak předělávají. Není to o tom, že to nezvládnete — je to o tom, že takhle připravený to nezvládne nikdo.',
  };
}

function zkouskaSeznam(idcka) {
  if (!idcka.length) return '';
  const polozky = idcka.map((id, i) => {
    const krok = ZKOUSKA_KROKY[id];
    if (!krok) return '';
    return `<tr><td style="padding:0 0 20px;">
<p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#8B7D61;letter-spacing:.04em;">${i + 1}. KROK</p>
<p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:#444;">${krok.ukol}</p>
<p style="margin:0;font-size:13px;"><a href="${krok.url}" style="color:#8B7D61;">${krok.kapitola} &rarr;</a></p>
</td></tr>`;
  }).join('');

  return `<p style="${P}margin-top:26px;"><strong style="color:#1a1a1a;">Co doplnit, a v tomhle pořadí:</strong></p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:14px 0 0;">${polozky}</table>
<p style="margin:6px 0 0;font-size:13px;line-height:1.6;color:#8a8378;">Pořadí není podle závažnosti, ale podle prodeje. Kdo nemá cenu, nemá co fotit — a kdo nemá fotky, nemá co inzerovat.</p>`;
}

function zkouskaRizika(rizika) {
  if (!rizika) return '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:26px 0 0;">
<tr><td style="background:#fdf6e8;border-left:3px solid #FFBF00;padding:16px 18px;">
<p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#1a1a1a;">Tohle platí bez ohledu na skóre</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.65;color:#444;">Označil jste: ${rizika}.</p>
<p style="margin:0;font-size:14px;line-height:1.65;color:#444;">V takové situaci se poraďte s odborníkem, i kdybyste měl osm z osmi. Každá z těch situací umí prodej zastavit uprostřed — typicky ve chvíli, kdy už máte kupce a sám jste podepsal koupi něčeho jiného.</p>
</td></tr></table>`;
}

const VYCVIK_ZKOUSKA = {
  subject: (d) => `Váš výsledek: ${Number(d && d.score) || 0} z 8`,
  html: (d) => {
    const skore = Number(d && d.score) || 0;
    const idcka = String((d && d.missing_ids) || '')
      .split(',')
      .map(s => parseInt(s, 10))
      .filter(n => n >= 1 && n <= 8)
      .sort((a, b) => a - b);
    const rizika = String((d && d.risks) || '').trim();
    const v = zkouskaVerdikt(skore);

    // Další krok se liší podle toho, kolik toho chybí. U plného skóre by
    // nabídka schůzky byla akvizice převlečená za radu; u nízkého by bylo
    // neupřímné poslat člověka zpátky číst a nic víc neříct.
    let dalsi;
    if (skore >= 6) {
      dalsi = `<p style="${P}margin-top:26px;">Nabídku spolupráce vám tady dávat nebudu — na to jste na ni odpověděl moc dobře. Všechny nástroje z knihy vám zůstávají otevřené, i kdybyste se k nim vrátil za dva roky.</p>
${tlacitko('https://www.davidchoc.cz/vycvik/vybava', 'Vaše výbava')}`;
    } else if (skore >= 4) {
      dalsi = `<p style="${P}margin-top:26px;">Když si nad tím budete chtít sednout s někým, kdo tím prošel párkrát: dvacet minut, nezávazně, a nikdo vám pak nebude volat. Klidně jen proto, abyste si potvrdil, že to děláte správně.</p>
${tlacitko('https://www.davidchoc.cz/pripad-pro-agenta', 'Nezávazná konzultace')}`;
    } else {
      dalsi = `<p style="${P}margin-top:26px;">Nabídnu vám dvě věci a obě myslím vážně. Buď si projděte kroky výš a pak si dotazník dejte znovu — je zdarma a nikdo vám ho nepočítá. Nebo mi napište, v čem jste, a řekneme si to za dvacet minut. <strong style="color:#1a1a1a;">Když z toho vyjde, že si to máte udělat sám, řeknu vám to</strong> — přijdu o zakázku a získám člověka, který o mně bude mluvit dobře. Ta druhá věc vydrží déle.</p>
${tlacitko('https://www.davidchoc.cz/pripad-pro-agenta', 'Napsat, v čem jsem')}`;
    }

    return obal(`Váš výsledek: ${skore} z 8`, `
<p style="${P}">Dobrý den,</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
<tr><td style="background:#1a1a1a;padding:14px 22px;border-radius:6px;">
<span style="font-size:30px;font-weight:800;color:#FFBF00;line-height:1;">${skore}</span>
<span style="font-size:15px;color:#c9c2b4;"> &nbsp;z 8</span>
</td></tr></table>
<p style="margin:0 0 12px;font-size:18px;font-weight:800;color:#1a1a1a;">${v.titul}</p>
<p style="${P}">${v.text}</p>
${zkouskaSeznam(idcka)}
${zkouskaRizika(rizika)}
${dalsi}
<p style="margin:26px 0 0;font-size:13px;line-height:1.6;color:#8a8378;">Celá kniha zůstává online a zdarma, bez registrace — tenhle e-mail je jen váš plán, ne vstupenka. Kdykoli si dotazník dáte znovu, dostanete nový.</p>
<p style="${P}margin-top:22px;">David Choc</p>
`);
  },
};

POTVRZENI['vycvik-zkouska'] = VYCVIK_ZKOUSKA;

// Posouzení inzerátu z knihy je stejná služba jako na samostatné stránce,
// takže i stejný slib. Kdyby tenhle klíč zůstal bez šablony, člověk se
// zaseknutou nabídkou — nejteplejší lead celé sekce — nedostane nic.
POTVRZENI['vycvik-posudek'] = POTVRZENI['posudek-inzeratu'];

export function potvrzeniPro(formular) {
  return POTVRZENI[formular] || null;
}
