// Prověrka před koupí — nástroj k Cihle 4.
// Tři kontrolní seznamy a generátor e-mailu pro správce SVJ.
// Všechno se ukládá do localStorage, nic se neodesílá.
(function () {
  'use strict';

  /** Skloňování po číslovce: 1 signál, 2–4 signály, 5+ signálů. */
  function sklonuj(n, jeden, dva, pet) {
    if (n === 1) return jeden;
    if (n >= 2 && n <= 4) return dva;
    return pet;
  }

  function init() {
    var box = document.getElementById('proverka');
    if (!box || !window.HubTools) return;

    /* ── 1) Dokumenty, které si vyžádáte ─────────────────────────────── */
    HubTools.initChecklist({
      storageKey: 'investovat-proverka-dokumenty',
      container: '#proverka-dokumenty',
      countEl: '#proverka-dokumenty-count',
      totalEl: '#proverka-dokumenty-total',
      fillEl: '#proverka-dokumenty-fill',
      resetEl: '#proverka-dokumenty-reset',
      doneClass: 'is-done',
      doneTarget: '.vy-check',
      gaEvent: 'investovat_proverka_dokumenty'
    });

    /* ── 2) Deset varovných signálů ──────────────────────────────────── */
    var verdikt = box.querySelector('.js-verdikt');

    HubTools.initChecklist({
      storageKey: 'investovat-proverka-signaly',
      container: '#proverka-signaly',
      countEl: '#proverka-signaly-count',
      totalEl: '#proverka-signaly-total',
      fillEl: '#proverka-signaly-fill',
      resetEl: '#proverka-signaly-reset',
      doneClass: 'is-done',
      doneTarget: '.vy-check',
      onChange: function (done) {
        if (!verdikt) return;

        if (done === 0) {
          verdikt.innerHTML =
            '<div class="vy-verdict vy-verdict--ok">' +
              '<strong>Zatím čisto.</strong>' +
              '<p>Žádný z deseti signálů jste neodškrtli. To je dobrá zpráva — ale platí jen tehdy, když jste všech deset skutečně prověřili, ne když jste je jen přeskočili.</p>' +
            '</div>';
        } else if (done <= 2) {
          verdikt.innerHTML =
            '<div class="vy-verdict vy-verdict--warn">' +
              '<strong>' + done + ' ' + sklonuj(done, 'signál', 'signály', 'signálů') + ' — zvýšená opatrnost.</strong>' +
              '<p>Jeden nebo dva body samy o sobě koupi nezabíjejí. Zjistěte si k nim podrobnosti přímo u předsedy SVJ a promítněte je do ceny, kterou nabídnete. Odpověď typu „to se nějak vyřeší" je třetí signál.</p>' +
            '</div>';
        } else {
          verdikt.innerHTML =
            '<div class="vy-verdict vy-verdict--danger">' +
              '<strong>' + done + ' ' + sklonuj(done, 'signál', 'signály', 'signálů') + ' — vezměte nohy na ramena.</strong>' +
              '<p>Tři a víc bodů znamená dům, který má problém dřív, než jste do něj vstoupili. Na trhu je dost jiných bytů. Tenhle nechte někomu, kdo si tuhle stránku nepřečetl.</p>' +
            '</div>';
        }
      }
    });

    /* ── 3) Technický stav bytu ──────────────────────────────────────── */
    HubTools.initChecklist({
      storageKey: 'investovat-proverka-technika',
      container: '#proverka-technika',
      countEl: '#proverka-technika-count',
      totalEl: '#proverka-technika-total',
      fillEl: '#proverka-technika-fill',
      resetEl: '#proverka-technika-reset',
      doneClass: 'is-done',
      doneTarget: '.vy-check',
      gaEvent: 'investovat_proverka_technika'
    });

    /* ── 4) E-mail pro správce SVJ ───────────────────────────────────── */
    var vystup = box.querySelector('.js-email-text');
    var tlacitko = box.querySelector('.js-email-kopirovat');

    function sestavit() {
      if (!vystup) return;

      function pole(name, nahrada) {
        var el = box.querySelector('[data-field="' + name + '"]');
        var v = el && el.value ? el.value.trim() : '';
        return v || nahrada;
      }

      var adresa = pole('adresa', '[adresa domu]');
      var jednotka = pole('jednotka', '[číslo jednotky]');
      var jmeno = pole('jmeno', '[vaše jméno]');

      vystup.value =
        'Dobrý den,\n\n' +
        'zvažuji koupi bytové jednotky č. ' + jednotka + ' v domě ' + adresa +
        ' a rád bych si předem ověřil hospodaření společenství vlastníků.\n\n' +
        'Prosím o zaslání těchto podkladů:\n\n' +
        '1. Finanční výkazy SVJ za poslední tři roky\n' +
        '2. Aktuální stav fondu oprav\n' +
        '3. Plán oprav a investic na příštích pět let\n' +
        '4. Zápisy z posledních dvou schůzí vlastníků\n' +
        '5. Potvrzení o bezdlužnosti současného vlastníka vůči SVJ\n\n' +
        'Zajímá mě také, zda SVJ nemá sjednaný úvěr, zda neprobíhá soudní spor ' +
        'a jaká je aktuální výše příspěvku do fondu oprav na metr čtvereční.\n\n' +
        'Předem děkuji za vstřícnost.\n\n' +
        'S pozdravem\n' +
        jmeno;
    }

    HubTools.initFields({
      storageKey: 'investovat-proverka-email',
      container: '#proverka-email',
      onChange: sestavit
    });

    box.addEventListener('input', function (e) {
      if (e.target && e.target.hasAttribute('data-field')) sestavit();
    });

    if (tlacitko) {
      tlacitko.addEventListener('click', function () {
        if (!vystup) return;
        var puvodni = tlacitko.textContent;

        function hotovo() {
          tlacitko.textContent = 'Zkopírováno';
          setTimeout(function () { tlacitko.textContent = puvodni; }, 2000);
          if (window.gtag) {
            window.gtag('event', 'investovat_email_svj', {
              event_category: 'nastroj', event_label: 'zkopirovan'
            });
          }
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(vystup.value).then(hotovo, function () {
            vystup.select();
          });
        } else {
          // Starší prohlížeče — aspoň text označíme, ať stačí Ctrl+C.
          vystup.select();
          try { document.execCommand('copy'); hotovo(); } catch (e) { /* nic */ }
        }
      });
    }

    sestavit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
