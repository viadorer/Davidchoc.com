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

<p><a href="https://www.davidchoc.cz/milionar" class="btn">Spočítat si to na svých číslech</a></p>

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

---

# Větev simulátoru — segment investoři

Leady z konverze pod výsledkem simulátoru (`/milionar`) **nespadají do
sekvence výše**. Mají vlastní kampaň:

```json
{"metadata.kampan": "milionarem-simulator"}
```

Důvod je jediný a je zásadní: obecná sekvence má krok s odstupem 0 hodin,
který by přebil potvrzení z webu. Člověku, kterému jsme na stránce slíbili
tři konkrétní byty do dvou pracovních dnů, by místo toho přišel úvod do
kurzu — a tím by první e-mail po odeslání zboural přesně tu důvěru, na které
celá stránka stojí.

## Co se děje hned

| Kdy | Co | Kdo |
|---|---|---|
| ihned | Potvrzení podle skóre (`api/_emaily.js`) — sedí na to, co bylo slíbeno | automat |
| do 2 prac. dnů | **Tři konkrétní byty**, nebo posouzení zadání | David, ručně |
| dnešní den u horkých | Telefonát | David |

**Ruční krok je jádro celé věci a nejde zautomatizovat.** Skóre je v předmětu
notifikace i v textu leadu (`SKÓRE: HORKÝ / VLAŽNÝ / STUDENÝ`). Horký znamená
koupi do tří měsíců a vyřízené nebo rozpracované financování — tomu se volá
týž den. Jediná mechanika v celém tomhle systému, která má za sebou tvrdý
výzkum, je rychlost reakce; a nestojí nic.

## Sekvence — pět kroků

Spouští se až po ručním kroku. Kdo odpoví na cokoli, vypadá — jako u sekvence výše.

| # | Odstup | Klíč šablony | Předmět | Zdroj textu |
|---|---|---|---|---|
| 1 | 168 h (7 dní) | `sim-chyba` | Chyba, kterou dělá skoro každý první investor | nový, níž |
| 2 | 336 h (14 dní) | `mil-lokalita` | Dva byty, stejná cena, dvojnásobný výnos | převzít beze změny |
| 3 | 504 h (21 dní) | `mil-proverka` | Hodina, která vám ušetří statisíce | převzít beze změny |
| 4 | 720 h (30 dní) | `sim-spoluprace` | Co si za to beru | nový, níž |
| 5 | 1080 h (45 dní) | `sim-konec` | Poslední e-mail ode mě | nový, níž |

Nabídka spolupráce přichází až čtvrtá, po měsíci. U člověka, kterému jste
měsíc zdarma posílali, co má dělat, je dřívější nabídka přiznáním, že to celé
byla akvizice.

---

## Texty nových šablon

### 1 — `sim-chyba` · 7 dní · „Chyba, kterou dělá skoro každý první investor"

```html
<p>{{formalGreeting}}</p>

<p>Za třicet let jsem viděl první investiční byt asi stopadesátkrát. Chyba,
která se opakuje nejčastěji, není v ceně ani v lokalitě. Je v pořadí.</p>

<p>Skoro každý začne tím, že hledá byt. Prochází inzeráty, jezdí na
prohlídky, srovnává metry a ceny — a teprve když se do některého zamiluje,
jde se ptát banky, kolik dostane. V tu chvíli už ale nerozhoduje on. Rozhoduje
za něj to, co mu banka nabídne, protože couvnout od bytu, který si v hlavě
zařídil, dokáže málokdo.</p>

<p><strong>Správné pořadí je opačné.</strong> Nejdřív si zjistíte, kolik
dostanete a za jakou cenu, a teprve s tím číslem jdete hledat. Pak nehledáte
byt, který se vám líbí. Hledáte byt, který vychází — a to je úplně jiná práce.</p>

<p>Druhá věc, kterou z toho pořadí získáte: když se objeví byt, který sedí,
můžete jednat hned. A ty dobré nemají v inzerci týden, mají dva dny.</p>

<p>Vaše čísla mám. Kdyby se od minule změnila, napište mi — přepočítám to.</p>

<p>{{agentName}}</p>
```

### 4 — `sim-spoluprace` · 30 dní · „Co si za to beru"

```html
<p>{{formalGreeting}}</p>

<p>Měsíc vám sem chodí věci, které vám mají pomoct koupit byt samostatně.
Byly zdarma a myslel jsem to vážně — kdo si to postaví sám, má u mě palec
nahoru.</p>

<p>Tenhle e-mail je jediný, ve kterém něco nabízím, ať víte, na čem jste.</p>

<p><strong>Co dělám:</strong> hledám byty podle zadání, i mimo inzerci.
Prověřím katastr, fond oprav a zápisy ze schůzí dřív, než se jede na
prohlídku. Ohlídám rezervační i kupní smlouvu. Napojím vás na hypotečního
specialistu a po koupi seženu nájemníka.</p>

<p><strong>Co si za to beru:</strong> provizi od prodávající strany
u nabídek, které mám. U bytu, který najdete jinde a chcete jen provést,
se domluvíme dopředu na pevné částce — dozvíte se ji dřív, než cokoli
podepíšete, a nikdy z toho nebude překvapení.</p>

<p><strong>Co za to nechci:</strong> exkluzivitu, zálohu ani podpis na
začátku. Když spolupráce nesedne, rozejdeme se a nic neplatíte.</p>

<p>Jsem realitní makléř a na zprostředkování vydělávám. Právě proto vám
u každého bytu píšu i to, co bych na něm nekupoval — makléř, kterému věříte
jen to hezké, vám k ničemu není.</p>

<p>Kdyby to bylo aktuální, stačí odpovědět na tenhle e-mail.</p>

<p>{{agentName}}</p>
```

### 5 — `sim-konec` · 45 dní · „Poslední e-mail ode mě"

```html
<p>{{formalGreeting}}</p>

<p>Tohle je poslední e-mail z téhle série. Dál už vám odsud nic chodit
nebude — nemám ve zvyku psát podle kalendáře.</p>

<p>Jestli jste mezitím koupil, gratuluju a zajímalo by mě, jak to dopadlo.
Jestli ne, taky dobře; není to závod a špatný byt koupený rychle je dražší
než dobrý byt koupený za rok.</p>

<p>Kdyby cokoli — konkrétní byt k posouzení, smlouva k přečtení, nebo jen
otázka, na kterou nikde nenajdete odpověď — napište nebo zavolejte.
Odpovídám osobně a neúčtuju si za to.</p>

<p>{{agentName}}</p>
```

---

## Nastavení v adminu

1. **Komunikace** → tři nové šablony (`sim-chyba`, `sim-spoluprace`, `sim-konec`).
2. **Nastavení → Sekvence** → nová sekvence, spouštěč *lead_created*,
   podmínka `{"metadata.kampan": "milionarem-simulator"}`.
3. Kroky podle tabulky výše; kroky 2 a 3 ukazují na existující šablony.
4. Test na sebe, teprve pak zapnout.

**Notifikace na telefon.** U téhle kampaně ji zapněte — skóre je v textu
leadu a rozhoduje, komu se volá dnes. Bez ní je celá kvalifikace k ničemu.
