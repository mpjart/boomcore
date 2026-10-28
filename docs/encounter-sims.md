# Boom Encounter Simulations

*Run October 28, 2026. About 200,000 simulated fights checking the Chapter 9 threat points for parties of 3, 4, and 5 heroes at levels 1 to 10. All five changes below are now in the [Core Guidelines](https://mpjart.github.io/boomcore/rules.html), the [app](https://mpjart.github.io/boomcore/), the [CM screen](https://mpjart.github.io/boomcore/cm-screen.html), and the [Bestiary](https://mpjart.github.io/boomcore/bestiary.html). The simulator is `tools/boomsim.py` in the repo, if you want to run your own.*

## How the Sim Works

- **Rules followed:** the Boom Rule (explode and replace with 2 dice, 100-dice cap), initiative d20 + Speed, actions 1 + Speed ÷ 4, attack dice by hands and reach, bonus = Str − magical armor or Int − physical armor, armor off every hit, multi-target abilities roll once, minion swarms (pooled dice, bonus once), falling (level 2+ drop a level and come back at full HP minus a stat point; level 1 dies), monsters from the Chapter 9 template.
- **Encounters:** built exactly like the app's New encounter button (threat points per hero, random mix of minions and standards, bosses Epic, Hard and Deadly non-minions one level up, minions one level down). Deadly uses 3 threat per hero and always starts with a boss.
- **Monsters** get the abilities the rules give them: 1 for standard, 3 for bosses, as damage abilities of their rarity tier using their best stat.
- **Party:** fighter, mage, healer, ranger, and a second fighter for 5. Points by role. Modest loot: T1 gear at levels 1 to 5, T2 at 6 to 10 (two armor pieces, weapon +1). Abilities from level 2: T1 at 2 to 4, T2 at 5 to 8, T3 at 9 and up. The healer heals allies under half HP.
- **Not modeled:** conditions (Prone, Stunned, and so on, on both sides), movement and cover, traps, temp HP, potions.
- **Measured:** how often someone falls (loses a level or dies), levels lost per fight across the party, and how often a hero dies.

## What We Found

1. **Bosses were far too strong.** An Epic boss used T4 abilities (4d6 + stat to 4 heroes) every action, with no limit. Hard fights at levels 3 to 7 cost a party of 4 about 8 to 12 levels per fight, and a hero died in 37 to 98% of them.
2. **Level 1 was a coin flip.** A 5 HP commoner dies to one minion hit (2d6). Even Easy fights killed a hero 30 to 50% of the time.
3. **Levels 3 and 4 were a cliff.** Threat halving stopped at level 2, so the full budget (and a boss) arrived while heroes were still fragile.
4. **Parties of 3 rarely met a boss** at Fair, so their Fair fights played like Easy.
5. **Boss HP is fine.** The triple HP wasn't the problem; unlimited big abilities were.

## Changes Made

1. **Monster ability tier:** its rarity tier, but never above its level ÷ 3, rounded up (levels 1 to 3 T1, 4 to 6 T2, 7 to 9 T3, 10 to 12 T4, and so on).
2. **Monsters use each ability once per fight,** then attack.
3. **Halve the threat points through level 4** (was level 2), and **quarter them at level 1.**
4. **Level 1 monsters attack with one hand:** 1d6 melee, 1d4 ranged.
5. **App only:** a Fair fight can include a boss when the budget is 5 or more (was 6).

## Results: Party of 4

Someone falls % / levels lost per fight / a hero dies %.

| Level | Difficulty | Before | After |
| --- | --- | --- | --- |
| 1 | Easy | 37 / 0 / 37 | 3 / 0 / 3 |
| 1 | Hard | 90 / 0 / 90 | 31 / 0 / 31 |
| 2 | Hard | 99 / 3.9 / 73 | 62 / 0.7 / 9 |
| 3 | Fair | 72 / 3.8 / 27 | 11 / 0.1 / 0 |
| 3 | Hard | 100 / 8.0 / 98 | 70 / 1.3 / 2 |
| 5 | Fair | 56 / 3.5 / 3 | 22 / 0.3 / 0 |
| 5 | Hard | 100 / 12.2 / 37 | 61 / 1.0 / 0 |
| 7 | Hard | 99 / 7.2 / 2 | 59 / 1.0 / 0 |
| 10 | Hard | 78 / 4.1 / 0 | 61 / 1.3 / 0 |
| 10 | Deadly | 91 / 6.1 / 0 | 75 / 1.7 / 0 |

## Results After the Changes, All Party Sizes

Someone falls %, levels 2 to 10:

| Difficulty | Party of 3 | Party of 4 | Party of 5 | What it feels like |
| --- | --- | --- | --- | --- |
| Easy | 0-11% | 0-16% | 1-21% | Rarely costs anything |
| Fair | 3-28% | 5-23% | 8-25% | Sometimes someone drops a level |
| Hard | 9-72% | 59-70% | 44-58% | About one level lost |
| Deadly | 70-94% | 75-90% | 65-90% | About two levels lost; real death risk at levels 1 to 3 |

**Still soft:** a party of 3 at levels 2 to 4 on Hard (about 10% falls), because the halved budget (3) can't fit a boss. The Core Guidelines tell the Core Master to add one standard monster.

**Level 1 after the changes:** a hero dies 2 to 12% of the time on Easy and Fair, 25 to 40% on Hard, and 35 to 73% on Deadly.
