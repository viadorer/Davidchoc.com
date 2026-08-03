// Prověření nájemníka — nástroj k Cihle 8.
// Není to počítadlo. Některé body se dají dohnat potom, jiné ne — a rozdíl
// mezi nimi je celý smysl téhle kapitoly. Vše v localStorage.
(function () {
  'use strict';

  function sklonuj(n, jeden, dva, pet) {
    var a = Math.abs(n);
    if (a === 1) return jeden;
    if (a >= 2 && a <= 4) return dva;
    return pet;
  }

  function seznam(boxy) {
    return boxy.map(function (b) {
      return '<li>' + (b.getAttribute('data-nazev') || '') + '</li>';
    }).join('');
  }

  function init() {
    var box = document.getElementById('provereni-najemnika');
    if (!box || !window.HubTools) return;

    var verdikt = box.querySelector('.js-najemnik-verdikt');
    var seznamEl = box.querySelector('#najemnik-body');

    function nesplnene(vaha) {
      return Array.prototype.slice.call(
        seznamEl.querySelectorAll('input[type="checkbox"][data-vaha="' + vaha + '"]')
      ).filter(function (b) { return !b.checked; });
    }

    HubTools.initChecklist({
      storageKey: 'milionarem-najemnik',
      container: '#najemnik-body',
      countEl: '#najemnik-count',
      totalEl: '#najemnik-total',
      fillEl: '#najemnik-fill',
      resetEl: '#najemnik-reset',
      doneClass: 'is-done',
      doneTarget: '.vy-check',
      gaEvent: 'milionarem_najemnik_kompletni',
      onChange: function (done, total) {
        if (!verdikt) return;

        var stop = nesplnene('stop');
        var riziko = nesplnene('riziko');

        // Body označené jako „stop" se po předání klíčů dohnat nedají.
        // Nepodepsaná smlouva ani nesložená kauce se zpětně nevymáhá
        // ničím jiným než dobrou vůlí druhé strany.
        if (stop.length) {
          verdikt.innerHTML =
            '<div class="vy-verdict vy-verdict--danger">' +
              '<strong>Klíče nepředávejte. Chybí ' + stop.length + ' ' +
                sklonuj(stop.length, 'věc', 'věci', 'věcí') + ', ' +
                (stop.length === 1 ? 'kterou' : 'které') + ' už zpětně nezískáte.</strong>' +
              '<ul>' + seznam(stop) + '</ul>' +
              '<p>Dokud má klíče ve své moci ještě někdo jiný než nájemník, máte co nabídnout ' +
              'výměnou. Ve chvíli, kdy je předáte, vyjednáváte už jen o jeho dobré vůli.</p>' +
            '</div>';
          return;
        }

        if (riziko.length) {
          verdikt.innerHTML =
            '<div class="vy-verdict vy-verdict--warn">' +
              '<strong>Formálně jste v pořádku, ale o tom člověku nic nevíte.</strong>' +
              '<ul>' + seznam(riziko) + '</ul>' +
              '<p>Smlouva a kauce vás chrání až potom, co se něco stane. Prověření je to jediné, ' +
              'co tomu předchází — a stojí jeden telefonát předchozímu pronajímateli.</p>' +
              '<p>Připomeňte si přitom, kolik času máte: <strong>vypovědět nájem bez výpovědní ' +
              'doby jde teprve po třech nezaplacených měsících</strong>, a i pak musíte nájemníka ' +
              'nejdřív písemně vyzvat k nápravě. Tři měsíce bez nájmu jsou dražší než tři dny ' +
              'čekání na dalšího zájemce.</p>' +
            '</div>';
          return;
        }

        verdikt.innerHTML =
          '<div class="vy-verdict vy-verdict--ok">' +
            '<strong>Prověřeno. Klíče můžete předat.</strong>' +
            '<p>Máte podepsanou smlouvu, složenou kauci, protokol o stavu bytu i představu o tom, ' +
            'komu ho svěřujete. To je všechno, co se dá udělat předem — zbytek je běžné riziko ' +
            'pronájmu a na to je kauce.</p>' +
            '<p>Nezapomeňte na jednu věc, na kterou se běžně zapomíná: <strong>kauce se ze zákona ' +
            'úročí.</strong> Až ji budete vracet, patří k ní i úrok.</p>' +
          '</div>';
      }
    });

    /* Test „Poznáte, že cihla drží?" */
    var testVerdikt = document.querySelector('.js-test-verdikt');
    if (testVerdikt) {
      HubTools.initChecklist({
        storageKey: 'milionarem-najemnik-test',
        container: '#test-najemnik',
        countEl: '#test-najemnik-count',
        totalEl: '#test-najemnik-total',
        fillEl: '#test-najemnik-fill',
        resetEl: '#test-najemnik-reset',
        doneClass: 'is-done',
        doneTarget: '.vy-check',
        gaEvent: 'milionarem_najemnik_test',
        onChange: function (done, total) {
          if (done === total) {
            testVerdikt.innerHTML =
              '<div class="vy-verdict vy-verdict--ok">' +
                '<strong>Cihla drží. Vybíráte, místo abyste doufali.</strong>' +
                '<p>To je celý rozdíl mezi dvěma majiteli ze začátku kapitoly. Zbytek je běžné ' +
                'riziko pronájmu — a na to máte kauci a smlouvu.</p>' +
              '</div>';
            return;
          }

          var chybi = Array.prototype.slice.call(
            document.querySelectorAll('#test-najemnik input[type="checkbox"][data-nazev]')
          ).filter(function (b) { return !b.checked; });

          testVerdikt.innerHTML =
            '<div class="vy-verdict vy-verdict--warn">' +
              '<strong>' + chybi.length + ' ' +
                sklonuj(chybi.length, 'otázka', 'otázky', 'otázek') +
                ', na ' + (chybi.length === 1 ? 'kterou' : 'které') + ' zatím odpověď nemáte.</strong>' +
              '<ul>' + seznam(chybi) + '</ul>' +
              '<p>Prověřte to dřív, než podepíšete. Zrušený zájemce je levnější než nájemník, ' +
              'kterého musíte řešit u soudu.</p>' +
            '</div>';
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
