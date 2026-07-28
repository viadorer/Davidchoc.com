# E-mailová sekvence — Posouzení inzerátu

Spouští se odesláním formuláře na `/posudte-inzerat` (lead se zdrojem
`posudek-inzeratu`, `metadata.segment = zaseknuty-samoprodejce`).

## Jak je to zapojené

Odeslání formuláře dělá tři věci naráz:

1. založí případ v CRM na ptf.cz/admin,
2. vloží kontakt do Brevo se seznamem a atributy,
3. odešle potvrzovací e-mail **E0**.

Kroky E2–E6 řídí **automatizace v Brevu**, ne davidchoc.cz — statický web
nemá kde držet stav ani co by ho po pěti dnech probudilo. Když Brevo
vypadne, lead se přesto uloží do CRM; do logu Vercelu padne varování.

### Proměnné na Vercelu

| Proměnná | K čemu |
|---|---|
| `BREVO_API_KEY` | povinná, bez ní se e-maily neodesílají |
| `BREVO_SENDER_EMAIL` | výchozí `david.choc@ptf.cz` |
| `BREVO_SENDER_NAME` | výchozí `David Choc` |
| `BREVO_LIST_POSUDEK` | ID seznamu pro tuhle sekvenci |
| `BREVO_LIST_KNIHA` | ID seznamu pro leady z knihy |

### Atributy kontaktu, podle kterých se dá v Brevu větvit

`ZDROJ` = davidchoc.cz · `FORMULAR` = posudek-inzeratu ·
`SEGMENT` = zaseknuty-samoprodejce · `INZERAT_URL` = odkaz na nabídku

### Nastavení automatizace

V Brevu založte seznam, jeho ID vložte do `BREVO_LIST_POSUDEK` a navěste
na něj automatizaci se spouštěčem *kontakt přidán do seznamu*. Kroky
a odstupy podle tabulky níže — **E0 už odešel z webu, začínáte tedy E2.**

**Podmínka pro ukončení: kontakt odpověděl.** Nastavte ji jako výstup
z celé automatizace, ne jen jako přeskočení kroku.

---

## Dvě železná pravidla

**1. Kdo odpoví, okamžitě vypadne ze sekvence.** Na jakýkoli e-mail, bez
výjimky. Nic nezabije důvěru rychleji než automat, který dorazí potom, co
jste si spolu už psali.

**2. Nabídka roste pomalu.** První čtyři e-maily nesou hodnotu a žádnou
nabídku. Teprve pátý se ptá. U člověka, kterému jste zdarma napsal, co má
opravit, je jakákoli dřívější nabídka přiznáním, že to celé byla akvizice.

---

## E-mail 0 — okamžitě, automaticky

**Předmět:** Mám váš inzerát

> Dobrý den,
>
> odkaz mi dorazil. Podívám se na něj a do dvou pracovních dnů vám napíšu,
> co bych změnil jako první.
>
> Než se ozvu, může se vám hodit diagnostický list z deváté kapitoly. Je to
> sedm čísel a když je vyplníte, polovina odpovědi z nich obvykle vypadne sama.
>
> [Otevřít diagnostický list] → https://www.davidchoc.cz/vycvik/diagnostika
>
> David Choc

---

## E-mail 1 — do dvou pracovních dnů, píšete ručně

Tohle je celý produkt. Struktura pokaždé stejná — je rychlejší psát
a působí profesionálně.

> Dobrý den,
>
> díval jsem se na vaši nabídku [adresa/typ]. Tady je, co bych změnil,
> v pořadí podle dopadu.
>
> **1. [Věc s největším dopadem]** — [proč, jedna věta] — [co konkrétně udělat]
> **2. [Druhá věc]** — …
> **3. [Třetí věc]** — …
>
> **K ceně:** [srovnání s realizovanými prodeji v okolí, jedna až dvě věty]
>
> Kdyby k tomu byly otázky, ozvěte se. A dejte prosím vědět, jak to dopadne
> — zajímá mě to.
>
> David Choc

**Nikdy nepřipojujte nabídku spolupráce.** Ani na konci, ani jemně. Přijde
sama, nebo nepřijde — a když ji připojíte, znehodnotíte celý slib z té stránky.

---

## E-mail 2 — za 5 dní

**Předmět:** Stihl jste to?

> Dobrý den,
>
> jen krátce: povedlo se vám změnit tu první věc ze seznamu?
>
> Ptám se proto, že rozhoduje pořadí. Kdo změní všechny tři najednou,
> nezjistí, co zabralo. Kdo změní jednu a týden počká, ví to přesně.
>
> Kdyby se něco zaseklo, napište.
>
> David Choc

Krátký e-mail, jediná otázka. Jeho úkolem je vyvolat odpověď, ne informovat.

---

## E-mail 3 — za 14 dní

**Předmět:** Jak vypadají čísla po úpravě?

> Dobrý den,
>
> po dvou týdnech od změny už je vidět, jestli zabrala. Stačí se podívat
> na dvě čísla.
>
> **Zobrazení nahoru, dotazy pořád žádné** — problém je v ceně, ne v prezentaci.
> **Zobrazení stejná** — nezměnila se hlavní fotka natolik, aby si toho někdo všiml.
> **Dotazy přišly** — jde to správným směrem, držte se toho.
>
> [Případ: nabídka, která visela pět měsíců, a co s ní udělalo rozdíl]
>
> Když si čísly nejste jistý, pošlete mi je a projdu je s vámi.
>
> David Choc

---

## E-mail 4 — za 30 dní

**Předmět:** Když ani úprava nepomohla

> Dobrý den,
>
> pokud se od minule nic nezměnilo, stojí za to připustit, že problém není
> v inzerátu. Existují tři situace, kdy sleva ani lepší fotky nepomůžou:
>
> **Překážka, kterou kupující nedokáže obejít** — neschválitelná hypotéka,
> nesoulad s katastrem, přístup přes cizí pozemek, nedořešené dědictví,
> nájemce na dobu určitou. Kupující vám to neřekne, řekne mu to jeho banka
> a on zmizí.
>
> **Nabídka míří na špatnou skupinu** — jinou cílovou skupinu neopravíte
> cenou, ale jiným textem a jinými fotkami.
>
> **Vyčerpání** — osmý týden už nezvedáte telefon se stejnou chutí jako první.
> Je to lidské a stojí to víc než jakákoli sleva.
>
> Kterou z těch tří máte, poznám z pár otázek. Napište a projdeme to.
>
> David Choc

---

## E-mail 5 — za 45 dní, první skutečná nabídka

**Předmět:** Nabídka, kterou můžete odmítnout

> Dobrý den,
>
> pokud se to pořád neprodalo, mám pro vás nabídku a klidně ji odmítněte.
>
> Můžu prodej převzít. Přípravu, fotky, video, sken, kampaň i vyjednávání
> platím já se svým týmem. **Pokud nemovitost neprodám, neplatíte mi nic.**
> Riziko nesu já.
>
> Neříkám to proto, abych vám dokázal, že jste to nezvládl. Prodat sám dává
> v řadě případů smysl a část lidí, kterým jsem takhle psal, prodala sama
> a napsala mi o tom. Jenom vám dávám vědět, že ta možnost existuje
> a co obnáší.
>
> [Domluvit nezávaznou konzultaci] [Zavolat: 774 052 232]
>
> A když ne, nic se neděje. Ozvu se ještě jednou a pak vás nechám být.
>
> David Choc

---

## E-mail 6 — za 75 dní, poslední

**Předmět:** Poslední z mé strany

> Dobrý den,
>
> tímhle e-mailem to z mé strany uzavírám, ať vám nechodí něco, o co jste
> nežádal.
>
> Všechno, co jsem vám psal, zůstává dostupné — kniha, nástroje i diagnostika.
> Zdarma a natrvalo.
>
> [Vaše výbava] → https://www.davidchoc.cz/vycvik/vybava
>
> Kdykoli budete něco potřebovat, napište nebo zavolejte. Ozvat se můžete
> i za rok.
>
> A kdyby se to mezitím prodalo, budu rád, když mi dáte vědět. Sbírám ty
> příběhy, protože se z nich pořád ještě učím.
>
> David Choc

---

## Větvení po E-mailu 1

Ne každý lead patří do stejné řady. Podle toho, co uvidíte v inzerátu,
ho přepněte:

| Co uvidíte | Kam ho poslat |
|---|---|
| Běžná nabídka, chyby v prezentaci nebo ceně | Standardní řada E2 → E6 |
| **Právní nebo strukturální překážka** — nájemce, dědictví, zástava, spoluvlastnictví | Přeskočit na obsah E4 hned a nabídnout konzultaci ve druhém e-mailu. Tady sekvence nepomůže, tady je potřeba mluvit. |
| Vysoká hodnota nemovitosti | Zkrátit odstupy, nabídku posunout na E3 |
| Odpověděl na cokoli | Ven ze sekvence, osobní komunikace |

---

## Co měřit

| Metrika | Proč |
|---|---|
| Odeslané formuláře / návštěvy stránky | jestli text funguje |
| Podíl leadů, kteří odpoví na E2 | jestli sekvence baví |
| **Podíl leadů, kteří napíšou dřív, než přijde E5** | nejdůležitější — ti se rozhodli sami a ti také podepisují |
| Schůzky ze sekvence | cíl |
| Odhlášení do E4 | jestli netlačíte moc brzy |

Když odhlášení do čtvrtého e-mailu překročí desetinu, je nabídka moc brzy
nebo moc často. Ubírejte, nepřidávejte.

---

## Čeho se ten člověk bojí

Dvě skupiny strachů. První ho přivedla na stránku, druhá mu brání odeslat
formulář. **Konverzi rozhoduje ta druhá.**

### Ze situace — proč tam je

1. Že už je pozdě
2. Že přijde o peníze
3. Že je s nemovitostí něco doopravdy špatně
4. Že bude muset jít výrazně dolů
5. Že to nikdy nezjistí
6. Ztrapnění před okolím
7. **Že to zkazil sám**

Sedmička je nejsilnější a nejtišší. Nikdy ji nevysloví — a **nesmíte se jí
dotknout.** Jakákoli věta ve smyslu „to se stává, když to lidé dělají sami"
toho člověka okamžitě zavře. Proto je na stránce věta *„většinu chyb z toho
seznamu jsem za třicet let udělal taky"* — snímá vinu, aniž by ji pojmenovala.

### Z formuláře — proč neodešle

1. Bude mi volat a tlačit
2. Chce mě jen získat jako zakázku
3. **Bude mě soudit**
4. **Použije to proti mně**
5. Zjistí to okolí
6. Bude to šablona
7. Neodpoví vůbec

Čtyřka je u samoprodejce, který se makléřům vyhýbá, ze všech nejsilnější.
Poslat odkaz je pro něj vydání se do rukou. Proto je na stránce sekce
**„Vaše nabídka zůstane vaše"** — je krátká, ale bez ní polovina lidí
formulář neodešle.
