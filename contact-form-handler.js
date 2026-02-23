// Kontaktní formulář handler - nahrazuje ECM Widget
(function() {
  const CONTAINER_ID = 'f-21-125ab233e4603d4d7c84f5cbf8130258';
  
  function createForm() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    container.innerHTML = `
      <form id="contact-form" class="contact-form-custom">
        <div class="form-group">
          <label for="contact-name">Jméno a příjmení *</label>
          <input type="text" id="contact-name" name="name" required placeholder="Jan Novák">
        </div>
        
        <div class="form-group">
          <label for="contact-email">E-mail *</label>
          <input type="email" id="contact-email" name="email" required placeholder="jan@example.com">
        </div>
        
        <div class="form-group">
          <label for="contact-phone">Telefon</label>
          <input type="tel" id="contact-phone" name="phone" placeholder="+420 123 456 789">
        </div>
        
        <div class="form-group">
          <label for="contact-message">Zpráva *</label>
          <textarea id="contact-message" name="message" required placeholder="Mám zájem o vaše služby..."></textarea>
        </div>
        
        <div class="form-group">
          <label class="consent">
            <input type="checkbox" name="gdpr" required>
            Souhlasím se zpracováním osobních údajů podle <a href="/osobni-udaje.html" target="_blank">zásad ochrany osobních údajů</a>
          </label>
        </div>
        
        <button type="submit" class="cta-button">Odeslat zprávu</button>
        
        <div class="form-message" style="display:none; margin-top: 1rem;"></div>
      </form>
    `;

    injectStyles();
    attachFormHandler();
  }

  function injectStyles() {
    if (document.getElementById('contact-form-style')) return;
    
    const css = `
      #${CONTAINER_ID} { background:#fff; padding: 16px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
      #${CONTAINER_ID} .form-group { margin-bottom: 16px; }
      #${CONTAINER_ID} label { display:block; margin-bottom: 6px; color:#111; font-weight:600; font-size: 14px; }
      #${CONTAINER_ID} input, #${CONTAINER_ID} textarea, #${CONTAINER_ID} select { 
        width:100%; 
        box-sizing:border-box; 
        border:1px solid #e5e5e5; 
        border-radius:12px; 
        padding:12px 14px; 
        background:#fff; 
        color:#111; 
        font: inherit; 
        line-height:1.4; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
      }
      #${CONTAINER_ID} textarea { min-height: 120px; resize: vertical; }
      #${CONTAINER_ID} input:focus, #${CONTAINER_ID} textarea:focus { 
        outline:none; 
        border-color:#FFBF00; 
        box-shadow: 0 0 0 4px rgba(255,191,0,0.18); 
      }
      #${CONTAINER_ID} .consent { 
        display: flex; 
        align-items: flex-start; 
        gap: 8px; 
        font-size: 0.9rem; 
        color: #444; 
        font-weight: normal;
      }
      #${CONTAINER_ID} .consent input[type="checkbox"] { 
        width: auto; 
        margin-top: 3px;
        flex-shrink: 0;
      }
      #${CONTAINER_ID} .consent a { color: #FFBF00; text-decoration: underline; }
      #${CONTAINER_ID} button[type="submit"] {
        width: 100%;
        margin-top: 8px;
      }
      #${CONTAINER_ID} button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      #${CONTAINER_ID} .form-message {
        padding: 12px;
        border-radius: 8px;
        font-size: 14px;
      }
      #${CONTAINER_ID} .form-message.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      #${CONTAINER_ID} .form-message.error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
    `;
    
    const style = document.createElement('style');
    style.id = 'contact-form-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function attachFormHandler() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const API_URL = 'https://api-production-88cf.up.railway.app/api/v1/public/api-leads/submit';
    const API_KEY = 'rv_live_56bf805da8b9078ad650e0a6de346401ce7da6281146ea2f';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const messageDiv = form.querySelector('.form-message');
      const originalText = submitBtn.textContent;
      
      // Disable form
      submitBtn.disabled = true;
      submitBtn.textContent = 'Odesílám...';
      messageDiv.style.display = 'none';
      
      // Get form data
      const formData = new FormData(form);
      const name = formData.get('name').trim();
      const email = formData.get('email').trim();
      const phone = formData.get('phone').trim();
      const message = formData.get('message').trim();

      // Split name into firstName + lastName
      const parts = name.split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      const payload = {
        firstName,
        lastName,
        email,
        phone,
        message,
        data: {
          source: 'davidchoc.com',
          campaign: 'davidchoc-website',
          pipeline: 'kontaktni-formu-87433'
        }
      };

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          // Success
          messageDiv.className = 'form-message success';
          messageDiv.textContent = 'Děkujeme! Vaše zpráva byla úspěšně odeslána. Brzy se vám ozveme.';
          messageDiv.style.display = 'block';
          
          // Reset form
          form.reset();
          
          // Google Analytics event
          if (window.gtag) {
            window.gtag('event', 'contact_submit', {
              event_category: 'contact',
              event_label: 'index_contact_form'
            });
          }
          
          // Facebook Pixel event
          if (window.fbq) {
            window.fbq('track', 'Contact');
          }
        } else {
          const errorData = await response.json();
          console.error('API error:', errorData);
          throw new Error('API error');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Omlouváme se, došlo k chybě při odesílání. Zkuste to prosím znovu nebo nás kontaktujte telefonicky.';
        messageDiv.style.display = 'block';
      } finally {
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createForm);
  } else {
    createForm();
  }
})();
