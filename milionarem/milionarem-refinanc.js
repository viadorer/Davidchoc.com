// Uvolněný kapitál — nástroj k Cihle 10.
// Kolik jde vytáhnout refinancováním, když byt mezitím zdražil, a na co
// to reálně stačí. Nic se neodesílá.
(function () {
  'use strict';

  // Kolik z akontace pokryje uvolněný kapitál. Vychází z Cihly 2:
  // u druhé a další nemovitosti se běžně počítá s dvaceti procenty
  // vlastních zdrojů.
  var AKONTACE_DALSI = 0.20;

  // Rezerva na daň z nabytí neexistuje, ale poplatky, provize a vybavení
  // ano. Bez nich vyjde počet dalších bytů příliš optimisticky.
  var VEDLEJSI_NAKLADY = 0.05;

  function fmt(n) {
    return window.HubTools ? HubTools.formatNumber(Math.round(n)) : String(Math.round(n));
  }
  function parse(v) {
    var n = window.HubTools ? HubTools.parseNumber(v) : parseFloat(v);
    return isNaN(n) ? null : n;
  }
  function des(n) {
    return n.toFixed(1).replace('.', ',');
  }

  function init() {
    var box = document.getElementById('uvolneny-kapital');
    if (!box) return;

    var out = box.querySelector('.js-refinanc-vysledek');

    if (window.HubTools) {
      HubTools.initFields({
        storageKey: 'milionarem-refinanc',
        container: '#uvolneny-kapital',
        resetEl: '.js-refinanc-reset',
        onChange: prepocitat
      });
    }

    function pole(name) {
      var el = box.querySelector('[data-field="' + name + '"]');
      return el ? el.value : '';
    }

    function prepocitat() {
      if (!out) return;

      var hodnota = parse(pole('hodnota'));
      var zbyva = parse(pole('zbyva'));
      var ltv = parse(pole('ltv')) || 80;

      if (hodnota === null || zbyva === null || hodnota <= 0 || zbyva < 0) {
        out.innerHTML = '<p class="vy-field__hint">Zadejte dnešní odhadovanou hodnotu bytu a kolik na něm ještě zbývá splatit. Hodnotu berte střízlivě — banka si ji nechá ocenit sama a bývá opatrnější než inzeráty.</p>';
        return;
      }

      var maxUver = hodnota * (ltv / 100);
      var uvolnitelne = maxUver - zbyva;
      var stavajiciLtv = zbyva / hodnota * 100;
      var vlastniKapital = hodnota - zbyva;

      var html =
        '<div class="sim-stats">' +
          '<div class="sim-stat">' +
            '<span class="sim-stat__label">Váš kapitál v bytě</span>' +
            '<span class="sim-stat__value">' + fmt(vlastniKapital) + ' Kč</span>' +
            '<span class="sim-stat__note">hodnota minus zbývající úvěr · dnešní LTV ' + des(stavajiciLtv) + ' %</span>' +
          '</div>' +
          '<div class="sim-stat' + (uvolnitelne > 0 ? ' sim-stat--ok' : ' sim-stat--warn') + '">' +
            '<span class="sim-stat__label">Uvolnitelné při LTV ' + ltv + ' %</span>' +
            '<span class="sim-stat__value">' + fmt(Math.max(0, uvolnitelne)) + ' Kč</span>' +
            '<span class="sim-stat__note">' + (uvolnitelne > 0
              ? 'úvěr by vzrostl na ' + fmt(maxUver) + ' Kč'
              : 'na dnešní hodnotu už je úvěr na stropě') + '</span>' +
          '</div>' +
        '</div>';

      if (uvolnitelne <= 0) {
        html +=
          '<div class="vy-verdict vy-verdict--warn">' +
            '<strong>Zatím není co uvolnit.</strong>' +
            '<p>Při LTV ' + ltv + ' % by úvěr směl být nejvýš ' + fmt(maxUver) + ' Kč a vy dlužíte ' +
              fmt(zbyva) + ' Kč. Druhá cihla tedy zatím musí přijít z úspor, ne z první nemovitosti.</p>' +
            '<p>Není to špatná zpráva. Každou splátkou ukrajujete z jistiny a hodnota bytu obvykle roste — ' +
            '<strong>tohle číslo se rok od roku zlepšuje samo.</strong> Přepočítejte si to za rok.</p>' +
          '</div>';
      } else {
        // Na kolik to stačí jako akontace, včetně vedlejších nákladů.
        var naByt = uvolnitelne / (AKONTACE_DALSI + VEDLEJSI_NAKLADY);

        html +=
          '<div class="hub-time">' +
            '<div class="hub-time__head">' +
              '<span class="hub-time__label">Na co to stačí</span>' +
              '<span class="hub-time__level">Druhá cihla</span>' +
            '</div>' +
            '<p class="hub-time__title">Jako vlastní zdroje na byt zhruba do ' + fmt(naByt) + ' Kč</p>' +
            '<p>Počítáno s dvaceti procenty vlastních zdrojů u další nemovitosti a s pěti procenty ' +
              'na poplatky, provizi a základní vybavení. U prvního bytu bývá požadavek přísnější, ' +
              'u druhého už banka vidí, že umíte splácet.</p>' +
          '</div>';

        html +=
          '<div class="vy-verdict vy-verdict--ok">' +
            '<strong>Uvolnit jde ' + fmt(uvolnitelne) + ' Kč. Teď ta nepříjemná část.</strong>' +
            '<p><strong>Nejsou to vaše peníze, je to větší dluh.</strong> Splátka prvního bytu se ' +
            'zvedne a musí ji dál platit nájemník z něj — ne nájemník z bytu, který teprve koupíte. ' +
            'Než to uděláte, projděte si první byt znovu Mapou cihel: unese vyšší splátku i v roce, ' +
            'kdy bude dva měsíce prázdný?</p>' +
            '<p>Když ano, máte druhou cihlu. Když ne, máte odpověď, proč ještě ne.</p>' +
          '</div>';
      }

      html +=
        '<div class="hub-risk">' +
          '<div class="hub-risk__head">' +
            '<span class="hub-risk__label">Kde se to láme</span>' +
            '<span class="hub-risk__level">Odhad hodnoty</span>' +
          '</div>' +
          '<p class="hub-risk__title">Hodnota, kterou si dosadíte, není hodnota, kterou uzná banka</p>' +
          '<p>Banka si nechá byt ocenit znovu a její odhadce bývá opatrnější než inzeráty v okolí. ' +
            'Počítejte proto s tím, že skutečné číslo vyjde níž — a limity LTV jsou doporučení ČNB, ' +
            'ne nárok: konkrétní banka může být přísnější.</p>' +
          '<p>A refinancování se nedělá samo. <strong>Když fixace doběhne bez vaší aktivity, banka ' +
            'obvykle nabídne sazbu, která je nejpohodlnější pro ni.</strong> Termín konce fixace patří ' +
            'do kalendáře aspoň tři měsíce dopředu.</p>' +
        '</div>';

      out.innerHTML = html;
    }

    /* Test „Poznáte, že cihla drží?" — poslední v celém kurzu. */
    var verdikt = document.querySelector('.js-test-verdikt');
    if (window.HubTools && verdikt) {
      HubTools.initChecklist({
        storageKey: 'milionarem-rust-test',
        container: '#test-rust',
        countEl: '#test-rust-count',
        totalEl: '#test-rust-total',
        fillEl: '#test-rust-fill',
        resetEl: '#test-rust-reset',
        doneClass: 'is-done',
        doneTarget: '.vy-check',
        gaEvent: 'milionarem_rust_test',
        onChange: function (done, total) {
          if (done === total) {
            verdikt.innerHTML =
              '<div class="vy-verdict vy-verdict--ok">' +
                '<strong>Cihla drží. A s ní celá desítka.</strong>' +
                '<p>Umíte odpovědět na všech pět otázek, které rozhodují o tom, jestli zůstane ' +
                'u jednoho bytu. Druhá cihla teď není otázka odvahy, ale načasování.</p>' +
              '</div>';
            return;
          }

          var chybi = Array.prototype.slice.call(
            document.querySelectorAll('#test-rust input[type="checkbox"][data-nazev]')
          ).filter(function (b) { return !b.checked; });

          var polozky = chybi.map(function (b) {
            return '<li>' + b.getAttribute('data-nazev') + '</li>';
          }).join('');

          verdikt.innerHTML =
            '<div class="vy-verdict vy-verdict--warn">' +
              '<strong>Tohle jsou otázky, které za vás jinak vyřeší někdo jiný.</strong>' +
              '<ul>' + polozky + '</ul>' +
              '<p>Banka prodlouží sazbu sama. Finanční úřad si daň spočítá sám. Rozdíl je v tom, ' +
              'že ani jeden z nich nemá důvod hledat variantu, která je nejlepší pro vás.</p>' +
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
