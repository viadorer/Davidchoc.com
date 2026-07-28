// Vlozeni odhadu ceny primo do clanku na blogu.
// Formular se nacita az ve chvili, kdy se ctenar priblizi k bloku — jinak by
// tretistranovy skript zdrzoval nacteni cele stranky.
(function () {
  'use strict';

  var WIDGET_ID = '22642/235f94312cb0beea2fe91791583a1aa735ee02fc';
  var WIDGET_SRC = 'https://cemap.cz/beta2/inc/js/widget.js';
  var CEKANI_MS = 12000;   // po teto dobe uz formular necekame
  var nactenoJiz = false;

  function nacistFormular() {
    if (nactenoJiz) return;
    nactenoJiz = true;

    window.cemap_id = WIDGET_ID;

    var s = document.createElement('script');
    s.src = WIDGET_SRC;
    s.async = true;
    s.onerror = vzdatTo;
    document.head.appendChild(s);

    hlidatDoruceni();

    if (window.gtag) {
      window.gtag('event', 'ocenit_widget_zobrazen', {
        event_category: 'ocenit',
        event_label: window.location.pathname
      });
    }
  }

  // Az formular dorazi, schovat nahradni text. Kdyz nedorazi, nabidnout odkaz.
  function hlidatDoruceni() {
    var zacatek = Date.now ? Date.now() : +new Date();
    var tik = setInterval(function () {
      var vsechnyMaji = true;
      mista().forEach(function (el) {
        if (el.querySelector('iframe')) {
          var n = el.querySelector('.ocenit-embed__fallback');
          if (n) n.remove();
        } else {
          vsechnyMaji = false;
        }
      });
      if (vsechnyMaji) return clearInterval(tik);
      if ((Date.now ? Date.now() : +new Date()) - zacatek > CEKANI_MS) {
        clearInterval(tik);
        vzdatTo();
      }
    }, 300);
  }

  function vzdatTo() {
    mista().forEach(function (el) {
      if (el.querySelector('iframe')) return;
      var n = el.querySelector('.ocenit-embed__fallback');
      if (n) {
        n.innerHTML = 'Formulář se teď nepodařilo načíst. ' +
          'Odhad si spočítáte na stránce <a href="/ocenit-online">Ocenit online</a>, ' +
          'nebo mi rovnou zavolejte na <a href="tel:+420774052232">774&nbsp;052&nbsp;232</a>.';
      }
    });
  }

  function mista() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-cemap]'));
  }

  function pripravit(el) {
    // widget.js hleda .cemap-widget, tak tridu doplnime az tesne pred nactenim
    // (pridat, ne prepsat — jinak by blok prisel o vlastni vzhled)
    if (el.className.indexOf('cemap-widget') === -1) el.className += ' cemap-widget';
    el.setAttribute('data-options', 'id=101');
  }

  function jeBlizko(el) {
    var r = el.getBoundingClientRect();
    var vyska = window.innerHeight || document.documentElement.clientHeight || 0;
    // Prohlizec zatim nic nevykreslil (skryte okno) — nechat na pozdeji
    if (!vyska) return false;
    return r.top < vyska + 600 && r.bottom > -600;
  }

  function zkusit() {
    if (nactenoJiz) return;
    var m = mista();
    if (!m.length) return;
    if (!m.some(jeBlizko)) return;
    m.forEach(pripravit);
    nacistFormular();
  }

  function start() {
    var m = mista();
    if (!m.length) return;

    if ('IntersectionObserver' in window) {
      var pozorovatel = new IntersectionObserver(function (zaznamy) {
        if (!zaznamy.some(function (z) { return z.isIntersecting; })) return;
        pozorovatel.disconnect();
        m.forEach(pripravit);
        nacistFormular();
      }, { rootMargin: '600px 0px' });
      m.forEach(function (el) { pozorovatel.observe(el); });
    }

    // Zaloha pro pripad, ze pozorovatel nikdy nespusti (skryte okno, stara
    // verze prohlizece). Bez ni by ctenar zustal koukat na prazdny ram.
    window.addEventListener('scroll', zkusit, { passive: true });
    window.addEventListener('resize', zkusit, { passive: true });
    setTimeout(zkusit, 3000);
    setTimeout(function () {
      if (nactenoJiz) return;
      m.forEach(pripravit);
      nacistFormular();
    }, 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
