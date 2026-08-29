// Srovnání lokalit — nástroj k Cihle 3.
// Tři byty vedle sebe, hrubý roční výnos u každého a porovnání s průměrem
// města. Běží v prohlížeči, nic se neodesílá.
(function () {
  'use strict';

  // Orientační hrubé roční výnosy podle měst, stav 2026.
  // Slouží jako měřítko, ne jako cíl — konkrétní byt může být výrazně lepší
  // i horší než průměr svého města. Přesně proto se počítá u každého zvlášť.
  var MESTA = {
    'usti': { nazev: 'Ústí nad Labem', vynos: 7.1 },
    'ostrava': { nazev: 'Ostrava', vynos: 5.8 },
    'vary': { nazev: 'Karlovy Vary', vynos: 5.7 },
    'jihlava': { nazev: 'Jihlava', vynos: 5.6 },
    'zlin': { nazev: 'Zlín', vynos: 5.4 },
    'pardubice': { nazev: 'Pardubice', vynos: 4.8 },
    'plzen': { nazev: 'Plzeň', vynos: 4.7 },
    'liberec': { nazev: 'Liberec', vynos: 4.6 },
    'budejovice': { nazev: 'České Budějovice', vynos: 4.5 },
    'hradec': { nazev: 'Hradec Králové', vynos: 4.5 },
    'olomouc': { nazev: 'Olomouc', vynos: 4.3 },
    'brno': { nazev: 'Brno', vynos: 4.1 },
    'praha': { nazev: 'Praha', vynos: 3.9 }
  };

  var SLOTY = ['a', 'b', 'c'];

  function fmt(n) {
    return window.HubTools ? HubTools.formatNumber(n) : String(Math.round(n));
  }
  function parse(v) {
    var n = window.HubTools ? HubTools.parseNumber(v) : parseFloat(v);
    return isNaN(n) ? null : n;
  }
  function pct(n) {
    return n.toFixed(2).replace('.', ',');
  }

  /** Rozdíl do 0,15 p. b. je šum, ne signál — nemá smysl kvůli němu tvrdit, že je byt horší. */
  function vuciPrumeru(vynos, prumer) {
    var rozdil = vynos - prumer;
    if (Math.abs(rozdil) <= 0.15) return 'zhruba na něm';
    return rozdil > 0 ? 'nad ním' : 'pod ním';
  }

  function init() {
    var box = document.getElementById('srovnani-lokalit');
    if (!box) return;

    var out = box.querySelector('.js-lokality-vysledek');

    if (window.HubTools) {
      HubTools.initFields({
        storageKey: 'milionarem-lokality',
        container: '#srovnani-lokalit',
        resetEl: '.js-lokality-reset',
        onChange: prepocitat
      });
    }

    function hodnota(slot, name) {
      var el = box.querySelector('[data-field="' + slot + '-' + name + '"]');
      return el ? el.value : '';
    }

    function nactiByt(slot) {
      var cena = parse(hodnota(slot, 'cena'));
      var najem = parse(hodnota(slot, 'najem'));
      var mesto = hodnota(slot, 'mesto');
      var popis = hodnota(slot, 'popis');
      if (cena === null || najem === null || cena < 100000 || najem < 1000) return null;

      return {
        slot: slot,
        popis: popis || (MESTA[mesto] ? MESTA[mesto].nazev : 'Byt ' + slot.toUpperCase()),
        mesto: MESTA[mesto] || null,
        cena: cena,
        najem: najem,
        vynos: (najem * 12) / cena * 100
      };
    }

    function prepocitat() {
      if (!out) return;

      var byty = SLOTY.map(nactiByt).filter(Boolean);

      if (!byty.length) {
        out.innerHTML = '<p class="vy-field__hint">Vyplňte u aspoň jednoho bytu kupní cenu a měsíční nájem — hrubý výnos spočítám hned. Ideálně vyplňte všechny tři, ať je co porovnávat.</p>';
        return;
      }

      var nejlepsi = byty.reduce(function (a, b) { return b.vynos > a.vynos ? b : a; });

      var html = '<div class="vy-results">';

      byty.forEach(function (b) {
        var jeNejlepsi = byty.length > 1 && b === nejlepsi;
        var trida = jeNejlepsi ? 'vy-result--good' : 'vy-result--realistic';

        html +=
          '<div class="vy-result ' + trida + '">' +
            '<span class="vy-result__label">' + b.popis +
              (jeNejlepsi ? ' — nejvyšší výnos' : '') + '</span>' +
            '<span class="vy-result__col">' +
              '<span class="vy-result__value">' + pct(b.vynos) + ' % ročně</span>' +
              '<span class="vy-result__body">' +
                fmt(b.najem) + ' Kč měsíčně z ceny ' + fmt(b.cena) + ' Kč' +
                (b.mesto ? ' · průměr města ' + pct(b.mesto.vynos) + ' %, tenhle byt je ' +
                    vuciPrumeru(b.vynos, b.mesto.vynos) : '') +
              '</span>' +
            '</span>' +
          '</div>';
      });

      html += '</div>';

      /* Kolik je ten rozdíl v korunách za dvacet let — procenta lidem nic neříkají. */
      if (byty.length > 1) {
        var nejhorsi = byty.reduce(function (a, b) { return b.vynos < a.vynos ? b : a; });
        if (nejlepsi !== nejhorsi) {
          var rozdilRocne = (nejlepsi.najem - nejhorsi.najem) * 12;
          var rozdilProcent = nejlepsi.vynos - nejhorsi.vynos;
          // Rozdíl na stejně velké investici, aby se porovnávalo jablko s jablkem.
          var naStejneCene = nejhorsi.cena * (rozdilProcent / 100);

          html +=
            '<div class="hub-time">' +
              '<div class="hub-time__head">' +
                '<span class="hub-time__label">Co dělá lokalita</span>' +
                '<span class="hub-time__level">Rozdíl ' + pct(rozdilProcent) + ' p. b.</span>' +
              '</div>' +
              '<p class="hub-time__title">Na investici ' + fmt(nejhorsi.cena) + ' Kč je to ' +
                fmt(naStejneCene) + ' Kč ročně navíc</p>' +
              '<p>Tolik by vynesla stejná částka, kdyby místo výnosu ' + pct(nejhorsi.vynos) +
                ' % pracovala na ' + pct(nejlepsi.vynos) + ' %. Za dvacet let, bez započítání růstu nájmu, ' +
                'je to ' + fmt(naStejneCene * 20) + ' Kč. Stejná koruna, stejná hypotéka, stejná práce — jen jinde.</p>' +
              (rozdilRocne !== 0
                ? '<p>V absolutních číslech je rozdíl v ročním nájmu ' + fmt(Math.abs(rozdilRocne)) +
                  ' Kč, ale to samo o sobě nic neříká — dražší byt musí nést víc, aby na tom byl stejně.</p>'
                : '') +
            '</div>';
        }
      }

      html +=
        '<div class="hub-risk">' +
          '<div class="hub-risk__head">' +
            '<span class="hub-risk__label">Pozor na tohle</span>' +
            '<span class="hub-risk__level">Hrubý vs. čistý</span>' +
          '</div>' +
          '<p class="hub-risk__title">Tohle je hrubý výnos. Do kapsy vám přijde míň.</p>' +
          '<p>Hrubý výnos nepočítá s fondem oprav, pojištěním, daní z nájmu, rezervou na opravy ani s měsíci, kdy je byt prázdný. Slouží k porovnání bytů mezi sebou, ne k rozhodnutí o koupi.</p>' +
          '<p>Až budete mít favorita, protáhněte ho třemi scénáři v <a href="/milionarem/cihla-1-plan#mapa">Mapě cihel</a> — tam se počítá i se splátkou a s prázdnými měsíci.</p>' +
        '</div>';

      out.innerHTML = html;
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
