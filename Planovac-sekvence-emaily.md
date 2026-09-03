# Plánovač rekonstrukce — navazující e-maily (podklad pro Brevo)

E0 (potvrzení s plánem, checklistem a otázkami) odchází z `api/_emaily.js`
hned po odeslání formuláře — hotovo. Tenhle dokument je zadání pro
navazující sekvenci v Brevu / CRM.

**Pravidla, která sekvence musí držet:**
- Žádná čísla, která nemáme čím doložit. Předměty typu „80 % rekonstrukcí
  přečerpá rozpočet o 20 %" (z externí analýzy) sem nepatří — web tahle
  tvrzení cíleně vyčistil a jedna nedoložená věta shodí důvěru všech ostatních.
- Slib odpovědi jednotně: „odpovím e-mailem do hodiny, mezi osmou a osmou;
  volám jen tomu, kdo si o to řekne."
- Segmentace podle `metadata.ucel` z leadu (prodej / pronajem / kratkodoby /
  vlastni) — třetí e-mail se podle ní větví.
- Žádné SMS. Je to další kanál a další slib, který musí někdo plnit.

---

## E1 · +2 dny — „Rezerva 15–20 %: kde se rozpočty rekonstrukcí lámou"

Rozpočty nelámou ceníky, ale skryté vady a vícepráce bez písemné dohody.
Tři konkrétní místa (odkaz na obsah, který už na stránce je):

1. **Za stěnou a pod podlahou.** U bytů starších padesáti let se skoro vždy
   něco najde. Proto plánovač počítá rezervu 15–20 % — není to polštář,
   je to položka.
2. **„Vícepráce" bez definice.** Co není písemně v ceně před začátkem,
   je po začátku vícepráce. Otázky z e-mailu s plánem jsou přesně na tohle.
3. **Kontrolní body se přeskočí.** Bourat hotové je nejdražší práce na stavbě.
   Checklist z prvního e-mailu + nabídka: „Když chcete, projdu kontrolní
   body s vámi — 15 minut online, termín si vyberete sám." → Calendly.

CTA: Calendly + odkaz na plánovač.

## E2 · +5 dnů — větvení podle záměru

**ucel = pronajem / kratkodoby:** „Byt vydělává až s nájemníkem — a hledat
se dá už během malování." Hledání nájemníka může běžet souběžně s dokončením;
prohlídky jdou dělat i v rozpracovaném bytě s vizualizací. Nabídka: pomůžu
s pronájmem ke dni dokončení. CTA: napište mi / Calendly.

**ucel = prodej:** „Prodej po rekonstrukci se připravuje během rekonstrukce."
Fotky a inzerce se plánují k datu dokončení z harmonogramu; odkaz na
/chci-prodat a na výcvik (kdo chce prodávat sám, dostane knihu — konzistentní
s étosem webu). CTA: /chci-prodat.

**ucel = vlastni:** „Na co se u vlastního bydlení nešetří." Co je pod omítkou
a pod podlahou, se dvacet let nemění — odkaz na sekci Podlaha a topení
v plánovači. Žádný prodejní CTA, jen „kdybyste si chtěl plán ověřit, napište."

## E3 · +12 dnů — „Jak dopadl váš plán?"

Krátký osobní e-mail bez grafiky: „Před dvěma týdny jste si sestavil plán
s dokončením {konec}. Sedí to zatím? Když se něco zaseklo — nejčastěji to
bývají objednávky nebo řemeslníci, co nedrží termín — napište mi, na co
jste narazil. Odpovím do hodiny, mezi osmou a osmou." Žádné tlačítko,
jen reply. Odpovědi = nejteplejší leady celé sekvence.

---

**Technická poznámka pro nasazení:** leady z plánovače zatím nejdou do
žádného Brevo seznamu (`seznamyPro` v api/lead.js planovač nemapuje).
Před spuštěním sekvence přidat `BREVO_LIST_PLANOVAC` a mapování.
