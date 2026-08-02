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

    // Jediná nabídka služby v celé sekci. Stojí za nástrojem, kde čtenář
    // právě zjistil, kolik té práce je — ne na začátku a ne místo obsahu.
    HubCTA.initGateById('milionarem-servis-form', {
      fields: { name: true, url: true },
      leadForm: 'milionarem-servis',
      message: function (d) {
        return 'Prosba o posouzení konkrétního bytu — z Cihly 4 (Prověrka).\n\nOdkaz: ' + d.url;
      },
      meta: function (d) { return { cihla: '4', listing_url: d.url }; },
      gaEvent: 'milionarem_servis',
      gaLabel: 'cihla_4',
      msgUrl: 'Vložte prosím celý odkaz na inzerát včetně https://',
      done: HOTOVO +
        '<h3>Mám ho.</h3>' +
        '<p>Podívám se na katastr, zápisy a fond oprav a do dvou pracovních dnů vám napíšu, co bych řešil dřív než cenu.</p>'
    });

    HubCTA.initGateById('milionarem-lokality-form', {
      fields: { name: true },
      leadForm: 'milionarem-lokality',
      message: 'Zájem o další cihly — z Cihly 3 (Srovnání lokalit).',
      meta: { cihla: '3' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_3',
      done: HOTOVO +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude čtvrtá cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

    HubCTA.initGateById('milionarem-proverka-form', {
      fields: { name: true },
      leadForm: 'milionarem-proverka',
      message: 'Zájem o další cihly — z Cihly 4 (Prověrka před koupí).',
      meta: { cihla: '4' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_4',
      done: HOTOVO +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude pátá cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

    HubCTA.initGateById('milionarem-rezervace-form', {
      fields: { name: true },
      leadForm: 'milionarem-rezervace',
      message: 'Zájem o další cihly — z Cihly 5 (Kontrola smlouvy).',
      meta: { cihla: '5' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_5',
      done: HOTOVO +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude šestá cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

    HubCTA.initGateById('milionarem-strop-form', {
      fields: { name: true },
      leadForm: 'milionarem-strop',
      message: 'Zájem o další cihly — z Cihly 2 (Finanční strop).',
      meta: { cihla: '2' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_2',
      done: '<i class="fas fa-circle-check" aria-hidden="true"></i>' +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude třetí cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

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
