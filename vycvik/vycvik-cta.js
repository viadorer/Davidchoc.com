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
    help: {
      wrapSelector: '.vycvik-chapter__wrap, .vycvik-tool-page__wrap',
      title: 'Zaseklo se to?',
      text: 'Napište mi, o co jde. Odpovím do 24 hodin, zdarma a bez závazku — i když to nakonec budete prodávat sami.',
      action: { label: 'Napsat', href: '/pripad-pro-agenta' },
      phone: { label: '774 052 232', href: 'tel:+420774052232' },
      // Hub a stránky, kde už silná nabídka je.
      skip: [
        '/vycvik', '/vycvik/', '/vycvik/index.html', '/vycvik/vybava',
        '/vycvik/kolik-to-stoji', '/vycvik/zaver', '/vycvik/zvladnete-to-sami',
        '/vycvik/posudte-inzerat'
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

  function buildExamGate(score, missingChapters, risks, missingIds) {
    var chybi = (missingChapters || []).length;
    var el = document.createElement('div');
    el.className = 'vy-gate';
    el.innerHTML =
      '<div class="vy-gate__head">' +
        '<span class="vy-gate__label">Váš plán</span>' +
        '<h3>' + nadpisBrany(chybi) + '</h3>' +
        '<p>' + (chybi
          ? 'Pošlu vám vaše skóre a ke každé chybějící věci konkrétní úkol — ne odkaz na kapitolu, ale větu, co s tím udělat.'
          : 'Pošlu vám vaše skóre a shrnutí, ať to máte černé na bílém.') + '</p>' +
        '<ul class="vy-gate__list">' +
          (chybi > 1
            ? '<li>Co udělat jako první, druhé, třetí — v pořadí prodeje, ne podle závažnosti</li>' +
              '<li>Ke každému kroku kapitola, kde je rozepsaný</li>'
            : chybi
              ? '<li>Konkrétní úkol a kapitola, kde je rozepsaný</li>'
              : '<li>Vaše skóre a co z něj plyne</li>') +
          // Rizika slibujeme jen tomu, kdo si nějaké označil. Slíbit
          // shrnutí něčeho, co člověk nevyplnil, je ta samá vada jako
          // slíbit PDF a poslat odkaz.
          ((risks && risks.length)
            ? '<li>Rizikové situace, které jste označil, a co s nimi</li>'
            : '') +
        '</ul>' +
        '<p class="vy-gate__note" style="margin:0;">Kniha zůstává celá online a zdarma — tohle není vstupenka do obsahu, je to váš plán.</p>' +
      '</div>' +
      '<form id="vy-exam-form" class="vy-gate__form" novalidate>' +
        '<div class="vy-gate__row">' +
          '<input type="text" name="jmeno" placeholder="Jméno" autocomplete="name" required aria-label="Jméno">' +
          '<input type="email" name="email" placeholder="vas@email.cz" required aria-label="E-mail">' +
        '</div>' +
        '<div class="vy-gate__row">' +
          '<button type="submit">Poslat výsledek</button>' +
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

  // Export pro stránku zkoušky
  window.VycvikCTA = { buildExamGate: buildExamGate };

  HubCTA.ready(function () {
    HubCTA.injectHelp();
    initInzeratForm();
  });
})();
