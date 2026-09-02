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
      text: 'Napište mi jednu větu o tom, kde stojíte. Odpovím do hodiny, mezi osmou a osmou, zdarma a bez závazku — i když si to nakonec postavíte celé sami.',
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
              '<p>Odpovím vám do hodiny, mezi osmou a osmou. Smlouvu zatím nepodepisujte — po podpisu už nemáte co nabídnout výměnou.</p>'
      },
      '8': {
        zprava: 'Zájem o garantovaný nájem — z Cihly 8 (Nájemník).',
        done: '<h3>Mám to.</h3>' +
              '<p>Podívám se na lokalitu i na to, za kolik se tam pronajímá, a napíšu vám rovnou, jestli by se vám garance vyplatila — i kdyby vyšlo, že ne.</p>'
      },
      '10': {
        zprava: 'Zájem o další krok po dokončení výcviku — z Cihly 10 (Růst).',
        done: '<h3>Mám to. Odpovím do hodiny, mezi osmou a osmou.</h3>' +
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

    /* ─────────────────────────────────────────────
       BRÁNY V KAPITOLÁCH — VÝSLEDEK NÁSTROJE NA E-MAIL

       Původně těchhle devět bran slibovalo „dám vám vědět, až bude venku
       další cihla". Všech deset cihel je ale venku, takže ta nabídka byla
       prázdná: čtenář vyplňoval e-mail za něco, co si mohl rozkliknout.

       Nabízejí proto to jediné, co v tu chvíli existuje a co si sám nikam
       neuloží — jeho vlastní výsledek z nástroje nad formulářem. Nástroj
       ho vydá v window.MilionaremVystup; kdo nástroj nevyplnil, nemá co
       posílat a dozví se to.
       ───────────────────────────────────────────── */
    // Název nástroje je tady, ne z titulku widgetu: kontrolní seznamy jsou
    // poskládané z několika widgetů a titulek prvního z nich by v e-mailu
    // pojmenoval jen jeho část.
    var VYSLEDKY = [
      { klic: 'mapa',      cihla: '1', nastroj: 'Mapa cihel' },
      { klic: 'strop',     cihla: '2', nastroj: 'Finanční strop' },
      { klic: 'lokality',  cihla: '3', nastroj: 'Srovnání lokalit' },
      { klic: 'proverka',  cihla: '4', nastroj: 'Prověrka před koupí' },
      { klic: 'rezervace', cihla: '5', nastroj: 'Kontrola rezervační smlouvy' },
      { klic: 'cerpani',   cihla: '6', nastroj: 'Harmonogram čerpání' },
      { klic: 'vybaveni',  cihla: '7', nastroj: 'Rozpočet na vybavení' },
      { klic: 'najemnik',  cihla: '8', nastroj: 'Výběr nájemníka' },
      { klic: 'sprava',    cihla: '9', nastroj: 'Paušál vs. skutečné výdaje' }
    ];

    // Výsledek se čte z vykreslené stránky, ne z každého nástroje zvlášť.
    // Všech devět jich staví výstup ze stejných tříd kitu, takže jeden
    // čtenář je obslouží všechny — a další nástroj bude fungovat sám od
    // sebe, aniž by se sem sahalo.
    function nastrojBox() {
      var boxy = document.querySelectorAll('.vy-widget');
      for (var i = 0; i < boxy.length; i++) {
        if (boxy[i].querySelector('.sim-headline__num, .sim-stat__value, .vy-result__value, .vy-progress__count')) {
          return boxy[i];
        }
      }
      return null;
    }

    function text(el) {
      return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
    }

    // Metadata leadu berou jen řetězce a ořezávají na 500 znaků, takže
    // výstup posíláme jako předrenderovaný text, ne jako strukturu.
    function vystupText(box) {
      if (!box) return '';
      var radky = [];

      var hl = box.querySelector('.sim-headline');
      if (hl) {
        radky.push(text(hl.querySelector('.sim-headline__label')) + ': ' +
                   text(hl.querySelector('.sim-headline__num')));
      }

      var dvojice = [
        ['.sim-stat', '.sim-stat__label', '.sim-stat__value'],
        ['.vy-result', '.vy-result__label', '.vy-result__value'],
        // Kontrolní seznamy v cihlách 4, 5 a 8 nemají statistiky, ale postup.
        ['.vy-progress__row', '.vy-progress__label', '.vy-progress__count']
      ];
      dvojice.forEach(function (d) {
        Array.prototype.forEach.call(box.querySelectorAll(d[0]), function (el) {
          var l = text(el.querySelector(d[1])), v = text(el.querySelector(d[2]));
          if (l && v) radky.push(l + ': ' + v);
        });
      });

      // Závěr nástroje jde na konec jako věta, ne jako dvojice.
      var verdikt = box.querySelector('.vy-verdict strong, .sim-headline__sub');
      if (verdikt) radky.push(text(verdikt));

      if (!radky.length) return '';
      return radky.slice(0, 8).join('\n').slice(0, 480);
    }



    VYSLEDKY.forEach(function (v) {
      var form = document.getElementById('milionarem-' + v.klic + '-form');
      if (!form) return;

      var msg = form.querySelector('.vy-gate__msg');
      var btn = form.querySelector('button[type="submit"]');

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var jmenoEl = form.querySelector('input[name="name"]');
        var emailEl = form.querySelector('input[type="email"]');
        var consent = form.querySelector('input[type="checkbox"]');
        var jmeno = jmenoEl ? jmenoEl.value.trim() : '';
        var email = emailEl ? emailEl.value.trim() : '';

        if (!jmeno) {
          return HubCTA.showMsg(msg, 'Napište mi prosím jméno, ať vím, komu píšu.', 'error', jmenoEl);
        }
        if (!HubCTA.isEmail(email)) {
          return HubCTA.showMsg(msg, 'Zadejte prosím platnou e-mailovou adresu.', 'error', emailEl);
        }
        if (consent && !consent.checked) {
          return HubCTA.showMsg(msg, 'Pro odeslání potřebuji souhlas se zpracováním údajů.', 'error', consent);
        }

        var box = nastrojBox();
        var vystup = vystupText(box);
        var nastroj = v.nastroj;
        if (!vystup) {
          // Slibovat výsledek někomu, kdo nástroj nevyplnil, by znamenalo
          // poslat mu prázdný e-mail. Radši ho pošleme o kus výš.
          return HubCTA.showMsg(msg,
            'Nejdřív prosím vyplňte nástroj nad formulářem — bez vašich čísel nemám co poslat.');
        }

        var puvodni = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Odesílám…'; }

        HubCTA.sendLead({
          form: 'milionarem-' + v.klic,
          name: jmeno,
          email: email,
          message: 'Výsledek nástroje „' + nastroj + '" z Cihly ' + v.cihla + ':\n\n' + vystup,
          meta: { cihla: v.cihla, nastroj: nastroj, vystup: vystup, segment: 'investor' }
        }).then(function () {
          form.innerHTML =
            '<div class="vy-gate__done">' + HOTOVO +
              '<h3>Poslal jsem vám to.</h3>' +
              '<p>Váš výsledek máte v e-mailu, ať se k němu můžete vrátit, až ho budete ' +
              'potřebovat. Kdyby nedorazil, mrkněte do hromadné pošty.</p>' +
              '<p>Až budete mít konkrétní byt, napište — podívám se na něj a řeknu vám, ' +
              'co bych na něm řešil dřív než cenu.</p>' +
            '</div>';
          HubCTA.track('milionarem_vysledek', {
            event_category: 'lead',
            event_label: 'cihla_' + v.cihla
          });
          if (window.fbq) window.fbq('track', 'Lead', { content_name: 'milionarem-' + v.klic });
        }).catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = puvodni; }
          HubCTA.showMsg(msg, 'Něco se nepodařilo odeslat. Zkuste to prosím znovu, nebo mi ' +
                              'napište na david.choc@ptf.cz.');
        });
      });
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

  });
})();
