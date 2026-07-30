// Konverzní vrstva kurzu Deset zlatých cihel.
// Strojová část je v /common/hub/hub-cta.js — tady jsou jen texty a cesty.
//
// Zásada celé sekce: čtenář nemá důvod odejít jinam. Všechno — kalkulačka,
// stažení průvodce i napsání zprávy — se odehrává na té stránce, kde právě je.
(function () {
  'use strict';

  window.HubConfig = {
    section: 'investovat',
    leadApi: '/api/lead',

    help: {
      wrapSelector: '.hub-chapter__wrap, .hub-tool-page__wrap',
      title: 'Zaseklo se to na jedné cihle?',
      text: 'Napište mi, o co jde. Odpovím do 24 hodin, zdarma a bez závazku — i když si to nakonec postavíte celé sami.',
      action: { label: 'Napsat', href: '/investovat#servis' },
      phone: { label: '774 052 232', href: 'tel:+420774052232' },
      // Hub má vlastní formulář, úvod slibuje, že nikdo nikoho netlačí.
      skip: [
        '/investovat', '/investovat/', '/investovat/index.html',
        '/investovat/uvod'
      ]
    }
  };

  var HOTOVO = '<i class="fas fa-circle-check" aria-hidden="true"></i>';

  HubCTA.ready(function () {
    HubCTA.injectHelp();

    /* ── Kompletní průvodce v PDF ── */
    HubCTA.initGateById('investovat-pdf-form', {
      leadForm: 'investovat-pdf',
      message: 'Žádost o kompletního průvodce Deset zlatých cihel v PDF.',
      gaEvent: 'investovat_pdf',
      gaLabel: 'kompletni_pruvodce',
      done: HOTOVO +
        '<h3>Hotovo. Průvodce je na cestě.</h3>' +
        '<p>Za chvíli vám přijde e-mail s PDF ke stažení. Kdyby nedorazil do deseti minut, mrkněte do spamu — nebo mi napište na <a href="mailto:david.choc@ptf.cz">david.choc@ptf.cz</a>.</p>' +
        '<p class="vy-gate__done-note">Mezitím můžete rovnou <a href="/investovat/uvod">začít číst online</a>.</p>'
    });

    /* ── Pracovní list Mapa cihel (Cihla 1) ── */
    HubCTA.initGateById('investovat-mapa-form', {
      leadForm: 'investovat-mapa-cihel',
      message: 'Žádost o pracovní list Mapa cihel z Cihly 1.',
      meta: { cihla: '1' },
      gaEvent: 'investovat_pracovni_list',
      gaLabel: 'mapa_cihel',
      done: HOTOVO +
        '<h3>Mapa je na cestě.</h3>' +
        '<p>Vytiskněte si ji a projděte pět kroků z téhle kapitoly. Až budete mít vyplněno, jste připravení otevřít první inzerát.</p>'
    });

    /* ── Napište mi ── */
    HubCTA.initGateById('investovat-servis-form', {
      leadForm: 'investovat-servis',
      fields: { name: true },
      message: function (d) {
        return d.note || 'Zájem o pomoc s investičním bytem — bez bližšího popisu.';
      },
      meta: { segment: 'investor-kupujici' },
      gaEvent: 'investovat_poptavka',
      gaLabel: 'servis',
      done: function (d) {
        return HOTOVO +
          '<h3>Mám to. Ozvu se vám.</h3>' +
          '<p>Odpověď vám přijde do 24 hodin na <strong>' + d.email + '</strong>. ' +
          'Kdyby nedorazila, mrkněte do spamu — nebo mi zavolejte na 774 052 232.</p>';
      }
    });
  });
})();
