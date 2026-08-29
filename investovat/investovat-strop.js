// Finanční strop — nástroj k Cihle 2.
// Spočítá limit podle DTI a porovná ho s rozpočtem z Mapy cihel.
// Všechno běží v prohlížeči, nic se neodesílá.
(function () {
  'use strict';

  // Doporučení ČNB pro investiční hypotéky s platností od 1. 4. 2026.
  // Není to zákon — je to doporučení poskytovatelům, které banky v praxi
  // dodržují. U hypotéky na vlastní bydlení platí mírnější limity.
  var DTI_LIMIT = 7;
  var LTV_LIMIT = 0.70;

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
        storageKey: 'investovat-strop',
        container: '#financni-strop',
        onChange: prepocitat
      });
    }

    /* Cenu bytu si vezmeme z Mapy cihel, pokud ji čtenář už vyplnil. */
    function nactiCenu() {
      var el = box.querySelector('[data-field="cena"]');
      if (!el || el.value) return;
      try {
        var mapa = JSON.parse(localStorage.getItem('investovat-mapa') || 'null');
        if (mapa && mapa.cena) {
          el.value = mapa.cena;
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
        out.innerHTML = '<p class="vy-field__hint">Zadejte čistý měsíční příjem — tedy to, co vám chodí na účet — a spočítám váš strop podle DTI.</p>';
        return;
      }

      var dluhy = hodnota('dluhy') || 0;
      var cena = hodnota('cena');

      var rocni = prijem * 12;
      var strop = rocni * DTI_LIMIT;
      var volne = Math.max(0, strop - dluhy);

      // Kolik nejdražší byt při LTV 70 % a kolik k němu potřebujete svého.
      var maxCena = volne / LTV_LIMIT;
      var maxVlastni = maxCena - volne;

      var html =
        '<div class="hub-calc">' +
          '<div class="hub-calc__block">' +
            '<div class="hub-calc__row"><span>Čistý roční příjem</span><strong>' + fmt(rocni) + ' Kč</strong></div>' +
            '<div class="hub-calc__row"><span>Strop podle DTI (sedminásobek)</span><strong>' + fmt(strop) + ' Kč</strong></div>' +
            (dluhy > 0
              ? '<div class="hub-calc__row"><span>Minus stávající úvěry a leasingy</span><strong>−' + fmt(dluhy) + ' Kč</strong></div>'
              : '') +
            '<div class="hub-calc__row hub-calc__row--sum"><span>Kolik si dnes reálně můžete půjčit</span><strong>' + fmt(volne) + ' Kč</strong></div>' +
          '</div>' +

          '<div class="hub-calc__total">' +
            '<div class="hub-calc__total-side">' +
              '<span class="hub-calc__total-label">Nejdražší byt, na který dosáhnete</span>' +
              '<span class="hub-calc__total-num">' + fmt(maxCena) + ' Kč</span>' +
            '</div>' +
            '<p class="hub-calc__promise">při LTV 70 % k němu potřebujete ' + fmt(maxVlastni) +
              ' Kč vlastních zdrojů — a k tomu ještě poplatky, rezervu a polštář z Cihly 1</p>' +
          '</div>';

      if (cena !== null && cena > 100000) {
        var potreba = cena * LTV_LIMIT;
        var vlastni = cena - potreba;
        var sedi = potreba <= volne;

        html +=
          '<div class="hub-calc__block">' +
            '<div class="hub-calc__row"><span>Byt z vaší Mapy cihel</span><strong>' + fmt(cena) + ' Kč</strong></div>' +
            '<div class="hub-calc__row"><span>Potřebný úvěr (70 % ceny)</span><strong>' + fmt(potreba) + ' Kč</strong></div>' +
            '<div class="hub-calc__row"><span>Vlastní zdroje (30 %)</span><strong>' + fmt(vlastni) + ' Kč</strong></div>' +
          '</div>';

        if (sedi) {
          html +=
            '<div class="vy-verdict vy-verdict--ok">' +
              '<strong>Sedí to. Na tenhle byt podle DTI dosáhnete.</strong>' +
              '<p>Zbývá ověřit, že máte fyzicky k dispozici vlastních ' + fmt(vlastni) +
                ' Kč plus rezervy z Cihly 1. Pak už jde jen o předschválení.</p>' +
            '</div>';
        } else {
          html +=
            '<div class="vy-verdict vy-verdict--warn">' +
              '<strong>Na tenhle byt vám podle DTI chybí ' + fmt(potreba - volne) + ' Kč úvěru.</strong>' +
              '<p>Nemá cenu chodit na prohlídky bytů, které banka nezafinancuje. Buď hledejte do ' +
                fmt(maxCena) + ' Kč, nebo dejte víc vlastních zdrojů a snižte potřebný úvěr, ' +
                'nebo nejdřív doplaťte stávající závazky.</p>' +
            '</div>';
        }
      }

      html +=
        '<div class="hub-risk">' +
          '<div class="hub-risk__head">' +
            '<span class="hub-risk__label">Pozor na tohle</span>' +
            '<span class="hub-risk__level">Druhý byt</span>' +
          '</div>' +
          '<p class="hub-risk__title">Kdo první hypotéku vezme až na hranici stropu, nemá kam růst</p>' +
          '<p>Sedminásobek se počítá přes všechny vaše úvěry dohromady, ne pro každý byt zvlášť. ' +
            'Jestli plánujete portfolio a ne jednu koupi, nechte si u první hypotéky rezervu — ' +
            'jinak vám druhý byt zablokuje banka, i kdybyste na něj měli vlastní zdroje.</p>' +
        '</div>' +
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
