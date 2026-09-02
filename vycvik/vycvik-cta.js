// Konverzní vrstva sekce Výcvik ziskového prodeje.
// Strojová část (odeslání leadu, atribuce, validace) je v /common/hub/hub-cta.js —
// tady zůstaly jen texty a cesty, které patří téhle knize.
// Záměrně nenátlakové — kniha slibuje, že nikdo nikoho nikam netlačí.
(function () {
  'use strict';

  window.HubConfig = {
    section: 'vycvik',
    leadApi: '/api/lead',

    // Patička pod kapitolami a nástroji — zavírá slepé uličky.
    //
    // Dřív tu stálo „Zaseklo se to? Napište mi" s odkazem na konzultaci.
    // To je nabídka pro rozhodnutého, ale na konci třetí kapitoly stojí
    // někdo, kdo se rozhoduje — a ten na „napište mi" neklikne. Míří to
    // proto na dotazník: je to jediná konverzní událost celé sekce, stojí
    // dvě minuty a člověku odpoví na otázku, kvůli které sem přišel.
    help: {
      wrapSelector: '.vycvik-chapter__wrap, .vycvik-tool-page__wrap',
      title: 'Týká se tahle kapitola zrovna vás?',
      text: 'Osm otázek, dvě minuty — a víte, které kapitoly si máte přečíst a které klidně přeskočte. Výsledek se ukáže hned na obrazovce, e-mail po vás nechci.',
      action: { label: 'Zvládnete to sami?', href: '/vycvik/zvladnete-to-sami' },
      phone: { label: '774 052 232', href: 'tel:+420774052232' },
      // Hub a stránky, kde už silná nabídka je.
      skip: [
        '/vycvik', '/vycvik/', '/vycvik/index.html', '/vycvik/vybava',
        '/vycvik/kolik-to-stoji', '/vycvik/zaver', '/vycvik/zvladnete-to-sami',
        '/vycvik/posudte-inzerat', '/vycvik/kapitola-9-zaseklo-se',
        '/vycvik/krok-za-krokem',
        // Kapitoly s vlastní bránou na téma kapitoly. Patička by pod ní
        // byla druhá nabídka v řadě a čtenář by si vybíral mezi dvěma
        // výzvami místo mezi „chci" a „nechci".
        '/vycvik/kapitola-1-cena', '/vycvik/kapitola-3-fotografie',
        '/vycvik/kapitola-7-smlouvy'
      ]
    }
  };

  var DONE_ICON = '<i class="fas fa-circle-check" aria-hidden="true"></i>';

  /* ── Posouzení inzerátu ── */
  function initInzeratForm() {
    HubCTA.initGateById('vy-inzerat-form', {
      leadForm: 'vycvik-posudek',
      fields: { url: true },
      msgUrl: 'Vložte prosím celý odkaz na inzerát včetně https://',
      msgEmail: 'Zadejte prosím platnou e-mailovou adresu, ať vám mám kam odpovědět.',
      msgConsent: 'Bez souhlasu se zpracováním údajů vám nemůžu odpovědět.',
      msgError: 'Odeslání se nepodařilo. Zkuste to prosím znovu, nebo mi pošlete odkaz rovnou na david.choc@ptf.cz.',
      message: function (d) {
        return 'Žádost o posouzení inzerátu.' + (d.note ? ' Poznámka: ' + d.note : '');
      },
      meta: function (d) {
        return { listing_url: d.url, segment: 'neuspesny-samoprodejce' };
      },
      gaEvent: 'vycvik_posudek_inzeratu',
      gaLabel: 'segment_e',
      done: function (d) {
        return DONE_ICON +
          '<h3>Mám to. Dívám se na to.</h3>' +
          '<p>Odpověď vám přijde do dvou pracovních dnů na <strong>' + d.email + '</strong>. ' +
          'Kdyby nedorazila, mrkněte do spamu — nebo mi napište na <a href="mailto:david.choc@ptf.cz">david.choc@ptf.cz</a>.</p>' +
          '<p class="vy-gate__done-note">Mezitím si můžete projít <a href="/vycvik/diagnostika">diagnostiku</a> — čtyři čísla a uvidíte, kde to vázne.</p>';
      }
    });
  }

  /* ── Plán z výsledku dotazníku ──
     Vkládá se až po vyhodnocení — nejteplejší moment celé sekce.

     Brána nestojí před obsahem: skóre i chybějící kapitoly už člověk
     vidí zdarma na stránce a kniha je celá venku. Za e-mail se vyměňuje
     jen to, co ze stránky odnést nejde — jeho vlastní kroky seřazené do
     pořadí a k tomu uložené, aby se k nim mohl vrátit.

     Slibovat se tu smí výhradně to, co e-mail doopravdy odešle
     (api/_emaily.js → VYCVIK_ZKOUSKA). Nesplněný slib na tomhle místě
     zboří všechno, co kniha nad ním osmdesát stran staví. */
  // „5 věcí seřazených", ale „3 věci seřazené" — čeština skloňuje od pěti
  // výš jinak. Nadpis brány je první věta po výsledku a chyba v ní zní
  // jako automat, což je přesně dojem, který si stránka nemůže dovolit.
  function nadpisBrany(n) {
    if (!n) return 'Chcete si výsledek nechat poslat?';
    if (n === 1) return 'Chcete vědět, co s tou jednou věcí udělat?';
    if (n < 5) return 'Chcete ty ' + n + ' věci seřazené do plánu?';
    return 'Chcete těch ' + n + ' věcí seřazených do plánu?';
  }

  /* Brána má tři podoby podle toho, co člověku ve výsledku vyšlo.
     Jedna univerzální by musela slibovat průnik všeho — a průnik je
     vždycky slabší než to, co ten konkrétní člověk právě potřebuje. */
  function textyBrany(chybi, maRizika, score) {
    if (maRizika) {
      return {
        label: 'Vaše situace',
        h: 'Chcete to probrat, než uděláte další krok?',
        p: 'Napište mi e-mail a pošlu vám shrnutí toho, co jste označil — co ta situace' +
           ' u prodeje typicky znamená, co se ošetřuje předem a v jakém pořadí.' +
           (chybi ? ' K tomu i zbytek vašeho plánu.' : ''),
        li: ['Co konkrétně vaše situace u prodeje mění',
             'Co se dá ošetřit předem a co až u smlouvy'].concat(
             chybi ? ['Vaše kroky k doplnění, seřazené podle prodeje'] : []),
        btn: 'Poslat mi to'
      };
    }
    // Kdo má šest a víc, plán skoro nepotřebuje — ale u smluv a úschovy
    // se pálí i připravení. Nabídnout mu pomoc až na tu chvíli je jediná
    // nabídka, která mu po „jděte do toho sám" nezní jako protimluv.
    if (score >= 6) {
      return {
        label: 'Až budete u smluv',
        h: 'Mám se vám ozvat, až budete u smluv?',
        p: 'Pošlu vám teď shrnutí výsledku. A pak už nic — až na jednu věc:' +
           ' když mi napíšete, až budete u kupní smlouvy a úschovy, projdu vám ji.' +
           ' I když prodáváte sám a nic spolu nepodepisujeme.',
        li: (chybi ? ['Co vám ve výsledku chybělo a co s tím'] : ['Vaše skóre a co z něj plyne'])
             .concat(['Na co si dát pozor u kupní smlouvy a úschovy']),
        btn: 'Poslat mi výsledek'
      };
    }
    return {
      label: 'Váš plán',
      h: nadpisBrany(chybi),
      p: chybi
        ? 'Pošlu vám vaše skóre a ke každé chybějící věci konkrétní úkol — ne odkaz na kapitolu, ale větu, co s tím udělat.'
        : 'Pošlu vám vaše skóre a shrnutí, ať to máte černé na bílém.',
      li: chybi > 1
        ? ['Co udělat jako první, druhé, třetí — v pořadí prodeje, ne podle závažnosti',
           'Ke každému kroku kapitola, kde je rozepsaný']
        : chybi
          ? ['Konkrétní úkol a kapitola, kde je rozepsaný']
          : ['Vaše skóre a co z něj plyne'],
      btn: 'Poslat mi plán'
    };
  }

  function buildExamGate(score, missingChapters, risks, missingIds, riskIds) {
    var chybi = (missingChapters || []).length;
    var maRizika = !!(risks && risks.length);
    var t = textyBrany(chybi, maRizika, score);
    var el = document.createElement('div');
    el.className = 'vy-gate' + (maRizika ? ' vy-gate--urgent' : '');
    el.innerHTML =
      '<div class="vy-gate__head">' +
        '<span class="vy-gate__label">' + t.label + '</span>' +
        '<h3>' + t.h + '</h3>' +
        '<p>' + t.p + '</p>' +
        '<ul class="vy-gate__list">' +
          t.li.map(function (x) { return '<li>' + x + '</li>'; }).join('') +
        '</ul>' +
        '<p class="vy-gate__note" style="margin:0;">Kniha zůstává celá online a zdarma — tohle není vstupenka do obsahu, je to váš plán.</p>' +
      '</div>' +
      '<form id="vy-exam-form" class="vy-gate__form" novalidate>' +
        '<div class="vy-gate__row">' +
          '<p class="vy-gate__field">' +
            '<label for="vy-exam-jmeno">Jméno</label>' +
            '<input id="vy-exam-jmeno" type="text" name="jmeno" autocomplete="name" required>' +
          '</p>' +
          '<p class="vy-gate__field">' +
            '<label for="vy-exam-email">E-mail</label>' +
            '<input id="vy-exam-email" type="email" name="email" autocomplete="email" required>' +
          '</p>' +
        '</div>' +
        // Souhlas stojí nad tlačítkem: kdo vyplňuje odshora dolů, jinak
        // klikne na odeslání dřív, než ho vůbec uvidí.
        '<label class="vy-gate__consent">' +
          '<input type="checkbox" name="gdpr" required>' +
          '<span>Souhlasím se zpracováním e-mailu podle <a href="/osobni-udaje" target="_blank" rel="noopener">zásad ochrany osobních údajů</a>. Odhlásit se dá jedním kliknutím.</span>' +
        '</label>' +
        '<button type="submit">' + t.btn + '</button>' +
        '<p class="vy-gate__msg" role="alert" hidden></p>' +
      '</form>' +
      '<p class="vy-gate__note">Nikdo vám kvůli tomu nezavolá. Píšu, když mám co říct, ne podle kalendáře.</p>';

    var chybiText = (missingChapters || []).join(', ');
    var rizika = (risks || []).join(', ');
    var idText = (missingIds || []).join(',');

    // Skóre a rizika rozhodují o tom, jak rychle se na lead reaguje.
    // Kdo má 0–3 body nebo označil právní překážku, je prioritní —
    // v adminu to má být vidět dřív, než se otevře detail.
    var segment = (risks && risks.length) ? 'rizikova-situace'
      : (score <= 3 ? 'nepripraveny-samoprodejce'
      : (score <= 5 ? 'zvazujici-samoprodejce' : 'pripraveny-samoprodejce'));

    HubCTA.initGate({
      form: el.querySelector('#vy-exam-form'),
      doneTarget: el,
      leadForm: 'vycvik-zkouska',
      fields: { name: true },
      message:
        'Dotazník „Zvládnete to sami?" — skóre ' + score + '/8.\n' +
        (chybiText ? 'Chybí: ' + chybiText + '.\n' : 'Nechybí nic.\n') +
        (rizika ? 'Rizikové situace: ' + rizika + '.\n' : ''),
      meta: {
        score: score,
        missing_chapters: chybiText,
        missing_ids: idText,
        risks: rizika,
        // Čísla rizik, aby e-mail mohl ke každému napsat, co konkrétně
        // u prodeje znamená. Podle názvů by to nešlo spolehlivě spárovat.
        risk_ids: (riskIds || []).join(','),
        segment: segment
      },
      gaEvent: 'vycvik_plan_email',
      gaLabel: 'score_' + score,
      gaParams: { value: score },
      msgError: 'Něco se nepodařilo odeslat. Zkuste to prosím znovu.',
      done: DONE_ICON +
        '<h3>Odesláno. Plán je na cestě.</h3>' +
        '<p>Za chvíli vám přijde e-mail s vaším skóre a kroky v pořadí. Kdyby nedorazil do deseti minut, mrkněte do spamu — nebo mi napište na <a href="mailto:david.choc@ptf.cz">david.choc@ptf.cz</a>.</p>' +
        '<p class="vy-gate__done-note">Výsledek nahoře vám zůstává na stránce, i kdybyste e-mail nikdy neotevřel.</p>'
    });

    return el;
  }

  /* ── Plán z průvodce „krok za krokem" ──
     Druhý vstup do téže konverzní události. Člověk si právě sám spočítal,
     kolik hodin a korun ho prodej stojí a u kterých fází řekl „tohle ne" —
     takže brána nesmí nic vysvětlovat, jen nabídnout, že mu to shrnutí
     zůstane. Slibovat se smí jen to, co odešle api/_emaily.js → VYCVIK_PLAN. */
  function buildPlanGate(d) {
    var ne = (d.ne || []).length;
    var el = document.createElement('div');
    el.className = 'vy-gate';
    el.innerHTML =
      '<div class="vy-gate__head">' +
        '<span class="vy-gate__label">Váš rozpis</span>' +
        '<h3>' + (ne
          ? 'Chcete si tenhle rozpis nechat poslat?'
          : 'Chcete si to nechat poslat, ať to nemusíte počítat znovu?') + '</h3>' +
        '<p>Pošlu vám, co jste si tady odškrtal — v e-mailu, ke kterému se vrátíte za měsíc, ' +
        'až budete rozhodovat doopravdy. Stav v prohlížeči vám zůstává tak jako tak.</p>' +
        '<ul class="vy-gate__list">' +
          '<li>Vaše hodiny a náklady rozepsané po fázích</li>' +
          (ne
            ? '<li>U ' + (ne === 1 ? 'fáze, kterou' : ne + ' fází, které') +
              ' jste označil „tohle ne", co s ní jde udělat</li>'
            : '<li>Kde se jednotlivé fáze nejčastěji rozbíjejí</li>') +
        '</ul>' +
        '<p class="vy-gate__note" style="margin:0;">Kniha i tenhle průvodce zůstávají celé online a zdarma — tohle není vstupenka do obsahu.</p>' +
      '</div>' +
      '<form id="vy-plan-form" class="vy-gate__form" novalidate>' +
        '<div class="vy-gate__row">' +
          '<p class="vy-gate__field">' +
            '<label for="vy-plan-jmeno">Jméno</label>' +
            '<input id="vy-plan-jmeno" type="text" name="jmeno" autocomplete="name" required>' +
          '</p>' +
          '<p class="vy-gate__field">' +
            '<label for="vy-plan-email">E-mail</label>' +
            '<input id="vy-plan-email" type="email" name="email" autocomplete="email" required>' +
          '</p>' +
        '</div>' +
        // Souhlas stojí nad tlačítkem: kdo vyplňuje odshora dolů, jinak
        // klikne na odeslání dřív, než ho vůbec uvidí.
        '<label class="vy-gate__consent">' +
          '<input type="checkbox" name="gdpr" required>' +
          '<span>Souhlasím se zpracováním e-mailu podle <a href="/osobni-udaje" target="_blank" rel="noopener">zásad ochrany osobních údajů</a>. Odhlásit se dá jedním kliknutím.</span>' +
        '</label>' +
        '<button type="submit">Poslat mi rozpis</button>' +
        '<p class="vy-gate__msg" role="alert" hidden></p>' +
      '</form>' +
      '<p class="vy-gate__note">Nikdo vám kvůli tomu nezavolá. Píšu, když mám co říct, ne podle kalendáře.</p>';

    // Kdo řekl „tohle ne" u pěti a víc fází, sám si spočítal, že to dělat
    // nechce. To je jiný člověk než ten, komu chybí jedna věc, a v adminu
    // to musí být vidět dřív, než se otevře detail.
    var segment = ne >= 5 ? 'nechce-to-delat-sam'
      : (ne >= 3 ? 'zvazujici-samoprodejce' : 'pripraveny-samoprodejce');

    HubCTA.initGate({
      form: el.querySelector('#vy-plan-form'),
      doneTarget: el,
      leadForm: 'vycvik-plan',
      fields: { name: true },
      message:
        'Průvodce krok za krokem — prošel ' + d.prosel + ' z 10 fází.\n' +
        (ne ? 'Nechce dělat sám: ' + d.ne.join(', ') + '.\n' : 'Všechny fáze označil jako zvládnutelné.\n') +
        'Odhad: ' + d.hmin + '–' + d.hmax + ' hodin, ' + d.kc + ' Kč navíc.\n',
      meta: {
        prosel_fazi: d.prosel,
        nechce_faze: (d.ne || []).join(', '),
        // Čísla fází, aby e-mail ke každé napsal konkrétní větu.
        // Podle názvů by se to párovalo přes diakritiku, což je křehké.
        nechce_ids: (d.neIds || []).join(','),
        pocet_ne: ne,
        hodin_min: d.hmin,
        hodin_max: d.hmax,
        naklady: d.kc,
        segment: segment
      },
      gaEvent: 'vycvik_rozpis_email',
      gaLabel: 'ne_' + ne,
      gaParams: { value: ne },
      msgError: 'Něco se nepodařilo odeslat. Zkuste to prosím znovu.',
      done: DONE_ICON +
        '<h3>Odesláno. Rozpis je na cestě.</h3>' +
        '<p>Za chvíli vám přijde e-mail s vašimi čísly a fázemi. Kdyby nedorazil do deseti minut, mrkněte do spamu — nebo mi napište na <a href="mailto:david.choc@ptf.cz">david.choc@ptf.cz</a>.</p>' +
        '<p class="vy-gate__done-note">Odškrtané fáze vám zůstávají tady na stránce, i kdybyste e-mail nikdy neotevřel.</p>'
    });

    return el;
  }

  /* ── Zkratka pro nedokončený dotazník ──
     Kdo se zasekne uprostřed, dnes neodejde jen bez plánu — odejde beze
     stopy. Tahle brána proto neslibuje výsledek, který nemáme z čeho
     spočítat, ale to jediné, co jde poslat i bez dokončení: všech osm
     bodů, které se hlídají, a u každého konkrétní úkol.

     Co už člověk odpověděl, se v e-mailu odškrtne — proto se posílají
     čísla otázek, ne jen jejich počet. */
  function buildDropoutGate(odpovedi, rizika) {
    var hotovo = [];
    var chybi = [];
    for (var i = 1; i <= 8; i++) {
      if (odpovedi[i] === '1') hotovo.push(i);
      else if (odpovedi[i] === '0') chybi.push(i);
    }
    var zodpovezeno = hotovo.length + chybi.length;

    var el = document.createElement('div');
    el.className = 'vy-gate vy-gate--slim';
    el.innerHTML =
      '<div class="vy-gate__head">' +
        '<span class="vy-gate__label">Zkratka</span>' +
        '<h3>Pošlu vám osm bodů i bez dokončení</h3>' +
        '<p>Dotazník je jen způsob, jak se k nim dostat. Když ho dodělat nechcete, ' +
        'pošlu vám rovnou celý seznam — a u každého bodu jednu větu, co s ním udělat.</p>' +
        '<ul class="vy-gate__list">' +
          '<li>Osm bodů v pořadí prodeje, u každého konkrétní úkol</li>' +
          (hotovo.length
            ? '<li>' + (hotovo.length === 1 ? 'Bod, který' : 'Body, které') +
              ' už máte, ' + (hotovo.length === 1 ? 'zůstane' : 'zůstanou') + ' odškrtnuté</li>'
            : '<li>Ke každému bodu kapitola, kde je rozepsaný</li>') +
        '</ul>' +
        '<p class="vy-gate__note" style="margin:0;">Dotazník vám zůstane rozdělaný tady na stránce. Kdykoli ho dodělat můžete.</p>' +
      '</div>' +
      '<form class="vy-gate__form" novalidate>' +
        '<p class="vy-gate__field">' +
          '<label for="vy-zkratka-email">E-mail</label>' +
          '<input id="vy-zkratka-email" type="email" name="email" autocomplete="email" required>' +
        '</p>' +
        '<label class="vy-gate__consent">' +
          '<input type="checkbox" name="gdpr" required>' +
          '<span>Souhlasím se zpracováním e-mailu podle <a href="/osobni-udaje" target="_blank" rel="noopener">zásad ochrany osobních údajů</a>. Odhlásit se dá jedním kliknutím.</span>' +
        '</label>' +
        '<button type="submit">Poslat mi osm bodů</button>' +
        '<p class="vy-gate__msg" role="alert" hidden></p>' +
      '</form>' +
      '<p class="vy-gate__note">Nikdo vám kvůli tomu nezavolá. Píšu, když mám co říct, ne podle kalendáře.</p>';

    HubCTA.initGate({
      form: el.querySelector('form'),
      doneTarget: el,
      leadForm: 'vycvik-zkouska-nedokonceny',
      fields: {},
      message:
        'Dotazník „Zvládnete to sami?" — nedokončený, zodpovězeno ' + zodpovezeno + ' z 8.\n' +
        (hotovo.length ? 'Má hotové otázky: ' + hotovo.join(', ') + '.\n' : '') +
        (chybi.length ? 'Chybí mu otázky: ' + chybi.join(', ') + '.\n' : ''),
      meta: {
        zodpovezeno: zodpovezeno,
        hotovo_ids: hotovo.join(','),
        chybi_ids: chybi.join(','),
        risk_ids: (rizika || []).join(','),
        // Nedokončený dotazník neříká, jak je člověk připravený — říká jen,
        // že se zastavil. Segment proto nesmí předstírat víc.
        segment: 'nedokonceny-dotaznik'
      },
      gaEvent: 'vycvik_zkratka_email',
      gaLabel: 'odpovezeno_' + zodpovezeno,
      gaParams: { value: zodpovezeno },
      msgError: 'Něco se nepodařilo odeslat. Zkuste to prosím znovu.',
      done: DONE_ICON +
        '<h3>Odesláno. Osm bodů je na cestě.</h3>' +
        '<p>Za chvíli vám přijde e-mail se všemi osmi body a úkolem u každého. Kdyby nedorazil do deseti minut, mrkněte do spamu — nebo mi napište na <a href="mailto:david.choc@ptf.cz">david.choc@ptf.cz</a>.</p>' +
        '<p class="vy-gate__done-note">Rozdělaný dotazník vám zůstává tady na stránce.</p>'
    });

    return el;
  }

  /* ── Brány v kapitolách ──
     Osmnáct stránek z dvaadvaceti nemělo kam nechat kontakt. Kdo dočetl
     kapitolu o ceně a došlo mu, že cenu nemá čím podložit, se musel vrátit
     na rozcestník a začít dotazník od začátku — a většina lidí se nevrátí.

     Zakládat kvůli tomu další stránky by byla chyba, kterou tahle sekce
     jednou zavírala. Brána proto stojí přímo v kapitole, je na téma té
     kapitoly a je záměrně malá: jedno pole, jedna věta, žádné jméno.

     Platí tu totéž co u velkých bran — slíbit se smí jen to, co e-mail
     doopravdy odešle (api/_emaily.js → VYCVIK_KAPITOLA_*). */
  var KAPITOLY = {
    '/vycvik/kapitola-1-cena': {
      leadForm: 'vycvik-kapitola-cena',
      label: 'K téhle kapitole',
      h: 'Chcete tři zdroje, ze kterých se cena dá podložit?',
      p: 'Pošlu vám tři konkrétní místa, kde si cenu ověříte sám — u každého to, co v něm hledat a čemu v něm nevěřit.',
      li: ['Tři zdroje a u každého jedna věta, na co si u něj dát pozor',
           'Jak z nich složit ty tři částky, o kterých je celá tahle kapitola'],
      btn: 'Poslat mi tři zdroje',
      done: 'Za chvíli vám přijdou tři zdroje a co v každém z nich hledat.'
    },
    '/vycvik/kapitola-3-fotografie': {
      leadForm: 'vycvik-kapitola-fotky',
      label: 'K téhle kapitole',
      h: 'Chcete seznam záběrů s sebou k focení?',
      p: 'Pošlu vám osm záběrů, které v inzerátu musí být, v pořadí, ve kterém se fotí. Ať u toho nemusíte listovat kapitolou.',
      li: ['Osm záběrů v pořadí, ve kterém se fotí',
           'Tři chyby, kvůli kterým se fotka přeskočí, i když je ostrá'],
      btn: 'Poslat mi seznam záběrů',
      done: 'Za chvíli vám přijde osm záběrů i s pořadím, ve kterém je fotit.'
    },
    '/vycvik/kapitola-7-smlouvy': {
      leadForm: 'vycvik-kapitola-smlouvy',
      label: 'K téhle kapitole',
      h: 'Chcete vědět, na co si dát pozor u úschovy?',
      p: 'Tohle je jediné místo prodeje, kde se chybou nepřichází o část ceny, ale o peníze i o nemovitost zároveň. Pošlu vám, kde se to láme.',
      li: ['Pět míst, na kterých se u kupní smlouvy a úschovy chybuje',
           'Pořadí kroků, které se nesmí prohodit'],
      btn: 'Poslat mi, na co dát pozor',
      done: 'Za chvíli vám přijde pět míst, kde se u úschovy chybuje, i s pořadím kroků.'
    }
  };

  /* ── Sdílený stav sekce ──
     Dvě místa v knize si pamatují, co člověk vyplnil: dotazník
     („vycvik-zkouska") a průvodce po fázích („vycvik-krok-za-krokem").
     Základní brána je čte obě, aby na páté kapitole neříkala „chcete
     vědět, co vás čeká?" někomu, kdo si to už spočítal.

     Rizikové situace jsou schválně v témže klíči jako dotazník: kdo je
     zaškrtne kdekoli na webu, najde je zaškrtnuté i v dotazníku. Dvě
     různá místa s vlastní pamětí by znamenala, že se web ptá dvakrát
     na totéž a jednu z odpovědí zahodí. */
  var KLIC_ZKOUSKA = 'vycvik-zkouska';
  var KLIC_PRUVODCE = 'vycvik-krok-za-krokem';

  function nactiKlic(klic) {
    try { return JSON.parse(localStorage.getItem(klic)) || {}; }
    catch (e) { return {}; }
  }

  function ulozKlic(klic, data) {
    try { localStorage.setItem(klic, JSON.stringify(data)); } catch (e) {}
  }

  function stavSekce() {
    var z = nactiKlic(KLIC_ZKOUSKA);
    var pr = nactiKlic(KLIC_PRUVODCE);

    var odpovedi = z.answers || {};
    var zodpovezeno = 0, spravne = 0;
    for (var i = 1; i <= 8; i++) {
      if (odpovedi[i] === '1') { zodpovezeno++; spravne++; }
      else if (odpovedi[i] === '0') { zodpovezeno++; }
    }

    var prosel = 0, ne = [];
    for (var f = 1; f <= 10; f++) {
      var v = pr['f' + f];
      if (!v) continue;
      prosel++;
      if (v === 'ne') ne.push(f);
    }

    return {
      rizika: Object.keys(z.risks || {}),
      // Skóre má smysl jen z dokončeného dotazníku. Hlásit „3 z 8"
      // někomu, kdo odpověděl tři otázky, by byl výsledek, který si
      // nezasloužil — a ještě špatný.
      skore: zodpovezeno === 8 ? spravne : null,
      prosel: prosel,
      ne: ne
    };
  }

  /* ── Základní brána sekce ──
     Jedna komponenta, tři podoby. Na stránce smí být jen jednou.

     default    — nikde nic nevyplnil: nabídne rozpis deseti fází
     diagnosed  — něco už spočítal: mluví jeho čísly
     eskalace   — označil právní překážku: přebíjí obojí

     Slíbit se smí jen to, co e-mail doopravdy odešle
     (api/_emaily.js → VYCVIK_ROZPIS, VYCVIK_RIZIKA). */
  var PATICKA_BRANY =
    'David Choc · realitní agent v Plzni od roku 1995 · přes 5 000 obchodů · ' +
    'když nemovitost neprodám, neplatíte mi nic.';

  function textyHlavniBrany(st) {
    if (st.rizika.length) {
      return {
        varianta: 'eskalace',
        leadForm: 'vycvik-rizika',
        label: 'Vaše situace',
        h: 'Tohle není o tom, jestli to umíte.',
        p: 'Označil jste ' + (st.rizika.length === 1 ? 'situaci' : 'situace') +
           ', kde se chyba nedá opravit slevou z ceny. Pošlu vám, co to u prodeje ' +
           'reálně mění a co se ošetřuje předem — a pak vám odpovím osobně.',
        li: ['Co konkrétně vaše situace u prodeje mění',
             'Co se dá ošetřit předem a co až u smlouvy'],
        btn: 'Chci to probrat',
        pod: 'Odpovím do hodiny, mezi osmou a osmou. Bez závazku a bez podpisu.'
      };
    }

    if (st.prosel >= 3 || st.skore !== null) {
      var uvod = st.prosel >= 3
        ? 'Prošel jste ' + st.prosel + ' z deseti fází průvodce' +
          (st.ne.length
            ? ' a u ' + (st.ne.length === 1 ? 'jedné' : st.ne.length) + ' jste řekl „tohle ne".'
            : '.')
        : 'Z dotazníku vám vyšlo ' + st.skore + ' z 8.';
      return {
        varianta: 'diagnosed',
        leadForm: 'vycvik-rozpis',
        label: 'Váš rozpis',
        h: 'Chcete si to nechat poslat, ať to nemusíte počítat znovu?',
        p: uvod + ' Pošlu vám celý rozpis deseti fází — hodiny, orientační náklady ' +
           'a co se v každé fázi nejčastěji rozbije' +
           (st.ne.length ? ' — a u fází, které jste odmítl, jednu větu, co s nimi jde dělat.' : '.'),
        li: ['Deset fází v pořadí, ve kterém se dělají',
             'U každé hodiny, koruny a místo, kde se to nejčastěji láme',
             'Součet: kolik hodin a kolik korun to dělá dohromady'],
        btn: 'Poslat mi rozpis',
        pod: 'Přijde hned. Nikdo vám nevolá — volám jen tomu, kdo si o to řekne.'
      };
    }

    return {
      varianta: 'default',
      leadForm: 'vycvik-rozpis',
      label: 'Než se do toho pustíte',
      h: 'Chcete vědět, co přesně vás čeká?',
      // Čísla jsou zatím odhad českého trhu, ne Davidův ceník (viz
      // docs/vycvik-cisla-k-overeni.md). Brána proto slibuje řád, ne
      // ověřená data — slib, který e-mail nesplní, je horší než žádný.
      p: 'Pošlu vám prodej rozepsaný na deset fází — u každé kolik hodin práce ' +
         'zabere, kolik zhruba stojí a co se v ní nejčastěji rozbije. Orientační ' +
         'rozpětí, ať víte, o jakém řádu se bavíme.',
      li: ['Deset fází v pořadí, ve kterém se dělají',
           'U každé hodiny, koruny a místo, kde se to nejčastěji láme',
           'Součet: kolik hodin a kolik korun to dělá dohromady'],
      btn: 'Poslat mi rozpis',
      pod: 'Přijde hned. Nikdo vám nevolá — volám jen tomu, kdo si o to řekne. Odhlásit jedním kliknutím.'
    };
  }

  /* Brány na stránce si držíme v seznamu, protože se můžou během čtení
     změnit: kdo v půlce kapitoly zaškrtne dědické řízení, musí pod sebou
     najít eskalaci, ne nabídku rozpisu. Odeslanou bránu překreslovat
     nesmíme — smazali bychom člověku poděkování i to, co si přečetl. */
  var BRANY = [];

  function obnovBrany() {
    BRANY.forEach(function (z) {
      if (!z.el || !z.el.parentNode) return;
      if (z.el.querySelector('.vy-gate__done')) return;
      var novy = buildHlavniBranu(z.zdroj);
      z.el.parentNode.replaceChild(novy, z.el);
      z.el = novy;
    });
  }

  function buildHlavniBranu(zdroj) {
    var st = stavSekce();
    var t = textyHlavniBrany(st);
    var id = 'vy-hlavni-' + Math.random().toString(36).slice(2, 8);

    var el = document.createElement('div');
    el.className = 'vy-gate' + (t.varianta === 'eskalace' ? ' vy-gate--urgent' : '');
    el.innerHTML =
      '<div class="vy-gate__head">' +
        '<span class="vy-gate__label">' + t.label + '</span>' +
        '<h3>' + t.h + '</h3>' +
        '<p>' + t.p + '</p>' +
        '<ul class="vy-gate__list">' +
          t.li.map(function (x) { return '<li>' + x + '</li>'; }).join('') +
        '</ul>' +
        '<p class="vy-gate__note" style="margin:0;">Kniha zůstává celá online a zdarma — tohle není vstupenka do obsahu.</p>' +
      '</div>' +
      '<form class="vy-gate__form" novalidate>' +
        '<p class="vy-gate__field">' +
          '<label for="' + id + '-email">E-mail</label>' +
          '<input id="' + id + '-email" type="email" name="email" autocomplete="email" required>' +
        '</p>' +
        '<label class="vy-gate__consent">' +
          '<input type="checkbox" name="gdpr" required>' +
          '<span>Souhlasím se zpracováním e-mailu podle <a href="/osobni-udaje" target="_blank" rel="noopener">zásad ochrany osobních údajů</a>. Odhlásit se dá jedním kliknutím.</span>' +
        '</label>' +
        '<button type="submit">' + t.btn + '</button>' +
        '<p class="vy-gate__msg" role="alert" hidden></p>' +
      '</form>' +
      '<p class="vy-gate__note">' + t.pod + '</p>' +
      '<p class="vy-gate__note vy-gate__note--author">' + PATICKA_BRANY + '</p>';

    HubCTA.initGate({
      form: el.querySelector('form'),
      doneTarget: el,
      leadForm: t.leadForm,
      fields: {},
      message: t.varianta === 'eskalace'
        ? 'Riziková situace označená v knize: ' + st.rizika.join(', ') + '.\n'
        : 'Rozpis deseti fází' +
          (st.prosel ? ', prošel ' + st.prosel + ' z 10 fází průvodce' : '') +
          (st.ne.length ? ', odmítl fáze ' + st.ne.join(', ') : '') +
          (st.skore !== null ? ', dotazník ' + st.skore + '/8' : '') + '.\n',
      meta: {
        zdroj_stranka: zdroj,
        varianta: t.varianta,
        risk_ids: st.rizika.join(','),
        nechce_ids: st.ne.join(','),
        prosel_fazi: st.prosel,
        score: st.skore,
        // Rizikovou situaci řeším dřív než cokoli jiného — v adminu to
        // musí být poznat bez otevírání detailu.
        segment: t.varianta === 'eskalace' ? 'rizikova-situace' : 'ctenar-knihy'
      },
      gaEvent: 'vycvik_hlavni_brana',
      gaLabel: t.varianta + '_' + zdroj,
      msgError: 'Něco se nepodařilo odeslat. Zkuste to prosím znovu.',
      done: t.varianta === 'eskalace'
        ? DONE_ICON +
          '<h3>Mám to. Dívám se na to.</h3>' +
          '<p>Za chvíli vám přijde shrnutí toho, co jste označil. A pak odpovím osobně — do hodiny, mezi osmou a osmou. Napište mi klidně rovnou na <a href="mailto:david.choc@ptf.cz">david.choc@ptf.cz</a>, co přesně máte.</p>'
        : DONE_ICON +
          '<h3>Odesláno. Rozpis je na cestě.</h3>' +
          '<p>Za chvíli vám přijde deset fází i s hodinami a náklady. Kdyby nedorazil do deseti minut, mrkněte do spamu — nebo mi napište na <a href="mailto:david.choc@ptf.cz">david.choc@ptf.cz</a>.</p>'
    });

    return el;
  }

  /* ── Osm rizikových situací mimo dotazník ──
     Nejvýnosnější zakázky sekce dosud neměly na webu jediné tlačítko:
     kdo o dědickém řízení věděl, musel na to sám přijít v dotazníku.
     Blok se dá vložit do kterékoli stránky přes <div data-vy-rizika>.

     Zaškrtnutí se ukládá do stavu dotazníku, takže se nikde neptáme
     dvakrát, a hned pod blokem vyjede eskalační brána — čekat s ní na
     konec stránky by znamenalo spoléhat, že člověk doroluje. */
  var RIZIKA = [
    [1, 'Nemovitost je v podílovém spoluvlastnictví a nejsou všichni zajedno'],
    [2, 'Dědické řízení není pravomocně ukončené, nebo prodávám krátce po něm'],
    [3, 'Prodávám v souvislosti s rozvodem nebo se dělí společné jmění'],
    [4, 'Vázne tam zástava, exekuce, insolvence nebo věcné břemeno'],
    [5, 'V nemovitosti bydlí nájemce nebo je pronajatá na dobu určitou'],
    [6, 'Prodávám družstevní podíl, ne nemovitost'],
    [7, 'Kupující je ze zahraničí nebo peníze přicházejí ze zahraničí'],
    [8, 'Skutečný stav neodpovídá katastru nebo dokumentaci']
  ];

  function initRizikaBlok() {
    var hostitele = document.querySelectorAll('[data-vy-rizika]');
    if (!hostitele.length) return;

    Array.prototype.forEach.call(hostitele, function (host) {
      if (host.querySelector('.vy-widget')) return;
      var stav = nactiKlic(KLIC_ZKOUSKA);
      stav.risks = stav.risks || {};

      var el = document.createElement('div');
      el.className = 'vy-widget';
      el.innerHTML =
        '<div class="vy-widget__head">' +
          '<span class="vy-widget__badge" style="background:#c0392b; color:#fff;">' +
            '<i class="fas fa-triangle-exclamation" aria-hidden="true"></i> Nezávisle na všem ostatním' +
          '</span>' +
          '<h2 class="vy-widget__title">Platí u vás něco z tohoto?</h2>' +
          '<p class="vy-widget__desc">Tyhle situace nerozhoduje to, jestli prodej zvládnete. ' +
          'Rozhoduje je právo — a chyba se v nich nedá opravit slevou z ceny.</p>' +
        '</div>' +
        '<div class="vy-widget__body">' +
          RIZIKA.map(function (r) {
            return '<label class="vy-check"><input type="checkbox" data-risk="' + r[0] + '"' +
              (stav.risks[r[0]] ? ' checked' : '') +
              '><span class="vy-check__text">' + r[1] + '</span></label>';
          }).join('') +
          '<div class="vy-rizika__brana"></div>' +
        '</div>';

      var branaEl = el.querySelector('.vy-rizika__brana');

      /* Vlastní brána se pod seznamem staví jen tehdy, když na stránce
         žádná jiná není. Kde je (třeba na konci kapitoly), stačí ji
         překreslit — dvě nabídky pod sebou nutí vybírat mezi nimi
         místo mezi „chci" a „nechci". */
      function prekresli() {
        var aktualni = nactiKlic(KLIC_ZKOUSKA);
        var pocet = Object.keys(aktualni.risks || {}).length;
        obnovBrany();
        if (BRANY.length) { branaEl.innerHTML = ''; return; }
        branaEl.innerHTML = '';
        if (!pocet) return;
        var b = buildHlavniBranu('rizika-blok');
        branaEl.appendChild(b);
      }

      el.addEventListener('change', function (ev) {
        var vstup = ev.target;
        if (!vstup || !vstup.getAttribute || !vstup.getAttribute('data-risk')) return;
        var klic = vstup.getAttribute('data-risk');
        var aktualni = nactiKlic(KLIC_ZKOUSKA);
        aktualni.risks = aktualni.risks || {};
        if (vstup.checked) aktualni.risks[klic] = true;
        else delete aktualni.risks[klic];
        ulozKlic(KLIC_ZKOUSKA, aktualni);
        prekresli();
        if (vstup.checked && window.gtag) {
          window.gtag('event', 'vycvik_riziko_oznaceno', {
            event_category: 'vycvik', event_label: 'riziko_' + klic
          });
        }
      });

      host.appendChild(el);
      prekresli();
    });
  }

  /* ── Umístění základní brány ──
     Placeholder <div data-vy-brana="zdroj"> kdekoli, a jako záchranná
     síť konec každé části knihy, která vlastní bránu nemá. Dvanáct částí
     knihy mělo dohromady tři nabídky — zbytek končil navigační šipkou. */
  var BEZ_BRANY = [
    // Vlastní silnější nabídka přímo na stránce.
    '/vycvik/kapitola-9-zaseklo-se'
  ];

  function initZakladniBrana() {
    var hostitele = document.querySelectorAll('[data-vy-brana]');
    Array.prototype.forEach.call(hostitele, function (host) {
      if (host.querySelector('.vy-gate')) return;
      var zdroj = host.getAttribute('data-vy-brana') || 'stranka';
      var b = buildHlavniBranu(zdroj);
      host.appendChild(b);
      BRANY.push({ zdroj: zdroj, el: b });
    });

    var cesta = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
    if (KAPITOLY[cesta]) return false;
    if (BEZ_BRANY.indexOf(cesta) !== -1) return false;

    var wrap = document.querySelector('.vycvik-chapter__wrap');
    if (!wrap || wrap.querySelector('.vy-gate')) return false;

    var zdroj = cesta.replace('/vycvik/', '') || 'kniha';
    var el = buildHlavniBranu(zdroj);
    var pred = wrap.querySelector('.vy-related, .vycvik-verified, .vycvik-nav');
    if (pred) wrap.insertBefore(el, pred);
    else wrap.appendChild(el);
    BRANY.push({ zdroj: zdroj, el: el });
    return true;
  }

  function initChapterGate() {
    var cesta = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
    var k = KAPITOLY[cesta];
    if (!k) return;

    var wrap = document.querySelector('.vycvik-chapter__wrap');
    if (!wrap || wrap.querySelector('.vy-gate')) return;

    var idBase = 'vy-kap-' + k.leadForm.replace(/[^a-z]/g, '');
    var el = document.createElement('div');
    el.className = 'vy-gate vy-gate--slim';
    el.innerHTML =
      '<div class="vy-gate__head">' +
        '<span class="vy-gate__label">' + k.label + '</span>' +
        '<h3>' + k.h + '</h3>' +
        '<p>' + k.p + '</p>' +
        '<ul class="vy-gate__list">' +
          k.li.map(function (x) { return '<li>' + x + '</li>'; }).join('') +
        '</ul>' +
        '<p class="vy-gate__note" style="margin:0;">Kapitola i celá kniha zůstávají online a zdarma — tohle není vstupenka do obsahu.</p>' +
      '</div>' +
      '<form class="vy-gate__form" novalidate>' +
        '<p class="vy-gate__field">' +
          '<label for="' + idBase + '-email">E-mail</label>' +
          '<input id="' + idBase + '-email" type="email" name="email" autocomplete="email" required>' +
        '</p>' +
        // Souhlas nad tlačítkem, stejně jako na ostatních branách sekce.
        '<label class="vy-gate__consent">' +
          '<input type="checkbox" name="gdpr" required>' +
          '<span>Souhlasím se zpracováním e-mailu podle <a href="/osobni-udaje" target="_blank" rel="noopener">zásad ochrany osobních údajů</a>. Odhlásit se dá jedním kliknutím.</span>' +
        '</label>' +
        '<button type="submit">' + k.btn + '</button>' +
        '<p class="vy-gate__msg" role="alert" hidden></p>' +
      '</form>' +
      '<p class="vy-gate__note">Nikdo vám kvůli tomu nezavolá. Píšu, když mám co říct, ne podle kalendáře.</p>';

    HubCTA.initGate({
      form: el.querySelector('form'),
      doneTarget: el,
      leadForm: k.leadForm,
      fields: {},
      message: 'Zájem o materiál ke kapitole: ' + k.h + '\n',
      // Člověk, který si řekne o materiál k jedné kapitole, ještě neřekl
      // nic o tom, jak je na prodej připravený. Segment proto říká jen to,
      // co doopravdy víme — u které kapitoly se zastavil.
      meta: { segment: 'ctenar-kapitoly', kapitola: cesta },
      gaEvent: 'vycvik_kapitola_email',
      gaLabel: k.leadForm,
      msgError: 'Něco se nepodařilo odeslat. Zkuste to prosím znovu.',
      done: DONE_ICON +
        '<h3>Odesláno.</h3>' +
        '<p>' + k.done + ' Kdyby nedorazil do deseti minut, mrkněte do spamu — nebo mi napište na <a href="mailto:david.choc@ptf.cz">david.choc@ptf.cz</a>.</p>'
    });

    // Brána patří za text kapitoly, ale před odkazy na blog a navigaci —
    // tam čtenář dočetl a rozhoduje se, kam dál.
    var pred = wrap.querySelector('.vy-related, .vycvik-verified, .vycvik-nav');
    if (pred) wrap.insertBefore(el, pred);
    else wrap.appendChild(el);
  }

  // Export pro stránky dotazníku a průvodce
  window.VycvikCTA = {
    buildExamGate: buildExamGate,
    buildPlanGate: buildPlanGate,
    buildDropoutGate: buildDropoutGate,
    buildHlavniBranu: buildHlavniBranu,
    stavSekce: stavSekce
  };

  HubCTA.ready(function () {
    // Brána se staví první: patička pomoci se pod ní přeskakuje, aby
    // pod textem nestály dvě nabídky vedle sebe. Kapitoly s vlastní
    // bránou to mají natvrdo v help.skip, u ostatních se cesta přidá
    // až ve chvíli, kdy tam základní brána opravdu skončila.
    initChapterGate();
    if (initZakladniBrana()) {
      var c = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
      window.HubConfig.help.skip.push(c);
    }
    initRizikaBlok();
    HubCTA.injectHelp();
    initInzeratForm();
  });
})();
