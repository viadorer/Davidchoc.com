// Kontrola rezervační smlouvy — nástroj k Cihle 5.
// Pět bodů, které ve smlouvě musí být. Verdikt nepočítá jen kolik jich chybí,
// ale řekne které — protože každý z nich chrání proti něčemu jinému.
// Vše v localStorage, nic se neodesílá.
(function () {
  'use strict';

  function sklonuj(n, jeden, dva, pet) {
    if (n === 1) return jeden;
    if (n >= 2 && n <= 4) return dva;
    return pet;
  }

  function init() {
    var box = document.getElementById('kontrola-rezervace');
    if (!box || !window.HubTools) return;

    var seznam = box.querySelector('#rezervace-body');
    var verdikt = box.querySelector('.js-rezervace-verdikt');

    function chybejici() {
      var boxy = Array.prototype.slice.call(
        seznam.querySelectorAll('input[type="checkbox"][data-key]')
      );
      return boxy.filter(function (b) { return !b.checked; }).map(function (b) {
        return b.getAttribute('data-nazev') || '';
      });
    }

    HubTools.initChecklist({
      storageKey: 'milionarem-rezervace',
      container: '#rezervace-body',
      countEl: '#rezervace-count',
      totalEl: '#rezervace-total',
      fillEl: '#rezervace-fill',
      resetEl: '#rezervace-reset',
      doneClass: 'is-done',
      doneTarget: '.vy-check',
      gaEvent: 'milionarem_rezervace_kompletni',
      onChange: function (done, total) {
        if (!verdikt) return;

        if (done === total) {
          verdikt.innerHTML =
            '<div class="vy-verdict vy-verdict--ok">' +
              '<strong>Smlouva má všech pět bodů. Můžete podepisovat.</strong>' +
              '<p>Zbývá jediné: přečíst si přiložený návrh kupní smlouvy dřív, než pošlete peníze. ' +
              'A poslat je do úschovy, ne na účet realitní kanceláře.</p>' +
            '</div>';
          return;
        }

        var chybi = chybejici();
        var polozky = chybi.map(function (n) { return '<li>' + n + '</li>'; }).join('');

        verdikt.innerHTML =
          '<div class="vy-verdict vy-verdict--danger">' +
            '<strong>Nepodepisujte. Chybí ' + chybi.length + ' ' +
              sklonuj(chybi.length, 'bod', 'body', 'bodů') + ' z pěti.</strong>' +
            '<ul>' + polozky + '</ul>' +
            '<p>Požádejte o doplnění dřív, než smlouvu podepíšete. Po podpisu už nemáte co nabídnout ' +
            'výměnou — a druhá strana to ví.</p>' +
          '</div>';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
