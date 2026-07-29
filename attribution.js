/**
 * Attribution — zapamatování zdroje návštěvy napříč webem.
 *
 * PROČ EXISTUJE: contact-form-handler.js i vycvik-cta.js četly UTM jen
 * z aktuální adresy (window.location.search). Na webu s 26 podstránkami
 * to znamená, že se zdroj ztratí hned prvním proklikem:
 *
 *   klik z reklamy -> /vycvik/kapitola-1-cena?utm_source=facebook
 *                  -> proklik na /vycvik/diagnostika  (UTM už v adrese není)
 *                  -> odeslání formuláře             -> lead bez zdroje
 *
 * Výsledkem je sloupec „direct", ze kterého se nedá nic vyčíst.
 *
 * PRVNÍ DOTEK, NE POSLEDNÍ. Ukládá se to, co člověka na web přivedlo, a
 * další návštěvy to nepřepíšou. U obsahového webu, kde se lidé vracejí
 * a hledají si značku podruhé přes Google, by poslední dotek přepsal
 * reklamu na „organic" a vypadalo by to, že reklama nefunguje.
 *
 * Ukládá se do localStorage na 90 dní. Nic z toho neopouští prohlížeč,
 * dokud uživatel sám neodešle formulář.
 */
(function (global) {
  'use strict';

  var KLIC = 'dch_attr_v1';
  var PLATNOST_DNI = 90;

  function ted() { return new Date().getTime(); }

  function precistUlozene() {
    try {
      var raw = global.localStorage.getItem(KLIC);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !data.ulozeno) return null;
      if (ted() - data.ulozeno > PLATNOST_DNI * 86400000) {
        global.localStorage.removeItem(KLIC);
        return null;
      }
      return data;
    } catch (e) {
      return null;   // privátní režim nebo zakázané úložiště
    }
  }

  /**
   * Zdroj z adresy. Kromě utm_* bere i gclid a fbclid — placená reklama
   * je často doplňuje sama a bez nich by proklik z Google Ads vypadal
   * jako organický.
   */
  function zAdresy() {
    var p = new URLSearchParams(global.location.search);
    var utm = {};
    ['source', 'medium', 'campaign', 'content', 'term'].forEach(function (k) {
      var v = p.get('utm_' + k);
      if (v) utm[k] = v.slice(0, 120);
    });

    if (!utm.source && p.get('gclid')) { utm.source = 'google'; utm.medium = 'cpc'; }
    if (!utm.source && p.get('fbclid')) { utm.source = 'facebook'; utm.medium = 'social'; }

    // Zkratka pro QR kódy a tištěné materiály: ?src=plachta-radynska
    // se snáz opisuje než čtyři parametry a v tisku se to počítá.
    var src = p.get('src');
    if (!utm.source && src) { utm.source = src.slice(0, 120); utm.medium = 'qr'; }

    return Object.keys(utm).length ? utm : null;
  }

  /** Odkud člověk přišel, když v adrese nic není. */
  function zOdkazu() {
    var ref = global.document.referrer || '';
    if (!ref) return null;
    try {
      var host = new URL(ref).hostname.replace(/^www\./, '');
      if (host === global.location.hostname.replace(/^www\./, '')) return null;  // vlastní web
      if (/google\./.test(host)) return { source: 'google', medium: 'organic' };
      if (/seznam\./.test(host)) return { source: 'seznam', medium: 'organic' };
      if (/facebook\.|fb\./.test(host)) return { source: 'facebook', medium: 'social' };
      if (/instagram\./.test(host)) return { source: 'instagram', medium: 'social' };
      if (/linkedin\./.test(host)) return { source: 'linkedin', medium: 'social' };
      if (/ptf\.cz/.test(host)) return { source: 'ptf.cz', medium: 'referral' };
      return { source: host, medium: 'referral' };
    } catch (e) {
      return null;
    }
  }

  function zachytit() {
    var ulozene = precistUlozene();
    if (ulozene) return ulozene;          // první dotek se nepřepisuje

    var utm = zAdresy() || zOdkazu();
    if (!utm) utm = { source: 'primy', medium: 'none' };

    var data = {
      source: utm.source || '',
      medium: utm.medium || '',
      campaign: utm.campaign || '',
      content: utm.content || '',
      term: utm.term || '',
      // Vstupní stránka je u obsahového webu cennější než kampaň — řekne,
      // která kapitola nebo nástroj člověka přivedl.
      landing: global.location.pathname.slice(0, 200),
      referrer: (global.document.referrer || '').slice(0, 300),
      ulozeno: ted()
    };
    try { global.localStorage.setItem(KLIC, JSON.stringify(data)); } catch (e) { /* nevadí */ }
    return data;
  }

  /**
   * Zdroj pro odeslání s formulářem. Doplňuje `page` — stránku, na které
   * se formulář skutečně odeslal. Rozdíl mezi `landing` a `page` ukazuje,
   * kudy člověk prošel, než se rozhodl napsat.
   */
  function proFormular(nazevFormulare) {
    var a = zachytit();
    return {
      source: a.source,
      medium: a.medium,
      campaign: a.campaign,
      content: a.content,
      term: a.term,
      landing: a.landing,
      page: global.location.pathname,
      form: nazevFormulare || '',
      referrer: a.referrer
    };
  }

  // Zachytit hned při načtení, ať se první dotek uloží i u člověka,
  // který nakonec žádný formulář neodešle — vrátí se za týden a zdroj
  // už bude znát.
  try { zachytit(); } catch (e) { /* nevadí */ }

  global.DchAttribution = { zachytit: zachytit, proFormular: proFormular };
})(window);
