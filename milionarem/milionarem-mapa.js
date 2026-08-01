// Mapa cihel — pracovní list k Cihle 1, přímo v kapitole.
// Vše v localStorage, nic se neodesílá, dá se vytisknout.
(function () {
  'use strict';

  var LTV = 0.70;
  var POPLATEK = 4;          // % z ceny, v praxi 3 až 5
  var REZERVA = 100000;      // vybavení a příprava k pronájmu
  var POLSTAR_MESICU = 3;
  var SAZBA = 5.2;
  var SPLATNOST = 25;
  var NAKLADY = 2500;        // fond oprav, daň, rezerva na opravy

  var OBSAZENOST_REAL = 11.5 / 12;
  var OBSAZENOST_KONZ = 10.5 / 12;
  var SAZBA_PRIRAZKA = 1.0;

  function fmt(n) {
    return window.HubTools ? HubTools.formatNumber(n) : String(Math.round(n));
  }
  function des(n) { return String(n).replace('.', ','); }
  function parse(v) {
    var n = window.HubTools ? HubTools.parseNumber(v) : parseFloat(v);
    return isNaN(n) ? null : n;
  }

  function splatka(jistina, sazbaProcent, roky) {
    if (jistina <= 0) return 0;
    var i = sazbaProcent / 100 / 12, n = roky * 12;
    if (i === 0) return jistina / n;
    return jistina * i / (1 - Math.pow(1 + i, -n));
  }

  function init() {
    var box = document.getElementById('mapa-cihel');
    if (!box) return;

    var out = box.querySelector('.js-mapa-vysledek');

    if (window.HubTools) {
      HubTools.initFields({
        storageKey: 'milionarem-mapa',
        container: '#mapa-cihel',
        resetEl: '.js-mapa-reset',
        onChange: prepocitat
      });
    }

    /* Cenu si vezmeme ze simulátoru, pokud si s ním čtenář už hrál. */
    function nactiCenu() {
      var el = box.querySelector('[data-field="cena"]');
      if (!el || el.value) return;
      try {
        var sim = JSON.parse(localStorage.getItem('milionarem-simulator') || 'null');
        if (sim && sim.cena) {
          el.value = fmt(parse(sim.cena));
          var zprava = box.querySelector('.js-cena-prevzata');
          if (zprava) zprava.hidden = false;
        }
      } catch (e) { /* vyplní se ručně */ }
    }

    function hodnota(name, vychozi) {
      var el = box.querySelector('[data-field="' + name + '"]');
      var v = el ? parse(el.value) : null;
      return v === null ? vychozi : v;
    }

    function prepocitat() {
      if (!out) return;

      var cena = hodnota('cena', null);
      if (cena === null || cena < 100000) {
        out.innerHTML = '<p class="vy-field__hint">Zadejte cenu bytu, se kterou počítáte, a dopočítám rozpočet i tři scénáře. Nemusí jít o konkrétní byt — stačí částka obvyklá ve vašem městě.</p>';
        return;
      }

      var najem = hodnota('najem', null);
      var uver = cena * LTV;
      var akontace = cena - uver;
      var poplatek = cena * POPLATEK / 100;
      var mesicni = splatka(uver, SAZBA, SPLATNOST);
      var polstar = mesicni * POLSTAR_MESICU;
      var celkem = akontace + poplatek + REZERVA + polstar;

      var html =
        '<div class="sim-headline">' +
          '<span class="sim-headline__label">Než podepíšete, musíte mít</span>' +
          '<span class="sim-headline__num">' + fmt(celkem) + ' Kč</span>' +
          '<p class="sim-headline__sub">A to není jen akontace. Většina lidí počítá jen s ní — a pak si na poslední chvíli půjčuje na kuchyň.</p>' +
        '</div>' +
        '<div class="sim-stats">' +
          '<div class="sim-stat"><span class="sim-stat__label">Vlastní zdroje (30 % z ceny)</span><span class="sim-stat__value">' + fmt(akontace) + ' Kč</span></div>' +
          '<div class="sim-stat"><span class="sim-stat__label">Poplatky spojené s nákupem (' + des(POPLATEK) + ' %)</span><span class="sim-stat__value">' + fmt(poplatek) + ' Kč</span></div>' +
          '<div class="sim-stat"><span class="sim-stat__label">Rezerva na vybavení a přípravu</span><span class="sim-stat__value">' + fmt(REZERVA) + ' Kč</span></div>' +
          '<div class="sim-stat"><span class="sim-stat__label">Polštář na tři splátky</span><span class="sim-stat__value">' + fmt(polstar) + ' Kč</span></div>' +
          '<div class="sim-stat"><span class="sim-stat__label">Úvěr od banky</span><span class="sim-stat__value">' + fmt(uver) + ' Kč</span></div>' +
          '<div class="sim-stat"><span class="sim-stat__label">Měsíční splátka při ' + des(SAZBA) + ' % na ' + SPLATNOST + ' let</span><span class="sim-stat__value">' + fmt(mesicni) + ' Kč</span></div>' +
        '</div>';

      if (najem !== null && najem > 0) {
        var real = najem * OBSAZENOST_REAL - NAKLADY - mesicni;
        var konz = najem * OBSAZENOST_KONZ - NAKLADY - splatka(uver, SAZBA + SAZBA_PRIRAZKA, SPLATNOST);

        html +=
          '<div class="vy-results">' +
            '<div class="vy-result vy-result--realistic">' +
              '<span class="vy-result__label">Realistický — obsazenost 11,5 měsíce</span>' +
              '<span class="vy-result__value">' + (real >= 0 ? '+' : '') + fmt(real) + ' Kč / měsíc</span>' +
            '</div>' +
            '<div class="vy-result ' + (konz >= 0 ? 'vy-result--floor' : 'vy-result--fail') + '">' +
              '<span class="vy-result__label">Konzervativní — sazba +1 p. b. a měsíc prázdna navíc</span>' +
              '<span class="vy-result__value">' + (konz >= 0 ? '+' : '') + fmt(konz) + ' Kč / měsíc</span>' +
            '</div>' +
          '</div>';

        html += konz >= 0
          ? '<div class="vy-verdict vy-verdict--ok"><strong>Konzervativní scénář vychází kladně. Máte zelenou.</strong>' +
            '<p>Investice obstojí i ve špatný rok, ne jen v tom vysněném. Tohle je jediný test, který má váhu.</p></div>'
          : '<div class="vy-verdict vy-verdict--warn"><strong>Konzervativní scénář jde do minusu o ' + fmt(Math.abs(konz)) + ' Kč měsíčně.</strong>' +
            '<p>Nemusí to znamenat špatnou koupi — jen že v horším roce doplácíte ze svého. Rozhodujte se podle tohohle čísla, ne podle realistického.</p></div>';
      }

      out.innerHTML = html;
    }

    box.addEventListener('input', prepocitat);
    box.addEventListener('change', prepocitat);
    nactiCenu();
    prepocitat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
