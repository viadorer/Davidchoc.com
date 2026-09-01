// HUB MEDIA — místa pro fotky a videa v obsahových sekcích.
//
// Proč to není prostě <img> v HTML:
//
// Fotky a videa vznikají po částech a měsíce po textu. Bez tohohle by se
// buď do stránek vkládaly prázdné rámečky s „připravujeme" (návštěvník
// vidí nedodělaný web), nebo by se na místa zapomnělo (a zadání pro
// fotografa by žilo v dokumentu, který u focení nikdo nemá).
//
// Takže: v HTML je jen kotva
//
//     <div data-media="F1-1"></div>
//
// a všechno ostatní — co tam patří, jaký poměr stran, jaký popisek —
// je v manifestu sekce. Dokud soubor neexistuje, návštěvník nevidí nic.
// Kdo si k adrese přidá ?media, uvidí na každém místě zadání: co natočit,
// jak a proč. To je verze, kterou si otevřeš u focení.
//
// Manifest si sekce nastaví sama:
//
//     window.HubMediaConfig = {
//       kredit: 'David Choc',
//       polozky: { 'F1-1': { typ:'foto', … } }
//     };
(function (global, d) {
  'use strict';

  var Media = {};

  function cfg() { return global.HubMediaConfig || {}; }
  function polozky() { return cfg().polozky || {}; }

  /* Režim zadání: ?media v adrese, nebo localhost. Do produkce se tím
     nedostane nic — návštěvník bez toho parametru nevidí prázdná místa. */
  function rezimZadani() {
    try {
      if (new URLSearchParams(global.location.search).has('media')) return true;
    } catch (e) { /* starý prohlížeč, nevadí */ }
    var h = global.location.hostname;
    return h === 'localhost' || h === '127.0.0.1';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Poměr stran drží místo dopředu, takže se stránka pod čtenářem
     nehne, až se obrázek načte. */
  function styleStran(p) {
    return p ? ' style="aspect-ratio:' + esc(p.replace(':', '/')) + '"' : '';
  }

  /* ── Hotová fotka ──────────────────────────────────────────────── */
  function fotka(id, m) {
    var kredit = m.kredit || cfg().kredit;
    return '<figure class="hub-media hub-media--foto">' +
      '<img src="' + esc(m.src) + '" alt="' + esc(m.alt || '') + '"' +
        (m.stran ? ' class="hub-media__ram"' + styleStran(m.stran) : '') +
        ' loading="lazy" decoding="async">' +
      (m.popisek || kredit
        ? '<figcaption>' +
            (m.popisek ? esc(m.popisek) : '') +
            (kredit ? '<span class="hub-media__kredit">' + esc(kredit) + '</span>' : '') +
          '</figcaption>'
        : '') +
    '</figure>';
  }

  /* ── Dvojice před/po ───────────────────────────────────────────── */
  function dvojice(id, m) {
    var a = m.dvojice[0], b = m.dvojice[1];
    return '<figure class="hub-media hub-media--par">' +
      '<div class="hub-media__par">' +
        ['spatne', 'dobre'].map(function (klic, i) {
          var s = i === 0 ? a : b;
          return '<div class="hub-media__pul hub-media__pul--' + klic + '">' +
            '<img src="' + esc(s.src) + '" alt="' + esc(s.alt || '') + '"' +
              ' class="hub-media__ram"' + styleStran(m.stran || '4:3') +
              ' loading="lazy" decoding="async">' +
            '<span class="hub-media__stitek">' + esc(s.stitek || '') + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
      (m.popisek ? '<figcaption>' + esc(m.popisek) +
        (cfg().kredit ? '<span class="hub-media__kredit">' + esc(cfg().kredit) + '</span>' : '') +
        '</figcaption>' : '') +
    '</figure>';
  }

  /* ── Hotové video ──────────────────────────────────────────────────
     preload="none" schválně: video nesmí ubírat rychlost stránce, na
     které je hlavní obsah text. Titulky jsou povinné — bez nich je to
     na mobilu bez zvuku němý film. */
  function video(id, m) {
    var titulky = m.titulky
      ? '<track kind="captions" src="' + esc(m.titulky) + '" srclang="cs" label="Česky" default>'
      : '';
    return '<figure class="hub-media hub-media--video">' +
      '<video class="hub-media__ram"' + styleStran(m.stran || '16:9') +
        ' controls preload="none" playsinline' +
        (m.poster ? ' poster="' + esc(m.poster) + '"' : '') + '>' +
        '<source src="' + esc(m.src) + '" type="video/mp4">' +
        titulky +
        'Váš prohlížeč video nepřehraje. ' +
        '<a href="' + esc(m.src) + '">Stáhnout soubor</a>.' +
      '</video>' +
      (m.popisek
        ? '<figcaption>' + esc(m.popisek) +
          (m.delka ? '<span class="hub-media__kredit">' + esc(m.delka) + '</span>' : '') +
          '</figcaption>'
        : '') +
    '</figure>';
  }

  /* ── Zadání (jen v režimu ?media) ──────────────────────────────── */
  function zadani(id, m) {
    var radky = [];
    if (m.stran) radky.push(['Poměr', m.stran]);
    if (m.delka) radky.push(['Délka', m.delka]);
    if (m.kde) radky.push(['Kde', m.kde]);
    if (m.zdroj) radky.push(['Zdroj', m.zdroj]);

    return '<div class="hub-media hub-media--zadani hub-media--' + esc(m.typ) + '-zadani">' +
      '<p class="hub-media__hlava">' +
        '<span class="hub-media__id">' + esc(id) + '</span>' +
        '<span class="hub-media__typ">' + (m.typ === 'video' ? 'Video' : 'Fotografie') + '</span>' +
        '<span class="hub-media__stav">' + esc(m.stav === 'hotovo' ? 'hotovo' : 'chybí') + '</span>' +
      '</p>' +
      (m.nadpis ? '<h4 class="hub-media__nadpis">' + esc(m.nadpis) + '</h4>' : '') +
      '<p class="hub-media__patri">' + esc(m.patri || '') + '</p>' +
      (m.zabery && m.zabery.length
        ? '<ul class="hub-media__zabery">' +
            m.zabery.map(function (z) { return '<li>' + esc(z) + '</li>'; }).join('') +
          '</ul>'
        : '') +
      (m.proc ? '<p class="hub-media__proc"><b>Proč sem</b>' + esc(m.proc) + '</p>' : '') +
      (radky.length
        ? '<dl class="hub-media__param">' +
            radky.map(function (r) {
              return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
            }).join('') +
          '</dl>'
        : '') +
    '</div>';
  }

  function vykresli(el) {
    var id = el.getAttribute('data-media');
    var m = polozky()[id];

    if (!m) {
      if (rezimZadani()) {
        el.innerHTML = '<div class="hub-media hub-media--zadani hub-media--chyba">' +
          '<p class="hub-media__hlava"><span class="hub-media__id">' + esc(id) + '</span>' +
          '<span class="hub-media__stav">není v manifestu</span></p></div>';
      }
      return;
    }

    var hotovo = m.stav === 'hotovo' && (m.src || (m.dvojice && m.dvojice.length === 2));

    if (hotovo) {
      el.innerHTML = m.typ === 'video' ? video(id, m)
        : (m.dvojice ? dvojice(id, m) : fotka(id, m));
      return;
    }

    // Nehotové místo je pro návštěvníka neviditelné. Prázdný rámeček
    // s nápisem „připravujeme" je horší než nic — říká, že web není
    // dodělaný, a to je na stránce o důvěryhodnosti drahá zpráva.
    el.innerHTML = rezimZadani() ? zadani(id, m) : '';
  }

  Media.init = function () {
    var mista = d.querySelectorAll('[data-media]');
    if (!mista.length) return;
    Array.prototype.forEach.call(mista, vykresli);
    if (rezimZadani()) d.body.classList.add('ma-media-zadani');
  };

  Media.rezimZadani = rezimZadani;

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', Media.init);
  } else {
    Media.init();
  }

  global.HubMedia = Media;
})(window, document);
