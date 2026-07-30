// Kalkulačka důchodové mezery — běží celá v prohlížeči, nic se neodesílá.
//
// Model je záměrně jednoduchý a všechny předpoklady jsou vidět na stránce.
// Není to předpověď vašeho důchodu, je to model: ukazuje řádovou velikost
// mezery, ne přesnou částku. Přesnou částku nezná dnes nikdo, protože závisí
// na tom, co s důchodovým systémem udělá příštích třicet let politiky.
(function () {
  'use strict';

  var VEK_ODCHODU = 65;

  // Český důchod je silně solidární: skládá se z pevné části, kterou dostane
  // každý, a z části odvozené od příjmu, která se s rostoucím platem redukuje.
  // Kdo bere víc, dostane v procentech míň. Model to zjednodušuje na pevný
  // základ plus čtvrtinu příjmu a stropuje se na 60 % — nad tím už by to
  // neodpovídalo ničemu.
  var ZAKLAD = 11000;
  var PODIL_Z_PRIJMU = 0.25;
  var STROP = 0.60;

  // Demografická korekce. Důchodců přibývá, plátců ubývá — čím dál je člověk
  // od důchodu, tím menší podíl mu systém udrží. Půl procenta za rok, nejvýš
  // dvacet procent dolů. Není to předpověď, je to řádový odhad.
  var KOREKCE_ZA_ROK = 0.005;
  var KOREKCE_MIN = 0.80;

  // Kolik z dnešního příjmu potřebujete v důchodu, aby se vám nezměnil život.
  // Bydlení už je splacené, děti odrostlé — proto ne sto procent.
  var CIL_PODIL = 0.80;

  function fmt(n) {
    return window.HubTools ? HubTools.formatNumber(n) : String(Math.round(n));
  }
  function parse(v) {
    return window.HubTools ? HubTools.parseNumber(v) : parseFloat(v);
  }

  function sklonuj(n, jeden, dva, pet) {
    if (n === 1) return jeden;
    if (n >= 2 && n <= 4) return dva;
    return pet;
  }

  function spocitat(vek, prijem, najem) {
    var doDuchodu = Math.max(0, VEK_ODCHODU - vek);

    var duchodDnes = Math.min(prijem * STROP, ZAKLAD + prijem * PODIL_Z_PRIJMU);
    var korekce = Math.max(KOREKCE_MIN, 1 - doDuchodu * KOREKCE_ZA_ROK);
    var duchod = duchodDnes * korekce;

    var cil = prijem * CIL_PODIL;
    var mezera = Math.max(0, cil - duchod);
    var bytu = najem > 0 ? Math.ceil(mezera / najem) : 0;

    return {
      doDuchodu: doDuchodu,
      duchodDnes: duchodDnes,
      korekce: korekce,
      duchod: duchod,
      cil: cil,
      mezera: mezera,
      bytu: bytu,
      // Co stojí rok odkladu: dvanáct měsíců, kdy nájemník nesplácel byt
      // za vás. Tenhle rok se nedá dohnat, jen zaplatit ze svého.
      rokOdkladu: najem * 12
    };
  }

  function init() {
    var box = document.getElementById('mezera-kalkulacka');
    if (!box) return;

    var vekEl = box.querySelector('[data-field="vek"]');
    var prijemEl = box.querySelector('[data-field="prijem"]');
    var najemEl = box.querySelector('[data-field="najem"]');
    var vysledek = box.querySelector('.js-vysledek');
    var btn = box.querySelector('.js-spocitat');
    if (!vekEl || !prijemEl || !vysledek) return;

    // Ukládání vstupů, ať se nemusí vyplňovat znovu při dalším čtení.
    if (window.HubTools) {
      HubTools.initFields({
        storageKey: 'investovat-mezera',
        container: '#mezera-kalkulacka'
      });
    }

    function render() {
      var vek = parse(vekEl.value);
      var prijem = parse(prijemEl.value);
      var najem = parse(najemEl && najemEl.value) || 12000;

      if (isNaN(vek) || isNaN(prijem) || vek < 18 || vek > 75 || prijem < 5000) {
        vysledek.innerHTML =
          '<p class="vy-field__hint">Zadejte věk mezi 18 a 75 lety a čistý měsíční příjem — spočítám to okamžitě, tady na stránce.</p>';
        vysledek.hidden = false;
        return;
      }

      var v = spocitat(vek, prijem, najem);

      if (v.mezera <= 0) {
        vysledek.innerHTML =
          '<div class="vy-verdict vy-verdict--ok">' +
            '<strong>Podle tohoto modelu vám mezera nevzniká.</strong>' +
            '<p>To je vzácné. Projděte si model ještě jednou s příjmem, který vám reálně chodí na účet — lidé sem často zadají hrubou mzdu.</p>' +
          '</div>';
        vysledek.hidden = false;
        return;
      }

      vysledek.innerHTML =
        '<div class="hub-calc">' +
          '<div class="hub-calc__block">' +
            '<div class="hub-calc__row"><span>Do důchodu vám zbývá</span><strong>' +
              v.doDuchodu + ' ' + sklonuj(v.doDuchodu, 'rok', 'roky', 'let') + '</strong></div>' +
            '<div class="hub-calc__row"><span>Abyste si udrželi životní úroveň, potřebujete</span><strong>' +
              fmt(v.cil) + ' Kč měsíčně</strong></div>' +
            '<div class="hub-calc__row"><span>Podle dnešních pravidel by vám stát vyplácel</span><strong>' +
              fmt(v.duchodDnes) + ' Kč měsíčně</strong></div>' +
            '<div class="hub-calc__row"><span>Pro váš ročník počítám s demografickou korekcí, tedy</span><strong>' +
              fmt(v.duchod) + ' Kč měsíčně</strong></div>' +
            '<div class="hub-calc__row hub-calc__row--sum"><span>Vaše měsíční mezera</span><strong>' +
              fmt(v.mezera) + ' Kč</strong></div>' +
          '</div>' +

          '<div class="hub-calc__total">' +
            '<div class="hub-calc__total-side">' +
              '<span class="hub-calc__total-label">Mezeru zacelí</span>' +
              '<span class="hub-calc__total-num">' + v.bytu + ' ' +
                sklonuj(v.bytu, 'splacený byt', 'splacené byty', 'splacených bytů') + '</span>' +
            '</div>' +
            '<p class="hub-calc__promise">při čistém nájmu ' + fmt(najem) +
              ' Kč měsíčně za jeden byt</p>' +
          '</div>' +

          '<div class="hub-time">' +
            '<div class="hub-time__head">' +
              '<span class="hub-time__label">Co stojí odklad</span>' +
              '<span class="hub-time__level">Jeden rok</span>' +
            '</div>' +
            '<p class="hub-time__title">Každý rok čekání vás stojí ' + fmt(v.rokOdkladu) + ' Kč</p>' +
            '<p>Tolik by za dvanáct měsíců zaplatil nájemník na splátce bytu místo vás. ' +
              'Rok, který takhle uteče, se nedá dohnat — dá se jen doplatit ze svého.</p>' +
          '</div>' +
        '</div>';

      vysledek.hidden = false;

      if (window.gtag) {
        window.gtag('event', 'investovat_mezera_spoctena', {
          event_category: 'nastroj',
          event_label: 'bytu_' + v.bytu
        });
      }
    }

    if (btn) btn.addEventListener('click', render);
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); render(); }
    });

    // Když se čtenář vrátí k rozečtenému kurzu, výsledek už tam je.
    if (vekEl.value && prijemEl.value) render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
