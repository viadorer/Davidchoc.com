// Návratnost vybavení — nástroj k Cihle 7.
// Kolik měsíců trvá, než se investice do úprav vrátí ve zvýšeném nájmu,
// a jestli to dává smysl proti životnosti toho, co kupujete.
(function () {
  'use strict';

  // Hranice v měsících. Nejsou z tabulek — jsou z toho, jak dlouho
  // vybavení vydrží. Kuchyň v pronájmu doslouží zhruba za dvanáct let,
  // spotřebiče a nábytek dřív. Když se investice vrací osm let, vyděláte
  // na ní pár let a pak ji platíte znovu.
  var VYBORNE = 36;
  var BEZNE = 60;
  var HRANICNI = 96;

  function fmt(n) {
    return window.HubTools ? HubTools.formatNumber(Math.round(n)) : String(Math.round(n));
  }
  function parse(v) {
    var n = window.HubTools ? HubTools.parseNumber(v) : parseFloat(v);
    return isNaN(n) ? null : n;
  }
  function des(n, mist) {
    return n.toFixed(mist === undefined ? 1 : mist).replace('.', ',');
  }
  function sklonuj(n, jeden, dva, pet) {
    var a = Math.abs(n);
    if (a === 1) return jeden;
    if (a >= 2 && a <= 4) return dva;
    return pet;
  }

  /** Měsíce na „X let a Y měsíců", protože 87 měsíců si nikdo nepředstaví. */
  function naRoky(mesicu) {
    var roky = Math.floor(mesicu / 12);
    var zbytek = Math.round(mesicu % 12);
    if (roky === 0) return zbytek + ' ' + sklonuj(zbytek, 'měsíc', 'měsíce', 'měsíců');
    if (zbytek === 0) return roky + ' ' + sklonuj(roky, 'rok', 'roky', 'let');
    return roky + ' ' + sklonuj(roky, 'rok', 'roky', 'let') + ' a ' +
           zbytek + ' ' + sklonuj(zbytek, 'měsíc', 'měsíce', 'měsíců');
  }

  function init() {
    var box = document.getElementById('navratnost-vybaveni');
    if (!box) return;

    var out = box.querySelector('.js-vybaveni-vysledek');

    if (window.HubTools) {
      HubTools.initFields({
        storageKey: 'milionarem-vybaveni',
        container: '#navratnost-vybaveni',
        resetEl: '.js-vybaveni-reset',
        onChange: prepocitat
      });
    }

    function pole(name) {
      var el = box.querySelector('[data-field="' + name + '"]');
      return el ? el.value : '';
    }

    function prepocitat() {
      if (!out) return;

      var investice = parse(pole('investice'));
      var prirustek = parse(pole('prirustek'));
      var najemBez = parse(pole('najem'));

      if (investice === null || prirustek === null || investice <= 0 || prirustek <= 0) {
        out.innerHTML = '<p class="vy-field__hint">Zadejte, kolik chcete do úprav vložit a o kolik korun měsíčně to podle vás zvedne nájem. Zbytek dopočítám.</p>';
        return;
      }

      var mesicu = investice / prirustek;
      var rocniVynos = (prirustek * 12) / investice * 100;

      var trida, nadpis, telo;
      if (mesicu <= VYBORNE) {
        trida = 'vy-verdict--ok';
        nadpis = 'Vrátí se za ' + naRoky(mesicu) + '. To je dobrý obchod.';
        telo = '<p>Investice se zaplatí dřív, než se stihne opotřebovat. Do téhle kategorie spadají věci, ' +
               'které nájemníka opravdu rozhodují — funkční kuchyň, čistá koupelna, pračka.</p>';
      } else if (mesicu <= BEZNE) {
        trida = 'vy-verdict--ok';
        nadpis = 'Vrátí se za ' + naRoky(mesicu) + '. To je běžná a zdravá hranice.';
        telo = '<p>Tři až pět let je u vybavení normální návratnost. Počítejte s tím, že po ní vám vybavení ' +
               'ještě několik let vydělává — a teprve pak přijde další výměna.</p>';
      } else if (mesicu <= HRANICNI) {
        trida = 'vy-verdict--warn';
        nadpis = 'Vrátí se za ' + naRoky(mesicu) + '. To už je hraniční.';
        telo = '<p>Pět až osm let je dlouho na věc, která se mezitím opotřebovává. Zeptejte se sami sebe, ' +
               'jestli tuhle položku nájemník opravdu ocení tak, jak čekáte — nebo jestli si jí vůbec všimne.</p>' +
               '<p>Než rozpočet zvýšíte, zkuste jednu věc: podívejte se, za kolik se v okolí pronajímají byty ' +
               '<strong>bez</strong> toho vybavení. Rozdíl mezi nimi a vaším odhadem je to, co si opravdu ' +
               'můžete připsat.</p>';
      } else {
        trida = 'vy-verdict--danger';
        nadpis = 'Vrátí se za ' + naRoky(mesicu) + '. To je přeinvestování.';
        telo = '<p>Kuchyň v pronájmu doslouží zhruba za dvanáct let, spotřebiče a nábytek dřív. ' +
               '<strong>Když se investice vrací osm a víc let, vyděláte na ní pár let a pak ji platíte znovu.</strong></p>' +
               '<p>Tohle je nejčastější chyba majitelů, kteří byt vybavují podle sebe. Není to o vkusu — ' +
               'je to o tom, že vyšší standard se do nájmu promítne jen tehdy, když ho cílová skupina umí ' +
               'a chce zaplatit.</p>';
      }

      var html =
        '<div class="sim-stats">' +
          '<div class="sim-stat">' +
            '<span class="sim-stat__label">Návratnost</span>' +
            '<span class="sim-stat__value">' + Math.round(mesicu) + ' ' + sklonuj(Math.round(mesicu), 'měsíc', 'měsíce', 'měsíců') + '</span>' +
            '<span class="sim-stat__note">' + naRoky(mesicu) + '</span>' +
          '</div>' +
          '<div class="sim-stat">' +
            '<span class="sim-stat__label">Výnos investice</span>' +
            '<span class="sim-stat__value">' + des(rocniVynos) + ' % ročně</span>' +
            '<span class="sim-stat__note">' + fmt(prirustek * 12) + ' Kč ročně z ' + fmt(investice) + ' Kč</span>' +
          '</div>' +
        '</div>';

      html += '<div class="vy-verdict ' + trida + '"><strong>' + nadpis + '</strong>' + telo + '</div>';

      /* Srovnání s výnosem samotného bytu. Investice do vybavení soutěží
         o tytéž peníze jako akontace na další byt — tohle je jediné číslo,
         které je dá vedle sebe. */
      if (najemBez !== null && najemBez > 0) {
        var procentniNarust = prirustek / najemBez * 100;
        html +=
          '<div class="hub-time">' +
            '<div class="hub-time__head">' +
              '<span class="hub-time__label">Co to dělá s nájmem</span>' +
              '<span class="hub-time__level">+' + des(procentniNarust) + ' %</span>' +
            '</div>' +
            '<p class="hub-time__title">Z ' + fmt(najemBez) + ' Kč na ' + fmt(najemBez + prirustek) + ' Kč měsíčně</p>' +
            '<p>Než tomu uvěříte, ověřte si to na inzerátech: najděte v okolí tři byty se srovnatelným ' +
              'vybavením a tři bez něj. Když je mezi nimi menší rozdíl než ' + fmt(prirustek) + ' Kč, ' +
              'počítáte s přírůstkem, který trh nezaplatí.</p>' +
          '</div>';
      }

      html +=
        '<div class="hub-risk">' +
          '<div class="hub-risk__head">' +
            '<span class="hub-risk__label">Kde se to láme</span>' +
            '<span class="hub-risk__level">Prázdný měsíc</span>' +
          '</div>' +
          '<p class="hub-risk__title">Do téhle kalkulačky se nevejde to nejdražší: čas</p>' +
          '<p>Každý měsíc, o který se úpravy protáhnou, je měsíc bez nájmu — a ten stojí celý nájem, ' +
            'ne jen ten přírůstek' + (najemBez !== null && najemBez > 0 ? ' (' + fmt(najemBez + prirustek) + ' Kč)' : '') + '. ' +
            'Rekonstrukce, která se protáhne o dva měsíce, si vezme víc, než kolik jí přinese lepší vybavení za rok.</p>' +
          '<p>Proto je harmonogram s prověřeným dodavatelem stejně důležitý jako rozpočet. ' +
            '<strong>Rychle hotový průměrný byt vydělá víc než dokonalý byt o dva měsíce později.</strong></p>' +
        '</div>';

      out.innerHTML = html;
    }

    /* Test „Poznáte, že cihla drží?" */
    var verdikt = document.querySelector('.js-test-verdikt');
    if (window.HubTools && verdikt) {
      HubTools.initChecklist({
        storageKey: 'milionarem-vybaveni-test',
        container: '#test-vybaveni',
        countEl: '#test-vybaveni-count',
        totalEl: '#test-vybaveni-total',
        fillEl: '#test-vybaveni-fill',
        resetEl: '#test-vybaveni-reset',
        doneClass: 'is-done',
        doneTarget: '.vy-check',
        gaEvent: 'milionarem_vybaveni_test',
        onChange: function (done, total) {
          if (done === total) {
            verdikt.innerHTML =
              '<div class="vy-verdict vy-verdict--ok">' +
                '<strong>Cihla drží. Vybavujete pro nájemníka, ne pro sebe.</strong>' +
                '<p>To je celý rozdíl mezi dvěma majiteli ze začátku kapitoly. Zbytek je řemeslo ' +
                'a dodržený harmonogram.</p>' +
              '</div>';
            return;
          }

          var chybi = total - done;
          var polozky = Array.prototype.slice.call(
            document.querySelectorAll('#test-vybaveni input[type="checkbox"][data-nazev]')
          ).filter(function (b) { return !b.checked; })
           .map(function (b) { return '<li>' + b.getAttribute('data-nazev') + '</li>'; })
           .join('');

          verdikt.innerHTML =
            '<div class="vy-verdict vy-verdict--warn">' +
              '<strong>' + vetaOChybejicich(chybi) + '</strong>' +
              '<ul>' + polozky + '</ul>' +
              '<p>O každou z nich bude byt stát prázdný o něco déle. Prázdný měsíc stojí víc ' +
              'než hodina plánování předem.</p>' +
            '</div>';
        }
      });
    }

    function vetaOChybejicich(n) {
      return n + ' ' + sklonuj(n, 'otázka', 'otázky', 'otázek') + ', na které zatím odpověď nemáte.';
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
