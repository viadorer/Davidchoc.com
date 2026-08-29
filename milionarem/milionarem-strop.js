// Finanční strop — nástroj k Cihle 2, přímo v kapitole.
//
// Doporučení ČNB platná od 1. 4. 2026. Nejsou to zákony, jsou to
// doporučení poskytovatelům — banky se jimi řídí, ale konkrétní případ
// posuzují samy.
(function () {
  'use strict';

  var DTI = 7;   // sedminásobek čistého ročního příjmu, přes všechny úvěry

  function fmt(n) {
    return window.HubTools ? HubTools.formatNumber(n) : String(Math.round(n));
  }
  function parse(v) {
    var n = window.HubTools ? HubTools.parseNumber(v) : parseFloat(v);
    return isNaN(n) ? null : n;
  }

  function init() {
    var box = document.getElementById('financni-strop');
    if (!box) return;

    var out = box.querySelector('.js-strop-vysledek');

    if (window.HubTools) {
      HubTools.initFields({
        storageKey: 'milionarem-strop',
        container: '#financni-strop',
        onChange: prepocitat
      });
    }

    /* Cenu bytu si vezmeme z toho, s čím si čtenář hrál dřív. */
    function nactiCenu() {
      var el = box.querySelector('[data-field="cena"]');
      if (!el || el.value) return;
      try {
        var zdroj = JSON.parse(localStorage.getItem('milionarem-mapa') || 'null') ||
                    JSON.parse(localStorage.getItem('milionarem-simulator') || 'null');
        if (zdroj && zdroj.cena) {
          el.value = fmt(parse(zdroj.cena));
          var zprava = box.querySelector('.js-cena-prevzata');
          if (zprava) zprava.hidden = false;
        }
      } catch (e) { /* vyplní se ručně */ }
    }

    function hodnota(name) {
      var el = box.querySelector('[data-field="' + name + '"]');
      return el ? parse(el.value) : null;
    }

    function prepocitat() {
      if (!out) return;

      var prijem = hodnota('prijem');
      if (prijem === null || prijem < 5000) {
        out.innerHTML = '<p class="vy-field__hint">Zadejte čistý měsíční příjem — tedy to, co vám chodí na účet — a spočítám váš strop.</p>';
        return;
      }

      var ltv = (hodnota('ucel') || 70) / 100;
      var dluhy = hodnota('dluhy') || 0;
      var cena = hodnota('cena');

      var rocni = prijem * 12;
      var strop = rocni * DTI;
      var volne = Math.max(0, strop - dluhy);

      var maxCena = volne / ltv;
      var maxVlastni = maxCena - volne;

      var html =
        '<div class="sim-headline">' +
          '<span class="sim-headline__label">Nejdražší byt, na který dosáhnete</span>' +
          '<span class="sim-headline__num">' + fmt(maxCena) + ' Kč</span>' +
          '<p class="sim-headline__sub">Při LTV ' + Math.round(ltv * 100) + ' % k němu potřebujete sehnat ' +
            fmt(maxVlastni) + ' Kč mimo hypotéku — a k tomu ještě poplatky, rezervu a polštář z Cihly 1.</p>' +
        '</div>' +
        '<div class="sim-stats">' +
          '<div class="sim-stat"><span class="sim-stat__label">Čistý roční příjem</span><span class="sim-stat__value">' + fmt(rocni) + ' Kč</span></div>' +
          '<div class="sim-stat"><span class="sim-stat__label">Strop podle DTI (sedminásobek)</span><span class="sim-stat__value">' + fmt(strop) + ' Kč</span></div>' +
          '<div class="sim-stat' + (dluhy > 0 ? ' sim-stat--warn' : '') + '"><span class="sim-stat__label">Stávající úvěry a leasingy</span><span class="sim-stat__value">' + (dluhy > 0 ? '−' + fmt(dluhy) : '0') + ' Kč</span></div>' +
          '<div class="sim-stat sim-stat--ok"><span class="sim-stat__label">Kolik si dnes reálně půjčíte</span><span class="sim-stat__value">' + fmt(volne) + ' Kč</span></div>' +
        '</div>';

      if (cena !== null && cena > 100000) {
        var potreba = cena * ltv;
        var vlastni = cena - potreba;
        var sedi = potreba <= volne;

        html += sedi
          ? '<div class="vy-verdict vy-verdict--ok">' +
              '<strong>Na byt za ' + fmt(cena) + ' Kč podle DTI dosáhnete.</strong>' +
              '<p>Banka na něj půjčí ' + fmt(potreba) + ' Kč. Zbývá ověřit, že máte odkud vzít ' +
                fmt(vlastni) + ' Kč. Pak už jde jen o předschválení.</p>' +
            '</div>'
          : '<div class="vy-verdict vy-verdict--warn">' +
              '<strong>Na byt za ' + fmt(cena) + ' Kč vám podle DTI chybí ' + fmt(potreba - volne) + ' Kč úvěru.</strong>' +
              '<p>Nemá cenu chodit na prohlídky bytů, které banka nezafinancuje. Hledejte do ' +
                fmt(maxCena) + ' Kč, dejte víc vlastních zdrojů, nebo nejdřív doplaťte stávající závazky.</p>' +
            '</div>';
      }

      html +=
        '<div class="hub-risk">' +
          '<div class="hub-risk__head">' +
            '<span class="hub-risk__label">Pozor na tohle</span>' +
            '<span class="hub-risk__level">Druhý byt</span>' +
          '</div>' +
          '<p class="hub-risk__title">Kdo první hypotéku vezme na hranici stropu, nemá kam růst</p>' +
          '<p>Sedminásobek se počítá přes <strong>všechny vaše úvěry dohromady</strong>, ne pro každý byt zvlášť. ' +
            'Kdo plánuje portfolio a ne jednu koupi, nechá si u prvního bytu rezervu — jinak mu druhý zablokuje banka, ' +
            'i kdyby na něj měl vlastní zdroje.</p>' +
        '</div>';

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
