// Cookie Consent Banner
document.addEventListener('DOMContentLoaded', function() {
    // Funkce pro nastavení cookies
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    // Funkce pro získání hodnoty cookie
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Kontrola, zda již existuje souhlas s cookies
    const consent = getCookie('cookie-consent');
    
    // Pokud neexistuje souhlas, zobrazí cookie banner
    if (!consent) {
        // Vytvoření cookie banneru
        const cookieBanner = document.createElement('div');
        cookieBanner.id = 'cookie-consent-banner';
        cookieBanner.innerHTML = `
            <div class="cookie-container">
                <div class="cookie-text">
                    <p>Tento web používá cookies pro zlepšení vašeho zážitku z prohlížení. 
                    Používáním tohoto webu souhlasíte s naším <a href="cookies-policy.html">použitím cookies</a>.</p>
                </div>
                <div class="cookie-buttons">
                    <button id="cookie-accept" class="cookie-btn accept">Přijmout všechny</button>
                    <button id="cookie-deny" class="cookie-btn deny">Pouze nezbytné</button>
                    <button id="cookie-settings" class="cookie-btn settings">Nastavení</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(cookieBanner);
        
        // Stylování cookie banneru
        const style = document.createElement('style');
        style.textContent = `
            #cookie-consent-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background-color: rgba(26, 26, 26, 0.95);
                color: #fff;
                padding: 20px;
                z-index: 9999;
                box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                border-top: 2px solid #FFBF00;
            }
            
            .cookie-container {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                align-items: center;
            }
            
            .cookie-text {
                flex: 1;
                min-width: 280px;
                margin-right: 20px;
                margin-bottom: 10px;
            }
            
            .cookie-text a {
                color: #FFBF00;
                text-decoration: none;
            }
            
            .cookie-text a:hover {
                text-decoration: underline;
            }
            
            .cookie-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .cookie-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.3s, transform 0.2s;
            }
            
            .cookie-btn:hover {
                transform: translateY(-2px);
            }
            
            .cookie-btn.accept {
                background-color: #FFBF00;
                color: #1A1A1A;
            }
            
            .cookie-btn.accept:hover {
                background-color: #e6ad00;
            }
            
            .cookie-btn.deny {
                background-color: #333;
                color: #fff;
            }
            
            .cookie-btn.deny:hover {
                background-color: #444;
            }
            
            .cookie-btn.settings {
                background-color: transparent;
                color: #fff;
                border: 1px solid #FFBF00;
            }
            
            .cookie-btn.settings:hover {
                background-color: rgba(255, 191, 0, 0.1);
            }
            
            @media (max-width: 768px) {
                .cookie-container {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .cookie-text {
                    margin-right: 0;
                    margin-bottom: 15px;
                }
                
                .cookie-buttons {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(style);
        
        // Event Listeners pro tlačítka
        document.getElementById('cookie-accept').addEventListener('click', function() {
            setCookie('cookie-consent', 'all', 365);
            document.getElementById('cookie-consent-banner').remove();
            // Zde můžete aktivovat všechny cookies a analytické nástroje
        });
        
        document.getElementById('cookie-deny').addEventListener('click', function() {
            setCookie('cookie-consent', 'necessary', 365);
            document.getElementById('cookie-consent-banner').remove();
            // Zde byste měli deaktivovat nepovinné cookies
        });
        
        document.getElementById('cookie-settings').addEventListener('click', function() {
            // Přesměrování na stránku s nastavením cookies
            window.location.href = 'cookies-policy.html';
        });
    }
});
