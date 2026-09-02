// Sitewide popup CTA — bottom-right karta s odkazem na ocenění.
// Nezobrazí se na vybraných stránkách (ocenění, případ pro agenta, legal).
(function () {
  const STORAGE_KEY = 'popup-cta-dismissed';
  const DISMISS_DAYS = 7;
  const SHOW_AFTER_MS = 8000;
  const SHOW_AFTER_SCROLL_PCT = 30;

  // Skipped paths (case-insensitive contains)
  // Kurzy jsou z popupu vynechané celé. Mají vlastní, silnější nabídky
  // a slibují čtenáři, že ho nikdo nikam netlačí — vyskakovací karta
  // uprostřed kapitoly jde proti tomu slibu i proti klidu na čtení.
  const SKIP_PATHS = [
    '/ocenit-online',
    '/chci-si-to-overit',
    '/osobni-udaje',
    '/cookies-policy',
    '/vycvik',
    // Pokrývá i /milionarem/* — porovnává se přes includes().
    '/milionar',
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
        <a href="/ocenit-online" class="popup-cta__btn" data-popup-cta="ocenit">
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

    // Plovoucí tlačítka se posouvají nad popup. Posun se odvozuje od místa,
    // které popup zabírá odspodu — pevná hodnota sedí na desktopu, ale na
    // mobilu je popup o dvě stě pixelů nižší a tlačítka pak skončí uprostřed
    // obrazovky přes čtený text. Měří se výška plus vlastní odsazení popupu,
    // ne pozice na obrazovce: ta se během náběhové animace ještě mění.
    const mereniProstoru = () => {
      const odsazeni = parseFloat(getComputedStyle(popup).bottom) || 0;
      document.documentElement.style
        .setProperty('--popup-cta-space', (popup.offsetHeight + odsazeni) + 'px');
    };
    mereniProstoru();
    if (window.ResizeObserver) new ResizeObserver(mereniProstoru).observe(popup);
    // Pojistka pro otočení telefonu — tam se mění šířka i výška popupu naráz
    // a samotný ResizeObserver se na to nedá spolehnout.
    window.addEventListener('resize', mereniProstoru, { passive: true });
    window.addEventListener('orientationchange', mereniProstoru, { passive: true });

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
