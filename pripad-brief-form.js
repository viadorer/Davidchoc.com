// Multi-step formulář "Brief pro agenta" — Případ pro agenta
// Posílá data na stávající Railway endpoint se sourcem pripad-pro-agenta.
(function () {
  const form = document.getElementById('brief-form');
  if (!form) return;

  const API_URL = 'https://api-production-88cf.up.railway.app/api/v1/public/api-leads/submit';
  const API_KEY = 'rv_live_56bf805da8b9078ad650e0a6de346401ce7da6281146ea2f';
  const STORAGE_KEY = 'pripad-brief-state';

  const steps = Array.from(form.querySelectorAll('.pripad-brief__step'));
  const progressBar = form.parentElement.querySelector('.pripad-brief__progress-bar');
  const progressLabels = form.parentElement.querySelectorAll('.pripad-brief__progress-labels span');
  const errorBox = form.querySelector('.pripad-brief__error');

  let currentStep = 1;
  const state = restoreState() || { propertyType: '', caseType: '' };

  function restoreState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Pre-fill radios pokud existují
      if (parsed.propertyType) {
        const r = form.querySelector(`input[name="propertyType"][value="${parsed.propertyType}"]`);
        if (r) r.checked = true;
      }
      if (parsed.caseType) {
        const r = form.querySelector(`input[name="caseType"][value="${parsed.caseType}"]`);
        if (r) r.checked = true;
      }
      return parsed;
    } catch (e) { return null; }
  }

  function persistState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  function clearState() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function showStep(n) {
    steps.forEach(s => {
      const isMatch = String(s.dataset.step) === String(n);
      s.hidden = !isMatch;
    });

    if (n === 'done') {
      progressBar.parentElement.style.display = 'none';
      return;
    }

    progressBar.parentElement.style.display = '';
    progressBar.setAttribute('data-step', String(n));
    progressLabels.forEach((label, i) => {
      label.classList.toggle('active', i + 1 <= Number(n));
    });
    currentStep = Number(n);

    // GA event per krok
    if (window.gtag) {
      window.gtag('event', 'brief_step_' + n, {
        event_category: 'pripad_form',
      });
    }
  }

  function validateCurrentStep() {
    if (currentStep === 1) {
      const v = form.querySelector('input[name="propertyType"]:checked');
      if (!v) {
        showError('Vyberte prosím typ nemovitosti.');
        return false;
      }
      state.propertyType = v.value;
    } else if (currentStep === 2) {
      const v = form.querySelector('input[name="caseType"]:checked');
      if (!v) {
        showError('Vyberte prosím, co potřebujete vyřešit.');
        return false;
      }
      state.caseType = v.value;
    } else if (currentStep === 3) {
      const name = form.querySelector('#brief-name').value.trim();
      const phone = form.querySelector('#brief-phone').value.trim();
      const email = form.querySelector('#brief-email').value.trim();
      const gdpr = form.querySelector('input[name="gdpr"]').checked;
      if (!name) { showError('Vyplňte prosím jméno.'); return false; }
      if (!phone) { showError('Vyplňte prosím telefon.'); return false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('Zadejte platnou e-mailovou adresu.');
        return false;
      }
      if (!gdpr) { showError('Pro odeslání je nutný souhlas se zpracováním údajů.'); return false; }
    }
    hideError();
    persistState();
    return true;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  // Navigace
  form.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'next') {
      if (!validateCurrentStep()) return;
      showStep(currentStep + 1);
    } else if (action === 'back') {
      hideError();
      showStep(currentStep - 1);
    }
  });

  // Auto-pokračování po výběru radia (UX zlepšení — krok 1 a 2)
  form.addEventListener('change', (e) => {
    if (e.target.name === 'propertyType' && currentStep === 1) {
      state.propertyType = e.target.value;
      persistState();
      setTimeout(() => { if (currentStep === 1) showStep(2); }, 220);
    } else if (e.target.name === 'caseType' && currentStep === 2) {
      state.caseType = e.target.value;
      persistState();
      setTimeout(() => { if (currentStep === 2) showStep(3); }, 220);
    }
  });

  // Odeslání
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Odesílám…';
    hideError();

    const name = form.querySelector('#brief-name').value.trim();
    const phone = form.querySelector('#brief-phone').value.trim();
    const email = form.querySelector('#brief-email').value.trim();
    const message = form.querySelector('#brief-message').value.trim();

    const parts = name.split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    const labelMap = {
      propertyType: { byt: 'Byt', dum: 'Dům', pozemek: 'Pozemek', komercni: 'Komerční prostor', jine: 'Něco jiného / nevím' },
      caseType: { prodat: 'Prodat', koupit: 'Koupit', pronajmout: 'Pronajmout', ocenit: 'Ocenit', komplikovany: 'Komplikovanější případ', zvazuji: 'Zatím jen zvažuji' },
    };

    const composedMessage =
      `Typ nemovitosti: ${labelMap.propertyType[state.propertyType] || state.propertyType}\n` +
      `Případ: ${labelMap.caseType[state.caseType] || state.caseType}\n\n` +
      (message ? `Popis:\n${message}` : 'Popis: (nevyplněn)');

    const payload = {
      firstName,
      lastName,
      email,
      phone,
      message: composedMessage,
      data: {
        source: 'pripad-pro-agenta',
        campaign: 'davidchoc-website',
        pipeline: 'pripad-pro-agenta',
        propertyType: state.propertyType,
        caseType: state.caseType,
      },
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('API error ' + response.status);

      // Success
      showStep('done');
      clearState();

      if (window.gtag) {
        window.gtag('event', 'brief_submit', {
          event_category: 'pripad_form',
          event_label: state.caseType,
        });
        window.gtag('event', 'conversion', { event_category: 'lead' });
      }
      if (window.fbq) {
        window.fbq('track', 'Lead', { content_name: 'pripad-pro-agenta' });
      }
    } catch (err) {
      console.error('Brief submit error:', err);
      showError('Něco se nepodařilo odeslat. Zkuste to prosím znovu, nebo zavolejte na 774 052 232.');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  // Init — pokud máme sessionStorage od kroku 1/2, posuneme se rovnou na 3
  if (state.propertyType && state.caseType) {
    showStep(3);
  } else if (state.propertyType) {
    showStep(2);
  } else {
    showStep(1);
  }
})();
