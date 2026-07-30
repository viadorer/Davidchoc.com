# Hub kit

Kostra obsahových sekcí davidchoc.cz — hub s obsahem, kapitoly a interaktivní
nástroje. Postavená je na ní sekce `/vycvik` a od července 2026 slouží i dalším.

## Co v tom je

| Soubor | K čemu |
| --- | --- |
| `hub.css` | Celý layout: hero, obsah, kapitola, kroky, callouty, widgety, e-mailové brány, tisk |
| `hub-tools.js` | Checklisty, formulářová pole, formátování čísel. Vše do localStorage, nic se neodesílá |
| `hub-cta.js` | Odeslání leadu, atribuce zdroje, validace, patička pomoci, e-mailová brána |
| `themes/zelena.css` | Zelené téma (investice, pronájem) |
| `templates/` | Kostry hubu, kapitoly a nástroje s hotovým SEO |

## Dvojí pojmenování tříd

Každé pravidlo v `hub.css` má dva selektory — historický `.vycvik-*` / `.vy-*`
a neutrální `.hub-*`. Deklarace existuje jen jednou.

Výcvik vznikl dřív než kit a přepisovat kvůli přejmenování třicet živých
stránek by byla zbytečná porce rizika. **Nové sekce píšou `.hub-*`.**

Dvě výjimky, kde se jména křížila:

| Původní | Nově | Co to je |
| --- | --- | --- |
| `.vy-quote` | `.hub-quote-card` | recenze v rámečku s uvozovkou |
| `.vy-note` | `.hub-note-soft` | krémová poznámka uvnitř kapitoly |

`.vycvik-quote` a `.vycvik-note` zůstávají `.hub-quote` a `.hub-note`.

## Barvy

Všechny odstíny v `hub.css` jsou tokeny s fallbackem na původní hodnotu
výcviku — `var(--hub-paper, #F8F4E9)`. Bez tématu tedy kit vypadá jako výcvik.
Téma se přikládá jako třetí stylopis a přepíše jen to, co chce.

```html
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/common/hub/hub.css">
<link rel="stylesheet" href="/common/hub/themes/zelena.css">
```

Jádro palety je šest tokenů:

| Token | Výcvik | Zelená |
| --- | --- | --- |
| `--hub-ink` | `#1a1a1a` | `#0F1410` |
| `--hub-paper` | `#F8F4E9` | `#FBFCF7` |
| `--hub-accent` | `#FFBF00` | `#2F5D3A` |
| `--hub-accent-surface` | `#FFBF00` | `#D4E7B5` |
| `--hub-muted` | `#8B7D61` | `#5A6B5C` |
| `--hub-line` | `#E6E0D4` | `#DCE5D0` |

Zbytek (`--hub-surface-1..4`, `--hub-ok`, `--hub-risk`, `--hub-accent-deep`,
`--hub-accent-light` a `-rgb` varianty pro průhlednosti) se odvozuje od nich.

**Proč jsou akcenty dva.** Ve výcviku je jantarová zároveň linka i plocha, a jde
to. U světlých palet ne — pistáciová jako písmo je nečitelná. Proto se při
extrakci rozdělila podle vlastnosti: `background` bere `--hub-accent-surface`,
všechno ostatní `--hub-accent`. V jednobarevném tématu se oba nastaví stejně.

## Nová sekce

1. Zkopírovat `templates/hub.html` do `/<sekce>/index.html`, kapitoly
   a nástroje podle potřeby. Nahradit `{{ZÁSTUPCE}}`.
2. `<body class="hub-page is-light" data-hub-section="<sekce>">` — atribut
   určuje, pod jakou kategorií chodí události do GA.
3. Založit `/<sekce>/<sekce>-cta.js` s texty a cestami:

```js
window.HubConfig = {
  section: 'investice',
  leadApi: '/api/lead',
  help: {
    wrapSelector: '.hub-chapter__wrap, .hub-tool-page__wrap',
    title: 'Nejste si jistí?',
    text: 'Napište mi, o co jde. Odpovím do 24 hodin, zdarma a bez závazku.',
    action: { label: 'Napsat', href: '/pripad-pro-agenta' },
    phone: { label: '774 052 232', href: 'tel:+420774052232' },
    skip: ['/investice', '/investice/vybava']   // kde už silná nabídka je
  }
};

HubCTA.ready(function () {
  HubCTA.injectHelp();
  HubCTA.initGateById('moje-brana', {
    leadForm: 'investice-registrace',
    fields: { name: true },
    message: 'Zápis do databáze kupujících.',
    gaEvent: 'investice_registrace',
    done: '<h3>Hotovo.</h3><p>Ozvu se, jakmile budu mít něco, co sedí na vaše zadání.</p>'
  });
});
```

4. Přidat do `sitemap.xml` a `llms.txt`.

Pořadí skriptů: `attribution.js` → `hub-cta.js` → `hub-tools.js` → `<sekce>-cta.js`.
Atribuce musí být první, jinak se zdroj návštěvy ztratí prvním proklikem
a všechny leady vypadají jako přímé.

## Pár věcí, které se snadno rozbijí

- **Základ cesty (`skip`) se píše bez koncového lomítka i s ním.** Vercel má
  `cleanUrls`, takže `/vycvik` i `/vycvik/` míří na totéž.
- **`HubTools.section()` čte `<body>`**, takže se volá až za běhu. Kdyby se
  knihovna načítala v hlavičce, atribut ještě neexistuje.
- **Formulář potřebuje `.vy-gate__msg`**, jinak nemá kam psát chybové hlášky.
- **Riziková barva není červená.** Na stránce, kde je varování u každého kroku,
  červená po třetím výskytu přestane fungovat. Proto `--hub-risk` v zeleném
  tématu míří na pálenou hlínu.
