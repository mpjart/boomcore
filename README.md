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
- **New encounter (Easy / Fair / Hard):** a CM button set (tap twice) that builds a fight from the Chapter 8 threat points: 1, 1.5, or 2 points per hero (halved at party level 1-2), with Minions worth 1, Standard monsters 2, and Bosses 4. Hard always tries for a boss, and Fair sometimes does. Monster names match the table's theme, and their levels follow the party's average. It also chalks in 3 to 5 pieces of cover (trees, rocks, pillars, a wall, water, crates) and traps by difficulty (Easy 0 or 1, Fair 1, Hard 2), each labeled with its tier, dice, and the stat to dodge or resist. A new encounter replaces the chalk and the last generated monsters; monsters you made by hand stay.
- **Players can draw:** a CM checkbox that gives players Select, Chalk, Eraser, colors, sizes, and Undo for their own lines. Off by default.
- **Roll card:** the d20 bomb in the board's corner opens a card in the table's theme with HP, the six stats and armor as tap-to-roll chips, Init, attacks, abilities, and a box for any roll like 2d6+3. Rolls go to the shared feed. Players get their own hero's card; the CM can pick any hero or monster, or tap a token to switch to it. HP buttons stay CM-only, as on the Party tab.
- Chalk lines, tokens, and the map image are shared with the whole table (`map`, `mapstrokes`, and `maptokens` under the table).

## Character sheets

Every open sheet has a **🖨 Print sheet** button that prints a clean, ink-friendly one-page sheet: HP, armor, move, actions, initiative, damage bonuses, the six stats, attacks and abilities with their dice, gear, coins, loot, conditions, and notes.

## Save and load

The CM tab's **💾 Save** card exports the table to a `.json` file and imports it again, on the same device or another one.

- **Export session:** heroes, loot, the stash, monsters, initiative, handouts, the theme, the map (chalk, tokens, image), and the roll log.
- **Export encounter:** just the monsters and the map, for fights prepped ahead of time (in solo mode, say).
- **Import:** shows what's in the file first. **Add encounter only** adds its monsters and map and keeps your party. **Replace the whole table** (session files only, tap twice) swaps in everything from the file.

## Core Master tab

A button bar at the top of the CM tab toggles each group of cards on or off: **🎨 Theme**, **🎁 Loot** (loot box maker), **📜 Handouts**, and **👹 Monsters**, and **💾 Save**. Turn on any mix, all of them, or none. Two action buttons sit on the same bar: **📋 CM screen** opens the screen in a new tab, and **🌅 Dawn** starts a new day (tap twice). Each device remembers which are on. Initiative always sits with the roll feed, not in the CM tab.

## Handouts

The CM tab has a handout creator: type a note (title, text, and an optional signature) or upload a picture with a caption. A **Handout look** dropdown picks its theme, starting on the table theme, so a handout can look different from the table (the choice isn't saved; it resets to the table theme on reload). The looks: a ruled index card for Core, sealed parchment for Fantasy Light, a forbidden grimoire page (glowing violet runes, a heptagram sigil, eyes on the corners, a green sigil seal) for Fantasy Dark, a transmission screen for Space, a bloodstained page for Horror, taped notebook paper for Street Grit Light, charcoal notebook paper on asphalt with yellow tape, a yellow margin line, and a hazard stripe for Street Grit Dark, painted lettering on a ship's planked hull (rope border, brass corners, anchor seal) for Pirate, and typewriter text on dark leather in a riveted brass frame with gears (and a gear seal) for Steampunk. The **For** picker sends it to the whole party (the Handouts list in the Party tab), the party stash (anyone acting as a hero can Take it), or one hero privately (only that hero's player and the Core Master see it; the feed just says a private handout was given). A hero holding a handout can put it back in the stash to pass it on. Private handouts are hidden in the app, not encrypted, so a player poking at the table's data could still find them.

## Themes

**Colors:** each hero's color is a dropdown at the bottom of their open sheet (the hero's player and the Core Master can change it), and a player's free rolls use their hero's color. Next to it, a player's own hero has a **Theme** dropdown that changes only the colors and fonts on their device. It starts on the Core Master's pick. The Core Master's own roll color sits next to the theme dropdown in the CM tab.

The Core Master picks the table's theme from a dropdown in the CM tab: Core Light, Core Dark, Fantasy Light, Fantasy Dark, Pirate, Steampunk, Horror, Street Grit Light, Street Grit Dark, or Space. Core Light uses the CM screen's look: slate blue and burnt orange on cream, with Alfa Slab One titles. Fantasy Dark is dark magic: near-black violet with glowing purple and eldritch green, Cinzel titles, and Cormorant Garamond text (a look only; it uses the Fantasy names and currency). Street Grit Dark keeps the black, yellow, and grey industrial look on near-black panels with yellow-topped cards (a look only; it uses the Street Grit currency and monsters). Pirate is deep sea green with brass, Pirata One titles, and Alegreya text. Steampunk is dark leather and brass, Abril Fatface titles, and Libre Baskerville text. The theme changes the look only (colors and fonts). Under it, the Core Master sets the **Currency name** for the whole table: Match the theme (Spirit coins, Doubloons, Cogs, Grave coins, Bucks, or Credits), Gold, or Custom (one and many, like clam / clams). Everyone sees that name whatever look they pick, and it goes to the CM screen link. Soul cores, ability tokens, and loot boxes keep their Core names in every theme.

## Loot names

Every item a loot box drops gets a name from the d100 tables in `names.js` (Fantasy, Pirate, Steampunk, Horror, Street Grit, Grit 18+, and Space): a clever name plus a base item, like Black Hawk Longbow (+2 Speed). Gems get a quality word for their tier. Weapons carry their hands, reach, and damage type, and armor its type, so equipping sets them automatically. In **Make a loot box** the Core Master toggles any mix of tables (none on means Core/Fantasy), and each part of a name rolls its own table, so a Pirate name can land on a Space item. **Grit 18+** (formerly After Dark) is a bonus set for adult tables, made to pair with Street Grit. The Pirate and Steampunk tables are generated by `tools/pirate_names.py` and `tools/steampunk_names.py`, which also write their sections of `docs/loot-names.md`. The tables are reviewed in the Boom Loot Name Tables doc.

## To do next

Nothing on the list right now. Holding a turn is handled at the table: the player says they're holding and acts later in the round, and the app's initiative order doesn't need to move.

## Rules and Core Master screen

- **Rules:** https://mpjart.github.io/boomcore/rules.html (source: `docs/core-guidelines.md`). Tap the Boom logo at the top of the app to open them.
- **Core Master screen:** https://mpjart.github.io/boomcore/cm-screen.html — three panels that print on letter paper, landscape. Add `?theme=space` (or fantasy, fantasydark, pirate, steampunk, horror, grit, gritdark) to match a theme; the app's CM tab opens it in the table's theme.
- **Loot name tables:** https://mpjart.github.io/boomcore/loot-names.html (source: `docs/loot-names.md`)
- **Sample adventure:** https://mpjart.github.io/boomcore/the-hollow-crown.pdf — The Hollow Crown, a three-session starter adventure for levels 1 to 3.

The rules and loot pages are built from the Markdown in `docs/`. After editing it, run `python3 tools/build_docs.py` (needs `pip install markdown`) and commit the updated HTML.

## License

Code is released under the MIT License. See `LICENSE`.
