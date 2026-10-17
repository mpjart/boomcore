<p align="center"><img src="logo.svg" alt="Boom: Beyond Our Own Maximum" width="520"></p>

# Boom Core

**Beyond Our Own Maximum.** A free, open-source tabletop RPG framework built for speed and fun, with exploding dice and a companion app that tracks the math and the booms.

## Logo

The Boom logo comes in three versions, the same in every theme with only the colors changing:

- **Icon:** the d20 bomb alone (a d20 showing 20, with a cap and a lit fuse). Use it for app and social media icons. Files: `logo-mark.svg`, `app-icon.png`, `app-icon-dark.png` (512 × 512).
- **Wordmark:** BOOM in a heavy sans-serif (Archivo Black) where the first O is the d20 bomb and the second O is a plain, unlit d20 showing a 1. Use it in the app and anywhere like Boom Dice. File: `logo-wordmark.svg`.
- **Full logo:** the wordmark with **Beyond Our Own Maximum** underneath, for larger places like documents and the rules. File: `logo.svg`.

The letters are drawn as shapes, so the files look right anywhere without the fonts installed. See every theme at https://mpjart.github.io/boomcore/logo.html.

## Boom Dice app

`index.html` is the Boom Dice app: exploding dice, a shared chalkboard map, party character sheets, loot boxes, a shared party stash, initiative, and a Core Master tab for monsters.

Play it in your browser: https://mpjart.github.io/boomcore/ (works best on a tablet or larger).

**Mobile / Full layout:** on screens 900px or wider, a switch by the title picks the layout. Full keeps the current tab on the left and puts initiative and the roll feed in a right panel that stays on screen; Mobile is the single column. Phones always use Mobile.

The Core Master starts a table and shares its 6-letter code; players join with the code and everyone sees each other's rolls live. Shared tables run on Firebase's free plan: see `SETUP.md` to connect it. Until then the app runs in solo mode.

**Play solo** gives you the full Core Master view (party, loot boxes, stash, monsters, initiative, and the theme picker) on a private table saved on that device. There's no code and nobody else can join. Use it for solo games, prep, or one shared screen at the table.

## Map

The Dice tab opens with a **🗺️ Map** section, folded shut until you tap it; the dice log stays below. It's a shared chalkboard for when position matters, not a battle grid: no squares, measuring, or fog, and the Core Master's call on distance is final.

- **Core Master tools** (players never see them): Select, Chalk, Eraser, and Text, six chalk colors including black for light maps, three sizes, Undo, and Wipe chalk (tap twice). **Map image…** puts a picture behind the chalk; the board takes the picture's shape, and a Dim slider keeps chalk readable. **Back to slate** returns to the green board.
- **Tokens:** the CM places party heroes and monsters from the tray under the board (or Place all), drags any token, and taps one to select it and take it off with its ×. Players drag only their own hero (set with 🙋 This is me in the Party tab). Tokens show an HP bar; monster HP shows only to the CM.
- **Players can draw:** a CM checkbox that gives players Select, Chalk, Eraser, colors, sizes, and Undo for their own lines. Off by default.
- **Roll card:** the d20 bomb in the board's corner opens a card in the table's theme with HP, the six stats and armor as tap-to-roll chips, Init, attacks, abilities, and a box for any roll like 2d6+3. Rolls go to the shared feed. Players get their own hero's card; the CM can pick any hero or monster, or tap a token to switch to it. HP buttons stay CM-only, as on the Party tab.
- Chalk lines, tokens, and the map image are shared with the whole table (`map`, `mapstrokes`, and `maptokens` under the table).

## Core Master tab

A button bar at the top of the CM tab toggles each group of cards on or off: **🎨 Theme**, **🎁 Loot** (loot box maker), **📜 Handouts**, and **👹 Monsters**. Turn on any mix, all of them, or none. Two action buttons sit on the same bar: **📋 CM screen** opens the screen in a new tab, and **🌅 Dawn** starts a new day (tap twice). Each device remembers which are on. Initiative always sits with the roll feed, not in the CM tab.

## Handouts

The CM tab has a handout creator: type a note (title, text, and an optional signature) or upload a picture with a caption. It's drawn in the table's current theme: a ruled index card for Core, sealed parchment for Fantasy, a transmission screen for Space, a bloodstained page for Horror, and taped notebook paper for Street Grit. The **For** picker sends it to the whole party (the Handouts list in the Party tab), the party stash (anyone acting as a hero can Take it), or one hero privately (only that hero's player and the Core Master see it; the feed just says a private handout was given). A hero holding a handout can put it back in the stash to pass it on. Private handouts are hidden in the app, not encrypted, so a player poking at the table's data could still find them.

## Themes

**Colors:** each hero's color is a dropdown at the bottom of their open sheet (the hero's player and the Core Master can change it), and a player's free rolls use their hero's color. The Core Master's own roll color sits next to the theme dropdown in the CM tab.

The Core Master picks the table's theme from a dropdown in the CM tab: Core Light, Core Dark, Fantasy, Space, Horror, or Street Grit. Core Light uses the CM screen's look: slate blue and burnt orange on cream, with Alfa Slab One titles. It changes the look for everyone and renames the loot words (Space: credits, data chips, power cores, crates; Horror: grave coins, rites, coffers; Street Grit: bucks, favors, rep, duffel bags; Fantasy: chests).

## Loot names

Every item a loot box drops gets a name from its theme's d100 tables in `names.js`: a clever name plus a base item, like Black Hawk Longbow (+2 Speed). Gems get a quality word for their tier. Weapons carry their hands, reach, and damage type, and armor its type, so equipping sets them automatically. The Core Master can switch on **After Dark loot names (21+)** in the CM tab for adult tables; each item rolls 1d2 to use the theme's tables (1) or the After Dark tables (2). The tables are reviewed in the Boom Loot Name Tables doc.

## To do next

- **Pirate theme.**
- **Holding a turn** in the initiative order.

## Rules and Core Master screen

- **Rules:** https://mpjart.github.io/boomcore/rules.html (source: `docs/core-guidelines.md`). Tap the Boom logo at the top of the app to open them.
- **Core Master screen:** https://mpjart.github.io/boomcore/cm-screen.html — three panels that print on letter paper, landscape. Add `?theme=space` (or fantasy, horror, grit) to match a theme; the app's CM tab opens it in the table's theme.
- **Loot name tables:** https://mpjart.github.io/boomcore/loot-names.html (source: `docs/loot-names.md`)
- **Sample adventure:** https://mpjart.github.io/boomcore/the-hollow-crown.pdf — The Hollow Crown, a three-session starter adventure for levels 1 to 3.

The rules and loot pages are built from the Markdown in `docs/`. After editing it, run `python3 tools/build_docs.py` (needs `pip install markdown`) and commit the updated HTML.

## License

Code is released under the MIT License. See `LICENSE`.
