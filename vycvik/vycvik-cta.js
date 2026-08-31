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
        '/vycvik/krok-za-krokem'
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
          '<input type="text" name="jmeno" placeholder="Jméno" autocomplete="name" required aria-label="Jméno">' +
          '<input type="email" name="email" placeholder="vas@email.cz" required aria-label="E-mail">' +
        '</div>' +
        '<div class="vy-gate__row">' +
          '<button type="submit">' + t.btn + '</button>' +
        '</div>' +
        '<label class="vy-gate__consent">' +
          '<input type="checkbox" name="gdpr" required>' +
          '<span>Souhlasím se zpracováním e-mailu podle <a href="/osobni-udaje" target="_blank" rel="noopener">zásad ochrany osobních údajů</a>. Odhlásit se dá jedním kliknutím.</span>' +
        '</label>' +
        '<p class="vy-gate__msg" hidden></p>' +
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
          '<input type="text" name="jmeno" placeholder="Jméno" autocomplete="name" required aria-label="Jméno">' +
          '<input type="email" name="email" placeholder="vas@email.cz" required aria-label="E-mail">' +
        '</div>' +
        '<div class="vy-gate__row">' +
          '<button type="submit">Poslat mi rozpis</button>' +
        '</div>' +
        '<label class="vy-gate__consent">' +
          '<input type="checkbox" name="gdpr" required>' +
          '<span>Souhlasím se zpracováním e-mailu podle <a href="/osobni-udaje" target="_blank" rel="noopener">zásad ochrany osobních údajů</a>. Odhlásit se dá jedním kliknutím.</span>' +
        '</label>' +
        '<p class="vy-gate__msg" hidden></p>' +
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

  // Export pro stránky dotazníku a průvodce
  window.VycvikCTA = { buildExamGate: buildExamGate, buildPlanGate: buildPlanGate };

  HubCTA.ready(function () {
    HubCTA.injectHelp();
    initInzeratForm();
  });
})();
