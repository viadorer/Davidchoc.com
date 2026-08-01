// Simulátor cesty k milionu — nástroj sekce Chci být milionářem.
// Běží celý v prohlížeči, nic se neodesílá.
//
// MODEL
// Banka půjčí na kupovanou nemovitost nejvýš 70 % její hodnoty. Zbylých 30 %
// ale nemusí být vaše hotovost — dají se dofinancovat odjinud, nejčastěji
// úvěrem zajištěným jinou nemovitostí. Proto jde posuvník vlastních zdrojů
// až na nulu a model počítá se dvěma úvěry zvlášť, každým s vlastní sazbou.
// Nulový vklad není trik: je to druhá splátka, kterou musíte unést.
//
// Čistý majetek = hodnota nemovitosti − zbytek obou úvěrů + nastřádaná
// hotovost. Měsíční doplatek ze mzdy se od majetku NEODEČÍTÁ, protože část
// z něj splácí jistinu a ta už je v zůstatku úvěru. Právě proto ale musí
// spořicí účet dostat úplně stejné peníze — vklad i každý doplatek.
(function () {
  'use strict';

  // Strop banky na kupovanou nemovitost se liší podle účelu úvěru (2026):
  //   70 % — investiční hypotéka: třetí a další nemovitost NEBO jakákoli
  //          nemovitost pořizovaná na pronájem, tedy i ta první
  //   80 % — vlastní bydlení, první nebo druhá nemovitost
  //   90 % — vlastní bydlení u žadatele do 36 let
  // Hodnotu vybírá uživatel, protože z ní plyne, kolik musí sehnat jinde.
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

  function splatka(jistina, sazba, roky) {
    if (jistina <= 0) return 0;
    var i = sazba / 12, n = roky * 12;
    if (i === 0) return jistina / n;
    return jistina * i / (1 - Math.pow(1 + i, -n));
  }

  function zustatek(jistina, sazba, roky, mesicu) {
    if (jistina <= 0) return 0;
    var i = sazba / 12;
    if (i === 0) return Math.max(0, jistina - (jistina / (roky * 12)) * mesicu);
    var pay = splatka(jistina, sazba, roky);
    var q = Math.pow(1 + i, mesicu);
    return Math.max(0, jistina * q - pay * ((q - 1) / i));
  }

  function init() {
    var box = document.getElementById('simulator');
    if (!box) return;

    var pole = ['mesto', 'cena', 'ucel', 'vlastni', 'sazba', 'sazbaDofi',
                'splatnost', 'rust', 'najemRust', 'horizont'];

    if (window.HubTools) {
      HubTools.initFields({
        storageKey: 'milionarem-simulator',
        container: '#simulator',
        onChange: prepocitat
      });
    }

    function el(n) { return box.querySelector('[data-field="' + n + '"]'); }
    function num(n) { return parseFloat(el(n).value); }

    function spocitat() {
      var vynos = num('mesto') / 100;
      var cena = num('cena');
      var vlastniPct = num('vlastni') / 100;
      var sazba = num('sazba') / 100;
      var sazbaDofi = num('sazbaDofi') / 100;
      var splatnost = num('splatnost');
      var rust = num('rust') / 100;
      var najemRust = num('najemRust') / 100;
      var horizont = num('horizont');

      var ltv = num('ucel') / 100;
      var vlastni = cena * vlastniPct;
      var potreba = cena - vlastni;
      var uverHlavni = Math.min(potreba, cena * ltv);
      var dofi = Math.max(0, potreba - uverHlavni);

      var splatkaHlavni = splatka(uverHlavni, sazba, splatnost);
      var splatkaDofi = splatka(dofi, sazbaDofi, splatnost);
      var splatkaCelkem = splatkaHlavni + splatkaDofi;

      var najemStart = cena * vynos / 12 * (1 - REZERVA);

      var majetek = [], sporeni = [];
      var hotovost = 0, sporeniStav = vlastni, doplaceno = 0;
      var rokSobestacnosti = null;

      for (var y = 0; y <= horizont; y++) {
        var najem = najemStart * Math.pow(1 + najemRust, y);
        var cf = najem - splatkaCelkem;

        if (y > 0) {
          if (cf >= 0) hotovost += cf * 12; else doplaceno += -cf * 12;
          sporeniStav = sporeniStav * (1 + SPORICI_SAZBA) + Math.max(0, -cf) * 12;
        }
        if (rokSobestacnosti === null && cf >= 0) rokSobestacnosti = y;

        var mesicu = Math.min(y * 12, splatnost * 12);
        var zbytek = zustatek(uverHlavni, sazba, splatnost, mesicu) +
                     zustatek(dofi, sazbaDofi, splatnost, mesicu);

        majetek.push(cena * Math.pow(1 + rust, y) - zbytek + hotovost);
        sporeni.push(sporeniStav);
      }

      // Rozpad první splátky. Úrok je náklad, jistina je váš majetek —
      // a tenhle rozdíl rozhoduje, jestli je záporný cashflow spoření,
      // nebo skutečná ztráta.
      var urok = (uverHlavni * sazba + dofi * sazbaDofi) / 12;
      var jistina = Math.max(0, splatkaCelkem - urok);
      var cashflowStart = najemStart - splatkaCelkem;
      var doplatekNaJistinu = Math.max(0, Math.min(-cashflowStart, jistina));
      var doplatekNaUrok = Math.max(0, -cashflowStart - doplatekNaJistinu);

      return {
        cena: cena, ltv: ltv, vlastni: vlastni, uverHlavni: uverHlavni, dofi: dofi,
        splatkaCelkem: splatkaCelkem, splatkaDofi: splatkaDofi,
        urok: urok, jistina: jistina,
        najemStart: najemStart, cashflowStart: cashflowStart,
        najemKryjeUrok: najemStart >= urok,
        doplatekNaJistinu: doplatekNaJistinu, doplatekNaUrok: doplatekNaUrok,
        majetek: majetek, sporeni: sporeni, horizont: horizont,
        doplaceno: doplaceno, rokSobestacnosti: rokSobestacnosti
      };
    }

    function graf(v) {
      var W = 820, H = 320, L = 78, R = 16, T = 16, B = 38;
      var pw = W - L - R, ph = H - T - B;
      var max = Math.max.apply(null, v.majetek.concat(v.sporeni)) * 1.08 || 1;

      function x(i) { return L + (i / v.horizont) * pw; }
      function y(val) { return T + ph - (val / max) * ph; }

      var s = '';
      for (var g = 0; g <= 4; g++) {
        var val = (max / 4) * g, yy = y(val);
        s += '<line x1="' + L + '" y1="' + yy.toFixed(1) + '" x2="' + (W - R) + '" y2="' + yy.toFixed(1) +
             '" stroke="var(--hub-line)" stroke-width="1"/>' +
             '<text x="' + (L - 10) + '" y="' + (yy + 4).toFixed(1) + '" text-anchor="end" ' +
             'font-size="12" fill="var(--hub-muted)">' + fmtKratce(val) + '</text>';
      }

      var krok = v.horizont <= 10 ? 2 : 5;
      for (var r = 0; r <= v.horizont; r += krok) {
        s += '<text x="' + x(r).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" ' +
             'font-size="12" fill="var(--hub-muted)">' + r + '</text>';
      }

      function cesta(p) {
        return p.map(function (val, i) {
          return (i ? 'L' : 'M') + ' ' + x(i).toFixed(1) + ' ' + y(val).toFixed(1);
        }).join(' ');
      }

      if (v.rokSobestacnosti !== null && v.rokSobestacnosti > 0 &&
          v.rokSobestacnosti <= v.horizont) {
        var xs = x(v.rokSobestacnosti);
        s += '<line x1="' + xs.toFixed(1) + '" y1="' + T + '" x2="' + xs.toFixed(1) + '" y2="' +
             (T + ph) + '" stroke="var(--hub-ok)" stroke-width="2" stroke-dasharray="5 4"/>' +
             '<text x="' + (xs + 7).toFixed(1) + '" y="' + (T + 13) + '" font-size="12" ' +
             'font-weight="700" fill="var(--hub-ok)">byt se živí sám</text>';
      }

      s += '<path d="' + cesta(v.sporeni) + '" fill="none" stroke="var(--hub-risk)" stroke-width="3"/>';
      s += '<path d="' + cesta(v.majetek) + '" fill="none" stroke="var(--hub-accent)" stroke-width="3.5"/>';

      return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
             'aria-label="Vývoj čistého majetku z nemovitosti proti spoření se stejnými vklady" ' +
             'style="width:100%;height:auto;display:block;overflow:visible;">' + s + '</svg>';
    }

    function statistika(label, hodnota, trida) {
      return '<div class="sim-stat' + (trida ? ' ' + trida : '') + '">' +
             '<span class="sim-stat__label">' + label + '</span>' +
             '<span class="sim-stat__value">' + hodnota + '</span></div>';
    }

    function prepocitat() {
      box.querySelector('.js-val-mesto').textContent = des(el('mesto').value) + ' %';
      box.querySelector('.js-val-cena').textContent = fmtKratce(num('cena')) + ' Kč';
      box.querySelector('.js-val-ucel').textContent = 'LTV ' + num('ucel') + ' %';
      box.querySelector('.js-val-vlastni').textContent = num('vlastni') + ' %';
      // Minimum bez dofinancování se mění s účelem úvěru.
      box.querySelector('.js-min-vlastni').textContent = (100 - num('ucel')) + ' %';
      box.querySelector('.js-val-sazba').textContent = des(el('sazba').value) + ' %';
      box.querySelector('.js-val-sazbaDofi').textContent = des(el('sazbaDofi').value) + ' %';
      box.querySelector('.js-val-splatnost').textContent = num('splatnost') + ' let';
      box.querySelector('.js-val-rust').textContent = des(el('rust').value) + ' %';
      box.querySelector('.js-val-najemRust').textContent = des(el('najemRust').value) + ' %';
      box.querySelector('.js-val-horizont').textContent = num('horizont') + ' let';

      var v = spocitat();
      var konec = v.majetek[v.horizont];
      var konecSporeni = v.sporeni[v.horizont];

      // Řádek o dofinancování má smysl jen když nějaké je.
      var dofiRadek = box.querySelector('.js-dofi-radek');
      if (dofiRadek) dofiRadek.hidden = v.dofi <= 0;

      var podtitulek;
      if (v.vlastni > 0) {
        podtitulek = 'Z vlastního vkladu ' + fmt(v.vlastni) + ' Kč — to je <strong>' +
          (konec / v.vlastni).toFixed(1).replace('.', ',') + 'násobek</strong> toho, co jste vložili.';
      } else {
        podtitulek = 'A to <strong>bez jediné vlastní koruny na startu</strong> — všechno je ' +
          'na dvou úvěrech. Zaplatíte to měsíčními splátkami, ne vkladem.';
      }
      podtitulek += ' Na spořicím účtu byste při stejných vkladech měli ' + fmt(konecSporeni) + ' Kč.';

      box.querySelector('.js-headline').innerHTML =
        '<span class="sim-headline__label">Váš čistý majetek za ' + v.horizont + ' let</span>' +
        '<span class="sim-headline__num">' + fmt(konec) + ' Kč</span>' +
        '<p class="sim-headline__sub">' + podtitulek + '</p>';

      var kdy = v.rokSobestacnosti;
      var sobestacnost = kdy === 0 ? 'hned od začátku'
        : (kdy !== null && kdy <= v.horizont ? 'v ' + kdy + '. roce' : 'ne do konce horizontu');

      box.querySelector('.js-stats').innerHTML =
        statistika('Měsíční nájem po srážce ' + (REZERVA * 100) + ' % na opravy a neobsazenost',
                   fmt(v.najemStart) + ' Kč') +
        statistika('Měsíční splátka celkem' + (v.dofi > 0 ? ' (dva úvěry)' : ''),
                   v.uverHlavni + v.dofi > 0 ? fmt(v.splatkaCelkem) + ' Kč' : 'bez úvěru') +
        statistika('Cashflow v prvním roce',
                   (v.cashflowStart >= 0 ? '+' : '') + fmt(v.cashflowStart) + ' Kč',
                   // Záporný cashflow není červená, dokud nájem pokrývá úrok —
                   // to, co doplácíte, jde do jistiny, tedy do vašeho majetku.
                   v.cashflowStart >= 0 || v.najemKryjeUrok ? 'sim-stat--ok' : 'sim-stat--warn') +
        statistika('Z vaší měsíční platby jde na jistinu',
                   v.cashflowStart >= 0 ? 'nedoplácíte nic' : fmt(v.doplatekNaJistinu) + ' Kč',
                   'sim-stat--ok') +
        statistika('Byt se začne živit sám', sobestacnost,
                   kdy !== null && kdy <= v.horizont ? 'sim-stat--ok' : '') +
        statistika('Úrok v prvním roce — jediný skutečný náklad',
                   fmt(v.urok) + ' Kč měsíčně',
                   v.najemKryjeUrok ? '' : 'sim-stat--warn') +
        statistika('Hypotéka ' + (v.dofi > 0 ? '+ dofinancování' : 'od banky'),
                   fmt(v.uverHlavni + v.dofi) + ' Kč');

      var verdikt = '';
      if (v.dofi > 0) {
        verdikt +=
          '<div class="hub-risk">' +
            '<div class="hub-risk__head">' +
              '<span class="hub-risk__label">Dva úvěry místo jednoho</span>' +
              '<span class="hub-risk__level">' + fmt(v.dofi) + ' Kč</span>' +
            '</div>' +
            '<p class="hub-risk__title">Banka na tenhle byt půjčí nejvýš ' +
              Math.round(v.ltv * 100) + ' %. Zbytek musíte sehnat jinde.</p>' +
            '<p>Model počítá, že ' + fmt(v.dofi) + ' Kč dofinancujete druhým úvěrem — typicky ' +
              'zajištěným jinou nemovitostí. Přidává to <strong>' + fmt(v.splatkaDofi) +
              ' Kč měsíčně</strong> ke splátce a ručíte i tou druhou nemovitostí.</p>' +
            '<p>Jde to. Ale není to zadarmo a není to bez rizika — když se investice nepovede, ' +
              'nepřijdete jen o ni.</p>' +
          '</div>';
      }

      if (v.cashflowStart < 0 && v.najemKryjeUrok) {
        // Nájem pokryje celý úrok, takže doplatek majitele padá celý do jistiny.
        // Není to ztráta, je to spoření se splatností — jen si ho nevybíráte.
        verdikt +=
          '<div class="hub-time">' +
            '<div class="hub-time__head">' +
              '<span class="hub-time__label">Nucené spoření</span>' +
              '<span class="hub-time__level">' +
                (kdy !== null && kdy <= v.horizont ? 'Otočí se v roce ' + kdy : 'Poroste dál') +
              '</span>' +
            '</div>' +
            '<p class="hub-time__title">Doplácíte ' + fmt(Math.abs(v.cashflowStart)) +
              ' Kč měsíčně — a celá ta částka jde do vašeho majetku</p>' +
            '<p>Úrok ' + fmt(v.urok) + ' Kč <strong>zaplatí nájemník</strong>, ne vy. ' +
              'Z jeho nájmu zbyde ještě ' + fmt(Math.max(0, v.najemStart - v.urok)) +
              ' Kč na jistinu. Vašich ' + fmt(Math.abs(v.cashflowStart)) +
              ' Kč se tedy do posledního haléře mění na splacený kus bytu.</p>' +
            '<p>Není to výdaj. Je to spoření, které si nemůžete vybrat — a proto ho na rozdíl ' +
              'od spořicího účtu opravdu dodržíte.' +
              (kdy !== null && kdy <= v.horizont
                ? ' V <strong>' + kdy + '. roce</strong> nájem splátku dožene a od té chvíle ' +
                  'spoří nájemník za vás úplně sám.'
                : ' Při zadaných číslech se to do konce horizontu neotočí — spoříte dál, ' +
                  'ale pořád do svého.') +
            '</p>' +
          '</div>';
      } else if (v.cashflowStart < 0) {
        // Nájem nepokryje ani úrok — tady část peněz opravdu shoří.
        verdikt +=
          '<div class="hub-risk">' +
            '<div class="hub-risk__head">' +
              '<span class="hub-risk__label">Kde se to láme</span>' +
              '<span class="hub-risk__level">' + fmt(v.doplatekNaUrok) + ' Kč měsíčně</span>' +
            '</div>' +
            '<p class="hub-risk__title">Tady už nájem nestačí ani na úrok</p>' +
            '<p>Úrok je ' + fmt(v.urok) + ' Kč měsíčně, nájem po srážce jen ' +
              fmt(v.najemStart) + ' Kč. Z vašich ' + fmt(Math.abs(v.cashflowStart)) +
              ' Kč jde <strong>' + fmt(v.doplatekNaUrok) + ' Kč na úroky</strong> — a ty se vám ' +
              'nevrátí v ničem. Do jistiny padne jen ' + fmt(v.doplatekNaJistinu) + ' Kč.</p>' +
            '<p>Tohle je jediná situace, kdy záporný cashflow není spoření. Buď je cena vysoká ' +
              'na daný nájem, nebo je málo vlastních zdrojů, nebo obojí.</p>' +
          '</div>';
      } else {
        verdikt +=
          '<div class="vy-verdict vy-verdict--ok">' +
            '<strong>Byt se živí sám od prvního měsíce.</strong>' +
            '<p>Nájem po srážce pokryje splátku a ještě zbyde ' + fmt(v.cashflowStart) +
            ' Kč měsíčně. Při dnešních sazbách je to vzácné — ověřte si, jestli je zadaný ' +
            'nájem pro tu lokalitu reálný.</p>' +
          '</div>';
      }

      box.querySelector('.js-verdikt').innerHTML = verdikt;
      box.querySelector('.js-graf').innerHTML = graf(v);
    }

    pole.forEach(function (n) {
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
