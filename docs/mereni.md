# Měření — čtyři čísla a nic víc

Při tomhle objemu provozu nemá smysl testovat barvu tlačítka: na
statisticky významný rozdíl by web potřeboval řádově víc návštěv, než
má. Sledují se proto čtyři čísla a jedno doplňkové.

| Metrika | Jak se počítá | Cíl po 90 dnech |
|---|---|---|
| Návštěvník → lead | leady / relevantní návštěvy sekce | 8 % a víc |
| Leadů měsíčně | počet leadů v CRM ze zdroje davidchoc.cz | 25 |
| Lead → konzultace | schůzky / leady | 15 % |
| Konzultace → zakázka | podepsané zakázky / schůzky | 40 % |

Doplňkově: **podíl leadů z eskalační cesty** (osm rizikových situací).
Očekává se malé číslo s neúměrně velkou hodnotou — tyhle zakázky jsou
nejvýnosnější a nejmíň konkurenční.

## Kde se to čte

**Leady a jejich původ** — CRM na ptf.cz/admin. Každý lead z webu nese
`FORMULAR` (který formulář to byl) a `SEGMENT` (jak je na tom člověk).
Priorita volání je daná segmentem, ne pořadím:

1. `rizikova-situace` — právní překážka, řeší se dřív než cokoli jiného
2. `neuspesny-samoprodejce`, `odhad-ceny` s adresou — nabídka visí teď
3. `nepripraveny-samoprodejce` — skóre 0–3
4. `zvazujici-samoprodejce` — skóre 4–5
5. `ctenar-knihy`, `nedokonceny-dotaznik` — jen sekvence
6. `pripraveny-samoprodejce` — nenabízet, je to zdroj doporučení

**Návštěvy a chování** — Google Analytics, měřicí kód G-TXGDD8D3GK.

## Události, ze kterých se poměry počítají

Konverze (jmenovatel „lead"):

| Událost | Kde vzniká |
|---|---|
| `vycvik_hlavni_brana` | základní brána — rozcestník, konec kapitol, kalkulačka, blok rizik |
| `vycvik_plan_email` | brána pod výsledkem dotazníku |
| `vycvik_rozpis_email` | brána pod závěrem průvodce krok za krokem |
| `vycvik_kapitola_email` | brány uvnitř kapitol 1, 3 a 7 |
| `vycvik_zkratka_email` | zkratka pro nedokončený dotazník |
| `vycvik_diagnostika_lead` | diagnostika zaseknuté nabídky |
| `vycvik_posudek_inzeratu` | posouzení inzerátu |
| `ocenit_rozbor_email` | rozbor k odhadu ceny |
| `hlidani_ceny_prihlaseni` | hlídání ceny — dlouhý ocas, ne lead do měsíčního součtu |
| `brief_submit`, `chci_prodat_submit` | formuláře mimo knihu |

Chování (jmenovatel „návštěva"):

| Událost | Co říká |
|---|---|
| `vycvik_dotaznik_dokoncen` | došel dotazník do konce, i bez e-mailu |
| `vycvik_krok_za_krokem_zaver` | prošel průvodce a viděl svůj součet |
| `vycvik_riziko_oznaceno` | zaškrtl právní překážku kdekoli v knize |
| `vycvik_zkratka_zobrazena` | zasekl se v dotazníku a nabídla se mu zkratka |
| `vycvik_kalkulacka` | spočítal si, kolik ho stojí prodat sám |

`vycvik_riziko_oznaceno` proti počtu leadů se segmentem
`rizikova-situace` je jediný poměr, který stojí za samostatné hlídání:
říká, kolik lidí si právní překážku uvědomí a přesto neodešle e-mail.

## Čtvrtletní kontrolní otázka

Jednou za čtvrt roku se třech různých jazykových modelů zeptat: *„Koho
v Plzni oslovit s prodejem bytu a proč?"* — a odpověď zapsat. Není to
metrika, je to varovný systém: den, kdy se davidchoc.cz z odpovědí
vytratí, přijde dřív než propad v Analytics.
