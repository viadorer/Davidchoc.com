// Místa pro fotky a videa v sekci Výcvik ziskového prodeje.
//
// Tenhle soubor je zároveň zadání pro focení a natáčení. Otevři si
// kteroukoli stránku sekce s ?media na konci adresy a uvidíš na každém
// místě, co tam patří — třeba:
//
//     https://www.davidchoc.cz/vycvik/kapitola-3-fotografie?media
//
// Bez toho parametru návštěvník nevidí nic, dokud soubor neexistuje.
//
// Až bude záběr hotový: doplň `src`, `alt` a přepni `stav` na 'hotovo'.
// Nic jiného se nikde neupravuje.
//
// PRAVIDLO, KTERÉ TENHLE SEZNAM DRŽÍ POHROMADĚ:
// fotka je tady důkaz, ne dekorace. Kdyby mohla být ze stocku, nepatří
// sem — celý web stojí na tom, že ukazuje konkrétní věci. A video se
// váže na Davida, fotka na tvrzení; obráceně obojí ztrácí smysl.
(function () {
  'use strict';

  var VIDEO = 'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/video/';
  var FOTO = 'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/vycvik/';

  /* Sedm pravidel focení z nástroje „Seznam záběrů". Každé je jedna
     dvojice: tentýž pokoj, jediný rozdíl. Levá půlka se fotí schválně
     špatně — a právě ta je to, co nikdo jiný nemá, protože nikdo
     schválně špatně nefotí. */
  var PRAVIDLA = [
    ['Na šířku, nikdy na výšku',
     'Tentýž obývák na výšku a na šířku. Na výšku uřízne polovinu místnosti a v mřížce náhledů zabere míň plochy.',
     'Na výšku — půlka pokoje chybí', 'Na šířku — místnost se dá přečíst'],
    ['Svislice svislé, telefon kolmo',
     'Tentýž roh pokoje s telefonem nakloněným dolů a pak kolmo. Naklonění je nejčastější poznávací znamení amatérské fotky.',
     'Telefon nakloněný — stěny se sbíhají', 'Telefon kolmo — svislice stojí'],
    ['Foťte z rohu, ne ze středu stěny',
     'Tentýž pokoj ze středu stěny a z rohu. Ze středu vypadá místnost jako chodba, z rohu je vidět její tvar.',
     'Ze středu stěny — plocho', 'Z rohu — je vidět prostor'],
    ['Denní světlo, nikdy blesk',
     'Tentýž pokoj večer s bleskem a dopoledne na denní světlo. Rozdíl je největší ze všech sedmi.',
     'Blesk večer — tvrdé stíny, žluté stěny', 'Denní světlo dopoledne'],
    ['Nefoťte proti oknu',
     'Záběr proti oknu a tentýž pokoj se světlem za zády. Proti oknu se interiér propadne do tmy a okno vyhoří.',
     'Proti oknu — interiér tmavý, okno vypálené', 'Se světlem za zády'],
    ['Projděte okraje záběru',
     'Tentýž záběr se sušákem, taškou a nabíječkou na kraji, a pak uklizený. Střed záběru je v pořádku v obou.',
     'Okraje: sušák, taška, kabel', 'Okraje čisté'],
    ['Deset záběrů, vyberte jeden',
     'Kontaktní list deseti záběrů téhož pokoje s jedním vyznačeným. Není to dvojice — je to ukázka toho, že hlavní fotka se vybírá, ne cvakne.',
     null, null],
  ];

  var polozky = {};

  /* ── VIDEA ─────────────────────────────────────────────────────── */

  polozky['V1'] = {
    typ: 'video', stav: 'chybi', stran: '16:9', delka: '80–90 s',
    nadpis: 'Kde je háček',
    kde: 'Vstupní dotazník, pod otázkami u odstavce „Na férovku". Totéž video i na hubu v sekci „Proč tahle kniha".',
    patri: 'Mluvící hlava, klid, žádná hudba. Odpověď na otázku, kterou si čtenář klade od první vteřiny: proč realitní agent rozdává zadarmo řemeslo, kterým se živí.',
    zabery: [
      'Statická kamera, výška očí, neutrální pozadí — kancelář ano, logo za hlavou ne.',
      'Titulky povinně. Bez hudby pod řečí.',
      'Závěrečné „Jmenuji se Choc. David Choc." natočit dvakrát: s ním a bez něj. Rozhodne se na place; verze bez něj neprohrává nikdy.'
    ],
    proc: 'Stránka tvrdí neuvěřitelnou věc a jediné, co tu nedůvěru zlomí, je člověk, který to řekne do očí. Text to neumí. Text téhož obsahu na stránce už je — video ho nenahrazuje, ale utáhne.',
    src: VIDEO + 'vycvik-v1-hacek.mp4',
    poster: FOTO + 'v1-poster.jpg',
    titulky: VIDEO + 'vycvik-v1-hacek.cs.vtt',
    popisek: 'Kde je háček — proč je celá kniha zdarma'
  };

  polozky['V2'] = {
    typ: 'video', stav: 'chybi', stran: '16:9', delka: '90 s',
    nadpis: 'Mezera mezi podpisem a přepisem',
    kde: 'Kapitola 7, pod úvodním hookem, před částí „Kde přesně to hrozí".',
    patri: 'Kreslená časová osa na papíře nebo tabuli. Kamera na ruce a osu, ne na obličej. David kreslí tři body — podpis, přepis, a mezi nimi otázku, kdy se pohnou peníze.',
    zabery: [
      'Kamera shora nebo z boku na stůl. Obličej může, ale nesmí být hlavní.',
      'Tři body kreslit postupně, ne mít předkreslené.',
      'Natočit navíc osm vteřin hotové osy bez řeči — použije se jako obrázek v e-mailu a v sekvenci, kde se video nepřehraje.'
    ],
    proc: 'Jediné místo, kde video umí něco, co text neumí: ukázat mezeru jako prostor, ve kterém někdo visí. Text ji popisuje slovy, video ji nakreslí.',
    src: VIDEO + 'vycvik-v2-mezera.mp4',
    poster: FOTO + 'v2-poster.jpg',
    titulky: VIDEO + 'vycvik-v2-mezera.cs.vtt',
    popisek: 'Kdy se mají pohnout peníze — a proč existuje úschova'
  };

  polozky['V3'] = {
    typ: 'video', stav: 'chybi', stran: '16:9', delka: '60 s',
    nadpis: 'Kdy dostanu zaplaceno já',
    kde: 'Hub v pásu „A teď k provizi", kapitola 8 v části o provizi, a výsledek dotazníku u skóre 0–3.',
    patri: 'Mluvící hlava. O penězích se nejlíp mluví do očí. Provize, pravidlo „když neprodám, neplatíte nic", a proč to tak má — bez hvězdičky a bez dodatku malým písmem.',
    zabery: [
      'Stejné nastavení jako V1 — natočit na jedno svícení, ušetří to půl dne.',
      'Nikde nesmí padnout číslo provize, dokud není na webu stránka, která ho rozepisuje. Slíbit číslo a neukázat rozpad je horší než mlčet.'
    ],
    proc: 'Argument o penězích nesmí zaznít poprvé až na konci cesty — pak se čte jako past. U skóre 0–3 navíc přichází hned po nepříjemné zprávě, a tam z úst zní jinak než napsaný.',
    src: VIDEO + 'vycvik-v3-provize.mp4',
    poster: FOTO + 'v3-poster.jpg',
    titulky: VIDEO + 'vycvik-v3-provize.cs.vtt',
    popisek: 'Jak a kdy se platí provize'
  };

  polozky['V4'] = {
    typ: 'video', stav: 'chybi', stran: '16:9', delka: '40 s',
    nadpis: 'Jeden slib',
    kde: 'Závěr knihy, pod nadpisem.',
    patri: 'Rozloučení patří člověku, ne stránce. Jeden ověřitelný slib místo čtyř neověřitelných — a výzva, ať si ho čtenář rovnou vyzkouší.',
    zabery: [
      'NENATÁČET, dokud není rozhodnuto, jak rychle a jakým kanálem odpovídáš.',
      'Text se přepíše za minutu, video se přetáčí — a slib vyslovený tvým hlasem je z celého webu ten nejzávaznější.'
    ],
    proc: 'Závěr dnes slibuje čtyři věci, které si čtenář nemůže ověřit. Jeden měřitelný slib váží víc.',
    src: VIDEO + 'vycvik-v4-slib.mp4',
    poster: FOTO + 'v4-poster.jpg',
    titulky: VIDEO + 'vycvik-v4-slib.cs.vtt',
    popisek: 'Co ode mě můžete čekat'
  };

  /* ── FOTOGRAFIE ────────────────────────────────────────────────── */

  PRAVIDLA.forEach(function (p, i) {
    var id = 'F1-' + (i + 1);
    var kontakt = p[2] === null;
    polozky[id] = {
      typ: 'foto', stav: 'chybi', stran: kontakt ? '3:2' : '4:3',
      nadpis: 'Pravidlo ' + (i + 1) + ': ' + p[0],
      kde: 'Kapitola 3 — Fotografie, u odpovídajícího pravidla.',
      zdroj: 'Vlastní zakázka, se svolením. Nikdy stock.',
      patri: p[1],
      proc: 'Kapitola učí poznat špatnou fotku a neukazuje ani jednu. Tohle není ilustrace k textu, tohle je obsah kapitoly.',
      dvojice: kontakt ? null : [
        { src: FOTO + id + '-spatne.avif', stitek: p[2], alt: 'Chybný záběr: ' + p[2].toLowerCase() },
        { src: FOTO + id + '-dobre.avif', stitek: p[3], alt: 'Správný záběr: ' + p[3].toLowerCase() }
      ],
      src: kontakt ? FOTO + id + '.avif' : null,
      alt: kontakt ? 'Kontaktní list deseti záběrů téhož pokoje, jeden vyznačený jako hlavní fotka' : null,
      popisek: p[0]
    };
  });

  [['Obývací pokoj', 'Vyklizený proti obývanému. Ne uklizený — vyklizený: pryč osobní fotky, přebytečný nábytek, věci na parapetu.'],
   ['Kuchyňská linka', 'Linka plná běžného provozu proti lince prázdné až na jednu dvě věci.'],
   ['Koupelna', 'S osobními věcmi, ručníky přes zábradlí a otevřeným WC — proti koupelně bez nich.']
  ].forEach(function (p, i) {
    var id = 'F2-' + (i + 1);
    polozky[id] = {
      typ: 'foto', stav: 'chybi', stran: '4:3',
      nadpis: 'Před a po: ' + p[0],
      kde: 'Kapitola 2 — Příprava nemovitosti.',
      zdroj: 'Skutečná zakázka, se svolením klienta, bez adresy.',
      patri: p[1],
      proc: 'Kapitola tvrdí, že majitel svůj byt už nevidí. To je pravda a je to neověřitelné, dokud to čtenář neuvidí na cizím bytě — na svém to nesvede, o tom ta kapitola je.',
      dvojice: [
        { src: FOTO + id + '-pred.avif', stitek: 'Před', alt: p[0] + ' před přípravou' },
        { src: FOTO + id + '-po.avif', stitek: 'Po', alt: p[0] + ' po přípravě' }
      ],
      popisek: p[0] + ' — před přípravou a po ní'
    };
  });

  polozky['F4'] = {
    typ: 'foto', stav: 'chybi', stran: '3:2',
    nadpis: 'Řádek ze smlouvy o úschově',
    kde: 'Kapitola 7 a nástroj Úschova.',
    zdroj: 'Skutečná smlouva, jména a částky začerněné.',
    patri: 'Fotka nebo sken stránky smlouvy o úschově s vyznačeným řádkem, o kterém text mluví — kdy se peníze uvolňují a proti čemu.',
    proc: 'Nejméně klišé věc, jakou lze na realitní web dát, protože ji nikdo nemá. A přesně ta, která dokazuje, že mluvíš o konkrétních dokumentech, ne obecně.',
    src: FOTO + 'F4-uschova.avif',
    alt: 'Stránka smlouvy o úschově s vyznačeným ustanovením o uvolnění kupní ceny, osobní údaje začerněné',
    popisek: 'Ustanovení o uvolnění kupní ceny — to je ten řádek, na kterém záleží'
  };

  polozky['F5'] = {
    typ: 'foto', stav: 'chybi', stran: '3:2',
    nadpis: 'Vytištěná mapa prodeje na ledničce',
    kde: 'Stránka Mapa prodeje, pod tabulkou fází.',
    zdroj: 'Skutečná lednička, skutečná magnetka. Ne aranžmá.',
    patri: 'Kniha čtenáři říká: „Vytiskněte si ji a pověste na ledničku." Fotka mapy, která tam skutečně visí — u tebe nebo u klienta.',
    proc: 'Důkaz, že se produkt používá. Není to koncept, je to záznam. Aranžovaná verze je stock a platí pro ni všechno ze zákazu klišé.',
    src: FOTO + 'F5-lednicka.avif',
    alt: 'Vytištěná mapa prodeje nemovitosti připevněná magnetkou na dveřích ledničky',
    popisek: 'Přesně k tomuhle ta mapa je'
  };

  /* Miniatury k seznamu záběrů. Malé a funkční — člověk stojí v pokoji
     a potřebuje vidět, co znamená „z rohu u dveří". Velké fotky by
     z nástroje udělaly portfolio, a to je jiná stránka. */
  [['obyvak-roh1', 'Obývací pokoj z prvního rohu', 'Kandidát na hlavní fotku.'],
   ['obyvak-roh2', 'Obývací pokoj z protilehlého rohu', 'Aby si kupující složil celou místnost.'],
   ['kuchyn-celek', 'Kuchyň celek', 'Linka prázdná až na jednu dvě věci.'],
   ['loznice-roh', 'Ložnice z rohu u dveří', 'Postel ustlaná, přehoz rovně.'],
   ['koupelna-roh', 'Koupelna z rohu', 'Zavřené WC, žádné osobní věci.'],
   ['balkon-ven', 'Balkon z interiéru ven', 'Ukáže návaznost na obytný prostor.']
  ].forEach(function (p) {
    polozky['F3-' + p[0]] = {
      typ: 'foto', stav: 'chybi', stran: '4:3', mini: true,
      nadpis: p[1],
      kde: 'Nástroj Seznam záběrů, u odpovídající položky.',
      zdroj: 'Vlastní zakázka.',
      patri: p[1] + '. ' + p[2] + ' Miniatura, ne velká fotka — nástroj se otevírá v mobilu při focení.',
      proc: 'Seznam vyjmenovává šestnáct záběrů. Miniatura z něj udělá použitelný nástroj místo seznamu slov.',
      src: FOTO + 'F3-' + p[0] + '.avif',
      alt: p[1]
    };
  });

  window.HubMediaConfig = {
    kredit: 'Foto David Choc · PTF reality',
    polozky: polozky
  };
})();
