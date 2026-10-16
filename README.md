# Boom Core

**Beyond Our Own Maximum.** A free, open-source tabletop RPG framework built for speed and fun, with exploding dice and a companion app that tracks the math and the booms.

## Boom Dice app

`index.html` is the Boom Dice app: exploding dice, party character sheets, loot boxes, a shared party stash, initiative, and a Core Master tab for monsters.

Play it in your browser: https://mpjart.github.io/boomcore/ (works best on a tablet or larger).

The Core Master starts a table and shares its 6-letter code; players join with the code and everyone sees each other's rolls live. Shared tables run on Firebase's free plan: see `SETUP.md` to connect it. Until then the app runs in solo mode.

**Play solo** gives you the full Core Master view (party, loot boxes, stash, monsters, initiative, and the theme picker) on a private table saved on that device. There's no code and nobody else can join. Use it for solo games, prep, or one shared screen at the table.

## Themes

The Core Master picks the table's theme in the CM tab: Core, Fantasy, Space, Horror, or Street Grit. It changes the look for everyone and renames the loot words (Space: credits, data chips, power cores, crates; Horror: grave coins, rites, coffers; Street Grit: bucks, favors, rep, duffel bags; Fantasy: chests).

## Loot names

Every item a loot box drops gets a name from its theme's d100 tables in `names.js`: a clever name plus a base item, like Black Hawk Longbow (+2 Speed). Gems get a quality word for their tier. Weapons carry their hands, reach, and damage type, and armor its type, so equipping sets them automatically. The Core Master can switch on **After Dark loot names (21+)** in the CM tab for adult tables; it adds the After Dark names to the theme's tables, so drops mix both. The tables are reviewed in the Boom Loot Name Tables doc.

## To do next

- **Pirate theme.**
- **Holding a turn** in the initiative order.

## Rules and Core Master screen

- **Rules:** https://mpjart.github.io/boomcore/rules.html (source: `docs/core-guidelines.md`)
- **Core Master screen:** https://mpjart.github.io/boomcore/cm-screen.html — three panels that print on letter paper, landscape. Add `?theme=space` (or fantasy, horror, grit) to match a theme; the app's CM tab opens it in the table's theme.
- **Loot name tables:** https://mpjart.github.io/boomcore/loot-names.html (source: `docs/loot-names.md`)

The rules and loot pages are built from the Markdown in `docs/`. After editing it, run `python3 tools/build_docs.py` (needs `pip install markdown`) and commit the updated HTML.

## License

Code is released under the MIT License. See `LICENSE`.
