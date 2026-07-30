// HUB KIT — konverzní vrstva obsahových sekcí.
//
// Obsahuje jen strojovou část: odeslání leadu, atribuci zdroje, hlášky
// a dva stavební prvky — patičku pomoci a e-mailovou bránu. Texty ani cesty
// tu nejsou, ty si každá sekce nastaví sama:
//
//     window.HubConfig = {
//       section: 'investice',
//       leadApi: '/api/lead',
//       help: { title, text, action: {label, href}, phone: {label, href}, skip: [] }
//     };
//
// Sekce pak zavolá HubCTA.injectHelp() a HubCTA.initGate(...) — nebo si
// z HubCTA.sendLead() postaví vlastní formulář.
(function (global) {
  'use strict';

  var HubCTA = {};

  function cfg() { return global.HubConfig || {}; }

  // Leady jdou přes vlastní server do CRM PTF — klíče ani adresa CRM
  // nemají co dělat ve zdrojovém kódu stránky.
  function leadApi() { return cfg().leadApi || '/api/lead'; }

  function section() {
    return cfg().section ||
      (document.body && document.body.getAttribute('data-hub-section')) || 'hub';
  }

  /**
   * Zdroj návštěvy. Když je k dispozici attribution.js, bere se PRVNÍ
   * dotek uložený při vstupu na web — jinak by se zdroj ztratil hned
   * prvním proklikem mezi kapitolami a všechny leady by vypadaly jako
   * přímé.
   */
  function utm() {
    if (global.DchAttribution) {
      var a = global.DchAttribution.proFormular();
      if (a && a.source) return a;
    }
    try {
      var p = new URLSearchParams(global.location.search);
      var u = {};
      if (p.get('utm_source')) u.source = p.get('utm_source');
      if (p.get('utm_medium')) u.medium = p.get('utm_medium');
      if (p.get('utm_campaign')) u.campaign = p.get('utm_campaign');
      return u;
    } catch (e) { return {}; }
  }

  HubCTA.utm = utm;

  /* ─────────────────────────────────────────────
     ODESLÁNÍ LEADU
     ───────────────────────────────────────────── */
  function sendLead(data) {
    return fetch(leadApi(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form: data.form,
        name: data.name || '',
        email: data.email,
        phone: data.phone || '',
        message: data.message || '',
        gdpr: true,
        meta: data.meta || {},
        referrer: document.referrer || '',
        utm: utm()
      })
    }).then(function (r) {
      if (!r.ok) {
        return r.json().catch(function () { return {}; }).then(function (t) {
          throw new Error(t.error || ('API ' + r.status));
        });
      }
      return r.json().catch(function () { return {}; });
    });
  }

  HubCTA.sendLead = sendLead;

  /* ─────────────────────────────────────────────
     HLÁŠKY A VALIDACE
     ───────────────────────────────────────────── */
  function showMsg(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = 'vy-gate__msg vy-gate__msg--' + (type || 'error');
    el.hidden = false;
  }

  HubCTA.showMsg = showMsg;
  HubCTA.isEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
  HubCTA.isUrl = function (v) { return /^https?:\/\/.+\..+/.test(v); };

  function track(event, params) {
    if (global.gtag) global.gtag('event', event, params || {});
  }
  HubCTA.track = track;

  /* ─────────────────────────────────────────────
     1) PATIČKA POMOCI — zavírá slepé uličky
     Vkládá se pod obsah kapitoly nebo nástroje. Na stránkách, kde už
     silná nabídka je, se přeskakuje — proto skip.
     ───────────────────────────────────────────── */
  HubCTA.injectHelp = function () {
    var c = cfg().help;
    if (!c) return;

    var wrap = document.querySelector(
      c.wrapSelector || '.hub-chapter__wrap, .hub-tool-page__wrap'
    );
    if (!wrap) return;
    if (wrap.querySelector('.vy-help')) return;

    var path = global.location.pathname;
    var skip = c.skip || [];
    if (skip.some(function (p) { return path === p || path === p + '.html'; })) return;

    var el = document.createElement('div');
    el.className = 'vy-help';
    el.innerHTML =
      '<div class="vy-help__text">' +
        '<strong>' + c.title + '</strong>' +
        '<p>' + c.text + '</p>' +
      '</div>' +
      '<div class="vy-help__actions">' +
        '<a href="' + c.action.href + '" class="vy-help__btn">' + c.action.label + '</a>' +
        (c.phone
          ? '<a href="' + c.phone.href + '" class="vy-help__phone">' +
              '<i class="fas fa-phone" aria-hidden="true"></i> ' + c.phone.label +
            '</a>'
          : '') +
      '</div>';

    var nav = wrap.querySelector('.hub-nav, .vycvik-nav');
    if (nav) wrap.insertBefore(el, nav);
    else wrap.appendChild(el);
  };

  /* ─────────────────────────────────────────────
     2) E-MAILOVÁ BRÁNA
     Jeden formulář, který umí obojí — existující v HTML i vygenerovaný.
     opts:
       form      – element formuláře (povinné)
       leadForm  – hodnota pole "form" v leadu (povinné)
       message   – text zprávy, nebo funkce vracející text
       meta      – objekt navíc, nebo funkce
       gaEvent   – název události pro GA (volitelné)
       fields    – které vstupy jsou povinné: {name:true, email:true, url:false}
       done      – HTML poděkování (nebo funkce dostávající zadaný e-mail)
       sending   – text tlačítka během odesílání
     ───────────────────────────────────────────── */
  HubCTA.initGate = function (opts) {
    var form = opts.form;
    if (!form) return;

    var msg = form.querySelector('.vy-gate__msg');
    var btn = form.querySelector('button[type="submit"]');
    var f = opts.fields || {};

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      function val(sel) {
        var el = form.querySelector(sel);
        return el ? el.value.trim() : '';
      }

      var email = val('input[type="email"]');
      var name = val('input[name="name"], input[name="jmeno"]');
      var url = val('input[name="odkaz"], input[type="url"]');
      var note = val('textarea');
      var consent = form.querySelector('input[type="checkbox"]');

      if (f.name && !name) {
        return showMsg(msg, opts.msgName || 'Napište mi prosím jméno, ať vím, komu píšu.');
      }
      if (f.url && !HubCTA.isUrl(url)) {
        return showMsg(msg, opts.msgUrl || 'Vložte prosím celý odkaz včetně https://');
      }
      if (!HubCTA.isEmail(email)) {
        return showMsg(msg, opts.msgEmail || 'Zadejte prosím platnou e-mailovou adresu.');
      }
      if (consent && !consent.checked) {
        return showMsg(msg, opts.msgConsent || 'Pro odeslání potřebuji souhlas se zpracováním údajů.');
      }

      var original = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = opts.sending || 'Odesílám…';
      }

      var data = { email: email, name: name, url: url, note: note };

      sendLead({
        form: opts.leadForm,
        name: name,
        email: email,
        message: typeof opts.message === 'function' ? opts.message(data) : (opts.message || ''),
        meta: typeof opts.meta === 'function' ? opts.meta(data) : (opts.meta || {})
      }).then(function () {
        var html = typeof opts.done === 'function' ? opts.done(data) : opts.done;
        var target = opts.doneTarget || form;
        target.innerHTML = '<div class="vy-gate__done">' + html + '</div>';

        if (opts.gaEvent) {
          var params = { event_category: 'lead', event_label: opts.gaLabel || section() };
          if (opts.gaParams) {
            for (var k in opts.gaParams) {
              if (Object.prototype.hasOwnProperty.call(opts.gaParams, k)) params[k] = opts.gaParams[k];
            }
          }
          track(opts.gaEvent, params);
        }
        if (global.fbq) global.fbq('track', 'Lead', { content_name: opts.leadForm });
        if (typeof opts.onDone === 'function') opts.onDone(data);
      }).catch(function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = original;
        }
        showMsg(msg, opts.msgError ||
          'Něco se nepodařilo odeslat. Zkuste to prosím znovu, nebo mi napište na david.choc@ptf.cz.');
      });
    });
  };

  /** Zkratka pro formulář, který v HTML už je — stačí jeho id. */
  HubCTA.initGateById = function (id, opts) {
    var form = document.getElementById(id);
    if (!form) return;
    opts.form = form;
    HubCTA.initGate(opts);
  };

  HubCTA.ready = function (fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  global.HubCTA = HubCTA;
})(window);
