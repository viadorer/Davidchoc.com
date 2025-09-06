// Funkce pro načtení navigace a patičky
document.addEventListener('DOMContentLoaded', function() {
    // Zjištění, kde se nachází aktuální stránka
    const currentPath = window.location.href;
    let commonPath = './common/';
    
    // Pokud jsme v podadresáři blog, musíme použít jinou cestu
    if (currentPath.includes('/blog/')) {
        commonPath = '../common/';
    }
    
    console.log('Cesta k common:', commonPath); // Debug výpis
    
    // Načtení navigace - rozlišení mezi hlavní stránkou a podstránkami
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        // Zjistit, jestli jsme na hlavní stránce (pouze root index.html, ne podstránky jako blog/index.html)
        const isRootIndexPage = (currentPath === '/' || currentPath === '' || currentPath === 'index.html' || currentPath.endsWith('/index.html') && !currentPath.includes('/') && currentPath !== 'blog/index.html');
        const navbarFile = isRootIndexPage ? 'navbar-index.html' : 'navbar.html';
        
        console.log('Načítám navigaci:', navbarFile, 'pro stránku:', currentPath);
        
        // Nejprve zkusíme předpokládanou cestu
        fetch(commonPath + navbarFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Navigace nenalezena na ' + commonPath + navbarFile);
                }
                return response.text();
            })
            .then(data => {
                navbarPlaceholder.innerHTML = data;
                initMobileNav();
            })
            .catch(error => {
                console.warn(error.message);
                // Pokud selže, zkusíme alterativní cestu
                const altPath = commonPath === './common/' ? '../common/' : './common/';
                console.log('Zkusíme alternativní cestu:', altPath + navbarFile);
                
                fetch(altPath + navbarFile)
                    .then(response => response.text())
                    .then(data => {
                        navbarPlaceholder.innerHTML = data;
                        initMobileNav();
                    })
                    .catch(err => console.error('Chyba při načítání navigace:', err));
            });
    }

    // Načtení patičky - podobný přístup
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch(commonPath + 'footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Patička nenalezena na ' + commonPath);
                }
                return response.text();
            })
            .then(data => {
                footerPlaceholder.innerHTML = data;
                initFooterFunctionality();
            })
            .catch(error => {
                console.warn(error.message);
                // Pokud selže, zkusíme alterativní cestu
                const altPath = commonPath === './common/' ? '../common/' : './common/';
                console.log('Zkusíme alternativní cestu:', altPath);
                
                fetch(altPath + 'footer.html')
                    .then(response => response.text())
                    .then(data => {
                        footerPlaceholder.innerHTML = data;
                        initFooterFunctionality();
                    })
                    .catch(err => console.error('Chyba při načítání patičky:', err));
            });
    }
    
    // Inject a reusable contact modal (vanilla JS) and expose openContactModal()
    (function initContactModal(){
        if (document.getElementById('contact-modal-overlay')) return; // prevent double-init
        const overlay = document.createElement('div');
        overlay.id = 'contact-modal-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,.6); display:none; z-index: 10000;
            align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(2px);
        `;
        overlay.innerHTML = `
            <div id="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title" style="
                background:#111; color:#fff; width:100%; max-width:720px; border-radius:18px; overflow:hidden; border:1px solid rgba(255,191,0,.25);
                box-shadow: 0 25px 60px rgba(0,0,0,.5);
            ">
                <div style="display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-bottom:1px solid rgba(255,191,0,.25);">
                    <h2 id="contact-modal-title" style="margin:0; font-size:1.4rem; color:#FFBF00; font-weight:800;">Rychlý kontakt</h2>
                    <button type="button" id="contact-modal-close" aria-label="Zavřít" style="
                        background:transparent; border:none; color:#fff; font-size:1.4rem; cursor:pointer; line-height:1; padding:6px; border-radius:8px;
                    ">✕</button>
                </div>
                <div style="padding:22px;">
                    <p style="margin-top:0; color:#ddd;">Zanechte mi zprávu a já se vám ozvu. Odpovídám zpravidla <strong>do 24 hodin</strong>.</p>
                    <form id="contact-modal-form" novalidate>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
                            <div>
                                <label for="cm-name" style="display:block; color:#ccc; font-size:.9rem; margin-bottom:6px;">Jméno</label>
                                <input id="cm-name" name="name" type="text" required placeholder="Vaše jméno" style="
                                    width:100%; padding:12px 14px; border-radius:10px; background:#1a1a1a; border:1px solid #333; color:#fff;
                                ">
                            </div>
                            <div>
                                <label for="cm-contact" style="display:block; color:#ccc; font-size:.9rem; margin-bottom:6px;">E-mail nebo telefon</label>
                                <input id="cm-contact" name="contact" type="text" required placeholder="email@domena.cz / +420…" style="
                                    width:100%; padding:12px 14px; border-radius:10px; background:#1a1a1a; border:1px solid #333; color:#fff;
                                ">
                            </div>
                        </div>
                        <div style="margin-top:14px;">
                            <label for="cm-message" style="display:block; color:#ccc; font-size:.9rem; margin-bottom:6px;">Zpráva</label>
                            <textarea id="cm-message" name="message" rows="4" required placeholder="S čím mohu pomoci?" style="
                                width:100%; padding:12px 14px; border-radius:10px; background:#1a1a1a; border:1px solid #333; color:#fff; resize:vertical;
                            "></textarea>
                        </div>
                        <div style="display:flex; gap:12px; align-items:center; justify-content:flex-end; margin-top:18px;">
                            <button type="button" id="contact-modal-cancel" style="
                                border:2px solid #444; background:transparent; color:#ddd; padding:10px 16px; border-radius:999px; cursor:pointer; font-weight:600;
                            ">Zavřít</button>
                            <button type="submit" id="contact-modal-submit" style="
                                background:#FFBF00; color:#1a1a1a; padding:12px 18px; border-radius:999px; font-weight:800; border:none; cursor:pointer;
                            ">Odeslat</button>
                        </div>
                        <p id="contact-modal-status" style="margin:10px 0 0; font-size:.9rem; color:#bbb; display:none;"></p>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const close = () => { overlay.style.display = 'none'; overlay.setAttribute('aria-hidden', 'true'); };
        const open = () => { overlay.style.display = 'flex'; overlay.removeAttribute('aria-hidden'); };
        window.openContactModal = open;
        
        // Open triggers: use [data-open-contact]
        document.querySelectorAll('[data-open-contact]')
            .forEach(el => el.addEventListener('click', (e) => { e.preventDefault(); open(); }));

        // Close handlers
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.getElementById('contact-modal-close').addEventListener('click', close);
        document.getElementById('contact-modal-cancel').addEventListener('click', close);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.style.display === 'flex') close(); });

        // Simple submit handler (no backend) — replace with your integration if needed
        const form = document.getElementById('contact-modal-form');
        const status = document.getElementById('contact-modal-status');
        const submitBtn = document.getElementById('contact-modal-submit');
        form.addEventListener('submit', function(evt){
            evt.preventDefault();
            const name = document.getElementById('cm-name').value.trim();
            const contact = document.getElementById('cm-contact').value.trim();
            const message = document.getElementById('cm-message').value.trim();
            if (!name || !contact || !message) {
                status.textContent = 'Vyplňte prosím všechna pole.';
                status.style.display = 'block';
                status.style.color = '#ffb3b3';
                return;
            }
            // Ulož prefill pro widget na homepage a přesměruj na sekci #kontakt
            try {
                localStorage.setItem('contact_prefill', JSON.stringify({ name, contact, message, ts: Date.now() }));
            } catch(e) {}
            window.location.href = '/index.html#kontakt';
        });
    })();
});

// Inicializace mobilní navigace
function initMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Zavření menu po kliknutí na odkaz
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
    
    // Aktivace položky navigace podle aktuální stránky
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        if (linkPath === currentPath || 
            (currentPath.includes('/blog/') && linkPath === '/blog/index.html')) {
            link.classList.add('active');
        }
    });
}

// Inicializace funkcionality patičky
function initFooterFunctionality() {
    // Newsletter je v patičce nyní vkládán přes iframe (žádná JS reinicializace není potřeba)
    
    // Funkce pro tlačítko zpět nahoru
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        // Zobrazit/skrýt tlačítko při scrollování
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        // Scroll nahoru po kliknutí
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Newsletter formulář
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value.trim() !== '') {
                alert('Děkujeme za přihlášení k odběru novinek!');
                emailInput.value = '';
            }
        });
    }
}
