// Mapa cihel — interaktivní pracovní list k Cihle 1.
// Všechno se ukládá do localStorage, nic se neodesílá. Stránka se dá vytisknout.
(function () {
  'use strict';

  /* ── Výchozí hodnoty, které si uživatel může přepsat ──────────────── */
  var LTV = 0.70;                 // banka půjčí nejvýš 70 % (pravidla 2026)
  var POPLATEK_VYCHOZI = 4;       // % z kupní ceny, v praxi 3 až 5
  var REZERVA_VYCHOZI = 100000;   // vybavení a lehká příprava k pronájmu
  var POLSTAR_MESICU = 3;         // splátky, než nastoupí první nájemník
  var SAZBA_VYCHOZI = 5.2;        // % p. a., jen výchozí odhad
  var SPLATNOST_VYCHOZI = 25;     // let
  var NAKLADY_VYCHOZI = 2500;     // fond oprav, daň, rezerva na opravy

  // Cihla 1: realistický scénář počítá s obsazeností 11,5 měsíce v roce,
  // konzervativní přidává měsíc prázdna navíc a procentní bod na sazbě.
  var OBSAZENOST_REAL = 11.5 / 12;
  var OBSAZENOST_KONZ = 10.5 / 12;
  var SAZBA_PRIRAZKA = 1.0;
  var RUST_NAJMU = 0.03;          // optimistický scénář, ročně

  function fmt(n) {
    return window.HubTools ? HubTools.formatNumber(n) : String(Math.round(n));
  }
  /** Desetinné číslo po česku: 5.2 → "5,2" */
  function des(n) {
    return String(n).replace(".", ",");
  }
  function parse(v) {
    var n = window.HubTools ? HubTools.parseNumber(v) : parseFloat(v);
    return isNaN(n) ? null : n;
  }

  /** Anuitní splátka. Pro nulovou sazbu prostý podíl. */
  function splatka(jistina, sazbaProcent, roky) {
    var i = sazbaProcent / 100 / 12;
    var n = roky * 12;
    if (n <= 0) return 0;
    if (i === 0) return jistina / n;
    return jistina * i / (1 - Math.pow(1 + i, -n));
  }

  function init() {
    var box = document.getElementById('mapa-cihel');
    if (!box) return;

    var out = box.querySelector('.js-mapa-vysledek');

    if (window.HubTools) {
      HubTools.initFields({
        storageKey: 'investovat-mapa',
        container: '#mapa-cihel',
        resetEl: '.js-mapa-reset',
        onChange: prepocitat
      });
    }

    /* Číslo z kalkulačky důchodové mezery, pokud si ji čtenář už spočítal. */
    function nactiMezeru() {
      var el = box.querySelector('[data-field="mezera"]');
      if (!el || el.value) return;
      try {
        var ulozeno = JSON.parse(localStorage.getItem('investovat-mezera-vysledek') || 'null');
        if (ulozeno && ulozeno.mezera) {
          el.value = fmt(ulozeno.mezera);
          var zprava = box.querySelector('.js-mezera-prevzata');
          if (zprava) zprava.hidden = false;
        }
      } catch (e) { /* nic, vyplní se ručně */ }
    }

    function hodnota(name, vychozi) {
      var el = box.querySelector('[data-field="' + name + '"]');
      var v = el ? parse(el.value) : null;
      return v === null ? vychozi : v;
    }

    function prepocitat() {
      if (!out) return;

      var cena = hodnota('cena', null);
      if (cena === null || cena < 100000) {
        out.innerHTML = '<p class="vy-field__hint">Zadejte cenu bytu, se kterou počítáte, a dopočítám rozpočet i tři scénáře. Nemusí to být konkrétní byt — stačí částka, která je ve vašem městě obvyklá.</p>';
        return;
      }

      var poplatekPct = hodnota('poplatek', POPLATEK_VYCHOZI);
      var rezerva = hodnota('rezerva', REZERVA_VYCHOZI);
      var sazba = hodnota('sazba', SAZBA_VYCHOZI);
      var splatnost = hodnota('splatnost', SPLATNOST_VYCHOZI);
      var najem = hodnota('najem', null);
      var naklady = hodnota('naklady', NAKLADY_VYCHOZI);

      var uver = cena * LTV;
      var akontace = cena - uver;
      var poplatek = cena * poplatekPct / 100;
      var mesicni = splatka(uver, sazba, splatnost);
      var polstar = mesicni * POLSTAR_MESICU;
      var celkem = akontace + poplatek + rezerva + polstar;

      var html =
        '<div class="hub-calc">' +
          '<div class="hub-calc__block">' +
            '<div class="hub-calc__row"><span>Vlastní zdroje na akontaci (30 % z ceny)</span><strong>' + fmt(akontace) + ' Kč</strong></div>' +
            '<div class="hub-calc__row"><span>Poplatky spojené s nákupem (' + des(poplatekPct) + ' %)</span><strong>' + fmt(poplatek) + ' Kč</strong></div>' +
            '<div class="hub-calc__row"><span>Rezerva na vybavení a přípravu</span><strong>' + fmt(rezerva) + ' Kč</strong></div>' +
            '<div class="hub-calc__row"><span>Polštář na ' + POLSTAR_MESICU + ' splátky</span><strong>' + fmt(polstar) + ' Kč</strong></div>' +
            '<div class="hub-calc__row hub-calc__row--sum"><span>Celkem potřebujete mít</span><strong>' + fmt(celkem) + ' Kč</strong></div>' +
          '</div>' +

          '<div class="hub-calc__block">' +
            '<div class="hub-calc__row"><span>Úvěr od banky (LTV 70 %)</span><strong>' + fmt(uver) + ' Kč</strong></div>' +
            '<div class="hub-calc__row"><span>Měsíční splátka při ' + des(sazba) + ' % na ' + splatnost + ' let</span><strong>' + fmt(mesicni) + ' Kč</strong></div>' +
          '</div>';

      if (najem !== null && najem > 0) {
        var real = najem * OBSAZENOST_REAL - naklady - mesicni;
        var splatkaKonz = splatka(uver, sazba + SAZBA_PRIRAZKA, splatnost);
        var konz = najem * OBSAZENOST_KONZ - naklady - splatkaKonz;
        var najemZa5 = najem * Math.pow(1 + RUST_NAJMU, 5);
        var opt = najemZa5 * OBSAZENOST_REAL - naklady - mesicni;

        html +=
          '<div class="vy-results">' +
            '<div class="vy-result vy-result--realistic">' +
              '<span class="vy-result__label">Realistický — obsazenost 11,5 měsíce</span>' +
              '<span class="vy-result__value">' + (real >= 0 ? '+' : '') + fmt(real) + ' Kč / měsíc</span>' +
            '</div>' +
            '<div class="vy-result ' + (konz >= 0 ? 'vy-result--floor' : 'vy-result--fail') + '">' +
              '<span class="vy-result__label">Konzervativní — sazba +1 p. b. a měsíc prázdna navíc</span>' +
              '<span class="vy-result__value">' + (konz >= 0 ? '+' : '') + fmt(konz) + ' Kč / měsíc</span>' +
            '</div>' +
            '<div class="vy-result vy-result--optimistic">' +
              '<span class="vy-result__label">Za pět let při růstu nájmu 3 % ročně</span>' +
              '<span class="vy-result__value">' + (opt >= 0 ? '+' : '') + fmt(opt) + ' Kč / měsíc</span>' +
            '</div>' +
          '</div>';

        if (konz >= 0) {
          html +=
            '<div class="vy-verdict vy-verdict--ok">' +
              '<strong>Konzervativní scénář vychází kladně. Máte zelenou.</strong>' +
              '<p>To je celý smysl pátého kroku: investice obstojí i ve špatný rok, ne jen v tom vysněném. Byt, který projde tímhle testem, nemusíte dotovat z výplaty.</p>' +
            '</div>';
        } else {
          html +=
            '<div class="vy-verdict vy-verdict--warn">' +
              '<strong>Konzervativní scénář jde do minusu o ' + fmt(Math.abs(konz)) + ' Kč měsíčně.</strong>' +
              '<p>Neznamená to, že je koupě špatná — znamená to, že v horším roce budete doplácet ze svého. Buď potřebujete vyšší akontaci, nižší cenu, nebo vyšší nájem. Rozhodujte se podle tohohle čísla, ne podle realistického.</p>' +
            '</div>';
        }

        html +=
          '<div class="hub-time">' +
            '<div class="hub-time__head">' +
              '<span class="hub-time__label">Až bude splaceno</span>' +
              '<span class="hub-time__level">Za ' + splatnost + ' let</span>' +
            '</div>' +
            '<p class="hub-time__title">Po doplacení vám z bytu zůstane ' + fmt(najem * OBSAZENOST_REAL - naklady) + ' Kč měsíčně</p>' +
            '<p>Splátka zmizí, nájem zůstane. Tohle je to číslo, které porovnáváte se svojí důchodovou mezerou — kvůli němu se celá stavba dělá.</p>' +
          '</div>';
      }

      html += '</div>';
      out.innerHTML = html;
    }

    box.addEventListener('input', prepocitat);
    box.addEventListener('change', prepocitat);

    nactiMezeru();
    prepocitat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
