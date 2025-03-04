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
    
    // Načtení navigace - zkušení obou možných cest
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        // Nejprve zkusíme předpokládanou cestu
        fetch(commonPath + 'navbar.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Navígace nenalezena na ' + commonPath);
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
                console.log('Zkusíme alternativní cestu:', altPath);
                
                fetch(altPath + 'navbar.html')
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
