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

    /* ── Pracovní list Finanční strop (Cihla 2) ── */
    HubCTA.initGateById('investovat-strop-form', {
      leadForm: 'investovat-financni-strop',
      message: 'Žádost o pracovní list Finanční strop z Cihly 2.',
      meta: { cihla: '2' },
      gaEvent: 'investovat_pracovni_list',
      gaLabel: 'financni_strop',
      done: HOTOVO +
        '<h3>Pracovní list je na cestě.</h3>' +
        '<p>Spočítejte si strop a napište si ho vedle rozpočtu z Cihly 1. Když si obě čísla sedí, další krok je předschválení.</p>'
    });

    /* ── Pracovní list Srovnání lokalit (Cihla 3) ── */
    HubCTA.initGateById('investovat-lokality-form', {
      leadForm: 'investovat-srovnani-lokalit',
      message: 'Žádost o pracovní list Srovnání lokalit z Cihly 3.',
      meta: { cihla: '3' },
      gaEvent: 'investovat_pracovni_list',
      gaLabel: 'srovnani_lokalit',
      done: HOTOVO +
        '<h3>Pracovní list je na cestě.</h3>' +
        '<p>Vyberte tři města, najděte v každém tři inzeráty 2+kk a spočítejte si u nich výnos. Porovnávejte čísla, ne pocity.</p>'
    });

    /* ── Pracovní list Prověrka před koupí (Cihla 4) ── */
    HubCTA.initGateById('investovat-proverka-form', {
      leadForm: 'investovat-proverka',
      message: 'Žádost o pracovní list Prověrka před koupí z Cihly 4.',
      meta: { cihla: '4' },
      gaEvent: 'investovat_pracovni_list',
      gaLabel: 'proverka_pred_koupi',
      done: HOTOVO +
        '<h3>Pracovní list je na cestě.</h3>' +
        '<p>Vezměte si ho na prohlídku vytištěný. Papír se nenechá zmást čerstvou výmalbou.</p>'
    });

    /* ── Pracovní list Kontrola rezervační smlouvy (Cihla 5) ── */
    HubCTA.initGateById('investovat-rezervace-form', {
      leadForm: 'investovat-rezervacni-smlouva',
      message: 'Žádost o pracovní list Kontrola rezervační smlouvy z Cihly 5.',
      meta: { cihla: '5' },
      gaEvent: 'investovat_pracovni_list',
      gaLabel: 'rezervacni_smlouva',
      done: HOTOVO +
        '<h3>Pracovní list je na cestě.</h3>' +
        '<p>Projděte podle něj smlouvu dřív, než ji podepíšete. Po podpisu už nemáte co nabídnout výměnou.</p>'
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
