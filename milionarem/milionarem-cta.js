// Konverzní vrstva sekce Chci být milionářem.
// Strojová část je v /common/hub/hub-cta.js — tady jsou jen texty a cesty.
//
// Zásada sekce: čtenář nemá důvod odejít jinam. Všechno se odehrává na té
// stránce, kde právě je.
(function () {
  'use strict';

  window.HubConfig = {
    section: 'milionarem',
    leadApi: '/api/lead',

    help: {
      wrapSelector: '.hub-chapter__wrap, .hub-tool-page__wrap',
      title: 'Nevíte, kde začít?',
      text: 'Napište mi jednu větu o tom, kde stojíte. Odpovím do 24 hodin, zdarma a bez závazku — i když si to nakonec postavíte celé sami.',
      action: { label: 'Napsat', href: 'mailto:david.choc@ptf.cz' },
      phone: { label: '774 052 232', href: 'tel:+420774052232' },
      // Úvod je manifest. Do manifestu se nabídka nevkládá.
      skip: ['/milionarem', '/milionarem/', '/milionarem/index.html']
    }
  };

  var HOTOVO = '<i class="fas fa-circle-check" aria-hidden="true"></i>';

  HubCTA.ready(function () {
    HubCTA.injectHelp();

    HubCTA.initGateById('milionarem-mapa-form', {
      fields: { name: true },
      leadForm: 'milionarem-mapa',
      message: 'Zájem o další cihly — z Cihly 1 (Mapa cihel).',
      meta: { cihla: '1' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_1',
      done: '<i class="fas fa-circle-check" aria-hidden="true"></i>' +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude druhá cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

    HubCTA.initGateById('milionarem-pdf-form', {
      fields: { name: true },
      leadForm: 'milionarem-pdf',
      message: 'Žádost o výcvik Deset zlatých cihel v PDF.',
      gaEvent: 'milionarem_pdf',
      gaLabel: 'vycvik',
      done: HOTOVO +
        '<h3>Mám to. Dám vám vědět.</h3>' +
        '<p>Jakmile bude první cihla venku, přijde vám e-mail. Do té doby od nás nic jiného nedostanete.</p>'
    });
  });
})();
