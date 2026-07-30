// Konverzní vrstva sekce Investiční byt.
// Strojová část je v /common/hub/hub-cta.js — tady jsou jen texty a cesty.
// Zatím kostra: formuláře přibudou spolu s obsahem.
(function () {
  'use strict';

  window.HubConfig = {
    section: 'investice',
    leadApi: '/api/lead',

    help: {
      wrapSelector: '.hub-chapter__wrap, .hub-tool-page__wrap',
      title: 'Nejste si jistí, jestli tenhle byt dává smysl?',
      text: 'Pošlete mi odkaz na inzerát. Řeknu vám, co bych na něm hlídal — zdarma a bez závazku.',
      action: { label: 'Napsat', href: '/pripad-pro-agenta' },
      phone: { label: '774 052 232', href: 'tel:+420774052232' },
      // Hub sám nabídku nepotřebuje, má ji v sekci „Kudy dál".
      skip: ['/investice', '/investice/', '/investice/index.html']
    }
  };

  HubCTA.ready(function () {
    HubCTA.injectHelp();
  });
})();
