# E-mailová sekvence — Výcvik ziskového prodeje

Spouští se odesláním brány pod výsledkem dotazníku na
`/vycvik/zvladnete-to-sami` (lead se zdrojem `vycvik-zkouska`, seznam
`BREVO_LIST_KNIHA`).

## Proč je dlouhá

Rozhodnutí prodat nemovitost zraje měsíce až roky a většina lidí osloví
před podpisem jen málo makléřů — často jediného. Sekvence proto nemá za
úkol nikoho přesvědčit. Má jediný úkol: být tím jedním, na koho si
vzpomenou, až to dozraje. Neměří se konverzí na schůzku, ale tím, kolik
lidí v ní po roce ještě je.

> **Pozor na čísla.** Konkrétní údaje typu „prodávající se rozhoduje
> 12–18 měsíců" nebo „77 % osloví jen jednoho makléře" kolují po
> marketingových blozích bez dohledatelného primárního zdroje. Mechanismus
> platí, čísla neověřuj a hlavně je **nedávej do textů na webu** — první
> čtenář, který si je ověří, s nimi shodí důvěryhodnost všeho ostatního.
> Doložitelné je z NAR 2025 tohle: medián držení nemovitosti 11 let,
> 66 % prodávajících přichází přes doporučení, u 35 % rozhodla pověst.
> I to jsou ale americká data a pro ČR jen proxy.

## Jak je to zapojené

Odeslání brány dělá tři věci naráz:

1. založí případ v CRM na ptf.cz/admin,
2. vloží kontakt do Brevo se seznamem a atributy,
3. odešle **E0 — plán z dotazníku**, sestavený z jeho vlastních odpovědí
   (`api/_emaily.js` → `VYCVIK_ZKOUSKA`).

Kroky E1–E5 řídí **automatizace v Brevu**, ne davidchoc.cz — statický
web nemá kde držet stav ani co by ho po pěti dnech probudilo.

### Proměnné na Vercelu

| Proměnná | K čemu |
|---|---|
| `BREVO_API_KEY` | povinná, bez ní se e-maily neodesílají |
| `BREVO_LIST_KNIHA` | ID seznamu pro tuhle sekvenci |
| `BREVO_LIST_POSUDEK` | posouzení inzerátu — jiná sekvence, jiní lidé |

### Atributy kontaktu, podle kterých se větví

`ZDROJ` = davidchoc.cz · `FORMULAR` = vycvik-zkouska ·
`SKORE` = 0–8 · `SEGMENT` = viz tabulka

| SEGMENT | Kdy vzniká | Co to je za člověka |
|---|---|---|
| `rizikova-situace` | označil aspoň jednu právní překážku | Priorita. Dědictví, exekuce, rozvod, nájemník. Tady se neprodává výcvik, tady se řeší problém. |
| `nepripraveny-samoprodejce` | skóre 0–3, bez rizika | Chce prodat sám a nemá skoro nic. Nejvyšší pravděpodobnost, že skončí u makléře — ale ne dnes. |
| `zvazujici-samoprodejce` | skóre 4–5 | Zvládne to, ale draho. Tady je sekvence nejcennější. |
| `pripraveny-samoprodejce` | skóre 6–8 | Prodá si to sám a je to tak správně. Nenabízet. Tenhle člověk je zdroj doporučení, ne zakázka. |

### Nastavení automatizace

V Brevu navěste na seznam automatizaci se spouštěčem *kontakt přidán do
seznamu*. **E0 už odešel z webu, začínáte tedy E1.**

**Podmínka pro ukončení: kontakt odpověděl.** Nastavte ji jako výstup
z celé automatizace, ne jen jako přeskočení kroku.

---

## Tři železná pravidla

**1. Kdo odpoví, okamžitě vypadne ze sekvence.** Na jakýkoli e-mail, bez
výjimky. Nic nezabije důvěru rychleji než automat, který dorazí potom, co
jste si spolu už psali.

**2. Segmentu `pripraveny-samoprodejce` se nenabízí nic.** Dostane E1,
E3 a čtvrtletní hlídání ceny — a tím to končí. Člověku, kterému jste
právě napsal „jděte do toho sám", nelze za dva týdny nabídnout
spolupráci; byl by to důkaz, že ten posudek byla akvizice.

**3. Nabídka roste pomalu.** První tři e-maily nesou hodnotu a žádnou
nabídku. Kdo dostal zdarma plán, u toho je jakákoli dřívější nabídka
přiznáním, že to celé byl sběr adres.

---

## E0 — okamžitě, automaticky (odesílá web)

**Předmět:** Váš výsledek: X z 8

Skóre, verdikt, chybějící kroky v pořadí prodeje, označená rizika a jeden
další krok podle skóre. Znění je v kódu, ne tady — musí sedět na to, co
brána slíbila.

---

## E1 — po 2 dnech · všechny segmenty

**Předmět:** Jedna věc, kterou jsem vám v tom plánu neřekl

> Dobrý den,
>
> plán, co jsem vám posílal, je seřazený podle prodeje. Ale je v něm
> jedna věc, která ho celý přebíjí, a nechtěl jsem ji tam cpát mezi kroky.
>
> **Cena, kterou vyslovíte první, se pak už jen snižuje.** Neexistuje
> způsob, jak jít nahoru. Proto se první číslo nevymýšlí — počítá se.
>
> Když nic jiného z toho plánu neuděláte, udělejte tohle: tři nezávislé
> zdroje, tři částky napsané na papíře, a ta nejnižší z nich je ta, pod
> kterou nejdete ani ve tři ráno po čtvrté prohlídce.
>
> Kalkulačku tří cen máte tady, je zdarma jako všechno ostatní:
> [Kalkulačka tří cen]
>
> David Choc

*Bez nabídky. Jeden nástroj, jedna myšlenka.*

---

## E2 — po 6 dnech · segmenty `nepripraveny`, `zvazujici`, `rizikova`

**Předmět:** Kolik vás bude stát prodat sám

> Dobrý den,
>
> provizi je vidět. Zbytek ne — a ten zbytek bývá větší.
>
> Nemyslím tím jen fotografa a inzerci. Myslím hlavně dvě položky, které
> si nikdo nezapočítá: rozdíl mezi cenou, za kterou se to prodá vám, a
> cenou, za kterou by se to prodalo připravené. A čtyřicet až šedesát
> hodin vašeho času.
>
> Tahle kalkulačka sečte obojí a porovná to s provizí. **Počítá i to, co
> mluví pro samoprodej** — kdyby vám vyšlo, že se vyplatí prodat sám,
> budu to já, kdo vám to řekne:
> [Kolik vás stojí prodat sám]
>
> David Choc

*Pořád bez nabídky. Nástroj, který umí vyjít proti mně, je nejlepší důkaz,
že nelžu.*

---

## E3 — po 12 dnech · všechny segmenty

**Předmět:** Kde se to nejčastěji rozbije

> Dobrý den,
>
> za třicet let jsem viděl, jak se prodeje kazí. Skoro nikdy to není tam,
> kde to lidi čekají.
>
> Nekazí se to u vyjednávání o ceně. Kazí se to o tři týdny dřív, u
> telefonu — když se nikdo nezeptá, jestli kupující musí nejdřív sám
> něco prodat. Ten člověk pak přijede, zamiluje se, podepíše rezervaci a
> za dva měsíce couvne, protože se mu neprodal jeho byt. Vy jste mezitím
> odmítl dva jiné zájemce a máte nabídku, kterou trh vidí tři měsíce.
>
> Dvacet otázek, které se vás zájemci budou ptát — a tři, které se máte
> ptát vy — je tady: [Dvacet otázek zájemců]
>
> David Choc

---

## E4 — po 20 dnech · segmenty `nepripraveny`, `zvazujici`

**Předmět:** Jak to jde?

> Dobrý den,
>
> nechci nic nabízet, jen se ptám: jak to jde?
>
> Stačí odpovědět jedním slovem.
>
> David Choc

*Žádný odkaz. Žádné tlačítko. Žádná nabídka. Tenhle e-mail je v celé
sekvenci nejdůležitější a je nejkratší — jeho jediný úkol je vyrobit
odpověď. **Kdo odpoví, je okamžitě prioritní lead** a vypadává ze
sekvence do vaší schránky.*

---

## E5 — po 35 dnech · segmenty `nepripraveny`, `zvazujici`, `rizikova`

**Předmět:** Dvacet minut, a pak si to uděláte, jak chcete

> Dobrý den,
>
> tohle je jediný e-mail z téhle řady, ve kterém něco nabízím, tak to
> vezmu krátce.
>
> Dvacet minut nad vaší konkrétní nemovitostí. Řeknu vám názor na cenu,
> co bych dělal jinak a co bych na vašem místě neřešil vůbec. Zdarma,
> nezávazně, a **nikdo vám pak nebude volat** — když se neozvete, neozvu
> se ani já.
>
> Jestli z toho vyjde, že si to máte udělat sám, řeknu vám to. Přijdu o
> zakázku a získám člověka, který o mně bude mluvit dobře. Ta druhá věc
> vydrží déle.
>
> [Nezávazná konzultace]
>
> A kdyby ne: výbava vám zůstává. Zdarma a natrvalo, i kdybyste se
> ozval za dva roky.
>
> David Choc

---

## Čtvrtletní hlídání ceny — všechny segmenty, dokud neodhlásí

**Předmět:** Ceny v Plzni — [čtvrtletí]

Jednou za tři měsíce, čtyři odstavce, žádná nabídka:

1. Co se stalo s cenami v Plzni za poslední čtvrtletí, v číslech.
2. Jak dlouho se teď průměrně prodává.
3. Jedna věc, která se změnila v pravidlech (daň, katastr, portály, PENB).
4. Věta: „Kdyby vás zajímalo, co to znamená pro vaši konkrétní
   nemovitost, stačí odpovědět."

**Tohle je ta vlastní část celého systému.** Kniha se dá napsat znovu,
dotazník okopírovat. Čtvrtletní čísla z Plzně od člověka, který v nich
třicet let obchoduje, ne. Je to zároveň jediný důvod, proč vám někdo
zůstane v seznamu osmnáct měsíců.

---

## Co ještě chybí

- **Plzeňská čísla 2026.** Ceny fotografa, videa a 3D skenu; podmínky
  portálů pro soukromé inzerenty; ceny advokátní a notářské úschovy;
  normální návštěvnost a počet poptávek. Dokud nejsou, neslibují se —
  ani na stránce, ani v e-mailu. Až budou, patří do E2 jako příloha
  a stanou se druhou polovinou toho, co brána nabízí.
- **Hodiny prodeje.** Kalkulačka `kolik-to-stoji` počítá 40–60 hodin,
  rozpad po fázích vychází 45–85. E2 zatím používá 40–60. Sjednotit
  napříč webem — dvě různá čísla jsou horší než jedno vysoké.
- **Znění E1–E5 je moje imitace Davidova hlasu.** U textů, které mají
  fungovat na důvěru, není autenticita kosmetika. Před nasazením přečíst
  nahlas a přepsat, co by David neřekl.
