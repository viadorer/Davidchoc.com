// Paušál vs. skutečné výdaje — nástroj k Cihle 9.
// Orientační základ daně z nájmu podle § 9 ZDP v obou variantách.
// Nic se neodesílá, počítá se v prohlížeči.
(function () {
  'use strict';

  // § 9 odst. 4 ZDP: výdaje 30 % z příjmů, nejvýše 600 000 Kč ročně.
  // Strop odpovídá příjmu 2 000 000 Kč — nad ním paušál dál neroste.
  var PAUSAL_PROCENT = 0.30;
  var PAUSAL_STROP = 600000;

  // Byt je v 5. odpisové skupině: 30 let, rovnoměrně 1,4 % v prvním roce
  // a 3,4 % v každém dalším. Pozemek se neodpisuje, proto se do vstupní
  // ceny nepočítá — na to upozorňuje nápověda u pole.
  var ODPIS_PRVNI = 0.014;
  var ODPIS_DALSI = 0.034;

  function fmt(n) {
    return window.HubTools ? HubTools.formatNumber(Math.round(n)) : String(Math.round(n));
  }
  function parse(v) {
    var n = window.HubTools ? HubTools.parseNumber(v) : parseFloat(v);
    return isNaN(n) ? null : n;
  }

  function init() {
    var box = document.getElementById('dane-najem');
    if (!box) return;

    var out = box.querySelector('.js-dane-vysledek');

    if (window.HubTools) {
      HubTools.initFields({
        storageKey: 'milionarem-dane',
        container: '#dane-najem',
        resetEl: '.js-dane-reset',
        onChange: prepocitat
      });
    }

    function pole(name) {
      var el = box.querySelector('[data-field="' + name + '"]');
      return el ? el.value : '';
    }

    function prepocitat() {
      if (!out) return;

      var prijem = parse(pole('prijem'));
      if (prijem === null || prijem <= 0) {
        out.innerHTML = '<p class="vy-field__hint">Zadejte roční příjem z nájmu — u nájmu 15 000 Kč měsíčně je to 180 000 Kč. Zbytek je nepovinný, ale bez něj vyjde paušál vždycky lépe, než jaká je pravda.</p>';
        return;
      }

      var uroky = parse(pole('uroky')) || 0;
      var ostatni = parse(pole('ostatni')) || 0;
      var cena = parse(pole('cena')) || 0;
      var prvniRok = pole('rok') === 'prvni';

      var odpis = cena > 0 ? cena * (prvniRok ? ODPIS_PRVNI : ODPIS_DALSI) : 0;

      var pausalVydaje = Math.min(prijem * PAUSAL_PROCENT, PAUSAL_STROP);
      var skutecneVydaje = uroky + ostatni + odpis;

      var zakladPausal = Math.max(0, prijem - pausalVydaje);
      var zakladSkutecne = Math.max(0, prijem - skutecneVydaje);

      var rozdil = zakladPausal - zakladSkutecne;
      var lepsiSkutecne = zakladSkutecne < zakladPausal;

      var html =
        '<div class="sim-stats">' +
          '<div class="sim-stat' + (lepsiSkutecne ? '' : ' sim-stat--ok') + '">' +
            '<span class="sim-stat__label">Paušál 30 %</span>' +
            '<span class="sim-stat__value">' + fmt(zakladPausal) + ' Kč</span>' +
            '<span class="sim-stat__note">výdaje ' + fmt(pausalVydaje) + ' Kč' +
              (prijem * PAUSAL_PROCENT > PAUSAL_STROP ? ' — narazili jste na strop 600 000 Kč' : '') +
            '</span>' +
          '</div>' +
          '<div class="sim-stat' + (lepsiSkutecne ? ' sim-stat--ok' : '') + '">' +
            '<span class="sim-stat__label">Skutečné výdaje</span>' +
            '<span class="sim-stat__value">' + fmt(zakladSkutecne) + ' Kč</span>' +
            '<span class="sim-stat__note">výdaje ' + fmt(skutecneVydaje) + ' Kč' +
              (odpis > 0 ? ', z toho odpis ' + fmt(odpis) + ' Kč' : '') +
            '</span>' +
          '</div>' +
        '</div>';

      if (Math.abs(rozdil) < 1000) {
        html +=
          '<div class="vy-verdict vy-verdict--warn">' +
            '<strong>Obě varianty vycházejí prakticky stejně.</strong>' +
            '<p>Rozdíl v základu daně je pod tisíc korun. V takové situaci bývá paušál pohodlnější — ' +
            'nemusíte schovávat doklady. Ale pozor: odpis příští rok povyskočí z 1,4 na 3,4 procenta, ' +
            'takže napřesrok už to stejné být nemusí.</p>' +
          '</div>';
      } else if (lepsiSkutecne) {
        html +=
          '<div class="vy-verdict vy-verdict--ok">' +
            '<strong>Skutečné výdaje vám sníží základ daně o ' + fmt(rozdil) + ' Kč.</strong>' +
            '<p>Při patnáctiprocentní sazbě je to zhruba <strong>' + fmt(rozdil * 0.15) + ' Kč</strong> ' +
            'na dani. Cenou za to je papírování: doklady, evidence a odpisový plán, který musíte držet ' +
            'celých třicet let.</p>' +
            '<p>Vezměte tahle dvě čísla daňovému poradci. Rozhodnutí je jeho, ne kalkulačky — ale teď ' +
            'aspoň víte, o kolik se hraje.</p>' +
          '</div>';
      } else {
        html +=
          '<div class="vy-verdict vy-verdict--warn">' +
            '<strong>Zatím vychází lépe paušál, o ' + fmt(-rozdil) + ' Kč základu daně.</strong>' +
            (cena <= 0
              ? '<p><strong>Ale nezadali jste pořizovací cenu</strong>, takže se nepočítá odpis — a to je u ' +
                'zafinancovaného bytu obvykle největší položka. Doplňte ji a spočítejte to znovu.</p>'
              : '<p>Může se to změnit hned příští rok: odpis vyskočí z 1,4 na 3,4 procenta vstupní ceny. ' +
                'U bytu za ' + fmt(cena) + ' Kč to je rozdíl ' + fmt(cena * (ODPIS_DALSI - ODPIS_PRVNI)) + ' Kč ' +
                've výdajích. Proto se to porovnává každý rok znovu.</p>') +
          '</div>';
      }

      html +=
        '<div class="hub-risk">' +
          '<div class="hub-risk__head">' +
            '<span class="hub-risk__label">Kde se to láme</span>' +
            '<span class="hub-risk__level">Orientačně</span>' +
          '</div>' +
          '<p class="hub-risk__title">Tohle je podklad k hovoru s poradcem, ne daňové přiznání</p>' +
          '<p>Do vstupní ceny pro odpis se nepočítá podíl na pozemku — ten se neodpisuje. Volba se navíc ' +
            'musí uplatnit stejně na všechny pronajímané nemovitosti a <strong>přechod z paušálu na ' +
            'skutečné výdaje se nedá udělat zpětně</strong>, protože odpisy musíte vést od začátku.</p>' +
          '<p>Sazba daně tu počítá s patnácti procenty. Nad zákonným limitem se část základu daní ' +
            'třiadvaceti — a do toho se sčítá i váš ostatní příjem, který tahle kalkulačka nezná.</p>' +
        '</div>';

      out.innerHTML = html;
    }

    /* Test „Poznáte, že cihla drží?" */
    var verdikt = document.querySelector('.js-test-verdikt');
    if (window.HubTools && verdikt) {
      HubTools.initChecklist({
        storageKey: 'milionarem-sprava-test',
        container: '#test-sprava',
        countEl: '#test-sprava-count',
        totalEl: '#test-sprava-total',
        fillEl: '#test-sprava-fill',
        resetEl: '#test-sprava-reset',
        doneClass: 'is-done',
        doneTarget: '.vy-check',
        gaEvent: 'milionarem_sprava_test',
        onChange: function (done, total) {
          if (done === total) {
            verdikt.innerHTML =
              '<div class="vy-verdict vy-verdict--ok">' +
                '<strong>Cihla drží. Byt pracuje, vy ne.</strong>' +
                '<p>Tohle je stav, kvůli kterému se do investičního bytu jde. Zbytek roku se o něj ' +
                'nemusíte starat — a přesně proto je čas přemýšlet o druhém.</p>' +
              '</div>';
            return;
          }

          var chybi = Array.prototype.slice.call(
            document.querySelectorAll('#test-sprava input[type="checkbox"][data-nazev]')
          ).filter(function (b) { return !b.checked; });

          var polozky = chybi.map(function (b) {
            return '<li>' + b.getAttribute('data-nazev') + '</li>';
          }).join('');

          verdikt.innerHTML =
            '<div class="vy-verdict vy-verdict--warn">' +
              '<strong>Správa běží na improvizaci, ne na systému.</strong>' +
              '<ul>' + polozky + '</ul>' +
              '<p>Deset minut nastavení dnes ušetří hodiny hašení příště. Žádná z těch věcí ' +
              'nespěchá — a právě proto se odkládá, dokud nezačne hořet.</p>' +
            '</div>';
        }
      });
    }

    box.addEventListener('input', prepocitat);
    box.addEventListener('change', prepocitat);
    prepocitat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
