// Mobile navigation menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Lazy loading videí
    const heroVideo = document.getElementById('hero-video');
    const missionVideo = document.getElementById('mission-video');
    
    if (heroVideo) {
        // Změníme atribut preload na 'none' pomocí JavaScriptu
        // protože někteří prohlížeče ignorují preload='metadata' v HTML
        heroVideo.preload = 'none';
        
        // Nastavení původního src atributu videa
        const videoSource = heroVideo.querySelector('source');
        const originalSrc = videoSource.getAttribute('src');
        
        // Odstraníme src aby se video nezačalo automaticky stahovat
        videoSource.removeAttribute('src');
        
        // Observer pro lazy loading
        const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Pokud je hero sekce viditelná, načteme video
                    videoSource.setAttribute('src', originalSrc);
                    heroVideo.load();
                    heroVideo.play().catch(e => console.log('Automatické přehrávání není povoleno: ', e));
                    
                    // Efekt ztmavení a znovu objevení videa po skončení
                    heroVideo.addEventListener('ended', function() {
                        // Ztmavit video
                        heroVideo.style.transition = 'opacity 0.7s ease';
                        heroVideo.style.opacity = '0';
                        
                        // Po chvíli znovu objevit a přehrát
                        setTimeout(function() {
                            heroVideo.currentTime = 0; // Restart videa
                            heroVideo.play();
                            // Znovu zobrazit video s animací
                            setTimeout(function() {
                                heroVideo.style.opacity = '1';
                            }, 100);
                        }, 800);
                    });
                    
                    // Přestaneme sledovat, protože už jsme video načetli
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 }); // Spustí se, když je viditelných 10% hero sekce
        
        // Začneme sledovat hero sekci
        lazyLoadObserver.observe(document.querySelector('.hero'));
    }
    
    // Lazy loading pro video v sekci mise
    if (missionVideo) {
        missionVideo.preload = 'none';
        
        // Nastavení původního src atributu videa
        const videoSource = missionVideo.querySelector('source');
        const originalSrc = videoSource.getAttribute('src');
        
        // Odstraníme src aby se video nezačalo automaticky stahovat
        videoSource.removeAttribute('src');
        
        // Observer pro lazy loading
        const missionVideoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Pokud je sekce mise viditelná, načteme video
                    videoSource.setAttribute('src', originalSrc);
                    missionVideo.load();
                    missionVideo.play().catch(e => console.log('Automatické přehrávání není povoleno: ', e));
                    
                    // Přestaneme sledovat
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '100px' });
        
        // Začneme sledovat sekci mise
        missionVideoObserver.observe(document.querySelector('.mission-section'));
    }
    // Mobilní navigace
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
    
    // Plynulý scroll na kotvy
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== "#") {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Aktivace navigace při scrollu
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Načítání médií a optimalizace
    const mediaItems = document.querySelectorAll('.media-item');
    mediaItems.forEach((item, index) => {
        // Přidat zpožděné načítání pro kaskádový efekt
        setTimeout(() => {
            item.classList.add('loaded');
        }, index * 150);
    });
    
    // Přehrávání videa při najetí myší v sekci Videoprohlídka
    const videoContainer = document.getElementById('videoContainer');
    const promoVideo = document.getElementById('promoVideo');
    
    if (videoContainer && promoVideo) {
        // Přehrání videa při najetí
        videoContainer.addEventListener('mouseenter', function() {
            promoVideo.play();
            videoContainer.classList.add('playing');
        });

        // Zastavení videa při odjezdu myši
        videoContainer.addEventListener('mouseleave', function() {
            promoVideo.pause();
            videoContainer.classList.remove('playing');
        });

        // Kliknutí na video
        videoContainer.addEventListener('click', function() {
            if (promoVideo.paused) {
                promoVideo.play();
                videoContainer.classList.add('playing');
            } else {
                promoVideo.pause();
                videoContainer.classList.remove('playing');
            }
        });

        // Nastavení autoplay pomocí Intersection Observer
        // Přehraje video, když je v zorném poli
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    promoVideo.play().catch(e => console.log('Automatické přehrávání není povoleno: ', e));
                    videoContainer.classList.add('playing');
                } else {
                    promoVideo.pause();
                    videoContainer.classList.remove('playing');
                }
            });
        }, { threshold: 0.5 });

        videoObserver.observe(videoContainer);
    }
});
