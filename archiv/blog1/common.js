// Funkce pro načtení navigace a patičky pro blog adresář
document.addEventListener('DOMContentLoaded', function() {
    // Načtení navigace - používáme relativní cestu pro blog adresář
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        fetch('../common/navbar.html')
            .then(response => response.text())
            .then(data => {
                navbarPlaceholder.innerHTML = data;
                // Inicializace mobilní navigace po načtení
                initMobileNav();
            })
            .catch(error => console.error('Chyba při načítání navigace:', error));
    }

    // Načtení patičky - používáme relativní cestu pro blog adresář
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('../common/footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                // Inicializace funkcionality patičky
                initFooterFunctionality();
            })
            .catch(error => console.error('Chyba při načítání patičky:', error));
    }
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
        
        // Zavřít menu při kliknutí na odkaz
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Inicializace funkcionality patičky
function initFooterFunctionality() {
    // Aktualizace roku v copyrightu
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }
    
    // Smooth scrolling pro odkazy v patičce
    const footerLinks = document.querySelectorAll('footer a[href^="../index.html#"]');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Získej ID sekce z href atributu
            const targetId = this.getAttribute('href').split('#')[1];
            
            // Pokud je uživatel na hlavní stránce, proveď smooth scroll
            if (window.location.pathname.includes('index.html')) {
                e.preventDefault();
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}
