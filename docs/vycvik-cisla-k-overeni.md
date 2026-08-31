# Výcvik — čísla, která čekají na ověření

Všechna čísla níž jsou **moje odhady, ne Davidova data**. Na webu jsou
označená jako orientační rozpětí českého trhu, ne jako jeho ceník —
takže nic nelže. Ale dokud je David nepotvrdí, jsou to čísla, která
o jeho trhu nevypovídají.

Priorita je daná tím, kolik toho na čísle visí.

---

## 1. Hodiny po fázích · `vycvik/krok-za-krokem.html`

Součet je schválně **40–60 hodin**, protože to samé číslo už stojí
v kalkulačce `/vycvik/kolik-to-stoji`. Dvě různá čísla na jednom webu
jsou pro nedůvěřivého čtenáře horší než jedno vysoké.

| # | Fáze | Hodiny |
|---|---|---|
| 1 | Ocenění | 3–5 |
| 2 | Příprava dokumentů | 4–6 |
| 3 | Příprava nemovitosti | 8–12 |
| 4 | Fotografie, půdorys, prohlídka | 2–4 |
| 5 | Inzerce | 2–4 |
| 6 | Telefonáty a prohlídky | 12–16 |
| 7 | Dohoda a rezervace | 2–3 |
| 8 | Smlouvy a úschova | 3–5 |
| 9 | Vklad do katastru | 1–1 |
| 10 | Předání a vyúčtování | 3–4 |
| | **Celkem** | **40–60** |

**Když tohle změníš, musíš změnit i kalkulačku** — jinak vzniknou dvě
různá čísla, což je přesně ta vada, kvůli které tahle tabulka existuje.

## 2. Náklady po fázích · tamtéž

Celkem **44 000 Kč**, z toho **20 000 Kč** je právní část, kterou
prodávající platí s makléřem i bez něj. Do porovnání proto vstupuje
jen rozdíl **24 000 Kč**.

| # | Položka | Odhad |
|---|---|---|
| 2 | PENB, výpisy z katastru, potvrzení SVJ | 3 000 |
| 3 | malování, úklid, drobné opravy | 12 000 |
| 4 | fotograf + půdorys | 4 500 |
| 5 | portály + cedule | 3 500 |
| 8 | kupní smlouva + advokátní úschova | 18 000 *(platí se tak jako tak)* |
| 9 | kolek k návrhu na vklad | 2 000 *(platí se tak jako tak)* |
| 10 | přepisy, vyúčtování | 1 000 |

Rozpětí u jednotlivých položek jsou v textu fází (`kc_text`).

## 3. Co v datech ještě není

Tyhle věci **nikde neslibujeme**, právě proto, že je nemáme. Až budou,
stanou se druhou polovinou toho, co brána nabízí — a jsou to jediná data
na celém webu, která nejdou vygenerovat ani opsat:

- ceny fotografa, videa a 3D skenu **v Plzni**, u konkrétních lidí
- podmínky a ceny portálů pro soukromé inzerenty, aktuální
- ceny advokátní a notářské úschovy u konkrétních advokátů
- kolik zhlédnutí a poptávek je v Plzni normální, po typu nemovitosti

## 4. Kde se to nejčastěji rozbije

Deset formulací v `krok-za-krokem` je moje verze. Jsou věrohodné, ale
nejsou tvoje — a přitom je to ta vrstva, kterou ti žádný model ani
konkurent nedoplní. Projít a přepsat podle třiceti let praxe.

## 5. Znění e-mailů

- `api/_emaily.js` → `VYCVIK_ZKOUSKA`, `VYCVIK_PLAN`, `ZKOUSKA_KROKY`,
  `ZKOUSKA_RIZIKA`, `PLAN_FAZE`
- `docs/sekvence-vycvik.md` → E1–E5 a čtvrtletní hlídání ceny

Psané tvým tónem, ale je to moje imitace. U textů, které mají fungovat
na důvěru, není autenticita hlasu kosmetika.

Zvlášť pozor na `ZKOUSKA_RIZIKA` — osm odstavců o právních situacích.
Jsou psané obecně a každý končí odkazem na advokáta, ale jsou to věty,
které pod tvým jménem odejdou člověku řešícímu dědictví nebo exekuci.

---

## Co ještě není postavené

| Věc | Proč zatím ne |
|---|---|
| `/kolik-si-berem` — provize rozepsaná na části | Chybí tvoje číslo a rozpad. Bez něj nemá stránka obsah. |
| Sjednocení slibu reakce („do hodiny, 8–20") | Na webu je dnes „do 24 hodin" i „nikdo vám nezavolá". Je to rozhodnutí o tvém čase, ne o kódu. |
| Věta „výsledek vidím já" na `/ocenit-online` | Je na dvou místech včetně FAQ schématu. Přepsat, ne smazat — nová formulace chce tvoje svolení. |
| Hlídání ceny jako přihlášení | Sekvence to popisuje, mechanismus nikde. Potřebuje zdroj čtvrtletních dat. |
| Přejmenování `/pripad-pro-agenta` | Změna URL na živém webu s odkazy — dělat vědomě, ne mimochodem. |
