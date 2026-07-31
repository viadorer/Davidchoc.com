// Simulátor cesty k milionu — nástroj sekce Chci být milionářem.
// Běží celý v prohlížeči, nic se neodesílá.
//
// MODEL A JEHO POCTIVOST
// Čistý majetek z bytu = hodnota nemovitosti − zbytek úvěru + nastřádaná
// hotovost. Měsíční doplatek ze mzdy se od majetku NEODEČÍTÁ: část z něj
// splácí jistinu, a ta už je v zůstatku úvěru započítaná.
//
// Právě proto ale musí spořicí účet dostat úplně stejné peníze — vklad
// i každý měsíční doplatek. Kdo tohle vynechá, porovnává investora, který
// posílá peníze každý měsíc, se střadatelem, který uložil jednou a už nic.
// Rozdíl jde do statisíců a celé porovnání je pak k ničemu.
(function () {
  'use strict';

  var SPORICI_SAZBA = 0.02;   // ilustrativní úrok spořicího účtu
  var REZERVA = 0.15;         // srážka z nájmu na opravy a neobsazenost

  function fmt(n) {
    return window.HubTools ? HubTools.formatNumber(n) : String(Math.round(n));
  }
  function fmtKratce(n) {
    if (Math.abs(n) >= 1e6) {
      return (n / 1e6).toLocaleString('cs-CZ', { maximumFractionDigits: 2 }) + ' mil.';
    }
    return fmt(n);
  }
  function des(n) { return String(n).replace('.', ','); }
  function sklonuj(n, jeden, dva, pet) {
    if (n === 1) return jeden;
    if (n >= 2 && n <= 4) return dva;
    return pet;
  }

  /** Anuitní splátka. */
  function splatka(jistina, sazba, roky) {
    var i = sazba / 12, n = roky * 12;
    if (i === 0) return jistina / n;
    return jistina * i / (1 - Math.pow(1 + i, -n));
  }

  /** Zůstatek jistiny po odsplácených měsících. */
  function zustatek(jistina, sazba, roky, mesicu) {
    var i = sazba / 12;
    if (i === 0) return Math.max(0, jistina - (jistina / (roky * 12)) * mesicu);
    var pay = splatka(jistina, sazba, roky);
    var q = Math.pow(1 + i, mesicu);
    return Math.max(0, jistina * q - pay * ((q - 1) / i));
  }

  function init() {
    var box = document.getElementById('simulator');
    if (!box) return;

    var poleId = ['mesto', 'cena', 'vlastni', 'rust', 'sazba', 'najemRust', 'splatnost', 'horizont'];

    if (window.HubTools) {
      HubTools.initFields({
        storageKey: 'milionarem-simulator',
        container: '#simulator',
        onChange: prepocitat
      });
    }

    function el(name) { return box.querySelector('[data-field="' + name + '"]'); }
    function num(name) { return parseFloat(el(name).value); }

    function spocitat() {
      var vynos = num('mesto') / 100;
      var cena = num('cena');
      var vlastniPct = num('vlastni') / 100;
      var rust = num('rust') / 100;
      var sazba = num('sazba') / 100;
      var najemRust = num('najemRust') / 100;
      var splatnost = num('splatnost');
      var horizont = num('horizont');

      var vlastni = cena * vlastniPct;
      var uver = cena - vlastni;
      var mesicniSplatka = uver > 0 ? splatka(uver, sazba, splatnost) : 0;
      var najemStart = cena * vynos / 12;

      var majetek = [], sporeni = [], cashflow = [];
      var hotovost = 0;
      var sporeniStav = vlastni;
      var doplacenoCelkem = 0;
      var rokSobestacnosti = null;

      for (var y = 0; y <= horizont; y++) {
        // Nájem roste, splátka je fixní — proto se to jednou otočí.
        var najem = najemStart * Math.pow(1 + najemRust, y) * (1 - REZERVA);
        var cf = najem - mesicniSplatka;
        cashflow.push(cf);

        if (y > 0) {
          if (cf >= 0) {
            hotovost += cf * 12;
          } else {
            doplacenoCelkem += -cf * 12;
          }
          // Střadatel dostává přesně tolik, kolik investor doplácí ze mzdy.
          sporeniStav = sporeniStav * (1 + SPORICI_SAZBA) + Math.max(0, -cf) * 12;
        }

        if (rokSobestacnosti === null && cf >= 0) rokSobestacnosti = y;

        var hodnota = cena * Math.pow(1 + rust, y);
        var mesicu = Math.min(y * 12, splatnost * 12);
        var zbytek = uver > 0 ? zustatek(uver, sazba, splatnost, mesicu) : 0;

        majetek.push(hodnota - zbytek + hotovost);
        sporeni.push(sporeniStav);
      }

      return {
        vlastni: vlastni, uver: uver, mesicniSplatka: mesicniSplatka,
        najemStart: najemStart, najemCisty: najemStart * (1 - REZERVA),
        cashflowStart: cashflow[0], cashflow: cashflow,
        majetek: majetek, sporeni: sporeni, horizont: horizont,
        doplacenoCelkem: doplacenoCelkem, rokSobestacnosti: rokSobestacnosti,
        nasobek: vlastni > 0 ? majetek[horizont] / vlastni : 0
      };
    }

    /* ── Graf ───────────────────────────────────────────────────────── */
    function graf(v) {
      var W = 820, H = 340, L = 74, R = 16, T = 18, B = 40;
      var pw = W - L - R, ph = H - T - B;
      var max = Math.max.apply(null, v.majetek.concat(v.sporeni)) * 1.08;

      function x(i) { return L + (i / v.horizont) * pw; }
      function y(val) { return T + ph - (val / max) * ph; }

      var s = '';
      for (var g = 0; g <= 4; g++) {
        var val = (max / 4) * g, yy = y(val);
        s += '<line x1="' + L + '" y1="' + yy.toFixed(1) + '" x2="' + (W - R) + '" y2="' + yy.toFixed(1) +
             '" stroke="var(--hub-line)" stroke-width="1"/>';
        s += '<text x="' + (L - 10) + '" y="' + (yy + 4).toFixed(1) + '" text-anchor="end" ' +
             'font-size="12" fill="var(--hub-muted)">' + fmtKratce(val) + '</text>';
      }

      var krok = v.horizont <= 10 ? 2 : 5;
      for (var r = 0; r <= v.horizont; r += krok) {
        s += '<text x="' + x(r).toFixed(1) + '" y="' + (H - 14) + '" text-anchor="middle" ' +
             'font-size="12" fill="var(--hub-muted)">' + r + '</text>';
      }
      s += '<text x="' + (W - R) + '" y="' + (H - 14) + '" text-anchor="end" ' +
           'font-size="12" fill="var(--hub-muted)">let</text>';

      function cesta(pole) {
        return pole.map(function (val, i) {
          return (i ? 'L' : 'M') + ' ' + x(i).toFixed(1) + ' ' + y(val).toFixed(1);
        }).join(' ');
      }

      // Rok, kdy se byt začne živit sám — svislice, ne poznámka pod čarou.
      if (v.rokSobestacnosti !== null && v.rokSobestacnosti > 0 && v.rokSobestacnosti <= v.horizont) {
        var xs = x(v.rokSobestacnosti);
        s += '<line x1="' + xs.toFixed(1) + '" y1="' + T + '" x2="' + xs.toFixed(1) + '" y2="' + (T + ph) +
             '" stroke="var(--hub-ok)" stroke-width="2" stroke-dasharray="5 4"/>';
        s += '<text x="' + (xs + 7).toFixed(1) + '" y="' + (T + 14) + '" font-size="12" font-weight="700" ' +
             'fill="var(--hub-ok)">byt se živí sám</text>';
      }

      s += '<path d="' + cesta(v.sporeni) + '" fill="none" stroke="var(--hub-risk)" stroke-width="3"/>';
      s += '<path d="' + cesta(v.majetek) + '" fill="none" stroke="var(--hub-accent)" stroke-width="3.5"/>';

      return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
             'aria-label="Vývoj čistého majetku z nemovitosti proti spoření se stejnými vklady" ' +
             'style="width:100%;height:auto;display:block;overflow:visible;">' + s + '</svg>';
    }

    /* ── Vykreslení ─────────────────────────────────────────────────── */
    function prepocitat() {
      box.querySelector('.js-val-mesto').textContent =
        des(el('mesto').value) + ' %';
      box.querySelector('.js-val-cena').textContent = fmtKratce(num('cena')) + ' Kč';
      box.querySelector('.js-val-vlastni').textContent = num('vlastni') + ' %';
      box.querySelector('.js-val-rust').textContent = des(el('rust').value) + ' %';
      box.querySelector('.js-val-sazba').textContent = des(el('sazba').value) + ' %';
      box.querySelector('.js-val-najemRust').textContent = des(el('najemRust').value) + ' %';
      box.querySelector('.js-val-splatnost').textContent = num('splatnost') + ' let';
      box.querySelector('.js-val-horizont').textContent = num('horizont') + ' let';

      var v = spocitat();
      var konec = v.majetek[v.horizont];
      var konecSporeni = v.sporeni[v.horizont];

      box.querySelector('.js-hlavni').innerHTML =
        '<span class="hub-calc__total-label">Váš čistý majetek za ' + v.horizont + ' let</span>' +
        '<span class="hub-calc__total-num">' + fmt(konec) + ' Kč</span>';

      box.querySelector('.js-podtitulek').innerHTML =
        'Z vlastního vkladu ' + fmt(v.vlastni) + ' Kč. To je <strong>' +
        v.nasobek.toFixed(1).replace('.', ',') + 'násobek</strong> toho, co jste vložili — ' +
        'proti ' + fmt(konecSporeni) + ' Kč, které byste měli na spořicím účtu při stejných vkladech.';

      box.querySelector('.js-kpi').innerHTML =
        '<div class="hub-calc__row"><span>Měsíční nájem po srážce ' + (REZERVA * 100) +
          ' % na opravy a neobsazenost</span><strong>' + fmt(v.najemCisty) + ' Kč</strong></div>' +
        '<div class="hub-calc__row"><span>Měsíční splátka hypotéky</span><strong>' +
          (v.uver > 0 ? fmt(v.mesicniSplatka) + ' Kč' : 'bez úvěru') + '</strong></div>' +
        '<div class="hub-calc__row hub-calc__row--sum"><span>Cashflow v prvním roce</span><strong>' +
          (v.cashflowStart >= 0 ? '+' : '') + fmt(v.cashflowStart) + ' Kč měsíčně</strong></div>';

      var verdikt = '';
      if (v.cashflowStart < 0) {
        var kdy = v.rokSobestacnosti;
        verdikt =
          '<div class="hub-risk">' +
            '<div class="hub-risk__head">' +
              '<span class="hub-risk__label">Než se to otočí</span>' +
              '<span class="hub-risk__level">' +
                (kdy !== null && kdy <= v.horizont ? 'Rok ' + kdy : 'Za horizontem') +
              '</span>' +
            '</div>' +
            '<p class="hub-risk__title">Tenhle byt vás první roky stojí ' +
              fmt(Math.abs(v.cashflowStart)) + ' Kč měsíčně</p>' +
            (kdy !== null && kdy <= v.horizont
              ? '<p>Nájem roste, splátka ne — takže se to v <strong>' + kdy + '. roce</strong> otočí ' +
                'a od té chvíle se byt živí sám. Do té doby ho dotujete ze mzdy.</p>'
              : '<p>Při zadaných číslech se to do konce horizontu neotočí. Byt vyděláte na růstu ' +
                'hodnoty, ne na nájmu — což je legitimní strategie, ale musíte na ni mít.</p>') +
            '<p>' +
              (kdy !== null && kdy <= v.horizont
                ? 'Než se to otočí, doplatíte celkem <strong>' + fmt(v.doplacenoCelkem) + ' Kč</strong>.'
                : 'Za ' + v.horizont + ' ' + sklonuj(v.horizont, 'rok', 'roky', 'let') +
                  ' doplatíte celkem <strong>' + fmt(v.doplacenoCelkem) + ' Kč</strong>.') +
              ' Tyhle peníze nejsou pryč — splácí se jimi jistina, takže se vám vrací v hodnotě ' +
              'bytu. Ale musíte je každý měsíc mít.</p>' +
          '</div>';
      } else {
        verdikt =
          '<div class="vy-verdict vy-verdict--ok">' +
            '<strong>Byt se živí sám od prvního měsíce.</strong>' +
            '<p>Nájem po srážce pokryje splátku a ještě zbyde ' + fmt(v.cashflowStart) +
            ' Kč měsíčně. Při dnešních sazbách je to vzácné — zkontrolujte si, jestli je ' +
            'zadaný nájem reálný pro danou lokalitu.</p>' +
          '</div>';
      }
      box.querySelector('.js-verdikt').innerHTML = verdikt;
      box.querySelector('.js-graf').innerHTML = graf(v);
    }

    poleId.forEach(function (n) {
      var e = el(n);
      if (e) { e.addEventListener('input', prepocitat); e.addEventListener('change', prepocitat); }
    });

    prepocitat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
