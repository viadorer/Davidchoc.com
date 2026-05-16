// Sitewide popup CTA — bottom-right karta s odkazem na ocenění.
// Nezobrazí se na vybraných stránkách (ocenění, případ pro agenta, legal).
(function () {
  const STORAGE_KEY = 'popup-cta-dismissed';
  const DISMISS_DAYS = 7;
  const SHOW_AFTER_MS = 8000;
  const SHOW_AFTER_SCROLL_PCT = 30;

  // Skipped paths (case-insensitive contains)
  const SKIP_PATHS = [
    '/ocenit-online',
    '/pripad-pro-agenta',
    '/osobni-udaje',
    '/cookies-policy',
  ];

  const path = window.location.pathname.toLowerCase();
  if (SKIP_PATHS.some(p => path.includes(p))) return;

  // Recently dismissed?
  try {
    const dismissedAt = Number(localStorage.getItem(STORAGE_KEY));
    if (dismissedAt && (Date.now() - dismissedAt) < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
      return;
    }
  } catch (e) { /* ignore */ }

  function buildPopup() {
    const popup = document.createElement('aside');
    popup.className = 'popup-cta';
    popup.setAttribute('role', 'complementary');
    popup.setAttribute('aria-label', 'Nabídka ocenění nemovitosti');
    popup.innerHTML = `
      <button class="popup-cta__close" type="button" aria-label="Zavřít">&times;</button>
      <div class="popup-cta__image">
        <img src="https://pub-73649d5be63240648a58ace4d4c57318.r2.dev/images/davidchocagent.avif"
             alt="David Choc — realitní agent" loading="lazy">
      </div>
      <div class="popup-cta__body">
        <p class="popup-cta__title">Potřebujete ocenit nemovitost?</p>
        <a href="/ocenit-online.html" class="popup-cta__btn" data-popup-cta="ocenit">
          Ocenit online <i class="fas fa-arrow-right" aria-hidden="true"></i>
        </a>
      </div>
    `;
    document.body.appendChild(popup);

    const closeBtn = popup.querySelector('.popup-cta__close');
    closeBtn.addEventListener('click', () => {
      popup.classList.remove('is-visible');
      try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}
      setTimeout(() => popup.remove(), 500);
      if (window.gtag) window.gtag('event', 'popup_cta_dismiss', { event_category: 'popup' });
    });

    popup.querySelector('[data-popup-cta]').addEventListener('click', () => {
      if (window.gtag) window.gtag('event', 'popup_cta_click', { event_category: 'popup', event_label: 'ocenit' });
    });

    return popup;
  }

  let shown = false;
  function show() {
    if (shown) return;
    shown = true;
    const popup = buildPopup();
    // small delay to ensure transition triggers
    requestAnimationFrame(() => {
      requestAnimationFrame(() => popup.classList.add('is-visible'));
    });
    if (window.gtag) window.gtag('event', 'popup_cta_view', { event_category: 'popup' });
  }

  // Trigger 1: timer
  const timer = setTimeout(show, SHOW_AFTER_MS);

  // Trigger 2: scroll threshold
  const onScroll = () => {
    const doc = document.documentElement;
    const scrolled = window.scrollY + window.innerHeight;
    const pct = (scrolled / doc.scrollHeight) * 100;
    if (pct >= SHOW_AFTER_SCROLL_PCT) {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      show();
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();
