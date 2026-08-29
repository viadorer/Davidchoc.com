// Časová osa čerpání — nástroj k Cihle 6.
// Spočítá, kdy nejdřív může proběhnout vklad do katastru, a porovná to
// s termínem čerpání dohodnutým v kupní smlouvě. Běží v prohlížeči.
(function () {
  'use strict';

  // § 18 odst. 1 zákona č. 256/2013 Sb.: vklad lze povolit „nejdříve však
  // po uplynutí lhůty 20 dnů ode dne odeslání informace podle § 16 odst. 1".
  // Lhůta tedy neběží od podání, ale od chvíle, kdy katastr rozešle
  // vyrozumění o plombě — to je typicky den až dva po podání.
  var VYROZUMENI_DNU = 2;   // rezerva na rozeslání vyrozumění
  var OCHRANNA_LHUTA = 20;  // zákonné minimum

  // Po ochranné lhůtě úřad teprve rozhoduje. Třicetidenní lhůta plyne ze
  // správního řádu, ne z katastrálního zákona, a při vytížení úřadu se
  // překračuje. Držíme se proto rozpětí, ne jednoho čísla.
  var ROZHODNUTI_MIN = 3;
  var ROZHODNUTI_MAX = 12;

  // Banka uvolňuje peníze až po doložení zápisu.
  var CERPANI_PO_ZAPISU = 5;

  var DNY = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];

  function sklonuj(n, jeden, dva, pet) {
    var a = Math.abs(n);
    if (a === 1) return jeden;
    if (a >= 2 && a <= 4) return dva;
    return pet;
  }

  function parseDatum(v) {
    if (!v) return null;
    var c = v.split('-');
    if (c.length !== 3) return null;
    var d = new Date(Number(c[0]), Number(c[1]) - 1, Number(c[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  function plus(datum, dnu) {
    var d = new Date(datum.getTime());
    d.setDate(d.getDate() + dnu);
    return d;
  }

  function fmt(d) {
    return d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear();
  }

  function fmtDen(d) {
    return DNY[d.getDay()] + ' ' + fmt(d);
  }

  function rozdilDnu(a, b) {
    return Math.round((b - a) / 86400000);
  }

  function init() {
    var box = document.getElementById('casova-osa');
    if (!box) return;

    var out = box.querySelector('.js-osa-vysledek');

    if (window.HubTools) {
      HubTools.initFields({
        storageKey: 'milionarem-cerpani',
        container: '#casova-osa',
        resetEl: '.js-osa-reset',
        onChange: prepocitat
      });
    }

    function pole(name) {
      var el = box.querySelector('[data-field="' + name + '"]');
      return el ? el.value : '';
    }

    function radek(popis, datum, poznamka) {
      return '<div class="hub-osa__krok">' +
        '<span class="hub-osa__datum">' + fmt(datum) + '</span>' +
        '<span class="hub-osa__popis">' + popis +
          (poznamka ? '<small>' + poznamka + '</small>' : '') +
        '</span>' +
      '</div>';
    }

    function prepocitat() {
      if (!out) return;

      var podpis = parseDatum(pole('podpis'));
      if (!podpis) {
        out.innerHTML = '<p class="vy-field__hint">Zadejte datum podpisu kupní smlouvy — od něj se odvíjí všechno ostatní.</p>';
        return;
      }

      // Bez vlastního data předpokládáme podání ve stejný den jako podpis.
      // Je to ta nejpříznivější varianta; každý den zdržení se přičte na konec.
      var podani = parseDatum(pole('podani')) || podpis;
      if (podani < podpis) podani = podpis;

      var cerpani = parseDatum(pole('cerpani'));

      var vyrozumeni = plus(podani, VYROZUMENI_DNU);
      var konecLhuty = plus(vyrozumeni, OCHRANNA_LHUTA);
      var zapisMin = plus(konecLhuty, ROZHODNUTI_MIN);
      var zapisMax = plus(konecLhuty, ROZHODNUTI_MAX);
      var klice = plus(zapisMax, CERPANI_PO_ZAPISU);

      var html = '<div class="hub-osa">';
      html += radek('Podpis kupní smlouvy', podpis);
      html += radek('Podání návrhu na vklad', podani,
        podani.getTime() === podpis.getTime()
          ? 'Počítám s podáním ve stejný den. Každý den odkladu posune celý zbytek.'
          : rozdilDnu(podpis, podani) + ' ' + sklonuj(rozdilDnu(podpis, podani), 'den', 'dny', 'dnů') + ' po podpisu');
      html += radek('Konec ochranné lhůty', konecLhuty,
        'Dvacet dnů od rozeslání vyrozumění katastrem. Dřív vklad nejde povolit, ani kdyby bylo všechno v pořádku.');
      html += radek('Zápis — reálné rozpětí', zapisMin,
        'až ' + fmt(zapisMax) + '. Po ochranné lhůtě teprve úřad rozhoduje; při vytížení to trvá déle.');
      html += radek('Čerpání do úschovy a klíče', klice,
        'Banka uvolňuje peníze po doložení zápisu. Orientačně, ne zaručeně.');
      html += '</div>';

      if (cerpani) {
        var rezerva = rozdilDnu(zapisMax, cerpani);
        var doNejdrivejsiho = rozdilDnu(zapisMin, cerpani);

        if (doNejdrivejsiho < 0) {
          html +=
            '<div class="vy-verdict vy-verdict--danger">' +
              '<strong>Ten termín katastr nestihne.</strong>' +
              '<p>Čerpání máte ve smlouvě na ' + fmtDen(cerpani) + ', ale vklad nejde povolit dřív než ' +
                fmt(zapisMin) + ' — chybí ' + Math.abs(doNejdrivejsiho) + ' ' +
                sklonuj(doNejdrivejsiho, 'den', 'dny', 'dnů') + '. Není to o rychlosti banky ani advokáta, ' +
                'ochranná lhůta se zkrátit nedá.</p>' +
              '<p>Řešte to <strong>teď</strong>, dokud je to jednání o dodatku, a ne omluva po termínu.</p>' +
            '</div>';
        } else if (rezerva < 0) {
          html +=
            '<div class="vy-verdict vy-verdict--warn">' +
              '<strong>Termín vyjde jen při hladkém průběhu.</strong>' +
              '<p>Čerpání máte na ' + fmtDen(cerpani) + '. Nejdřívější možný zápis je ' + fmt(zapisMin) +
                ', ale běžně to trvá až do ' + fmt(zapisMax) + '. Jediná chybějící příloha nebo přetížený úřad ' +
                'a termín padá.</p>' +
              '<p>Buď si vyjednejte rezervu, nebo mějte s prodávajícím předem domluvené, co se stane, když se to nestihne.</p>' +
            '</div>';
        } else {
          html +=
            '<div class="vy-verdict vy-verdict--ok">' +
              '<strong>Termín vypadá reálně — rezerva ' + rezerva + ' ' +
                sklonuj(rezerva, 'den', 'dny', 'dnů') + '.</strong>' +
              '<p>Čerpání máte na ' + fmtDen(cerpani) + ' a i horší varianta zápisu (' + fmt(zapisMax) +
                ') se do něj vejde. Hlídejte jen to, aby se návrh na vklad opravdu podal ' +
                (podani.getTime() === podpis.getTime() ? 'v den podpisu' : fmt(podani)) + '.</p>' +
            '</div>';
        }
      } else {
        html += '<p class="vy-field__hint">Doplňte termín čerpání z kupní smlouvy a porovnám ho s tímhle odhadem.</p>';
      }

      html +=
        '<div class="hub-risk">' +
          '<div class="hub-risk__head">' +
            '<span class="hub-risk__label">Pozor na tohle</span>' +
            '<span class="hub-risk__level">Odhad, ne záruka</span>' +
          '</div>' +
          '<p class="hub-risk__title">Zaručená je jedině ta dolní hranice</p>' +
          '<p>Dvacetidenní ochranná lhůta je v zákoně a nezkrátí ji nikdo. Horní hranice je odhad z běžného provozu — ' +
            'lhůta pro rozhodnutí plyne ze správního řádu, ne z katastrálního zákona, a přetížený úřad ji překročí.</p>' +
          '<p>Počítejte s tím jako s minimem, od kterého se odpichujete při jednání o termínu. Ne jako s datem, ' +
            'které někomu slíbíte.</p>' +
        '</div>';

      out.innerHTML = html;
    }

    /* Test „Poznáte, že cihla drží?" — pět otázek, na které musíte umět
       odpovědět bez přemýšlení. Nepočítá skóre pro skóre: každá
       nezaškrtnutá položka je konkrétní telefonát, který máte dnes udělat. */
    var verdikt = document.querySelector('.js-test-verdikt');
    if (window.HubTools && verdikt) {
      HubTools.initChecklist({
        storageKey: 'milionarem-cerpani-test',
        container: '#test-cerpani',
        countEl: '#test-cerpani-count',
        totalEl: '#test-cerpani-total',
        fillEl: '#test-cerpani-fill',
        resetEl: '#test-cerpani-reset',
        doneClass: 'is-done',
        doneTarget: '.vy-check',
        gaEvent: 'milionarem_cerpani_test',
        onChange: function (done, total) {
          if (done === total) {
            verdikt.innerHTML =
              '<div class="vy-verdict vy-verdict--ok">' +
                '<strong>Cihla drží. Víte, kdo čeká na koho.</strong>' +
                '<p>To je přesně ten rozdíl mezi dvěma kupujícími ze začátku kapitoly. Zbytek je už jen ' +
                'volat tomu, kdo je zrovna na řadě.</p>' +
              '</div>';
            return;
          }

          var chybi = total - done;
          var boxy = Array.prototype.slice.call(
            document.querySelectorAll('#test-cerpani input[type="checkbox"][data-nazev]')
          );
          var polozky = boxy.filter(function (b) { return !b.checked; })
            .map(function (b) { return '<li>' + b.getAttribute('data-nazev') + '</li>'; })
            .join('');

          verdikt.innerHTML =
            '<div class="vy-verdict vy-verdict--warn">' +
              '<strong>' + chybi + ' ' + sklonuj(chybi, 'otázka', 'otázky', 'otázek') +
                ', na které zatím odpověď nemáte.</strong>' +
              '<ul>' + polozky + '</ul>' +
              '<p>Zavolejte kvůli nim advokátovi nebo bance dřív, než vyprší termín z kupní smlouvy. ' +
              'To je levnější telefonát než penále za prodlení.</p>' +
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
