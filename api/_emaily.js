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
    subject: 'Mám vaši zprávu — ozvu se do hodiny',
    html: () => obal('Mám vaši zprávu', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">zpráva o vašem bytě dorazila. <strong style="color:#1a1a1a;">Ozvu se vám do hodiny, mezi osmou a osmou</strong> — domluvíme termín prohlídky a do 48 hodin od ní budete znát cenové pásmo, doložené srovnáním prodejů v domě a okolí.</p>
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
  subject: 'Ozvu se vám do hodiny',
  html: () => obal('Mám vaši zprávu', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">zpráva dorazila. <strong style="color:#1a1a1a;">Ozvu se vám do hodiny, mezi osmou a osmou</strong> — osobně, ne šablonou.</p>
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

// Výsledek nástroje z kapitoly. Kdo si o něj řekne, dostane svoje čísla —
// ne leták. Řádky chodí v metadatech jako předrenderovaný text, protože
// metadata leadu nesou jen řetězce a čísla.
const MILIONAREM_VYSLEDEK = {
  subject: (d) => (d && d.nastroj) ? `Váš výsledek: ${d.nastroj}` : 'Váš výsledek',
  html: (d) => {
    const nastroj = (d && d.nastroj) || 'nástroj';
    const radky = ((d && d.vystup) || '').split('\n').filter(Boolean).map((r) => {
      const i = r.indexOf(': ');
      if (i === -1) {
        return `<p style="${P}margin:0 0 6px;"><strong style="color:#1a1a1a;">${r}</strong></p>`;
      }
      return `<p style="${P}margin:0 0 6px;">${r.slice(0, i)}: <strong style="color:#1a1a1a;">${r.slice(i + 2)}</strong></p>`;
    }).join('');

    return obal('Váš výsledek', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">tady je to, co vám vyšlo v nástroji <strong style="color:#1a1a1a;">${nastroj}</strong>. Schovejte si to — až budete stát před konkrétním bytem, budou to jediná čísla, která budete potřebovat.</p>
<div style="border-left:3px solid #1F6B4A;padding:14px 0 14px 16px;margin:20px 0;">
${radky}
</div>
<p style="${P}">Čísla platí pro to, co jste zadal. Když se něco změní — sazba, příjem, cena bytu — přepočítejte si to znovu, nástroj vám hodnoty pamatuje v prohlížeči.</p>
<p style="${P}">A jestli chcete vidět, co s vaším majetkem udělá celý byt za dvacet let, je na to samostatný nástroj:</p>
${tlacitko('https://www.davidchoc.cz/milionar', 'Spustit simulátor', 'zelena')}
<p style="${P}margin-top:22px;">Až budete mít konkrétní byt, napište. Podívám se na něj a řeknu vám, co bych na něm řešil dřív než cenu — i kdyby to nakonec bylo „tenhle nekupovat".</p>
<p style="${P}">David Choc</p>
`);
  },
};

POTVRZENI['milionarem-mapa'] = MILIONAREM_VYSLEDEK;
POTVRZENI['milionarem-strop'] = MILIONAREM_VYSLEDEK;
POTVRZENI['milionarem-lokality'] = MILIONAREM_VYSLEDEK;
POTVRZENI['milionarem-proverka'] = MILIONAREM_VYSLEDEK;
POTVRZENI['milionarem-rezervace'] = MILIONAREM_VYSLEDEK;
POTVRZENI['milionarem-cerpani'] = MILIONAREM_VYSLEDEK;
POTVRZENI['milionarem-vybaveni'] = MILIONAREM_VYSLEDEK;
POTVRZENI['milionarem-najemnik'] = MILIONAREM_VYSLEDEK;
POTVRZENI['milionarem-sprava'] = MILIONAREM_VYSLEDEK;
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
    titul: 'Prošel jste. A je vás málo.',
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
    titul: 'Takhle připravený do toho nechoďte.',
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

// Ke každé rizikové situaci to, co u prodeje reálně mění a kdy se to řeší.
// Vědomě obecné a bez rad na míru — konkrétní postup patří advokátovi,
// tohle má jen zabránit tomu, aby to člověk zjistil až u kupce.
const ZKOUSKA_RIZIKA = {
  1: {
    nazev: 'Podílové spoluvlastnictví bez shody',
    text: 'Kupní smlouvu musí podepsat všichni spoluvlastníci. Bez shody se neprodává celá nemovitost, ale jen váš podíl — a ten se prodává výrazně hůř a levněji. Shoda se řeší dřív, než dáte nabídku ven, ne až když máte kupce.',
  },
  2: {
    nazev: 'Neukončené dědické řízení',
    text: 'Dokud usnesení není pravomocné, nejste zapsaný vlastník a nemůžete převádět. Prodej se dá připravit — nafotit, ocenit, i inzerovat — ale podepisuje se až potom. Termíny s kupujícím tomu musí odpovídat, jinak vám odejde.',
  },
  3: {
    nazev: 'Rozvod nebo dělení společného jmění',
    text: 'Nemovitost ve společném jmění prodávají oba manželé společně. Když se SJM zrovna vypořádává, rozhoduje fáze, ve které je — určuje, kdo smlouvu podepisuje a co je k tomu potřeba doložit. Vyjasnit předem, ne u notáře.',
  },
  4: {
    nazev: 'Zástava, exekuce, insolvence nebo věcné břemeno',
    text: 'Je to na listu vlastnictví a uvidí to každá banka kupujícího. Zástava se typicky řeší výmazem proti splacení z kupní ceny, exekuce přes exekutora. Klíčové je, aby to bylo naplánované do úschovy — pořadí kroků tady rozhoduje o všem.',
  },
  5: {
    nazev: 'Nájemce v nemovitosti',
    text: 'Nájem přechází na kupujícího a nový majitel do bytu nenastěhuje. Tím vám odpadne většina kupujících, kteří chtějí bydlet, a zbydou investoři — což se promítne do ceny. Rozhodnutí, jestli prodávat s nájemcem nebo bez, se dělá před inzercí.',
  },
  6: {
    nazev: 'Družstevní podíl',
    text: 'Neprodáváte nemovitost, ale členský podíl v družstvu. Je to jiná smlouva, jiný proces a katastr do toho nevstupuje — takže ani úschova a převod nevypadají stejně. Postup určují stanovy družstva, sežeňte si je dřív, než začnete.',
  },
  7: {
    nazev: 'Kupující nebo peníze ze zahraničí',
    text: 'Banka i úschovatel prověřují původ peněz podrobněji a trvá to déle. Není to překážka, je to zdržení — ale musí se s ním počítat ve lhůtách v rezervační i kupní smlouvě, jinak vám propadnou termíny, které jste sám nastavil.',
  },
  8: {
    nazev: 'Nesoulad se stavem v katastru',
    text: 'Zazděné dveře, přístavba, jiná výměra než v dokumentaci. Vyjde to najevo u odhadce banky kupujícího a obchod se v tu chvíli zastaví na týdny. Řeší se před inzercí — po podpisu rezervace už jste ve vleku cizích termínů.',
  },
};

function zkouskaRizika(rizika, idcka) {
  if (!rizika && !(idcka && idcka.length)) return '';

  const detaily = (idcka || [])
    .map(id => ZKOUSKA_RIZIKA[id])
    .filter(Boolean)
    .map(r => `<p style="margin:0 0 14px;font-size:14px;line-height:1.65;color:#444;">
<strong style="color:#1a1a1a;">${r.nazev}.</strong> ${r.text}</p>`)
    .join('');

  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:26px 0 0;">
<tr><td style="background:#fdf6e8;border-left:3px solid #FFBF00;padding:18px 20px;">
<p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#1a1a1a;">Tohle platí bez ohledu na skóre</p>
${detaily || `<p style="margin:0 0 14px;font-size:14px;line-height:1.65;color:#444;">Označil jste: ${rizika}.</p>`}
<p style="margin:0;font-size:14px;line-height:1.65;color:#666;">Tohle je obecný popis, ne rada na váš případ — konkrétní postup patří advokátovi a u těchhle situací se to nevyplácí obcházet. Napište mi, co přesně máte, a řeknu vám, co bych na vašem místě ošetřil první.</p>
</td></tr></table>`;
}

const VYCVIK_ZKOUSKA = {
  // Předmět u právní překážky nemluví o skóre — skóre tam nerozhoduje
  // a nadpis, který ho hlásí jako první, míří vedle.
  subject: (d) => (String((d && d.risk_ids) || '').trim() || String((d && d.risks) || '').trim())
    ? 'K tomu, co jste označil'
    : `Váš výsledek: ${Number(d && d.score) || 0} z 8`,
  html: (d) => {
    const skore = Number(d && d.score) || 0;
    const idcka = String((d && d.missing_ids) || '')
      .split(',')
      .map(s => parseInt(s, 10))
      .filter(n => n >= 1 && n <= 8)
      .sort((a, b) => a - b);
    const rizika = String((d && d.risks) || '').trim();
    const rizikaIds = String((d && d.risk_ids) || '')
      .split(',')
      .map(s => parseInt(s, 10))
      .filter(n => n >= 1 && n <= 8)
      .sort((a, b) => a - b);
    const maRizika = rizikaIds.length > 0 || !!rizika;
    const v = zkouskaVerdikt(skore);

    // Další krok se liší podle toho, co člověku vyšlo. U plného skóre by
    // nabídka schůzky byla akvizice převlečená za radu; u nízkého by bylo
    // neupřímné poslat člověka zpátky číst a nic víc neříct. A právní
    // překážka přebíjí obojí — tam skóre nerozhoduje o ničem.
    let dalsi;
    if (maRizika) {
      dalsi = `<p style="${P}margin-top:26px;">Ať už vám ve zbytku dotazníku vyšlo cokoli, tohle je ta věc, kterou bych na vašem místě řešil první. Napište mi, co přesně máte — <strong style="color:#1a1a1a;">odpovím osobně a řeknu vám, co se dá ošetřit předem a co si vyžádá advokáta.</strong> I kdyby z toho vyšlo, že mě k tomu nepotřebujete.</p>
${tlacitko('https://www.davidchoc.cz/chci-si-to-overit', 'Napsat, co mám za situaci')}`;
    } else if (skore >= 6) {
      dalsi = `<p style="${P}margin-top:26px;">Nabídku spolupráce vám tady dávat nebudu — na to jste na dotazník odpověděl moc dobře. Všechny nástroje z knihy vám zůstávají otevřené, i kdybyste se k nim vrátil za dva roky.</p>
<p style="${P}">Jedna věc ale platí i pro vás. Připravení lidé se nejčastěji spálí až u kupní smlouvy a úschovy — tam už nejde o to, jestli to umíte prodat, ale jestli o peníze nepřijdete. <strong style="color:#1a1a1a;">Až budete u téhle fáze, napište mi a smlouvu vám projdu.</strong> I když prodáváte sám a nic spolu nepodepisujeme.</p>
${tlacitko('https://www.davidchoc.cz/vycvik/kapitola-7-smlouvy', 'Kapitola 7 — smlouvy a úschova')}`;
    } else if (skore >= 4) {
      dalsi = `<p style="${P}margin-top:26px;">Když si nad tím budete chtít sednout s někým, kdo tím prošel párkrát: dvacet minut, nezávazně, a nikdo vám pak nebude volat. Klidně jen proto, abyste si potvrdil, že to děláte správně.</p>
${tlacitko('https://www.davidchoc.cz/chci-si-to-overit', 'Nezávazná konzultace')}`;
    } else {
      dalsi = `<p style="${P}margin-top:26px;">Nabídnu vám dvě věci a obě myslím vážně. Buď si projděte kroky výš a pak si dotazník dejte znovu — je zdarma a nikdo vám ho nepočítá. Nebo mi napište, v čem jste, a řekneme si to za dvacet minut. <strong style="color:#1a1a1a;">Když z toho vyjde, že si to máte udělat sám, řeknu vám to</strong> — přijdu o zakázku a získám člověka, který o mně bude mluvit dobře. Ta druhá věc vydrží déle.</p>
${tlacitko('https://www.davidchoc.cz/chci-si-to-overit', 'Napsat, v čem jsem')}`;
    }

    return obal(maRizika ? 'K tomu, co jste označil' : `Váš výsledek: ${skore} z 8`, `
<p style="${P}">Dobrý den,</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
<tr><td style="background:#1a1a1a;padding:14px 22px;border-radius:6px;">
<span style="font-size:30px;font-weight:800;color:#FFBF00;line-height:1;">${skore}</span>
<span style="font-size:15px;color:#c9c2b4;"> &nbsp;z 8</span>
</td></tr></table>
<p style="margin:0 0 12px;font-size:18px;font-weight:800;color:#1a1a1a;">${v.titul}</p>
<p style="${P}">${v.text}</p>
${zkouskaSeznam(idcka)}
${zkouskaRizika(rizika, rizikaIds)}
${dalsi}
<p style="margin:26px 0 0;font-size:13px;line-height:1.6;color:#8a8378;">Celá kniha zůstává online a zdarma, bez registrace — tenhle e-mail není vstupenka do obsahu. Kdykoli si dotazník dáte znovu, dostanete nový.</p>
<p style="${P}margin-top:22px;">David Choc</p>
`);
  },
};

POTVRZENI['vycvik-zkouska'] = VYCVIK_ZKOUSKA;

/* ══════════════════════════════════════════════════════════════════════
   VÝCVIK — rozpis z průvodce „krok za krokem"

   Druhý vstup do téže konverzní události. Rozdíl proti dotazníku: tady
   si člověk nespočítal, co umí, ale co ho to bude stát. E-mail proto
   nevrací verdikt, vrací jeho vlastní čísla — a u fází, které odmítl,
   jednu větu, co s nimi jde dělat, aniž by si musel najmout makléře.
   ══════════════════════════════════════════════════════════════════════ */
const PLAN_FAZE = {
  1: ['Ocenění', 'Tuhle fázi za vás udělá odhad online a pak jeden telefonát na odhadce. Nemusíte umět oceňovat — musíte jen odmítnout rozhodnout se podle inzerce sousedů.'],
  2: ['Příprava dokumentů', 'Nejotravnější, ale nejmíň odborná fáze celého prodeje. Je to série žádostí a čekání; dá se to celé odbýt e-mailem a dvěma návštěvami úřadu.'],
  3: ['Příprava nemovitosti', 'Tady se dá koupit pomoc nejlevněji ze všech fází — úklidová firma, malíř, případně home staging. Vy musíte udělat jedinou věc: pustit do bytu někoho, kdo vám řekne pravdu.'],
  4: ['Fotografie, půdorys, prohlídka', 'Fotograf na interiéry to udělá za jedno dopoledne. Tohle je nejlevnější položka s největším dopadem na cenu, na které se nevyplatí šetřit ani při samoprodeji.'],
  5: ['Inzerce', 'Text napíše generátor z knihy, vložení na portály je hodina práce. Nejtěžší na téhle fázi není práce, ale disciplína sledovat čísla od prvního dne.'],
  6: ['Telefonáty a prohlídky', 'Tuhle fázi si koupit nejde a delegovat taky ne. Je to nejtvrdší část samoprodeje: dostupnost na telefonu, cizí lidé v bytě a patnáct až třicet víkendových prohlídek.'],
  7: ['Dohoda a rezervace', 'Vyjednávat za sebe je nejhorší možná pozice a nesouvisí to se schopnostmi. Když nic jiného, nechte si první nabídku přes noc uležet a mějte předem napsané číslo, pod které nejdete.'],
  8: ['Smlouvy a úschova', 'Tuhle fázi neděláte sám ani s makléřem — dělá ji advokát a platíte ji tak jako tak. Vaše práce je vybrat ho a ohlídat pořadí: peníze do úschovy dřív než návrh na katastr.'],
  9: ['Vklad do katastru', 'Tři až šest týdnů čekání, které neovlivníte. Vaše jediná práce je podat návrh se správnými přílohami a rychle reagovat, když katastr něco vytkne.'],
  10: ['Předání a vyúčtování', 'Jeden protokol, tři přepisy energií a jedna otázka na daňového poradce. Nejpodceňovanější fáze — a jediná, kde se spory objeví až po prodeji.'],
};

const VYCVIK_PLAN = {
  subject: 'Váš rozpis prodeje',
  html: (d) => {
    const prosel = Number(d && d.prosel_fazi) || 0;
    const hmin = Number(d && d.hodin_min) || 0;
    const hmax = Number(d && d.hodin_max) || 0;
    const naklady = Number(d && d.naklady) || 0;
    const ids = String((d && d.nechce_ids) || '')
      .split(',')
      .map(s => parseInt(s, 10))
      .filter(n => n >= 1 && n <= 10)
      .sort((a, b) => a - b);
    const ne = ids.length;
    const kc = new Intl.NumberFormat('cs-CZ').format(naklady);
    const hod = hmin === hmax ? `${hmin}` : `${hmin}–${hmax}`;

    let uvod;
    if (ne === 0) {
      uvod = 'Prošel jste průvodce a u žádné fáze jste neřekl „tohle ne". Podle vlastního odhadu to tedy zvládnete — a nebudu vám vymlouvat něco, co dáte.';
    } else if (ne <= 2) {
      uvod = `U ${ne === 1 ? 'jedné fáze' : 'dvou fází'} jste označil, že to dělat nechcete. Zbytek berete na sebe, což je slušný kus práce — a to, co vám nesedí, se dá buď naučit, nebo koupit zvlášť.`;
    } else if (ne <= 4) {
      uvod = `U ${ne} fází jste označil, že to dělat nechcete. To už není detail, ale pořád to není důvod couvnout — jen to znamená, že prodej sám u vás nebude o tolik levnější, kolik to vypadá.`;
    } else {
      uvod = `U ${ne} fází z deseti jste označil, že to dělat nechcete. Řeknu to rovnou, i když z toho vypadá, že si sháním zakázku: neznamená to, že to neumíte. Znamená to, že prodej sám u vás nebude levnější, jen jinak drahý.`;
    }

    const seznam = ne
      ? `<p style="${P}margin-top:26px;"><strong style="color:#1a1a1a;">Fáze, které jste odmítl — a co s nimi:</strong></p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:14px 0 0;">
${ids.map(id => {
  const f = PLAN_FAZE[id];
  if (!f) return '';
  return `<tr><td style="padding:0 0 18px;">
<p style="margin:0 0 5px;font-size:15px;font-weight:700;color:#1a1a1a;">${id}. ${f[0]}</p>
<p style="margin:0;font-size:15px;line-height:1.65;color:#444;">${f[1]}</p>
</td></tr>`;
}).join('')}
</table>`
      : '';

    const dalsi = ne >= 5
      ? `<p style="${P}margin-top:26px;">Nabídnu vám dvacet minut nad vaší konkrétní nemovitostí. Nezávazně, a <strong style="color:#1a1a1a;">jestli z toho vyjde, že mě nepotřebujete, řeknu vám to</strong> — přijdu o zakázku a získám člověka, který o mně bude mluvit dobře. Ta druhá věc vydrží déle.</p>
${tlacitko('https://www.davidchoc.cz/chci-si-to-overit', 'Dvacet minut nad mojí situací')}`
      : `<p style="${P}margin-top:26px;">Nabídku spolupráce vám tady dávat nebudu. Jedna věc ale platí i pro připravené: nejčastěji se lidé spálí až u kupní smlouvy a úschovy — tam už nejde o to, jestli to umíte prodat, ale jestli o peníze nepřijdete. <strong style="color:#1a1a1a;">Až budete u téhle fáze, napište mi a smlouvu vám projdu</strong>, i když prodáváte sám.</p>
${tlacitko('https://www.davidchoc.cz/vycvik/kapitola-7-smlouvy', 'Kapitola 7 — smlouvy a úschova')}`;

    return obal('Váš rozpis prodeje', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">tady jsou vaše čísla z průvodce, ať je nemusíte počítat znovu.</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
<tr><td style="background:#1a1a1a;padding:18px 22px;border-radius:6px;">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#c9c2b4;">Vaše práce</p>
<p style="margin:0 0 14px;font-size:26px;font-weight:800;color:#FFBF00;line-height:1;">${hod} hodin</p>
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#c9c2b4;">Náklady navíc oproti prodeji s makléřem</p>
<p style="margin:0;font-size:26px;font-weight:800;color:#FFBF00;line-height:1;">${kc} Kč</p>
</td></tr></table>
<p style="margin:0 0 20px;font-size:13px;line-height:1.6;color:#8a8378;">Prošel jste ${prosel} z deseti fází. Právní část — smlouva, úschova, kolek — do porovnání nevstupuje, protože ji platíte s makléřem i bez něj. Čísla jsou orientační rozpětí, ne nabídka.</p>
<p style="${P}">${uvod}</p>
${seznam}
${dalsi}
<p style="margin:26px 0 0;font-size:13px;line-height:1.6;color:#8a8378;">Průvodce i celá kniha zůstávají online a zdarma, bez registrace. Odškrtané fáze máte uložené v prohlížeči — kdykoli si to můžete přepočítat znovu.</p>
<p style="${P}margin-top:22px;">David Choc</p>
`);
  },
};

POTVRZENI['vycvik-plan'] = VYCVIK_PLAN;

// ── BRÁNY V KAPITOLÁCH ────────────────────────────────────────────────
// Kdo dočte kapitolu a uvědomí si, že mu něco chybí, měl dosud jedinou
// možnost: vrátit se na rozcestník a začít dotazník od začátku. Tyhle tři
// e-maily jsou přesně to, co brána v kapitole slibuje — nic víc — a všechno
// v nich vede na nástroje, které na webu opravdu jsou.

const VYCVIK_KAPITOLA_CENA = {
  subject: 'Tři zdroje, ze kterých se cena dá podložit',
  html: () => obal('Tři zdroje k ceně', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">slíbil jsem tři nezávislé zdroje. Schválně v tomhle pořadí — každý další je pomalejší, ale přesnější.</p>
<p style="${P}"><strong style="color:#1a1a1a;">1. Online odhad.</strong> Do dvou minut a zdarma. Berte ho jako první orientaci, ne jako číslo do inzerátu.</p>
${tlacitko('https://www.davidchoc.cz/ocenit-online', 'Odhadnout cenu online')}
<p style="${P}margin-top:22px;"><strong style="color:#1a1a1a;">2. Skutečně dokončené prodeje ve vašem okolí</strong>, ne inzertní ceny sousedů. Inzerát říká, co si kdo přeje. Kupní smlouva říká, za kolik se to nakonec prodalo — a to jsou dvě různá čísla, obvykle o desítky tisíc.</p>
<p style="${P}"><strong style="color:#1a1a1a;">3. Znalecký posudek</strong>, pokud jde o netypickou nemovitost nebo o ni bude spor. U běžného bytu je to zbytečný náklad, u domu s pozemkem nebo v dědickém řízení se vyplatí.</p>
<p style="${P}">Až budete mít čísla, napište si tři částky: optimistickou, realistickou a nejnižší přijatelnou. Tu poslední si schovejte a nikomu ji neříkejte — je to jediné číslo, které vás při vyjednávání udrží na nohou.</p>
<p style="${P}margin-top:22px;">Kdyby se zdroje rozcházely a nevěděl jste, kterému věřit, napište mi. Odpovídám osobně.</p>
<p style="${P}">David Choc</p>
`),
};

const VYCVIK_KAPITOLA_FOTKY = {
  subject: 'Osm záběrů, které v inzerátu musí být',
  html: () => obal('Seznam záběrů', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">seznam je na webu jako odškrtávací list — otevřete si ho v telefonu při focení. Stav se uloží v prohlížeči, takže se k němu můžete vrátit.</p>
${tlacitko('https://www.davidchoc.cz/vycvik/fotky', 'Otevřít seznam záběrů')}
<p style="${P}margin-top:22px;">Tři věci, na kterých to stojí:</p>
<p style="${P}"><strong style="color:#1a1a1a;">Hlavní fotka rozhoduje o všem ostatním.</strong> Kupující ji vidí tři vteřiny mezi dvaceti dalšími. Nemá to být koupelna ani chodba — má to být nejlepší pohled do nejlepší místnosti.</p>
<p style="${P}"><strong style="color:#1a1a1a;">Ukliďte víc, než vám přijde nutné.</strong> Na fotce je vidět všechno, čeho si doma po letech už nevšimnete.</p>
<p style="${P}"><strong style="color:#1a1a1a;">Foťte za světla</strong>, ne večer s rozsvíceným lustrem. Rozdíl mezi dopoledním a večerním snímkem téhož pokoje je větší než rozdíl mezi telefonem a zrcadlovkou.</p>
<p style="${P}margin-top:22px;">David Choc</p>
`),
};

const VYCVIK_KAPITOLA_SMLOUVY = {
  subject: 'Na co si dát pozor u úschovy',
  html: () => obal('Úschova — na co si dát pozor', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">tohle je jediná část prodeje, kde se chyba nedá opravit slevou z ceny. Buď je úschova ošetřená, nebo o peníze přijdete — mezi tím není nic.</p>
<p style="${P}"><strong style="color:#1a1a1a;">Peníze nikdy nesmí jít přímo prodávajícímu ani kupujícímu.</strong> Patří do úschovy u advokáta, notáře nebo banky a uvolní se až po zápisu do katastru.</p>
<p style="${P}"><strong style="color:#1a1a1a;">Úschova u realitní kanceláře na jejím běžném účtu není úschova.</strong> Ptejte se, kde peníze leží a kdo k nim má přístup.</p>
<p style="${P}"><strong style="color:#1a1a1a;">Ve smlouvě musí stát, co se stane, když se vklad nepovede.</strong> Nejen kdy se peníze vyplatí, ale i kdy a komu se vrátí.</p>
<p style="${P}">Řádek po řádku je to rozepsané tady — projděte si to dřív, než něco podepíšete:</p>
${tlacitko('https://www.davidchoc.cz/vycvik/uschova', 'Co musí být ve smlouvě o úschově')}
<p style="${P}margin-top:22px;">A jestli chcete vidět, kdy se co v transakci děje, <a href="https://www.davidchoc.cz/vycvik/transakce" style="color:#8B7D61;">časová osa je tady</a> — čtrnáct kroků od rezervace po daňové přiznání.</p>
<p style="${P}margin-top:22px;">Tady se pálí i připravení lidé. Až budete u kupní smlouvy a úschovy, klidně mi ji pošlete — projdu vám ji, i když prodáváte sám a nic spolu nepodepisujeme.</p>
<p style="${P}">David Choc</p>
`),
};

POTVRZENI['vycvik-kapitola-cena'] = VYCVIK_KAPITOLA_CENA;
POTVRZENI['vycvik-kapitola-fotky'] = VYCVIK_KAPITOLA_FOTKY;
POTVRZENI['vycvik-kapitola-smlouvy'] = VYCVIK_KAPITOLA_SMLOUVY;


// Posouzení inzerátu z knihy je stejná služba jako na samostatné stránce,
// takže i stejný slib. Kdyby tenhle klíč zůstal bez šablony, člověk se
// zaseknutou nabídkou — nejteplejší lead celé sekce — nedostane nic.
POTVRZENI['vycvik-posudek'] = POTVRZENI['posudek-inzeratu'];

/* ══════════════════════════════════════════════════════════════════════
   ZKRATKA — nedokončený dotazník

   Kdo se v dotazníku zasekl, dostane rovnou to, kvůli čemu tam šel:
   všech osm bodů i s úkolem. Body, které už zodpověděl, zůstávají
   odškrtnuté — jinak by e-mail vypadal, že jeho práci zahodil.
   ══════════════════════════════════════════════════════════════════════ */
const VYCVIK_ZKRATKA = {
  subject: 'Osm bodů, které rozhodují o prodeji',
  html: (d) => {
    const hotovo = String((d && d.hotovo_ids) || '')
      .split(',')
      .map(x => parseInt(x, 10))
      .filter(n => n >= 1 && n <= 8);

    const radky = [1, 2, 3, 4, 5, 6, 7, 8].map(id => {
      const k = ZKOUSKA_KROKY[id];
      if (!k) return '';
      const ma = hotovo.indexOf(id) !== -1;
      return `<tr><td style="padding:0 0 18px;">
<p style="margin:0 0 5px;font-size:15px;font-weight:700;color:#1a1a1a;">${id}. ${k.kapitola}${ma ? ' <span style="font-weight:400;color:#1f7a3d;">— tohle už máte</span>' : ''}</p>
<p style="margin:0 0 6px;font-size:15px;line-height:1.65;color:${ma ? '#8a8378' : '#444'};">${k.ukol}</p>
<a href="${k.url}" style="font-size:14px;color:#8B7D61;">Otevřít kapitolu</a>
</td></tr>`;
    }).join('');

    const uvod = hotovo.length
      ? `Dotazník jste nedodělal, tak posílám rovnou celý seznam. ${hotovo.length === 1 ? 'Bod, který' : 'Body, které'} jste stihl odpovědět, nechávám označené jako hotové.`
      : 'Dotazník je jen způsob, jak se k těmhle osmi bodům dostat. Tady jsou rovnou, i s úkolem u každého.';

    return obal('Osm bodů, které rozhodují o prodeji', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">${uvod}</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:22px 0 0;">
${radky}
</table>
<p style="${P}margin-top:8px;">Dotazník vám zůstal rozdělaný v prohlížeči. Když ho dodělte, dostanete k tomu skóre a pořadí, ve kterém to řešit.</p>
${tlacitko('https://www.davidchoc.cz/vycvik/zvladnete-to-sami', 'Dodělat dotazník (2 minuty)')}
<p style="margin:26px 0 0;font-size:13px;line-height:1.6;color:#8a8378;">Kniha je celá online a zdarma, bez registrace. Nikdo vám kvůli tomuhle e-mailu nevolá.</p>
<p style="${P}margin-top:22px;">David Choc</p>
`);
  },
};

/* ══════════════════════════════════════════════════════════════════════
   DIAGNOSTIKA ZASEKNUTÉ NABÍDKY

   Tady se neposílá rada — na stránce jsem slíbil osobní odpověď do
   hodiny a tenhle e-mail ji nesmí předstírat. Potvrzuje příjem, vrací
   verdikt, který člověk viděl na obrazovce, a říká, kdy odpovím já.
   ══════════════════════════════════════════════════════════════════════ */
const DIAG_VERDIKT = {
  cena: 'čísla ukazují na cenu',
  fotky: 'čísla ukazují na první dojem z inzerátu',
  inzerat: 'čísla ukazují na text a rozsah inzerátu',
  dosah: 'čísla ukazují na dosah — nabídku vidí málo lidí',
  nabidka: 'máte na stole nabídku a řešíte, jestli ji vzít',
  brzy: 'na závěry je zatím brzo',
};

const VYCVIK_DIAGNOSTIKA = {
  subject: 'Mám vaši diagnostiku — dívám se na to',
  html: (d) => {
    const klic = String((d && d.verdikt) || '').trim();
    const veta = DIAG_VERDIKT[klic];
    return obal('Mám vaši diagnostiku', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">vaše čísla mi dorazila${veta ? ` — vyšlo z nich, že ${veta}` : ''}. Podívám se na ně a <strong style="color:#1a1a1a;">odpovím vám do hodiny, mezi osmou ráno a osmou večer</strong>. Osobně, ne šablonou.</p>
<p style="${P}">Napíšu vám, co se s tou nabídkou podle mě děje a co bych s ní udělal jako první — i kdyby výsledek byl, že mě nepotřebujete.</p>
<p style="${P}">Než se ozvu, nedělejte jednu věc: <strong style="color:#1a1a1a;">nezlevňujte.</strong> Zlevnění bez důvodu je pro trh signál, že přijde další, takže se čeká — a nabídka visí dál, jen levnější.</p>
${tlacitko('https://www.davidchoc.cz/vycvik/kapitola-9-zaseklo-se', 'Kapitola 9 — když už to visí')}
<p style="${P}margin-top:22px;">David Choc</p>
`);
  },
};

/* ══════════════════════════════════════════════════════════════════════
   ROZPIS DESETI FÁZÍ — základní brána sekce

   E-mail pro člověka, který zatím nic nevyplnil: stojí na začátku a ptá
   se, co ho čeká. Nedostane názor, dostane rozsah práce a čísla —
   a rozhodne se sám. Hodiny a ceny musí souhlasit s průvodcem
   /vycvik/krok-za-krokem a s kalkulačkou /vycvik/kolik-to-stoji. Když se
   změní tam, musí se změnit i tady.
   ══════════════════════════════════════════════════════════════════════ */
const KZK_FAZE = [
  [1, 'Ocenění', '3–5 h', '0 Kč', 'Cena nastavená podle toho, kolik potřebujete, ne kolik trh dá. Nabídka pak visí a každé zlevnění je pro trh signál, že přijde další.'],
  [2, 'Příprava dokumentů', '4–6 h', '3 000 Kč', 'Nesoulad mezi skutečným stavem a katastrem. Vyjde to najevo u odhadce banky kupujícího a obchod stojí týdny.'],
  [3, 'Příprava nemovitosti', '8–12 h', '12 000 Kč', 'Bydlíte v tom a nedokážete to vidět očima cizího člověka. To není chyba povahy, to je normální — proto se to dělá s někým zvenku.'],
  [4, 'Fotografie, půdorys', '2–4 h', '4 500 Kč', 'Fotky z mobilu. Ušetříte tři tisíce a zaplatíte to na ceně, protože nabídka nedostane ani ten první klik.'],
  [5, 'Inzerce', '2–4 h', '3 500 Kč', 'Nikdo nesleduje čísla. Bez nich nepoznáte, jestli je problém v ceně, ve fotkách, nebo jen ještě neuplynul čas.'],
  [6, 'Telefonáty a prohlídky', '12–16 h', '0 Kč', 'Majitel je na prohlídce a mluví. Kupující potřebuje ticho a prostor říct nahlas, co se mu nelíbí — což před majitelem neřekne nikdy.'],
  [7, 'Dohoda a rezervace', '2–3 h', '0 Kč', 'Emoce. Po osmi týdnech ticha je první konkrétní nabídka úleva a přijme se i výrazně pod cenou. Ne z hlouposti — z vyčerpání.'],
  [8, 'Smlouvy a úschova', '3–5 h', '18 000 Kč', 'Pořadí kroků. Peníze musí být zajištěné dřív, než se cokoli podává na katastr. Kdo tohle otočí, hraje o všechno.'],
  [9, 'Vklad do katastru', '1 h', '2 000 Kč', 'Vrácený návrh kvůli formální chybě. Celé řízení běží znovu — a s ním i nervy kupujícího, který má domluvené stěhování.'],
  [10, 'Předání a vyúčtování', '3–4 h', '1 000 Kč', 'Neexistující předávací protokol. Za tři měsíce přijde reklamace na něco, co tam bylo nebo nebylo, a nikdo to neumí doložit.'],
];

const VYCVIK_ROZPIS = {
  subject: 'Deset fází prodeje — hodiny a koruny',
  html: (d) => {
    // Kdo v průvodci označil fáze, které dělat nechce, dostane k nim
    // navíc jednu větu — brána mu to slíbila. Texty jsou tytéž jako
    // v rozpisu z průvodce (PLAN_FAZE): dvě různá znění téhož by
    // znamenala, že si někde vymýšlím.
    const ids = String((d && d.nechce_ids) || '')
      .split(',')
      .map(x => parseInt(x, 10))
      .filter(n => n >= 1 && n <= 10)
      .sort((a, b) => a - b);

    const odmitnute = ids.length
      ? `<p style="${P}margin-top:26px;"><strong style="color:#1a1a1a;">Fáze, u kterých jste řekl „tohle ne" — a co s nimi:</strong></p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:14px 0 0;">
${ids.map(id => {
  const f = PLAN_FAZE[id];
  if (!f) return '';
  return `<tr><td style="padding:0 0 18px;">
<p style="margin:0 0 5px;font-size:15px;font-weight:700;color:#1a1a1a;">${id}. ${f[0]}</p>
<p style="margin:0;font-size:15px;line-height:1.65;color:#444;">${f[1]}</p>
</td></tr>`;
}).join('')}
</table>`
      : '';

    return obal('Co obnáší prodat nemovitost sám', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">tady je celý prodej rozepsaný na deset fází. U každé kolik hodin práce zabere, kolik zhruba stojí a co se v ní nejčastěji rozbije. Čísla jsou orientační rozpětí českého trhu — ne ceník a ne nabídka.</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
<tr><td style="background:#1a1a1a;padding:18px 22px;border-radius:6px;">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#c9c2b4;">Vaše práce dohromady</p>
<p style="margin:0 0 14px;font-size:26px;font-weight:800;color:#FFBF00;line-height:1;">40–60 hodin</p>
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#c9c2b4;">Náklady navíc oproti prodeji s makléřem</p>
<p style="margin:0;font-size:26px;font-weight:800;color:#FFBF00;line-height:1;">24 000 Kč</p>
</td></tr></table>
<p style="margin:0 0 22px;font-size:13px;line-height:1.6;color:#8a8378;">Celkem vyjdou přímé náklady na zhruba 44 000 Kč, ale 20 000 Kč z toho je právní část — smlouva, úschova, kolek. Tu platíte s makléřem i bez něj, takže do porovnání nepatří.</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0;">
${KZK_FAZE.map(f => `<tr><td style="padding:0 0 18px;">
<p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1a1a1a;">${f[0]}. ${f[1]}</p>
<p style="margin:0 0 5px;font-size:13px;color:#8a8378;">${f[2]} · ${f[3]}</p>
<p style="margin:0;font-size:15px;line-height:1.65;color:#444;">${f[4]}</p>
</td></tr>`).join('')}
</table>
${odmitnute}
<p style="${P}margin-top:26px;">Jestli si chcete u každé fáze říct, co si vezmete na sebe a co ne, průvodce to sečte za vás — hodiny i koruny podle toho, co odškrtáte.</p>
${tlacitko('https://www.davidchoc.cz/vycvik/krok-za-krokem', 'Projít si prodej krok za krokem')}
<p style="margin:26px 0 0;font-size:13px;line-height:1.6;color:#8a8378;">Kniha, ze které to je, zůstává celá online a zdarma, bez registrace. Nikdo vám kvůli tomuhle e-mailu nevolá — volám jen tomu, kdo si o to řekne.</p>
<p style="${P}margin-top:22px;">David Choc</p>
`);
  },
};

/* ══════════════════════════════════════════════════════════════════════
   RIZIKOVÁ SITUACE — eskalace

   Osm právních situací, u kterých nerozhoduje, jestli to člověk umí
   prodat. Chyba se v nich nedá opravit slevou z ceny, takže tenhle
   e-mail neposílá návod — pojmenuje, co ta situace mění, a slíbí
   osobní odpověď. Texty jsou tytéž jako u dotazníku, schválně: dvě
   různá znění téhož by znamenala, že si někde vymýšlím.
   ══════════════════════════════════════════════════════════════════════ */
const VYCVIK_RIZIKA = {
  subject: 'K tomu, co jste označil',
  html: (d) => {
    const idcka = String((d && d.risk_ids) || '')
      .split(',')
      .map(x => parseInt(x, 10))
      .filter(n => n >= 1 && n <= 8);
    const detaily = idcka
      .map(id => ZKOUSKA_RIZIKA[id])
      .filter(Boolean)
      .map(r => `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#444;">
<strong style="color:#1a1a1a;">${r.nazev}.</strong> ${r.text}</p>`)
      .join('');

    return obal('K tomu, co jste označil', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">tohle není o tom, jestli prodej zvládnete. Je to právní situace a v ní se chyba nedá opravit slevou z ceny — proto ji píšu zvlášť a dřív než cokoli jiného.</p>
${detaily || `<p style="${P}">Napište mi prosím, co přesně máte — ať vám odpovím na vaši situaci, ne obecně.</p>`}
<p style="${P}">Tohle je obecný popis, ne rada na váš případ. <strong style="color:#1a1a1a;">Odpovím vám osobně do hodiny, mezi osmou ráno a osmou večer</strong> — napište mi, co přesně máte, a řeknu vám, co bych na vašem místě ošetřil první. I kdyby výsledek byl, že mě nepotřebujete.</p>
${tlacitko('mailto:david.choc@ptf.cz?subject=Moje%20situace', 'Napsat Davidovi')}
<p style="margin:26px 0 0;font-size:13px;line-height:1.6;color:#8a8378;">Volám jen tomu, kdo si o to řekne. Kniha i nástroje zůstávají zdarma bez ohledu na to, jak se rozhodnete.</p>
<p style="${P}margin-top:22px;">David Choc</p>
`);
  },
};

/* ══════════════════════════════════════════════════════════════════════
   HLÍDÁNÍ CENY

   Většina lidí, kteří si dnes spočítají odhad, letos neprodá — medián
   držení nemovitosti je jedenáct let. Tohle je jediná nabídka na webu,
   která s tím počítá: čtvrtletní e-mail s čísly, žádná nabídka.
   Rozesílku řídí Brevo, tenhle e-mail jen potvrzuje, do čeho člověk šel.
   ══════════════════════════════════════════════════════════════════════ */
const HLIDANI_CENY = {
  subject: 'Cenu vaší nemovitosti hlídám',
  html: (d) => obal('Hlídám cenu', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">zapsal jsem si to${(d && d.lokalita) ? ` — ${d.lokalita}` : ''}. <strong style="color:#1a1a1a;">Jednou za čtvrt roku</strong> vám napíšu, jak se cena ve vaší lokalitě pohnula, kolik nemovitostí se tam za kvartál prodalo a jedno číslo navíc, o kterém se nepíše.</p>
<p style="${P}">Žádná nabídka v tom nebude. Když budete chtít prodávat, ozvete se sám — a když ne, budete aspoň vědět, na čem jste. Odhlásit se dá jedním kliknutím v každém e-mailu.</p>
<p style="${P}">Do té doby vám zůstává všechno ostatní: kniha, nástroje i odhad ceny, kdykoli si ho budete chtít přepočítat.</p>
${tlacitko('https://www.davidchoc.cz/ocenit-online', 'Přepočítat odhad ceny')}
<p style="${P}margin-top:22px;">David Choc</p>
`),
};

/* ══════════════════════════════════════════════════════════════════════
   ROZBOR K ODHADU CENY

   Číslo z kalkulačky člověk viděl zdarma a bez e-mailu — gatuje se
   rozbor, ne číslo. Rozbor píšu ručně, takže tenhle e-mail jen
   potvrzuje, že mám zadání, a říká, kdy odpovím.
   ══════════════════════════════════════════════════════════════════════ */
const OCENIT_ROZBOR = {
  subject: 'Mám vaši nemovitost — posílám rozbor',
  html: () => obal('Dívám se na to', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">zadání mi dorazilo. <strong style="color:#1a1a1a;">Odpovím vám do hodiny, mezi osmou ráno a osmou večer</strong> — napíšu, z jakých konkrétních prodejů v okolí to číslo vzniklo a co by u vaší nemovitosti cenu posunulo nahoru.</p>
<p style="${P}">Jedna věc předem, ať s ní můžete počítat: online odhad pracuje s tím, co je v datech. Nezná stav zevnitř, rekonstrukci, výhled ani hluk — a právě tyhle věci dělají u konkrétní nemovitosti největší rozdíl.</p>
<p style="${P}">Než se ozvu, může se hodit kapitola o ceně. Jsou v ní tři zdroje, ze kterých se cena dá podložit, a hlavně pravidlo, které platí bez ohledu na to, kdo prodává: <strong style="color:#1a1a1a;">cena, kterou vyslovíte první, se pak už jen snižuje.</strong></p>
${tlacitko('https://www.davidchoc.cz/vycvik/kapitola-1-cena', 'Kapitola 1 — cena')}
<p style="${P}margin-top:22px;">David Choc</p>
`),
};

POTVRZENI['ocenit-rozbor'] = OCENIT_ROZBOR;

POTVRZENI['vycvik-zkouska-nedokonceny'] = VYCVIK_ZKRATKA;
POTVRZENI['vycvik-diagnostika'] = VYCVIK_DIAGNOSTIKA;
POTVRZENI['vycvik-rozpis'] = VYCVIK_ROZPIS;
POTVRZENI['vycvik-rizika'] = VYCVIK_RIZIKA;
POTVRZENI['hlidani-ceny'] = HLIDANI_CENY;


// ── PLÁNOVAČ REKONSTRUKCE ─────────────────────────────────────────────
// Brána na stránce slibuje za e-mail rozpis (odemyká se na stránce),
// termíny objednávek, checklist kontrolních bodů a otázky pro řemeslníky.
// Tenhle e-mail doručuje všechno kromě rozpisu — a nic navíc neslibuje.
// Data přicházejí v metadatech leadu, dopočítaná na stránce.

const PLANOVAC_KONTROLY = [
  ['Tlaková zkouška rozvodů', 'před zakrytím vody a topení; chtějte protokol, ne ústní „drží to".'],
  ['Výchozí revize elektro', 'bez revizní zprávy nezkolaudujete a nepojistíte; patří k předání.'],
  ['Hydroizolace před obkladem', 'dvě vrstvy, pásky v koutech, 30 cm nad sprchovou hlavicí a 2 m u stěnových sprch — vyfoťte, než zmizí pod obkladem.'],
  ['Potěr před pokládkou', 'termín uvolňuje protokol z měření CM metodou, ne kalendář. Pozor na záměnu % hmotnostních a % CM.'],
  ['Omítky před malbou', 'vlhkost do 4 % objemových u minerálních, do 1 % u sádrových; u silných vrstev je doba zrání spodní hranice.'],
  ['Rozsah obkladu vs. štuk', 'v ploše obkladu se štuk nenanáší — domluvit se zedníkem předem, zkontrolovat před omítáním.'],
  ['Krytí a spáry', 'kout mezi stěnou a podlahou patří silikonu, ne spárovací hmotě; na anhydrit žádné cementové lepidlo bez uzavírající penetrace.'],
  ['Předání díla', 'protokol, stavy měřidel, fotografie a soupis vad s termíny odstranění — u každé party, ne jen na konci.'],
];

const PLANOVAC_OTAZKY = [
  'Od kdy běží vaše dodací lhůta — od objednávky, od zálohy, nebo až od zaměření?',
  'Kdo a čím změří vlhkost potěru před pokládkou? Dostanu protokol s uvedenou metodou?',
  'Co přesně je v ceně — a co už je vícepráce? Chci to písemně před začátkem.',
  'Kdo odpovídá za byt a klíče mezi jednotlivými partami?',
  'Co se stane s termínem, když se vaše práce zpozdí? Máte v nabídce rezervu?',
  'Kdo po vás uklízí a kdo odveze suť — je to v ceně?',
];

POTVRZENI['planovac-rekonstrukce'] = {
  subject: (d) => (d && d.konec)
    ? `Plán rekonstrukce — hotovo ${d.konec}`
    : 'Váš plán rekonstrukce',
  html: (d) => {
    const konec = String((d && d.konec) || '').trim();
    const dnu = Number(d && d.dnu) || 0;
    const cekani = Number(d && d.cekani) || 0;
    const objednavky = String((d && d.objednavky) || '')
      .split('|').map(s => s.trim()).filter(Boolean);
    const predKlici = Number(d && d.pred_klici) || 0;

    // Rozpis den po dni. Formulář ho slibuje jako první věc, takže patří
    // do e-mailu celý, ne jen odkazem. Formát z formuláře:
    // od|do|název|profese|rezerva (K = kritická)|čekání ; ...
    const radky = String((d && d.rozpis) || '')
      .split(';').map(r => r.split('|')).filter(r => r.length >= 5);

    const bunka = 'padding:6px 8px;font-size:13px;line-height:1.5;border-bottom:1px solid #f0ebe0;color:#444;';
    const hlavicka = 'text-align:left;padding:7px 8px;font-size:12px;color:#8a8378;border-bottom:2px solid #e6dbbc;font-weight:600;';

    const rozpisHtml = radky.length
      ? `<p style="margin:26px 0 10px;font-size:15px;font-weight:700;color:#1a1a1a;">Rozpis den po dni</p>
<p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#8a8378;">Tučně jsou práce na kritické cestě — u těch se každý ztracený den propíše rovnou do termínu dokončení. U ostatních je vpravo rezerva ve dnech.</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 8px;border-collapse:collapse;">
<tr><th style="${hlavicka}">Od</th><th style="${hlavicka}">Do</th><th style="${hlavicka}">Práce</th><th style="${hlavicka}">Kdo</th><th style="${hlavicka}text-align:right;">Rezerva</th></tr>
${radky.map(r => {
  const od = r[0], doo = r[1], nazev = r[2], kdo = r[3], rez = r[4];
  const cekDnu = Number(r[5]) || 0;
  const krit = rez === 'K';
  return `<tr>
<td style="${bunka}white-space:nowrap;">${od}</td>
<td style="${bunka}white-space:nowrap;">${doo}</td>
<td style="${bunka}${krit ? 'font-weight:700;color:#1a1a1a;' : ''}">${nazev}${cekDnu ? `<br><span style="font-size:11px;color:#c0392b;">před tím ${cekDnu} dnů čekání</span>` : ''}</td>
<td style="${bunka}color:#8a8378;">${kdo}</td>
<td style="${bunka}text-align:right;white-space:nowrap;${krit ? 'color:#c0392b;font-weight:600;' : ''}">${krit ? 'kritická' : rez + ' d'}</td>
</tr>`;
}).join('')}
</table>
<p style="margin:0 0 22px;font-size:13px;line-height:1.6;color:#8a8378;">Platí pro zadání, se kterým jste plán počítal. Když se něco posune, přepočítejte si ho — odkaz je níž.</p>`
      : '';


    const hlava = konec
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
<tr><td style="background:#1a1a1a;padding:14px 22px;border-radius:6px;">
<span style="font-size:13px;color:#c9c2b4;text-transform:uppercase;letter-spacing:.08em;">Byt hotový</span><br>
<span style="font-size:26px;font-weight:800;color:#FFBF00;line-height:1.2;">${konec}</span>
${dnu ? `<br><span style="font-size:13px;color:#c9c2b4;">${dnu} kalendářních dnů${cekani ? `, z toho ${cekani} technologické čekání` : ''}</span>` : ''}
</td></tr></table>`
      : '';

    const objHtml = objednavky.length
      ? `<p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#1a1a1a;">Co objednat a do kdy</p>
<ul style="margin:0 0 6px;padding-left:20px;">
${objednavky.map(o => `<li style="${P}margin-bottom:6px;">${o}</li>`).join('')}
</ul>
<p style="margin:0 0 22px;font-size:13px;line-height:1.6;color:#8a8378;">Termíny „objednat do" jsou počítané zpětně od montáže včetně rezervy na to, že lhůta u většiny dodavatelů běží až od zálohy nebo zaměření.</p>`
      : '';

    const pozdeHtml = predKlici > 0
      ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 22px;">
<tr><td style="background:#fdeeee;border-left:3px solid #c0392b;padding:14px 18px;">
<p style="margin:0;font-size:14px;line-height:1.65;color:#444;"><strong style="color:#1a1a1a;">${predKlici === 1 ? 'Jedna položka se musí objednat' : predKlici + ' položky se musí objednat'} ještě před převzetím bytu.</strong> Dodací lhůta se nedá dohnat prací — když se objedná až po klíčích, termín se o odpovídající dobu posune.</p>
</td></tr></table>`
      : '';

    const kontrolyHtml = `<p style="margin:26px 0 10px;font-size:15px;font-weight:700;color:#1a1a1a;">Kontrolní body — co převzít, aby se nebouralo hotové</p>
<ul style="margin:0 0 22px;padding-left:20px;">
${PLANOVAC_KONTROLY.map(k => `<li style="${P}margin-bottom:8px;"><strong style="color:#1a1a1a;">${k[0]}.</strong> ${k[1]}</li>`).join('')}
</ul>`;

    const otazkyHtml = `<p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#1a1a1a;">Na co se ptát, než podepíšete</p>
<ul style="margin:0 0 22px;padding-left:20px;">
${PLANOVAC_OTAZKY.map(o => `<li style="${P}margin-bottom:6px;">${o}</li>`).join('')}
</ul>`;

    return obal(konec ? 'Váš plán rekonstrukce' : 'Plán rekonstrukce', `
<p style="${P}">Dobrý den,</p>
<p style="${P}">tady je plán, který jste si sestavil — rozpis den po dni, termíny objednávek, a k tomu dvě věci, které se na stránku nevešly: kontrolní body a otázky pro řemeslníky.</p>
${hlava}
${objHtml}
${pozdeHtml}
${rozpisHtml}
${kontrolyHtml}
${otazkyHtml}
<p style="${P}">Plán si můžete kdykoli upravit a vytisknout — na stránce je k tomu tlačítko:</p>
${tlacitko('https://www.davidchoc.cz/planovac-rekonstrukce', 'Otevřít plánovač')}
<p style="${P}margin-top:24px;">A poctivá poznámka na závěr: tohle je orientační plán, ne závazek. O termínech na stavbě rozhoduje měření a skutečný stav, ne kalendář — a plánovač nenahrazuje projekt ani stavební dozor.</p>
<p style="${P}">Kdybyste chtěl plán projít osobně, napište mi — <strong style="color:#1a1a1a;">odpovím e-mailem do hodiny, mezi osmou a osmou.</strong> Volám jen tomu, kdo si o to řekne.</p>
<p style="${P}margin-top:22px;">David Choc</p>
`);
  },
};

export function potvrzeniPro(formular) {
  return POTVRZENI[formular] || null;
}
