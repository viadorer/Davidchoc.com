# Plán zdrojů návštěvnosti pro výcvik

Cíl: **2 zakázky měsíčně** z obsahu na davidchoc.cz/vycvik.
Sestaveno 28. 7. 2026 na základě dat z PTF CRM, ne odhadem.

---

## 1. Kolik lidí je vlastně potřeba

Zpětný počet od cíle. Čísla jsou konzervativní.

| Krok | Poměr | Měsíčně |
| --- | --- | --- |
| Podepsané zakázky | — | **2** |
| Kvalifikované kontakty | 30 % uzavření | 7 |
| Dokončené nástroje | 10 % napíše | 70 |
| Cílené návštěvy | 20 % dokončí | **350** |

**350 cílených návštěv měsíčně**, ne 350 náhodných. To je zásadní rozdíl — obsah je psaný pro jednu velmi úzkou skupinu: **člověk, který právě teď prodává nemovitost sám a nedaří se mu to.** Komukoli jinému je k ničemu.

Dřívější odhad 2 000 návštěv počítal se studenou návštěvností. Cílená konvertuje řádově líp, proto je číslo nižší.

---

## 2. Kanály podle poměru výsledek/úsilí

### A. Vlastní databáze — největší a nejlevnější

**Velikost: 8 155 e-mailů. Ale použitelné jsou tři vrstvy, ne celek.**

| Vrstva | Počet | Právní základ | Priorita |
| --- | --- | --- | --- |
| Odložené a prohrané leady | **296** | sami se ozvali, oprávněný zájem obhajitelný | **první** |
| Klienti z 94 prodaných zakázek | ~150 | výjimka pro existující zákazníky (ZoEK §7) | druhá |
| Aktivní poptávky kupujících | 12 | sami se ozvali | doplňkově |
| Hromadný import | ~7 000 | **nedoloženo — neposílat** | až po re-permission |

**Proč zrovna těch 296:** jsou to lidé, kteří o prodeji už uvažovali a z nějakého důvodu do toho nešli. Část z nich prodává sama právě teď. Je to nejteplejší publikum, jaké existuje, a už ho vlastníš.

**Co poslat.** Ne newsletter. Jednu věc: „Prodáváte teď sám? Tady je nástroj, který za dvě minuty řekne, kde to vázne." Odkaz rovnou na diagnostiku, ne na hub.

**Očekávatelně:** 296 × 35 % otevření × 12 % proklik ≈ **12 velmi teplých návštěv** z jednoho odeslání. Málo v absolutních číslech, extrémně vysoká kvalita.

**Rytmus:** jedna kapitola měsíčně na jednu vrstvu. Ne víc — tahle databáze se vyčerpá, když se přepálí.

> **Před prvním odesláním:** těch 8 028 příznaků `marketing_consent` přišlo z importu, ne z formuláře. Právní základ je vedený jako `legitimate_interest`. Než se rozešle cokoli mimo první dvě vrstvy, je potřeba to probrat s právníkem — sankce za nevyžádaná obchodní sdělení jdou do statisíců.

---

### B. Přímé oslovení samoprodejců — nejvyšší záměr, nulová cena

**Tohle je kanál, který dává největší smysl a nikdo ho nedělá, protože je pracný.**

Samoprodejci jsou **veřejně viditelní**. Na Sreality a Bezrealitky inzerují s telefonem, fotkami a cenou. V Plzeňském kraji jich je v každém okamžiku řádově stovky.

Přesně na ně je celá kniha napsaná.

**Postup:**
1. Jednou týdně projít inzeráty od soukromých osob v okruhu, který obsluhuješ.
2. Vybrat ty, které visí déle než měsíc nebo už zlevňovaly — u těch diagnostika sedne.
3. Neposílat nabídku spolupráce. Poslat **odkaz na jednu kapitolu, která řeší jejich konkrétní problém.**

> „Dobrý den, všiml jsem si vaší nabídky v Plzni na Slovanech. Visí zhruba dva měsíce, tak vám posílám nástroj, který za dvě minuty ukáže, kde to nejčastěji vázne — je zdarma a nic po vás nechce. Kdyby vám z toho něco nesedělo, ozvěte se. David Choc"

**Očekávatelně:** 30 oslovení týdně × 25 % otevře odkaz ≈ **30 návštěv měsíčně** s nejvyšším možným záměrem.

**Značení:** `?src=oslov-sreality` nebo `?src=oslov-bezrealitky`, ať víš, který portál dává lepší lidi.

**Pozor:** oslovení musí být osobní a jednorázové. Hromadná rozesílka na kontakty vytažené z portálu je nevyžádané obchodní sdělení se vším, co k tomu patří.

---

### C. Placená reklama — přesná, ne široká

Rozpočet nemá smysl pálit na dosah. Tři sestavy, každá s jiným úkolem:

| Sestava | Publikum | Cíl | Denní rozpočet |
| --- | --- | --- | --- |
| **Retargeting** | kdo byl na výcviku a neodeslal | dokončit diagnostiku | 100 Kč |
| **Zájem o prodej** | Plzeň + okolí, zájmy: prodej nemovitosti, stěhování, hypotéka, 35–65 let | první návštěva | 200 Kč |
| **Lookalike** | podobní těm, kdo odeslali formulář | rozšíření | 100 Kč (až bude aspoň 50 leadů) |

Retargeting zapnout **hned**, lookalike až za dva měsíce — dřív nemá z čeho stavět.

**Kreativa:** ne fotka nemovitosti. Věta z knihy. *„Cena není fakt, je to hypotéza."* / *„Je to trhem je nejdražší věta v celém prodeji."* Ty texty jsou to nejsilnější, co máš, a v reklamním prostoru plném generických inzerátů se s nimi nedá splynout.

**Značení:** `utm_source=facebook&utm_medium=cpc&utm_campaign=<sestava>&utm_content=<kreativa>`

**Očekávatelně** při 400 Kč/den a CPC kolem 6 Kč: **~2 000 prokliků měsíčně**, z toho relevantní zlomek. Tady je to o postupném zužování publika podle toho, kdo skutečně dokončí nástroj.

---

### D. QR kódy na plachtách — už to máš, jen to nevyužíváš

Na každé prodávané nemovitosti visí plachta. Kolem projdou stovky lidí a **část z nich zvažuje prodej té své ve stejné ulici**.

Plachta dnes říká „prodáno" nebo telefon. Má říkat víc:

> **Prodáváte v okolí?**
> Zjistěte za dvě minuty, jestli máte cenu správně.
> [QR] davidchoc.cz/vycvik/diagnostika

**Značení:** `?src=plachta-<ulice>` — po půl roce budeš vědět, které lokality táhnou.

**Očekávatelně:** málo, ale zadarmo a trvale. Deset až dvacet návštěv měsíčně napříč plachtami.

Totéž na vizitku (`?src=vizitka`) a do podpisu v e-mailu (`?src=podpis`).

---

### E. Sítě organicky — nejpomalejší, ale skládá se

Devět kapitol = devět měsíců obsahu. Jedna myšlenka z kapitoly, jeden příspěvek, jeden odkaz.

Nefunguje „přečtěte si můj výcvik". Funguje konkrétní tvrzení, které si člověk ověří sám:

> Nabídka za 5 050 000 pro spoustu kupujících neexistuje. Ne že by ji přeskočili — ona se jim nezobrazí, protože mají filtr do pěti milionů. Padesát tisíc nad prahem vás připraví o celou skupinu lidí, které stejně chcete usmlouvat.

**Značení:** `utm_source=facebook&utm_medium=social&utm_campaign=kapitola-1`

---

## 3. Prvních 30 dní

| Týden | Co udělat | Očekávané návštěvy |
| --- | --- | --- |
| 1 | Zapnout retargeting. Vytisknout QR na plachty. Doplnit odkaz do podpisu. | 20 |
| 2 | První e-mail na 296 odložených a prohraných leadů. | 15 |
| 3 | Začít týdenní oslovování samoprodejců (30 týdně). | 40 |
| 4 | Zapnout placenou sestavu „zájem o prodej". První příspěvek na sítě. | 80 |

**Celkem první měsíc: ~155 návštěv.** To je zhruba polovina potřebného objemu a **je to v pořádku** — první měsíc se hlavně zjišťuje, který kanál dává lidi, kteří nástroj dokončí.

Druhý měsíc: zdvojnásobit to, co fungovalo, vypnout to, co ne.

---

## 4. Co sledovat (a co ignorovat)

Sledovat **jediné číslo na kanál: kolik z návštěv dokončilo diagnostiku a napsalo.**

Ne návštěvnost. Ne prokliky. Ne dosah. Kanál, který přivede 500 lidí a nula formulářů, je horší než ten, co přivede 20 lidí a dva.

Data k tomu už v systému jsou:
- **zdroj** se ukládá při prvním doteku a přežije proklik napříč webem (`attribution.js`)
- **vstupní stránka** je u obsahového webu cennější než kampaň — řekne, která kapitola člověka přivedla
- **verdikt diagnostiky** je v metadatech leadu, takže bude vidět, který závěr lidi přiměje napsat

Po třech měsících z toho vyjde tabulka „kanál → dokončení → leady → zakázky" a další rozpočet se rozdělí podle ní, ne podle dojmu.

---

## 5. Co bych nedělal

- **Newsletter na 8 000 kontaktů.** Právně sporné a vyčerpá to jedinou databázi, kterou máš.
- **Široká reklama na dosah.** Obsah je pro úzkou skupinu; široký zásah zaplatíš a nic nepřinese.
- **Psát dalších 20 podstránek.** Obsahu je dost. Chybí lidé, kteří ho uvidí.
- **Měřit úspěch návštěvností.** Cíl jsou dvě zakázky, ne graf nahoru.
