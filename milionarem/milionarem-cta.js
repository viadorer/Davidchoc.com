// Konverzní vrstva sekce Chci být milionářem.
// Strojová část je v /common/hub/hub-cta.js — tady jsou jen texty a cesty.
//
// Zásada sekce: čtenář nemá důvod odejít jinam. Všechno se odehrává na té
// stránce, kde právě je.
(function () {
  'use strict';

  window.HubConfig = {
    section: 'milionarem',
    leadApi: '/api/lead',

    help: {
      wrapSelector: '.hub-chapter__wrap, .hub-tool-page__wrap',
      title: 'Nevíte, kde začít?',
      text: 'Napište mi jednu větu o tom, kde stojíte. Odpovím do 24 hodin, zdarma a bez závazku — i když si to nakonec postavíte celé sami.',
      action: { label: 'Napsat', href: 'mailto:david.choc@ptf.cz' },
      phone: { label: '774 052 232', href: 'tel:+420774052232' },
      // Úvod je manifest. Do manifestu se nabídka nevkládá.
      // Na landingu i v manifestu už jedna nabídka je. Druhá vedle ní
      // znamená, že si čtenář nevybere ani jednu.
      skip: ['/milionar', '/milionar/', '/milionar/index.html',
             '/milionarem', '/milionarem/', '/milionarem/index.html']
    }
  };

  var HOTOVO = '<i class="fas fa-circle-check" aria-hidden="true"></i>';

  HubCTA.ready(function () {
    HubCTA.injectHelp();

    // Nabídka pomoci stojí jen tam, kde omyl stojí opravdové peníze a kde
    // už čtenář řeší konkrétní byt: trojka, čtyřka, pětka, osmička a na
    // konci desítka. Jednička a dvojka zůstávají čistě vzdělávací — kdo
    // je čte, ještě nekupuje. Šestka a sedmička patří bance a řemeslníkům,
    // devítka daňovému poradci; tam nabídka nepatří.
    //
    // Formulář je na všech těch stránkách stejný, liší se `data-cihla`.
    var SERVIS = {
      '3': {
        zprava: 'Prosba o pomoc s výběrem bytu — z Cihly 3 (Lokalita).',
        done: '<h3>Mám to.</h3>' +
              '<p>Podívám se na ty byty i na ulice kolem nich a do dvou pracovních dnů vám napíšu, který bych z nich koupil a proč.</p>'
      },
      '4': {
        url: true,
        zprava: 'Prosba o posouzení konkrétního bytu — z Cihly 4 (Prověrka).',
        done: '<h3>Mám ho.</h3>' +
              '<p>Podívám se na katastr, zápisy a fond oprav a do dvou pracovních dnů vám napíšu, co bych řešil dřív než cenu.</p>'
      },
      '5': {
        zprava: 'Prosba o posouzení rezervační smlouvy — z Cihly 5 (Smlouva).',
        done: '<h3>Mám to.</h3>' +
              '<p>Ozvu se vám do 24 hodin. Smlouvu zatím nepodepisujte — po podpisu už nemáte co nabídnout výměnou.</p>'
      },
      '8': {
        zprava: 'Zájem o garantovaný nájem — z Cihly 8 (Nájemník).',
        done: '<h3>Mám to.</h3>' +
              '<p>Podívám se na lokalitu i na to, za kolik se tam pronajímá, a napíšu vám rovnou, jestli by se vám garance vyplatila — i kdyby vyšlo, že ne.</p>'
      },
      '10': {
        zprava: 'Zájem o další krok po dokončení výcviku — z Cihly 10 (Růst).',
        done: '<h3>Mám to. Ozvu se do 24 hodin.</h3>' +
              '<p>Napište si zatím jedno číslo: kolik vám vyšlo v kalkulačce uvolněného kapitálu. Od něj se bude odvíjet celý hovor.</p>'
      }
    };

    var servisEl = document.getElementById('milionarem-servis-form');
    var servis = servisEl && SERVIS[servisEl.getAttribute('data-cihla')];
    if (servis) {
      var cihla = servisEl.getAttribute('data-cihla');
      HubCTA.initGateById('milionarem-servis-form', {
        fields: { name: true, url: servis.url === true },
        leadForm: 'milionarem-servis',
        message: function (d) {
          var t = servis.zprava;
          if (d.url) t += '\n\nOdkaz: ' + d.url;
          if (d.note) t += '\n\n' + d.note;
          return t;
        },
        // Odkazy zapsané do poznámky vytáhne z textu samo /api/lead —
        // tady doplňujeme jen ten z vlastního pole.
        meta: function (d) {
          var m = { cihla: cihla };
          if (d.url) m.listing_url = d.url;
          return m;
        },
        gaEvent: 'milionarem_servis',
        gaLabel: 'cihla_' + cihla,
        msgUrl: 'Vložte prosím celý odkaz na inzerát včetně https://',
        done: HOTOVO + servis.done
      });
    }

    HubCTA.initGateById('milionarem-sprava-form', {
      fields: { name: true },
      leadForm: 'milionarem-sprava',
      message: 'Zájem o další cihly — z Cihly 9 (Správa).',
      meta: { cihla: '9' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_9',
      done: HOTOVO +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude desátá cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

    HubCTA.initGateById('milionarem-najemnik-form', {
      fields: { name: true },
      leadForm: 'milionarem-najemnik',
      message: 'Zájem o další cihly — z Cihly 8 (Nájemník a garance).',
      meta: { cihla: '8' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_8',
      done: HOTOVO +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude devátá cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

    HubCTA.initGateById('milionarem-vybaveni-form', {
      fields: { name: true },
      leadForm: 'milionarem-vybaveni',
      message: 'Zájem o další cihly — z Cihly 7 (Vybavení bytu).',
      meta: { cihla: '7' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_7',
      done: HOTOVO +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude osmá cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

    HubCTA.initGateById('milionarem-cerpani-form', {
      fields: { name: true },
      leadForm: 'milionarem-cerpani',
      message: 'Zájem o další cihly — z Cihly 6 (Úvěr a čerpání).',
      meta: { cihla: '6' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_6',
      done: HOTOVO +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude sedmá cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

    HubCTA.initGateById('milionarem-lokality-form', {
      fields: { name: true },
      leadForm: 'milionarem-lokality',
      message: 'Zájem o další cihly — z Cihly 3 (Srovnání lokalit).',
      meta: { cihla: '3' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_3',
      done: HOTOVO +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude čtvrtá cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

    HubCTA.initGateById('milionarem-proverka-form', {
      fields: { name: true },
      leadForm: 'milionarem-proverka',
      message: 'Zájem o další cihly — z Cihly 4 (Prověrka před koupí).',
      meta: { cihla: '4' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_4',
      done: HOTOVO +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude pátá cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

    HubCTA.initGateById('milionarem-rezervace-form', {
      fields: { name: true },
      leadForm: 'milionarem-rezervace',
      message: 'Zájem o další cihly — z Cihly 5 (Kontrola smlouvy).',
      meta: { cihla: '5' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_5',
      done: HOTOVO +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude šestá cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

    HubCTA.initGateById('milionarem-strop-form', {
      fields: { name: true },
      leadForm: 'milionarem-strop',
      message: 'Zájem o další cihly — z Cihly 2 (Finanční strop).',
      meta: { cihla: '2' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_2',
      done: '<i class="fas fa-circle-check" aria-hidden="true"></i>' +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude třetí cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

    HubCTA.initGateById('milionarem-mapa-form', {
      fields: { name: true },
      leadForm: 'milionarem-mapa',
      message: 'Zájem o další cihly — z Cihly 1 (Mapa cihel).',
      meta: { cihla: '1' },
      gaEvent: 'milionarem_dalsi_cihly',
      gaLabel: 'cihla_1',
      done: '<i class="fas fa-circle-check" aria-hidden="true"></i>' +
        '<h3>Platí.</h3>' +
        '<p>Jakmile bude druhá cihla venku, přijde vám e-mail. Nic jiného od nás nedostanete.</p>'
    });

    /* ─────────────────────────────────────────────
       KONVERZE U VÝSLEDKU SIMULÁTORU

       Jediné místo na webu, kde návštěvník sám od sebe říká, co chce
       koupit a za kolik. Zadání z posuvníků je hotový investiční profil —
       stačí k němu dvě otázky, které rozhodnou, komu se volá dnes.

       Nejde přes HubCTA.initGate, protože slib i typ leadu se mění podle
       těch dvou odpovědí; brána z kitu má obojí pevné. Odesílá se ale
       stejným HubCTA.sendLead, takže atribuce i CRM zůstávají společné.
       ───────────────────────────────────────────── */
    (function () {
      var box = document.getElementById('nabidka');
      if (!box) return;

      var form = document.getElementById('milionarem-simulator-form');
      var kdyEl = document.getElementById('q-kdy');
      var finEl = document.getElementById('q-fin');
      var slibEl = box.querySelector('.js-slib');
      if (!form || !kdyEl || !finEl || !slibEl) return;

      var KDY = { do3m: 'do tří měsíců', doroka: 'do roka', rozhlizim: 'zatím se rozhlíží' };
      var FIN = { mam: 'má vyřízené', resim: 'právě řeší', zatim: 'zatím nic' };
      var SKORE_NAZEV = { horky: 'HORKÝ', vlazny: 'VLAŽNÝ', studeny: 'STUDENÝ' };

      // Konkrétní byty slibujeme jen tomu, komu je opravdu pošleme:
      // kdo kupuje do tří měsíců a financování má nebo řeší. Ostatním
      // slíbíme posouzení jejich zadání — je to míň, ale unese se to.
      function jeHorky() {
        return kdyEl.value === 'do3m' && (finEl.value === 'mam' || finEl.value === 'resim');
      }

      function skore() {
        if (jeHorky()) return 'horky';
        if (kdyEl.value === 'do3m' ||
            (kdyEl.value === 'doroka' && finEl.value !== 'zatim')) return 'vlazny';
        return 'studeny';
      }

      var SLIB_BYTY =
        '<strong>Vyberu tři konkrétní byty</strong>, které tomuhle zadání odpovídají, a u ' +
        'každého napíšu i to, co se mi na něm nelíbí. Do dvou pracovních dnů. Kdyby žádný ' +
        'takový zrovna nebyl, napíšu vám i to.';
      var SLIB_CISLA =
        '<strong>Projdu vaše zadání a napíšu vám, co bych na něm změnil</strong> dřív, než ' +
        'začnete hledat konkrétní byt. Do dvou pracovních dnů, bez závazku.';
      var SLIB_PRAZDNY =
        'Vyberte obě odpovědi — podle nich poznám, co vám bude užitečnější poslat.';

      function prekreslitSlib() {
        if (!kdyEl.value || !finEl.value) {
          slibEl.innerHTML = SLIB_PRAZDNY;
          return;
        }
        slibEl.innerHTML = jeHorky() ? SLIB_BYTY : SLIB_CISLA;
      }

      kdyEl.addEventListener('change', prekreslitSlib);
      finEl.addEventListener('change', prekreslitSlib);
      prekreslitSlib();

      function zprava(sim, s) {
        var r = [];
        r.push('Zadání ze simulátoru — ' + sim.mesto + ', byt za ' +
               sim.cena.toLocaleString('cs-CZ') + ' Kč.');
        r.push('Vlastní zdroje ' + sim.vlastniPct + ' % (' +
               sim.vlastni.toLocaleString('cs-CZ') + ' Kč), LTV ' + sim.ucelLtv +
               ' %, sazba ' + sim.sazba + ' %, splatnost ' + sim.splatnost + ' let.');
        if (sim.dofinancovani > 0) {
          r.push('Potřebuje dofinancovat ' + sim.dofinancovani.toLocaleString('cs-CZ') + ' Kč.');
        }
        r.push('Nájem po srážce ' + sim.najem.toLocaleString('cs-CZ') + ' Kč, splátka ' +
               sim.splatka.toLocaleString('cs-CZ') + ' Kč, cashflow ' +
               sim.cashflow.toLocaleString('cs-CZ') + ' Kč měsíčně.');
        r.push('Čistý majetek za ' + sim.horizont + ' let: ' +
               sim.majetek.toLocaleString('cs-CZ') + ' Kč.' +
               (sim.sobestacnost !== null
                 ? ' Byt se uživí sám v ' + sim.sobestacnost + '. roce.'
                 : ' Do konce horizontu se sám neuživí.'));
        r.push('');
        r.push('Koupě: ' + (KDY[kdyEl.value] || '—') +
               '. Financování: ' + (FIN[finEl.value] || '—') + '.');
        r.push('SKÓRE: ' + (SKORE_NAZEV[s] || s) +
               (s === 'horky' ? ' — slíbeny tři konkrétní byty, volat dnes.'
                              : ' — slíbeno posouzení zadání.'));
        return r.join('\n');
      }

      var msg = form.querySelector('.vy-gate__msg');
      var btn = form.querySelector('button[type="submit"]');

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var emailEl = form.querySelector('input[type="email"]');
        var jmenoEl = form.querySelector('input[name="name"]');
        var consent = form.querySelector('input[type="checkbox"]');
        var email = emailEl.value.trim();
        var jmeno = jmenoEl ? jmenoEl.value.trim() : '';

        if (!jmeno) {
          return HubCTA.showMsg(msg, 'Napište mi prosím jméno, ať vím, komu píšu.', 'error', jmenoEl);
        }
        if (!kdyEl.value) {
          return HubCTA.showMsg(msg, 'Vyberte prosím, kdy to chcete řešit.', 'error', kdyEl);
        }
        if (!finEl.value) {
          return HubCTA.showMsg(msg, 'Vyberte prosím, jak jste na tom s financováním.', 'error', finEl);
        }
        if (!HubCTA.isEmail(email)) {
          return HubCTA.showMsg(msg, 'Zadejte prosím platnou e-mailovou adresu.', 'error', emailEl);
        }
        if (consent && !consent.checked) {
          return HubCTA.showMsg(msg, 'Pro odeslání potřebuji souhlas se zpracováním údajů.', 'error', consent);
        }

        var sim = window.MilionaremSim;
        if (!sim) {
          return HubCTA.showMsg(msg, 'Posuňte prosím nejdřív posuvníky — bez zadání nemám co posílat.');
        }

        var s = skore();
        var horky = s === 'horky';
        var puvodni = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Odesílám…'; }

        HubCTA.sendLead({
          form: horky ? 'milionarem-simulator-byty' : 'milionarem-simulator-cisla',
          name: jmeno,
          email: email,
          message: zprava(sim, s),
          meta: {
            skore: s,
            kdy: kdyEl.value,
            financovani: finEl.value,
            mesto: sim.mesto,
            cena: sim.cena,
            vlastni_pct: sim.vlastniPct,
            vlastni_kc: sim.vlastni,
            ltv: sim.ucelLtv,
            sazba: sim.sazba,
            splatnost: sim.splatnost,
            horizont: sim.horizont,
            najem: sim.najem,
            splatka: sim.splatka,
            cashflow: sim.cashflow,
            dofinancovani: sim.dofinancovani,
            majetek: sim.majetek,
            cena_odkladu: sim.cenaOdkladu,
            segment: 'investor'
          }
        }).then(function () {
          box.innerHTML =
            '<div class="vy-gate__done">' + HOTOVO +
              '<h3>Mám vaše zadání.</h3>' +
              (horky
                ? '<p>Do dvou pracovních dnů vám pošlu tři konkrétní byty, které mu odpovídají — ' +
                  'a u každého i to, co se mi na něm nelíbí. Potvrzení máte v e-mailu; ' +
                  'kdyby nedorazilo, mrkněte do hromadné pošty.</p>'
                : '<p>Do dvou pracovních dnů se na něj podívám a napíšu vám, co bych na něm ' +
                  'změnil. Potvrzení máte v e-mailu; kdyby nedorazilo, mrkněte do hromadné pošty.</p>') +
              '<p>Než se ozvu, hodí se první cihla — je celá jen o přemýšlení a nepotřebujete ' +
              'k ní ani korunu. <a href="/milionarem/cihla-1-plan">Otevřít první cihlu</a></p>' +
            '</div>';

          HubCTA.track('milionarem_simulator_lead', {
            event_category: 'lead',
            event_label: s,
            skore: s,
            mesto: sim.mesto,
            cena: sim.cena
          });
          if (window.fbq) window.fbq('track', 'Lead', { content_name: 'milionarem-simulator' });
        }).catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = puvodni; }
          HubCTA.showMsg(msg, 'Něco se nepodařilo odeslat. Zkuste to prosím znovu, nebo mi ' +
                              'napište na david.choc@ptf.cz.');
        });
      });

      /* MĚŘENÍ — čtyři čísla, nic víc.
         1) dojde vůbec někdo k nabídce, 2) sáhne na posuvníky,
         3) odešle zadání (výš), 4) odejde do cihly. Zbytek se pozná
         až v CRM: kolik zadání skončilo hovorem a kolik zakázkou. */
      if (window.IntersectionObserver) {
        var videno = false;
        var io = new IntersectionObserver(function (zaznamy) {
          zaznamy.forEach(function (z) {
            if (z.isIntersecting && !videno) {
              videno = true;
              HubCTA.track('milionarem_nabidka_videna', { event_category: 'engagement' });
              io.disconnect();
            }
          });
        }, { threshold: 0.4 });
        io.observe(box);
      }
    })();

    var simBox = document.getElementById('simulator');
    if (simBox) {
      var sahnuto = false;
      simBox.addEventListener('input', function () {
        if (sahnuto) return;
        sahnuto = true;
        HubCTA.track('milionarem_simulator_start', { event_category: 'engagement' });
      });
    }

    var cihlyBox = document.querySelector('.hub-bricks');
    if (cihlyBox) {
      cihlyBox.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('.hub-brick') : null;
        if (!a) return;
        HubCTA.track('milionarem_cihla_klik', {
          event_category: 'engagement',
          event_label: a.getAttribute('href') || ''
        });
      });
    }

    HubCTA.initGateById('milionarem-pdf-form', {
      fields: { name: true },
      leadForm: 'milionarem-pdf',
      message: 'Žádost o výcvik Deset zlatých cihel v PDF.',
      gaEvent: 'milionarem_pdf',
      gaLabel: 'vycvik',
      done: HOTOVO +
        '<h3>Mám to. Dám vám vědět.</h3>' +
        '<p>Jakmile bude první cihla venku, přijde vám e-mail. Do té doby od nás nic jiného nedostanete.</p>'
    });
  });
})();
