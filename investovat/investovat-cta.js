// Konverzní vrstva kurzu Deset zlatých cihel.
// Strojová část je v /common/hub/hub-cta.js — tady jsou jen texty a cesty.
// Formuláře přibudou spolu s kapitolami.
(function () {
  'use strict';

  window.HubConfig = {
    section: 'investovat',
    leadApi: '/api/lead',

    help: {
      wrapSelector: '.hub-chapter__wrap, .hub-tool-page__wrap',
      title: 'Zaseklo se to na jedné cihle?',
      text: 'Napište mi, o co jde. Odpovím do 24 hodin, zdarma a bez závazku — i když si to nakonec postavíte celé sami.',
      action: { label: 'Napsat', href: '/pripad-pro-agenta' },
      phone: { label: '774 052 232', href: 'tel:+420774052232' },
      // Hub a úvod nabídku nepotřebují — úvod slibuje, že nikdo nikoho netlačí.
      skip: [
        '/investovat', '/investovat/', '/investovat/index.html',
        '/investovat/uvod'
      ]
    }
  };

  HubCTA.ready(function () {
    HubCTA.injectHelp();
  });
})();
