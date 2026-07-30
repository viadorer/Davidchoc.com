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
        '/vycvik/kolik-to-stoji', '/vycvik/zaver', '/vycvik/zkouska',
        '/vycvik/posudte-inzerat'
      ]
    }
  };

  var DONE_ICON = '<i class="fas fa-circle-check" aria-hidden="true"></i>';

  /* ── PDF knihy za e-mail ── */
  function initPdfForm() {
    HubCTA.initGateById('vy-pdf-form', {
      leadForm: 'vycvik-pdf',
      message: 'Žádost o PDF knihy Výcvik ziskového prodeje nemovitosti.',
      gaEvent: 'vycvik_pdf_download',
      gaLabel: 'kniha_pdf',
      done: DONE_ICON +
        '<h3>Hotovo. PDF je na cestě.</h3>' +
        '<p>Za chvíli vám přijde e-mail s knihou ke stažení. Kdyby nedorazil do deseti minut, mrkněte do spamu — nebo mi napište na <a href="mailto:david.choc@ptf.cz">david.choc@ptf.cz</a>.</p>' +
        '<p class="vy-gate__done-note">Mezitím můžete rovnou <a href="/vycvik/uvod">začít číst online</a>.</p>'
    });
  }

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

  /* ── Výsledek zkoušky e-mailem ──
     Vkládá se až po vyhodnocení — nejteplejší moment knihy. */
  function buildExamGate(score, missingChapters, risks) {
    var el = document.createElement('div');
    el.className = 'vy-gate';
    el.innerHTML =
      '<div class="vy-gate__head">' +
        '<span class="vy-gate__label">Výsledek e-mailem</span>' +
        '<h3>Chcete výsledek i s tím, co se do knihy nevešlo?</h3>' +
        '<p>Pošlu vám vaše skóre a kapitoly k doplnění. A k tomu věci, které do tištěné knihy nepatří, protože rychle zastarají:</p>' +
        '<ul class="vy-gate__list">' +
          '<li>Aktuální ceny fotografa, videa a 3D skenu v Plzni</li>' +
          '<li>Seznam inzertních portálů s podmínkami pro soukromé inzerenty</li>' +
          '<li>Ceny advokátní a notářské úschovy</li>' +
        '</ul>' +
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

    var chybi = (missingChapters || []).join(', ');
    var rizika = (risks || []).join(', ');

    HubCTA.initGate({
      form: el.querySelector('#vy-exam-form'),
      doneTarget: el,
      leadForm: 'vycvik-zkouska',
      fields: { name: true },
      message:
        'Závěrečná zkouška — skóre ' + score + '/8.\n' +
        (chybi ? 'Chybí: ' + chybi + '.\n' : '') +
        (rizika ? 'Rizikové situace: ' + rizika + '.\n' : ''),
      meta: { score: score, missing_chapters: chybi, risks: rizika },
      gaEvent: 'vycvik_zkouska_email',
      gaLabel: 'score_' + score,
      gaParams: { value: score },
      msgError: 'Něco se nepodařilo odeslat. Zkuste to prosím znovu.',
      done: DONE_ICON +
        '<h3>Odesláno.</h3>' +
        '<p>Výsledek i s doplňky vám přijde na e-mail. Kdyby nedorazil, mrkněte do spamu.</p>'
    });

    return el;
  }

  // Export pro stránku zkoušky
  window.VycvikCTA = { buildExamGate: buildExamGate };

  HubCTA.ready(function () {
    HubCTA.injectHelp();
    initPdfForm();
    initInzeratForm();
  });
})();
