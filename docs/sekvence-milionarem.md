# E-mailová sekvence — Chci být milionářem

Navazuje na formuláře sekce `/milionarem` na davidchoc.cz. Cílovka jsou
**kupující**, ne prodávající — mluví se k nim jinak než ve výcviku a nesmí
spadnout do stejné sekvence.

## Jak je to zapojené

Odeslání formuláře udělá tři věci:

1. založí případ v CRM na ptf.cz/admin (`utm_campaign: milionarem`),
2. vloží kontakt do Brevo s atributy,
3. spustí sekvenci — nebo pošle potvrzení z webu, když žádná nesedne.

Sekvenci řídí **CRM**, ne davidchoc.cz. Volá se automaticky z
`leads.routes.ts` při vzniku leadu (`trigger_event: lead_created`).
Statický web nemá kde držet stav ani co by ho po pěti dnech probudilo.

**Dvojí e-mail hlídá kód webu.** `api/lead.js` čte z odpovědi CRM pole
`sequences`; když je větší než nula, vlastní potvrzení neposílá. Krok
s odstupem 0 hodin tedy naše E0 nahrazuje, neduplikuje.

### Podmínka zařazení

```json
{"metadata.kampan": "milionarem"}
```

Ne výčet formulářů. `kampan` se do metadat propisuje z konfigurace
v `api/lead.js`, takže cihly 6 až 10 spadnou do sekvence samy, jakmile
jejich formuláře přibudou — v adminu se sahat nemusí.

Kdyby bylo někdy potřeba rozlišit, odkud člověk přišel, je to v
`metadata.form` (`milionarem-pdf`, `milionarem-mapa`, …) a v
`metadata.cihla` u bran uvnitř kapitol.

## Kroky

| # | Odstup | Klíč šablony | Předmět |
|---|---|---|---|
| 1 | 0 h | `mil-uvod` | Deset zlatých cihel |
| 2 | 48 h (2 dny) | `mil-plan` | Číslo, které vám nikdo neřekne |
| 3 | 120 h (5 dní) | `mil-paka` | Proč se nevyplatí kupovat za hotové |
| 4 | 216 h (9 dní) | `mil-lokalita` | Dva byty, stejná cena, dvojnásobný výnos |
| 5 | 336 h (14 dní) | `mil-proverka` | Hodina, která vám ušetří statisíce |
| 6 | 504 h (21 dní) | `mil-nabidka` | Poslední e-mail ze série |

**Nabídka přijde až šestá.** Prvních pět nese hodnotu a nic nechce. U
člověka, kterému jste tři týdny zdarma posílali, co má dělat, je dřívější
nabídka přiznáním, že to celé byla akvizice.

**Kdo odpoví, vypadne.** Na jakýkoli e-mail, bez výjimky. V adminu
Nastavení → Sekvence → detail → zařazení → *Vyřadit*.

## Nastavení v adminu

1. **Komunikace** → založit šest šablon podle klíčů výše (texty níž).
2. **Nastavení → Sekvence** → nová sekvence, spouštěč *lead_created*,
   podmínka výše. Nová sekvence je vždycky vypnutá.
3. Přidat kroky podle tabulky.
4. V Komunikaci si u každé šablony poslat test na sebe.
5. Teprve pak sekvenci zapnout.

Denní strop sekvence (`daily_cap`) nech na 50. Je to pojistka proti
hromadnému omylu, ne cíl.

---

## Texty

Šablony jsou fragmenty — hlavička, patička a podpis se dosazují z
`base.html`. `{{formalGreeting}}` oslovuje v pátém pádě podle pohlaví,
`{{agentName}}` je podpis z Nastavení → Podpis e-mailů.

### 1 — `mil-uvod` · hned · „Deset zlatých cihel"

```html
<h2>{{formalGreeting}}</h2>

<p>díky. Výcvik se píše a <strong>dám vám vědět, jakmile bude venku další cihla</strong>. Do té doby vám odsud nepřijde žádný newsletter ani upomínka — jen to, co jsem slíbil.</p>

<p>Než se ozvu, udělejte jednu věc. Zabere dvě minuty a je to jediné číslo, které potřebujete, než začnete cokoli počítat:</p>

<p><a href="https://www.davidchoc.cz/milionarem/simulator" class="btn">Spočítat si to na svých číslech</a></p>

<p>Uvidíte, co s vaším majetkem udělá jeden byt za dvacet let — a hlavně kdy se přestane živit z vaší výplaty a začne se živit sám.</p>

<p>Kdyby cokoli, napište. Odpovídám osobně.</p>

<p>{{agentName}}</p>
```

### 2 — `mil-plan` · za 2 dny · „Číslo, které vám nikdo neřekne"

```html
<h2>{{formalGreeting}}</h2>

<p>většina lidí, kteří mi píšou o investiční byt, začíná stejně: pošlou odkaz na inzerát a ptají se, jestli je to dobrá koupě.</p>

<p>Na to se nedá odpovědět. Ne proto, že bych nechtěl — ale protože <strong>dobrá koupě neexistuje sama o sobě.</strong> Existuje jen dobrá koupě pro konkrétního člověka s konkrétním cílem a konkrétním strop, kolik unese.</p>

<p>Proto je první cihla plán, a ne byt. Bez něj kupujete náhodně a poznáte to až za pět let, kdy už se s tím nedá nic dělat.</p>

<p><a href="https://www.davidchoc.cz/milionarem/cihla-1-plan" class="btn">Cihla 1 — Plán, který vás žene</a></p>

<p>Uvnitř je Mapa cihel: vyplníte, kde jste dnes a kam chcete dojít, a spočítá se, kolik bytů to znamená a za jak dlouho. Ukládá se to ve vašem prohlížeči, nikam se to neodesílá.</p>

<p>{{agentName}}</p>
```

### 3 — `mil-paka` · za 5 dní · „Proč se nevyplatí kupovat za hotové"

```html
<h2>{{formalGreeting}}</h2>

<p>tohle je nejtechničtější část celého výcviku a zároveň ta, kde se rozhoduje o největších penězích.</p>

<p>Byt za 4 miliony. Dáte do něj 1,2 milionu vlastních, zbytek banka. Za rok byt zdraží o pět procent, tedy o 200 000 Kč. <strong>Ty dvě stě tisíc nepřipadnou bance — připadnou vám</strong>, protože vlastník jste vy.</p>

<p>Na vašem vkladu je to výnos přes šestnáct procent. Kdybyste stejný byt koupili za hotové, máte pět. Stejný trh, stejný byt, jen čtyřikrát víc vašich peněz v něm.</p>

<p>A funguje to stejně silně i dolů. To je ta část, kterou vám prodejce hypoték sám od sebe neřekne.</p>

<p><a href="https://www.davidchoc.cz/milionarem/cihla-2-penize" class="btn">Cihla 2 — Peníze, které nemáte</a></p>

<p>Na konci kapitoly si spočítáte svůj finanční strop: kolik vám banka reálně půjčí a kolik musíte sehnat sami.</p>

<p>{{agentName}}</p>
```

### 4 — `mil-lokalita` · za 9 dní · „Dva byty, stejná cena, dvojnásobný výnos"

```html
<h2>{{formalGreeting}}</h2>

<p>byt v Praze za 6,5 milionu, nájem 19 000 Kč. Byt v Ostravě za 2,8 milionu, nájem 14 000 Kč.</p>

<p>První vynáší 3,5 procenta ročně, druhý šest. <strong>Rozdíl 2,5 procentního bodu je na téhle investici přes 160 000 Kč ročně</strong> — za dvacet let víc než tři miliony, a to bez započítání růstu nájmu.</p>

<p>Stejná koruna, stejná hypotéka, stejná práce. Jen jinde.</p>

<p>Tím netvrdím, že se má kupovat v Ostravě. Tvrdím, že se rozhodnutí o lokalitě dělá čísly, ne pocitem — a že většina lidí to má obráceně.</p>

<p><a href="https://www.davidchoc.cz/milionarem/cihla-3-nemovitost" class="btn">Cihla 3 — Byt, který vydělá</a></p>

<p>Uvnitř si postavíte tři byty vedle sebe a uvidíte výnos u každého i proti průměru jeho města.</p>

<p>{{agentName}}</p>
```

### 5 — `mil-proverka` · za 14 dní · „Hodina, která vám ušetří statisíce"

```html
<h2>{{formalGreeting}}</h2>

<p>představte si, že rok po koupi svolá společenství vlastníků mimořádnou schůzi. Střecha a výtah jsou v havarijním stavu a ve fondu oprav není nic.</p>

<p>Mimořádný příspěvek na jednotku se v takových případech běžně pohybuje <strong>mezi 50 000 a 200 000 Kč</strong>. Najednou. Mimo všechno, co jste si naplánovali.</p>

<p>Devadesáti procentům těchhle překvapení předejde jedna hodina práce před koupí: jeden e-mail správci domu, jeden výpis z katastru a hodina čtení. Po podpisu rezervace stojí tatáž informace desítky až stovky tisíc — a už se s ní nedá nic dělat.</p>

<p><a href="https://www.davidchoc.cz/milionarem/cihla-4-proverka" class="btn">Cihla 4 — Prověrka před koupí</a></p>

<p>Ten e-mail pro správce SVJ tam máte hotový, stačí doplnit adresu a zkopírovat. Je to nejvýnosnější minuta celé kapitoly.</p>

<p>{{agentName}}</p>
```

### 6 — `mil-nabidka` · za 21 dní · „Poslední e-mail ze série"

```html
<h2>{{formalGreeting}}</h2>

<p>tohle je poslední e-mail z téhle série. Další vám ode mě sám od sebe nepřijde.</p>

<p>Za tři týdny jste dostali plán, páku, lokalitu i prověrku. To je víc, než s čím do své první investice šla většina lidí, které znám — a mělo by vám to stačit na to, abyste první byt zvládli sami.</p>

<p>Někdo to sám dělat nechce. Ne kvůli neznalosti, ale proto, že prověřit dům, projít zápisy ze schůzí, přečíst rezervační smlouvu a odhadnout, co se dá vyjednat, zabere čas, který radši věnuje své práci.</p>

<p>Jestli jste to vy, <strong>odpovězte přímo na tenhle e-mail</strong> jednou větou o tom, kde stojíte. Podíváme se na konkrétní byt, který zvažujete, a řeknu vám rovnou, jestli do toho jít.</p>

<p>A jestli to chcete zvládnout sám — držím palce. Napište mi, jak to dopadlo.</p>

<p>{{agentName}}</p>
```

---

## Co ještě není hotové

Cihly 6 až 10 se píšou. Až budou venku, patří sem tři až čtyři další
kroky a šestý e-mail se posune na konec.
