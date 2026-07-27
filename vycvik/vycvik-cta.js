// Sdílené konverzní prvky sekce Výcvik ziskového prodeje.
// Vkládá jednotnou patičku pod obsah každé kapitoly a nástroje.
// Záměrně nenátlakové — kniha slibuje, že nikdo nikoho nikam netlačí.
(function () {
  'use strict';

  var LEAD_API = 'https://api-production-88cf.up.railway.app/api/v1/public/api-leads/submit';
  var LEAD_KEY = 'rv_live_56bf805da8b9078ad650e0a6de346401ce7da6281146ea2f';

  /* ─────────────────────────────────────────────
     1) PATIČKA — zavírá slepé uličky
     ───────────────────────────────────────────── */
  function injectFooterCta() {
    var wrap = document.querySelector('.vycvik-chapter__wrap, .vycvik-tool-page__wrap');
    if (!wrap) return;
    if (wrap.querySelector('.vy-help')) return;

    // Nevkládat na hub a na stránky, kde už je silná nabídka
    var path = window.location.pathname;
    var SKIP = ['/vycvik', '/vycvik/', '/vycvik/index.html', '/vycvik/vybava', '/vycvik/kolik-to-stoji', '/vycvik/zaver', '/vycvik/zkouska'];
    if (SKIP.some(function (p) { return path === p || path === p + '.html'; })) return;

    var nav = wrap.querySelector('.vycvik-nav');

    var el = document.createElement('div');
    el.className = 'vy-help';
    el.innerHTML =
      '<div class="vy-help__text">' +
        '<strong>Zaseklo se to?</strong>' +
        '<p>Napište mi, o co jde. Odpovím do 24 hodin, zdarma a bez závazku — i když to nakonec budete prodávat sami.</p>' +
      '</div>' +
      '<div class="vy-help__actions">' +
        '<a href="/pripad-pro-agenta" class="vy-help__btn">Napsat</a>' +
        '<a href="tel:+420774052232" class="vy-help__phone">' +
          '<i class="fas fa-phone" aria-hidden="true"></i> 774 052 232' +
        '</a>' +
      '</div>';

    if (nav) wrap.insertBefore(el, nav);
    else wrap.appendChild(el);
  }

  /* ─────────────────────────────────────────────
     2) STAŽENÍ PDF ZA E-MAIL
     ───────────────────────────────────────────── */
  function initPdfForm() {
    var form = document.getElementById('vy-pdf-form');
    if (!form) return;

    var msg = form.querySelector('.vy-gate__msg');
    var btn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = form.querySelector('input[type="email"]').value.trim();
      var name = form.querySelector('input[name="name"]');
      var gdpr = form.querySelector('input[type="checkbox"]');

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showMsg(msg, 'Zadejte prosím platnou e-mailovou adresu.', 'error');
      }
      if (gdpr && !gdpr.checked) {
        return showMsg(msg, 'Pro odeslání potřebuji souhlas se zpracováním údajů.', 'error');
      }

      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Odesílám…';

      var parts = (name && name.value ? name.value.trim() : '').split(/\s+/);

      sendLead({
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: email,
        phone: '',
        message: 'Stažení PDF knihy Výcvik ziskového prodeje nemovitosti.',
        source: 'vycvik-pdf',
        pipeline: 'vycvik-kniha'
      }).then(function () {
        form.innerHTML =
          '<div class="vy-gate__done">' +
            '<i class="fas fa-circle-check" aria-hidden="true"></i>' +
            '<h3>Hotovo. PDF je na cestě.</h3>' +
            '<p>Za chvíli vám přijde e-mail s knihou ke stažení. Kdyby nedorazil do deseti minut, mrkněte do spamu — nebo mi napište na <a href="mailto:david.choc@ptf.cz">david.choc@ptf.cz</a>.</p>' +
            '<p class="vy-gate__done-note">Mezitím můžete rovnou <a href="/vycvik/uvod">začít číst online</a>.</p>' +
          '</div>';

        if (window.gtag) {
          window.gtag('event', 'vycvik_pdf_download', { event_category: 'lead', event_label: 'kniha_pdf' });
        }
        if (window.fbq) window.fbq('track', 'Lead', { content_name: 'vycvik-pdf' });
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = original;
        showMsg(msg, 'Něco se nepodařilo odeslat. Zkuste to prosím znovu, nebo mi napište na david.choc@ptf.cz.', 'error');
      });
    });
  }

  /* ─────────────────────────────────────────────
     3) VÝSLEDEK ZKOUŠKY E-MAILEM
     Vkládá se až po vyhodnocení — nejteplejší moment knihy.
     ───────────────────────────────────────────── */
  function buildExamGate(score, missingChapters, risks) {
    var el = document.createElement('div');
    el.className = 'vy-gate';
    el.innerHTML =
      '<div class="vy-gate__head">' +
        '<span class="vy-gate__label">Výsledek e-mailem</span>' +
        '<h3>Chcete výsledek i s tím, co se do knihy nevešlo?</h3>' +
        '<p>Pošlu vám vaše skóre a kapitoly k doplnění. A k tomu věci, které do tištěné knihy nepatří, protože rychle zastarají:</p>' +
        '<ul class="vy-gate__list">' +
          '<li>Aktuální ceny fotografa, videa a 3D skenu v Plzni</li>' +
          '<li>Seznam inzertních portálů s podmínkami pro soukromé inzerenty</li>' +
          '<li>Ceny advokátní a notářské úschovy</li>' +
        '</ul>' +
      '</div>' +
      '<form id="vy-exam-form" class="vy-gate__form" novalidate>' +
        '<div class="vy-gate__row">' +
          '<input type="email" name="email" placeholder="vas@email.cz" required aria-label="E-mail">' +
          '<button type="submit">Poslat výsledek</button>' +
        '</div>' +
        '<label class="vy-gate__consent">' +
          '<input type="checkbox" name="gdpr" required>' +
          '<span>Souhlasím se zpracováním e-mailu podle <a href="/osobni-udaje" target="_blank" rel="noopener">zásad ochrany osobních údajů</a>. Odhlásit se dá jedním kliknutím.</span>' +
        '</label>' +
        '<p class="vy-gate__msg" hidden></p>' +
      '</form>' +
      '<p class="vy-gate__note">Nikdo vám kvůli tomu nezavolá. Píšu, když mám co říct, ne podle kalendáře.</p>';

    var form = el.querySelector('#vy-exam-form');
    var msg = el.querySelector('.vy-gate__msg');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type="email"]').value.trim();
      var gdpr = form.querySelector('input[name="gdpr"]');
      var btn = form.querySelector('button[type="submit"]');

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showMsg(msg, 'Zadejte prosím platnou e-mailovou adresu.', 'error');
      }
      if (!gdpr.checked) {
        return showMsg(msg, 'Pro odeslání potřebuji souhlas se zpracováním údajů.', 'error');
      }

      btn.disabled = true;
      btn.textContent = 'Odesílám…';

      var body = 'Závěrečná zkouška — skóre ' + score + '/8.\n';
      if (missingChapters && missingChapters.length) {
        body += 'Chybí: ' + missingChapters.join(', ') + '.\n';
      }
      if (risks && risks.length) {
        body += 'Rizikové situace: ' + risks.join(', ') + '.\n';
      }

      sendLead({
        firstName: '', lastName: '', email: email, phone: '',
        message: body,
        source: 'vycvik-zkouska',
        pipeline: 'vycvik-kniha',
        extra: { score: score }
      }).then(function () {
        el.innerHTML =
          '<div class="vy-gate__done">' +
            '<i class="fas fa-circle-check" aria-hidden="true"></i>' +
            '<h3>Odesláno.</h3>' +
            '<p>Výsledek i s doplňky vám přijde na e-mail. Kdyby nedorazil, mrkněte do spamu.</p>' +
          '</div>';
        if (window.gtag) {
          window.gtag('event', 'vycvik_zkouska_email', {
            event_category: 'lead', event_label: 'score_' + score, value: score
          });
        }
        if (window.fbq) window.fbq('track', 'Lead', { content_name: 'vycvik-zkouska' });
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = 'Poslat výsledek';
        showMsg(msg, 'Něco se nepodařilo odeslat. Zkuste to prosím znovu.', 'error');
      });
    });

    return el;
  }

  /* ── Pomocné ── */
  function showMsg(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = 'vy-gate__msg vy-gate__msg--' + (type || 'error');
    el.hidden = false;
  }

  function sendLead(data) {
    return fetch(LEAD_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': LEAD_KEY },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || '',
        message: data.message,
        data: Object.assign({
          source: data.source,
          campaign: 'vycvik-kniha',
          pipeline: data.pipeline
        }, data.extra || {})
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('API ' + r.status);
      return r;
    });
  }

  // Export pro stránku zkoušky
  window.VycvikCTA = { buildExamGate: buildExamGate };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectFooterCta();
      initPdfForm();
    });
  } else {
    injectFooterCta();
    initPdfForm();
  }
})();
