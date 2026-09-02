# Hlídání ceny — čtvrtletní přehled

Jediná věc na webu, která pracuje, když nepracuje David.

## Proč existuje

Medián držení nemovitosti je jedenáct let. Většina lidí, kteří si dnes
spočítají odhad, letos neprodá — a jednorázový trychtýř s tím nepočítá
vůbec: dostanou číslo a zmizí. Hlídání ceny z jednorázového magnetu
dělá odběr, který u člověka drží, dokud rozhodnutí nedozraje.

## Jak se sbírá

Formulář pod kalkulačkou na `/ocenit-online` — druhá, tišší nabídka
pod rozborem. Vyžaduje ulici a město, protože bez lokality není co
hlídat.

- formulář `hlidani-ceny`, `dedup: true` (druhé přihlášení nezaloží
  druhý případ v CRM)
- lokalita jde do `metadata.lokalita` a do zprávy v CRM
- kontakt padá do vlastního seznamu v Brevu — proměnná
  `BREVO_LIST_HLIDANI`

**Vlastní seznam je podstatný.** Kdyby přihlášení spadlo do seznamu
knihy, dostal by člověk pětidílnou sekvenci, o kterou si neřekl. Tady
si řekl o jednu věc: čtyři odstavce jednou za čtvrt roku.

## Co se posílá

Jednou za tři měsíce, čtyři odstavce, **žádná nabídka**:

1. Co se stalo s cenami v Plzni za poslední čtvrtletí, v číslech.
2. Jak dlouho se teď průměrně prodává.
3. Jedna věc, která se změnila v pravidlech (daň, katastr, portály, PENB).
4. Věta: „Kdyby vás zajímalo, co to znamená pro vaši konkrétní
   nemovitost, stačí odpovědět."

Rozesílku řídí Brevo, ne web — statický web nemá kde držet stav ani co
by ho po třech měsících probudilo. Web odešle jen potvrzení
(`api/_emaily.js` → `HLIDANI_CENY`), které říká přesně tohle a nic víc.

## Pravidla, která se nesmí porušit

1. **Žádná nabídka.** Ani v patičce, ani „mimochodem". První kvartál,
   ve kterém se objeví, je poslední, který někdo otevře.
2. **Kdo odpoví, vypadává z automatu** a je to prioritní lead. Člověk,
   který po roce ticha odepíše na čísla, je blíž rozhodnutí než většina
   nových kontaktů.
3. **Čísla musí být vlastní.** Přeposlaná tisková zpráva z portálu je
   přesně to, co ten člověk dostane i odjinud. Hodnotu tomu dává, že
   je komentuje někdo, kdo v tom trhu třicet let obchoduje.
