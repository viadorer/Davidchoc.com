// HUB KIT — knihovna interaktivních nástrojů obsahových sekcí.
// Checklisty, formulářová pole, formátování čísel. Vše se ukládá do
// localStorage — žádná registrace, žádné odesílání dat.
//
// Sekci, pod kterou se hlásí události do GA, nastavuje stránka:
//     <body data-hub-section="investice">
// Bez toho se použije "hub".
(function (global) {
  'use strict';

  var HubTools = {};

  // Název sekce pro události v Google Analytics.
  // Čte se až při použití — skript může být v hlavičce, kde <body> ještě není.
  HubTools.section = function () {
    var b = document.body;
    return (b && b.getAttribute('data-hub-section')) || 'hub';
  };

  function safeGet(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* private mode nebo plná kvóta — tiše ignorujeme */ }
  }

  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  /**
   * Checklist s ukládáním stavu.
   * opts:
   *   storageKey  – klíč do localStorage (povinné)
   *   container   – selektor obalu s checkboxy (povinné)
   *   countEl     – selektor prvku pro počet hotových (volitelné)
   *   totalEl     – selektor prvku pro celkový počet (volitelné)
   *   fillEl      – selektor progress baru (volitelné)
   *   resetEl     – selektor tlačítka pro vymazání (volitelné)
   *   doneClass   – třída přidaná rodiči při zaškrtnutí (volitelné)
   *   doneTarget  – selektor rodiče, na který se třída přidá (volitelné)
   *   onChange    – callback(done, total) (volitelné)
   *   gaEvent     – název GA eventu při dokončení všeho (volitelné)
   */
  HubTools.initChecklist = function (opts) {
    var root = document.querySelector(opts.container);
    if (!root) return;

    var boxes = Array.prototype.slice.call(
      root.querySelectorAll('input[type="checkbox"][data-key]')
    );
    if (!boxes.length) return;

    var total = boxes.length;
    var state = safeGet(opts.storageKey);
    var countEl = opts.countEl ? document.querySelector(opts.countEl) : null;
    var totalEl = opts.totalEl ? document.querySelector(opts.totalEl) : null;
    var fillEl = opts.fillEl ? document.querySelector(opts.fillEl) : null;
    var resetEl = opts.resetEl ? document.querySelector(opts.resetEl) : null;
    var firedComplete = false;

    function parentOf(box) {
      if (!opts.doneTarget) return null;
      return box.closest(opts.doneTarget);
    }

    function render() {
      var done = 0;

      boxes.forEach(function (box) {
        if (box.checked) done++;
        var parent = parentOf(box);
        if (parent && opts.doneClass) {
          parent.classList.toggle(opts.doneClass, box.checked);
        }
      });

      if (countEl) countEl.textContent = String(done);
      if (totalEl) totalEl.textContent = String(total);
      if (fillEl) fillEl.style.width = (total ? (done / total) * 100 : 0) + '%';
      if (typeof opts.onChange === 'function') opts.onChange(done, total);

      if (done === total && !firedComplete) {
        firedComplete = true;
        if (opts.gaEvent && global.gtag) {
          global.gtag('event', opts.gaEvent, {
            event_category: HubTools.section(),
            event_label: 'completed'
          });
        }
      }
      if (done < total) firedComplete = false;
    }

    // Obnovit uložený stav
    boxes.forEach(function (box) {
      var key = box.getAttribute('data-key');
      if (state[key]) box.checked = true;
    });

    root.addEventListener('change', function (e) {
      var box = e.target;
      if (!box.matches || !box.matches('input[type="checkbox"][data-key]')) return;
      var key = box.getAttribute('data-key');
      if (box.checked) {
        state[key] = true;
      } else {
        delete state[key];
      }
      safeSet(opts.storageKey, state);
      render();
    });

    if (resetEl) {
      resetEl.addEventListener('click', function () {
        if (!confirm('Opravdu vymazat celý postup? Tuto akci nelze vrátit.')) return;
        state = {};
        safeRemove(opts.storageKey);
        boxes.forEach(function (box) { box.checked = false; });
        render();
      });
    }

    render();
  };

  /**
   * Textová pole s ukládáním (poznámky, hodnoty do formulářů).
   * opts:
   *   storageKey – klíč do localStorage (povinné)
   *   container  – selektor obalu (povinné)
   *   resetEl    – selektor tlačítka pro vymazání (volitelné)
   */
  HubTools.initFields = function (opts) {
    var root = document.querySelector(opts.container);
    if (!root) return;

    var fields = Array.prototype.slice.call(
      root.querySelectorAll('[data-field]')
    );
    if (!fields.length) return;

    var state = safeGet(opts.storageKey);

    fields.forEach(function (field) {
      var key = field.getAttribute('data-field');
      if (state[key] != null) field.value = state[key];
    });

    root.addEventListener('input', function (e) {
      var field = e.target;
      if (!field.matches || !field.matches('[data-field]')) return;
      var key = field.getAttribute('data-field');
      if (field.value) {
        state[key] = field.value;
      } else {
        delete state[key];
      }
      safeSet(opts.storageKey, state);
      if (typeof opts.onChange === 'function') opts.onChange(state);
    });

    if (opts.resetEl) {
      var resetBtn = document.querySelector(opts.resetEl);
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          if (!confirm('Opravdu vymazat vyplněné údaje?')) return;
          state = {};
          safeRemove(opts.storageKey);
          fields.forEach(function (field) { field.value = ''; });
          if (typeof opts.onChange === 'function') opts.onChange(state);
        });
      }
    }

    if (typeof opts.onChange === 'function') opts.onChange(state);
  };

  /** Formátování čísla na české tisíce: 4850000 → "4 850 000" */
  HubTools.formatNumber = function (num) {
    if (num == null || isNaN(num)) return '';
    return Math.round(num).toLocaleString('cs-CZ').replace(/ /g, ' ');
  };

  /** Parsování uživatelského vstupu: "4 850 000 Kč" → 4850000 */
  HubTools.parseNumber = function (str) {
    if (str == null) return NaN;
    var cleaned = String(str).replace(/[^\d,.-]/g, '').replace(/\s/g, '').replace(',', '.');
    var num = parseFloat(cleaned);
    return isNaN(num) ? NaN : num;
  };

  global.HubTools = HubTools;
  // Výcvik knihovnu volá pod původním jménem — alias, ať se nemusí přepisovat.
  global.VycvikTools = HubTools;
})(window);
