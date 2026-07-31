// Kalkulačka důchodové mezery — běží celá v prohlížeči, nic se neodesílá.
//
// Důchod se počítá podle zákona č. 155/1995 Sb. s parametry platnými pro rok
// 2026, ne odhadem. Vzorec:
//
//   1. Osobní vyměřovací základ (OVZ) = průměrný měsíční hrubý výdělek
//      za rozhodné období, přepočtený na dnešní úroveň mezd.
//   2. Výpočtový základ = OVZ po redukci:
//        do 21 546 Kč ....................... započítá se 99 %
//        od 21 546 do 195 868 Kč ............ započítá se 26 %
//        nad 195 868 Kč ..................... nezapočítá se nic
//   3. Procentní výměra = výpočtový základ × 1,495 % × počet celých let
//      pojištění, nejméně však 4 900 Kč.
//   4. Důchod = základní výměra 4 900 Kč + procentní výměra.
//
// Všechno počítáme v DNEŠNÍCH penězích. OVZ i redukční hranice se každý rok
// posouvají s růstem mezd, takže dosadit dnešní mzdu do dnešních hranic dává
// důchod v dnešní kupní síle — a ten se dá poctivě porovnat s dnešní výplatou.
(function () {
  'use strict';

  /* ── Parametry důchodu pro rok 2026 ───────────────────────────────── */
  var ZAKLADNI_VYMERA = 4900;      // 10 % průměrné mzdy
  var HRANICE_1 = 21546;           // 44 % průměrné mzdy
  var HRANICE_2 = 195868;          // 400 % průměrné mzdy
  var ZAPOCET_1 = 0.99;
  var ZAPOCET_2 = 0.26;
  var SAZBA_ZA_ROK = 0.01495;      // procentní výměra za každý celý rok pojištění
  var MIN_PROCENTNI = 4900;

  /* ── Parametry mzdy pro rok 2026 (pro převod hrubé na čistou) ─────── */
  var SOCIALNI = 0.071;
  var ZDRAVOTNI = 0.045;
  var DAN_ZAKLAD = 0.15;
  var DAN_ZVYSENA = 0.23;
  var HRANICE_ZVYSENE_DANE = 146904;   // 3násobek průměrné mzdy měsíčně
  var SLEVA_POPLATNIK = 2570;

  // Kolik z dnešní čisté výplaty potřebujete v důchodu, aby se vám nezměnil
  // život. Bydlení bývá splacené, děti odrostlé — proto ne sto procent.
  var CIL_PODIL = 0.80;

  /* ── Důchodový věk podle ročníku (reforma platná od 2025) ─────────── */
  // Ročník 1965 a starší: 65 let. Každý další ročník o měsíc víc.
  // Od ročníku 1989 dál je strop 67 let.
  function duchodovyVek(rokNarozeni) {
    if (rokNarozeni <= 1965) return 65;
    if (rokNarozeni >= 1989) return 67;
    return 65 + (rokNarozeni - 1965) / 12;
  }

  function vekText(vek) {
    var roky = Math.floor(vek + 1e-9);
    var mesice = Math.round((vek - roky) * 12);
    if (mesice === 0) return roky + ' let';
    return roky + ' let a ' + mesice + ' ' + (mesice === 1 ? 'měsíc' : (mesice < 5 ? 'měsíce' : 'měsíců'));
  }

  /* ── Výpočty ──────────────────────────────────────────────────────── */

  // Redukce osobního vyměřovacího základu na výpočtový základ.
  function vypoctovyZaklad(ovz) {
    var prvni = Math.min(ovz, HRANICE_1) * ZAPOCET_1;
    var druha = Math.max(0, Math.min(ovz, HRANICE_2) - HRANICE_1) * ZAPOCET_2;
    return prvni + druha;
  }

  function cistaMzda(hruba) {
    var socialni = hruba * SOCIALNI;
    var zdravotni = hruba * ZDRAVOTNI;
    var zaklad = Math.min(hruba, HRANICE_ZVYSENE_DANE);
    var nadlimit = Math.max(0, hruba - HRANICE_ZVYSENE_DANE);
    var dan = Math.max(0, zaklad * DAN_ZAKLAD + nadlimit * DAN_ZVYSENA - SLEVA_POPLATNIK);
    return hruba - socialni - zdravotni - dan;
  }

  function spocitat(rokNarozeni, hruba, roky, najem, letos) {
    var vekTeded = letos - rokNarozeni;
    var vekOdchodu = duchodovyVek(rokNarozeni);
    var doDuchodu = Math.max(0, vekOdchodu - vekTeded);

    var vz = vypoctovyZaklad(hruba);
    var procentni = Math.max(MIN_PROCENTNI, vz * SAZBA_ZA_ROK * roky);
    var duchod = ZAKLADNI_VYMERA + procentni;

    var cista = cistaMzda(hruba);
    var cil = cista * CIL_PODIL;
    var mezera = Math.max(0, cil - duchod);
    var bytu = najem > 0 ? Math.ceil(mezera / najem) : 0;

    return {
      vekTeded: vekTeded,
      vekOdchodu: vekOdchodu,
      doDuchodu: doDuchodu,
      vz: vz,
      procentni: procentni,
      duchod: duchod,
      cista: cista,
      cil: cil,
      mezera: mezera,
      bytu: bytu,
      // Nad první redukční hranicí projde do důchodu jen 26 % výdělku.
      // Tohle číslo bývá pro lidi překvapení, tak ho ukazujeme zvlášť.
      nadHranici: Math.max(0, Math.min(hruba, HRANICE_2) - HRANICE_1),
      // Co stojí rok odkladu: dvanáct měsíců, kdy nájemník nesplácel byt
      // za vás. Tenhle rok se nedá dohnat, jen zaplatit ze svého.
      rokOdkladu: najem * 12
    };
  }

  /* ── Pomocné ──────────────────────────────────────────────────────── */
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

  /* ── Obsluha ──────────────────────────────────────────────────────── */
  function init() {
    var box = document.getElementById('mezera-kalkulacka');
    if (!box) return;

    var rokEl = box.querySelector('[data-field="rok"]');
    var hrubaEl = box.querySelector('[data-field="hruba"]');
    var rokyEl = box.querySelector('[data-field="roky"]');
    var najemEl = box.querySelector('[data-field="najem"]');
    var vysledek = box.querySelector('.js-vysledek');
    var btn = box.querySelector('.js-spocitat');
    if (!rokEl || !hrubaEl || !vysledek) return;

    var LETOS = parseInt(box.getAttribute('data-rok') || '2026', 10);

    if (window.HubTools) {
      HubTools.initFields({
        storageKey: 'investovat-mezera',
        container: '#mezera-kalkulacka'
      });
    }

    function hlaska(text) {
      vysledek.innerHTML = '<p class="vy-field__hint">' + text + '</p>';
      vysledek.hidden = false;
    }

    function render() {
      var rok = parse(rokEl.value);
      var hruba = parse(hrubaEl.value);
      var najem = parse(najemEl && najemEl.value) || 12000;

      if (isNaN(rok) || rok < 1940 || rok > LETOS - 18) {
        return hlaska('Zadejte rok narození, například 1981.');
      }
      if (isNaN(hruba) || hruba < 10000) {
        return hlaska('Zadejte hrubou měsíční mzdu — tedy částku před odvody, ne to, co vám chodí na účet.');
      }

      var vekOdchodu = duchodovyVek(rok);
      // Výchozí odhad: nástup do práce ve dvaadvaceti. Kdo studoval déle
      // nebo byl dlouho na rodičovské, si to opraví.
      var roky = parse(rokyEl && rokyEl.value);
      if (isNaN(roky) || roky < 15 || roky > 55) roky = Math.round(vekOdchodu - 22);

      var v = spocitat(rok, hruba, roky, najem, LETOS);

      var html =
        '<div class="hub-calc">' +
          '<div class="hub-calc__block">' +
            '<div class="hub-calc__row"><span>Do důchodu půjdete ve věku</span><strong>' +
              vekText(v.vekOdchodu) + '</strong></div>' +
            '<div class="hub-calc__row"><span>To je za</span><strong>' +
              Math.round(v.doDuchodu) + ' ' + sklonuj(Math.round(v.doDuchodu), 'rok', 'roky', 'let') + '</strong></div>' +
            '<div class="hub-calc__row"><span>Výpočtový základ po zákonné redukci</span><strong>' +
              fmt(v.vz) + ' Kč</strong></div>' +
            '<div class="hub-calc__row"><span>Procentní výměra za ' + roky + ' let pojištění</span><strong>' +
              fmt(v.procentni) + ' Kč</strong></div>' +
            '<div class="hub-calc__row"><span>Základní výměra</span><strong>' +
              fmt(ZAKLADNI_VYMERA) + ' Kč</strong></div>' +
            '<div class="hub-calc__row hub-calc__row--sum"><span>Váš státní důchod v dnešních penězích</span><strong>' +
              fmt(v.duchod) + ' Kč měsíčně</strong></div>' +
          '</div>' +

          '<div class="hub-calc__block">' +
            '<div class="hub-calc__row"><span>Dnešní čistá mzda</span><strong>' +
              fmt(v.cista) + ' Kč</strong></div>' +
            '<div class="hub-calc__row"><span>Abyste si udrželi životní úroveň, potřebujete</span><strong>' +
              fmt(v.cil) + ' Kč měsíčně</strong></div>' +
            '<div class="hub-calc__row hub-calc__row--sum"><span>Vaše měsíční mezera</span><strong>' +
              fmt(v.mezera) + ' Kč</strong></div>' +
          '</div>';

      if (v.mezera <= 0) {
        html +=
          '<div class="vy-verdict vy-verdict--ok">' +
            '<strong>Podle zákonného vzorce vám mezera nevzniká.</strong>' +
            '<p>To je vzácné a stává se to hlavně u nižších příjmů, kde je důchod díky solidaritě systému blízko čisté mzdě. Zkontrolujte, jestli jste zadali hrubou mzdu, a ne čistou.</p>' +
          '</div>';
      } else {
        html +=
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
          '</div>';
      }

      if (v.nadHranici > 0) {
        html +=
          '<div class="hub-risk">' +
            '<div class="hub-risk__head">' +
              '<span class="hub-risk__label">Kde se to láme</span>' +
              '<span class="hub-risk__level">Redukční hranice</span>' +
            '</div>' +
            '<p class="hub-risk__title">Z výdělku nad ' + fmt(HRANICE_1) +
              ' Kč se vám do důchodu započítá jen 26 %</p>' +
            '<p>Vaše mzda přesahuje první redukční hranici o ' + fmt(v.nadHranici) +
              ' Kč. Z téhle části se do výpočtového základu dostane ' +
              fmt(v.nadHranici * ZAPOCET_2) + ' Kč, zbytek propadne. ' +
              'Čím víc vyděláváte, tím menší podíl vám stát nahradí — a tím větší kus si musíte postavit sami.</p>' +
          '</div>';
      }

      html += '</div>';

      vysledek.innerHTML = html;
      vysledek.hidden = false;

      // Mapa cihel si tohle číslo převezme, ať ho čtenář nepřepisuje ručně.
      try {
        localStorage.setItem('investovat-mezera-vysledek', JSON.stringify({
          mezera: Math.round(v.mezera),
          bytu: v.bytu,
          duchod: Math.round(v.duchod),
          vekOdchodu: v.vekOdchodu
        }));
      } catch (e) { /* privátní režim — nic se neděje */ }

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

    if (rokEl.value && hrubaEl.value) render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
