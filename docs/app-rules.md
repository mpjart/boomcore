# Boom Dice App: Rules As Built

*Updated October 28, 2026.* A reference page for the rules already built into the Boom Dice app, read from the app's own code, plus the few places it still differs from the Boom Core Guidelines.

## Tables and Sharing

The standalone app lives in the Boomcore GitHub repo and runs at mpjart.github.io/boomcore (see SETUP.md in the repo for Firebase).

- **Starting a table:** the Core Master enters a name and taps **Start a new table**. The app makes a 6-letter table code and shows it at the top of the screen.
- **Joining:** players enter their name and the code and tap **Join**. A wrong code shows an error and lets them try again.
- **Who is the Core Master:** only the person who started the table gets the CM tab and the Core Master controls on sheets, loot, and the stash.
- **Remembered:** each device remembers its table, so reopening the app goes straight back in. **Leave table** at the top switches tables.
- **Solo:** **Play solo** gives the full Core Master view (party, loot boxes, stash, shop, one-shots, monsters, initiative, themes) on a private table saved on that device. Nobody else can join. The app also falls back to solo when shared tables aren't set up or Firebase can't load.

## Accessibility

- **No emoji:** the app uses no emoji anywhere (buttons, labels, the feed, toasts, or the CM bar), so screen readers read plain words. Buttons say what they do, like **Roll**, **Init**, **Melee**, **Ranged**, **Random name**, **Shop**, and **Dawn**.
- **Remove buttons:** the small × buttons are announced as "Remove." The Handout and loot box × buttons switch to their spoken confirm text ("Remove?", "Tap again to cancel") while armed.
- **Conditions:** on an open sheet, the CM's condition chips are announced as "Remove" plus the condition's name.
- **Decorations are hidden:** the mark on an exploded die (shown as *) and the fold arrow on a player card are hidden from screen readers.
- **Initiative:** the current turn reads "Now:" before the name.
- **Old feed entries:** events saved before this change have their emoji stripped when shown.

## Tabs

Tapping the Boom logo at the top opens the Boom Core Guidelines in a new tab.

- **Dice:** the shared **Map** (folded shut until tapped), roll expressions, saved quick rolls, the shared roll feed, and a highest-roll card. The dice rules fold under How it works.
- **Party:** every character sheet, collapsed until you tap one open (see Character Sheet Layout).
- **Loot:** loot boxes waiting to be opened, the party stash, and a market line at the top with the **Shop** button.
- **CM:** only the Core Master sees this tab. Its button bar toggles groups of cards (Theme, Loot, One-shots, Handouts, Monsters, Save) and holds the CM screen link, **Dawn**, and **Market**.

## Table Theme

The CM tab's **Table theme** card sets the table's look: colors and fonts only, the same as a player's own Theme pick.

- **Currency name:** a CM dropdown on the same card. **Match the theme** (the default) uses the theme's usual currency: Spirit coins for Core and both Fantasy looks, Doubloons for Pirate, Cogs for Steampunk, Grave coins for Horror, Bucks for Street Grit, Credits for Space. The CM can also pick any of those, **Gold** (gold pieces), or **Custom** (a name for one and for many, like clam / clams). It's shared with the whole table, saved with session exports, and every label that says coins uses it. A player's own Theme pick never changes it.
- **Never renamed:** soul cores, ability tokens, and loot boxes keep their Core names in every theme.
- **CM screen:** the CM screen link carries the theme and the currency name, so the screen matches.

Loot item names come from the loot name tables the CM toggles in Make a loot box (see Loot Tab), not from the theme. Handouts and the CM screen link still take the table's theme. The themes, in this order everywhere: Core Light, Core Dark, Fantasy Light, **Fantasy Dark** (a look only: dark magic, near-black violet with glowing purple and eldritch green, Cinzel titles, Cormorant Garamond text; it uses the Fantasy currency and monsters), **Pirate** (deep sea green and brass, Pirata One titles, Alegreya text, a brass-and-wood logo), **Steampunk** (dark leather browns and brass, Abril Fatface titles, Libre Baskerville text, a brass logo), Horror, Street Grit Light, **Street Grit Dark** (a look only: the same black, yellow, and grey industrial style on near-black panels, yellow-topped cards, and a hazard-stripe HP bar; it uses the Street Grit currency and monsters), and Space.

## Table Rules

A **Table rules** card sits under Table theme (in the Theme group). Only the Core Master can change it; it's one setting for the whole table, shared live and saved with session exports. Each change posts to the feed.

- **Leveling:** **Milestones (recommended)**, the default, or **XP bar (cores fill it)**. With milestones, the card shows **Level up party**, which raises every living hero one level (empty XP bar) and posts "Milestone! The party levels up." The sheet's own Level up button still works either way.
- **Market price dial:** one percent for the table, from −90% to +500%, with −5%, +5%, and Reset buttons. It starts at 0%. A note shows what a d100 sale of 60 would pay at the current setting.
- **Cores can be sold at the market:** a checkbox, off by default. While it's off, players have no Sell button on cores; the Core Master always does.

## Map

The Map sits at the top of the Dice tab, folded shut by default, with the dice log below it. It's a shared board for showing who is where, not a battle grid: no squares, measuring, line of sight, or fog. The Core Master decides distances.

- **Board style:** the CM picks **Chalk** (a green chalkboard with grainy chalk), **Glow** (a Space-style monitor screen: very dark blue with a faint cyan grid, scanlines, a dark vignette, and neon, glowing ink), or **Marker** (a white dry erase board in a silver frame with smooth marker ink). The choice is shared with the whole table and saved with it. Every line and label already drawn switches to the new style; on Marker, white shows as grey so it stays visible.
- **Map image:** the CM can set a **map image** behind the chalk; the board reshapes to the picture's proportions (capped at 3:1 either way), and a **Dim** slider darkens the picture so chalk stays readable. **No image** returns to the plain board.
- **CM tools:** Select (the default, so touching the board does nothing), Draw, Eraser, and Text; seven colors (white, yellow, pink, blue, red, green, black), each shown in the current board style; Thin, Mid, and Fat sizes; Undo (the most recent line); and **Wipe board** (tap twice). Players never see these tools.
- **New encounter:** CM buttons for **Easy**, **Fair**, and **Hard** (tap twice). The threat budget is 1, 1.5, or 2 points per living hero (a party of 4 when there are no heroes yet), **quartered when the party's average level is 1 and halved at levels 2 to 4**, rounded to the nearest point (at least 1). A boss costs 4, a standard monster 2, and a minion 1. Hard adds a boss when the budget allows, and Fair adds one half the time when the budget is **5 or more**; the rest is standard monsters and minions, up to 8 monsters. Levels are the party's average (minions one lower, and non-minions one higher on Hard). Names come from the table theme's monster list, and every name on those lists has an entry in the Bestiary (mpjart.github.io/boomcore/bestiary.html) with stats and abilities to add. Monsters are added to the CM tab with random stat points (the normal generator), bosses as Epic, and placed on the right; heroes not yet on the map go on the left. It chalks a title line, 3 to 5 pieces of labeled cover (tree, rocks, pillar, wall, water, crates), and traps (Easy 0 or 1, Fair 1, Hard 2) as red X's labeled with name, tier, dice, and the stat to avoid it. Trap tier is the party's average level ÷ 5 rounded up (at least T1), +1 on Hard. A new encounter wipes the chalk, removes monster tokens, and deletes the last generated monsters; hand-made monsters stay.
- **Players can draw:** a CM checkbox, off by default. When it's on, players get Select, Draw, Eraser, colors, sizes, and an Undo for their own last line.
- **Tokens:** the CM places heroes and monsters from the Party and Monsters trays under the board, one at a time or with Place all, and takes them off with Take all off or the × on a selected token. The CM can drag any token; a player can drag only their own hero (the one marked This is me). Each token shows an HP bar; monster HP shows only to the CM.
- **Roll card:** the d20 bomb in the board's corner opens a roll card in the table's theme. It has the HP bar, the six stats and ARM as small tap-to-roll chips, Init, Move and actions per turn, the physical and magic damage bonuses, every weapon and ability, a Both hands button when it applies, and a box for any roll such as 2d6+3. Every roll goes to the shared feed. A player's card shows only their own hero. The CM can pick any hero or monster from the list or tap a token to switch the card to it; the HP Amount box with **Dmg** (damage), Heal, and Full buttons is the CM's, the same as on the Party tab. A monster's abilities on the roll card follow the once-per-fight rule, the same as on its monster card.
- **Full screen:** a button above the board for everyone, made for a tablet or TV on the table. The board fills the screen (the browser's own full screen where the device allows it) and keeps the screen awake. A bar on top has **Big text** (on by default and remembered on the device: bigger token names, discs, HP bars, and roll card button), **Tools** (only for whoever can draw; the tools are hidden until tapped), and **Exit**. Esc or the browser's own exit also leaves. Tokens, chalk, and the roll card all keep working.
- **Shared:** chalk lines, tokens, the map image, and the Players can draw setting are the same for everyone at the table and are saved with it. Full screen and Big text are per device.

## Save and Load

The CM tab's **Save** card (shown with the Save button on the CM bar) moves a table in and out of a .json file.

- **Export session:** heroes, monsters, initiative, the theme, the table rules, the market, loot boxes, the stash, colors, handouts, the highest roll, the map (image, chalk, tokens, Players can draw), and the roll log. Each player's quick rolls stay on their own device.
- **Export encounter:** the monsters and the map only, without hero tokens.
- **Import:** pick a file and the card shows what's in it. **Add encounter only** replaces the map and chalk, keeps hero tokens for heroes at this table, and adds the file's monsters. **Replace the whole table** (session files with heroes only, tap twice) clears each saved part of the table and writes the file's version. Everyone at the table sees the result right away.

## One-shots

The CM tab's **One-shots** card puts a whole adventure's monsters, fights, and loot boxes one tap away. Kits come from oneshots.js in the repo, which tools/build_oneshots.py builds from the adventure Markdown in docs/oneshots/ (the same build makes the adventure's PDF). Adding a new one-shot file and running the build adds it to the picker with nothing else to change. Today it holds **The Hollow Crown**.

- **Picker:** a dropdown of one-shots (remembered on the CM's device) and a party size of **3 heroes** or **4 heroes** (it starts on the number of living heroes, 3 or 4). The card shows the levels and party size and a **Read the adventure** link to its PDF.
- **Acts:** each act or part folds open (remembered per device) to its scenes. A scene lists its **fights** (the monsters for the chosen party size) with **Add fight**, and its **loot boxes** with **Make box**.
- **Add fight:** adds that fight's monsters to the Monsters list with the adventure's exact stats, abilities, and notes. Several of the same monster are numbered (Hollow Recruit 1, Hollow Recruit 2), so they swarm. The feed posts what was added, and the Monsters cards are shown.
- **Make box:** a box for **each hero** makes one waiting box per living hero; **party loot** and **party stash** boxes make one group box with a 30-second timer. They wait in the Loot tab like boxes made by hand, use the loot name tables toggled in Make a loot box, and post to the feed. In a table without sharing, the boxes open at once.
- **Every monster in this adventure:** a folded list at the bottom adds any single monster with ＋.
- **Kit monsters** can carry an attack override (the Granary Rat bites for 1d4 and has no ranged attack, so its card shows no Ranged button), a note shown on the card, and a no-swarm flag (the rats fight one at a time). The Hollow King's Hollow Claim is a scripted story ability that breaks the tier cap and is used twice; the adventure says so.

## Handouts

The CM tab's **Handout creator** turns text (a note with a title, body, and signature) or an uploaded picture into an image drawn at the moment it's made. A **Handout look** dropdown on the card picks the handout's theme; it starts on the table theme (shown as Table theme (name)), and any other look can be chosen so a handout differs from the table and loot themes. The pick isn't saved and returns to the table theme on reload. The CM gives it to the whole party, the party stash, or one player.

- **Core Light and Core Dark:** an arcane spell card, not paper. A glowing orange-and-blue double frame with d20 sigils on the corners, a faint magic circle behind the words, a starfield with sparkles, and blue and orange nebula glow. The title is centered in Alfa Slab One with a glowing rune divider under it, the body is handwritten (Caveat), and a signed note gets a glowing d20 seal. Core Dark is a midnight sky with light, glowing ink; Core Light is a bright dawn sky with slate-blue ink. Pictures get a glowing double frame on the same background.
- **Fantasy Light:** aged parchment with a wax seal.
- **Fantasy Dark:** a forbidden grimoire page: near-black violet vellum with drifting purple and green mist, a faint ring of runes and a heptagram sigil behind the words, embers, and a glowing violet-and-green frame with eyes on the corners. The title glows green-edged violet in Cinzel Decorative with a glowing eye rule under it; the body glows in Cormorant Garamond, and a signed note gets a green sigil seal. Pictures get a glowing frame and a cold, dim tint. **Space:** a holographic transmission. **Horror:** stained, dripping paper. **Street Grit Light:** a taped, torn note.
- **Street Grit Dark:** the same torn, taped note in charcoal on asphalt: chalk-white marker text, a yellow title, a yellow margin line, yellow tape, and a black-and-yellow hazard stripe along the bottom.
- **Pirate:** a note is a grimy treasure map: stained parchment with burnt, torn edges, fold creases, coffee rings, a faint compass rose with rhumb lines, and a dotted trail to a red X. The title is dark red in Pirata One with an ink rule and a small Boom d20 bomb over crossed bones under it, the body is brown ink in IM Fell English, and a signed note gets a red wax seal stamped with the bomb and crossbones. A picture is nailed to a tattered black flag on a wooden pole, under the Boom d20 bomb (lit fuse and spark) painted over crossed bones in bone white, with grime, salt stains, and bullet holes; its caption is bone white.
- **Steampunk:** typewriter text (Special Elite) on dark, mottled leather with a stitched edge, a riveted brass frame, and brass gears on the corners. The title is gold Abril Fatface with a brass rule and gear under it, and a signed note gets a brass gear seal stamped B. Pictures sit in a riveted brass frame.

## Character Sheet Layout

- **Collapsed card:** name, level, an **Init** button, the HP bar, the six stats as small chips, and conditions. Tap the name to open the full sheet. Your own hero (from This is me) opens by default, and each device remembers which cards are open.
- **Always visible when open:** derived stats, HP with the CM's Amount box and **Dmg** (damage) and Heal controls, the **XP bar** (only when the table uses the XP bar), conditions, the six stats, and **Attacks**: equipped weapons with their own roll buttons, a Both hands button when it applies, and abilities.
- **HP Amount box:** a fixed width (wide enough to read a 3-digit number) so the Dmg, Heal, and Full buttons never squeeze it, on the Party tab, the map's roll card, and monster cards.
- **Folded sections:** **Gear** (shows how many slots are equipped), **Coins & Loot** (shows the highest coin tier and the item count), and **Notes** (the CM's notes box grows to fit its text, stays inside the card, and holds up to 500 characters). Coins & Loot opens on its own when a token or core panel needs it.
- **Edit button:** the CM's setup controls live here: name, Level up (which empties the XP bar) and − Level, Remove player, stat ± buttons, adding, training, and removing abilities, and gear names, values, and type dropdowns.
- **Color:** a dropdown at the bottom of the open sheet. Only that hero's player and the CM see it.
- **Theme:** next to Color on your own hero (the one marked This is me). It changes only the colors and fonts on your device, the same as the CM's Table theme. The currency name always follows the CM's setting. It starts on **Table**, the CM's pick, and follows the table if the CM changes it.
- **Print sheet:** at the bottom of every open sheet. It prints a one-page, ink-friendly sheet with HP, armor, move, actions, initiative, damage bonuses, the six stats (with gear bonuses), attacks and abilities with their dice, gear, coins, loot, conditions, and notes.
- **Unspent stat points** show on the sheet, with a reminder to tap Edit to spend them.

## Dice

- Roll expressions like 3d6+2, with saved quick rolls. The party sees everyone's rolls, and a best-roll card tracks the largest.
- **d6 and smaller** explode only on a 1. **d7 to d20** explode on their minimum or maximum. **d21 and larger** explode on a flat 10% chance.
- An exploding die is discarded and replaced by 2 new dice. Everything left adds up. In the feed, an exploded die is struck through and marked with *.
- **Boom cap:** one die group stops exploding after 100 dice in total.
- **Dice reveal:** a fresh roll in the feed shows its dice one at a time, in the order they were rolled, so a boom chain plays out die by die: each die drops in, an exploding die flares orange and pops, and the total lands last. A roll takes at most about 2.6 seconds whatever its size (bigger pools go faster). The toast and confetti wait for the reveal to finish. It plays on every device for rolls made in the last few seconds, survives the feed refreshing mid-reveal, never replays old rolls, and is skipped for one-die rolls and on devices set to reduce motion.
- **Booms** show as "Boom ×N" on the roll, the highest-roll card, and the toast.

## Stat Rolls

A stat roll is one d6 for every point in the stat, with a minimum of one die. With 0 points the die does not explode. With 1 or more points the dice explode.

## Character Math

Every stat counts its points plus any bonus from equipped items. The stat block shows the bonus next to the number, such as 3 +2.

- **Free stat points:** level - 1 - points spent (equipped bonuses do not use points)
- **Max HP:** 5 × (level + Constitution)
- **Move:** 5 + level + Speed
- **Actions per turn** (shown as Abilities/turn): 1 + Speed divided by 4, rounded down
- **Physical damage bonus:** Strength minus magical armor
- **Magic damage bonus:** Intellect minus physical armor
- **Total armor:** physical armor + magical armor
- **Initiative:** d20 + Speed

Bonus damage can go below zero. Each ability has a type (physical, magic, Constitution, Speed, Charm, or Luck). Physical and magic abilities use the damage bonuses above, and the other types add their full stat.

## Ability Slots, Tiers, and Training

3 slots at level 1, plus 1 for every 5 levels up to level 20 (7 slots at level 20), then plus 1 for every 10 levels after that.

- Every ability has a tier from T1 to T6, shown on its button. New abilities start at T1.
- **Ability tokens have no tier** and stack into one count in the Loot list.
- **Learning** a new T1 ability costs 1 token and a soul core of T1 or better, and needs a free slot. Only the Core Master learns abilities for a hero (players are told learning is the CM's call).
- **Training** an ability up one tier, to Tn, costs 1 token and a core of Tn or better. A core's training tier is the tier of the loot box it dropped from. The app always spends the cheapest core that works (the lowest tier that's high enough, then the lowest level). Players can train their own hero's abilities.
- **Mimic:** the CM can consume a token to mimic a monster's ability once; it's announced in the feed.
- Training raises plain d6 dice automatically, so 1d6 becomes 2d6. Each ability also has a **Train** button in Edit.

## Equipment

- **2 armor slots:** the CM marks each one physical or magical. Total armor adds both, and each type reduces the other kind of bonus damage. Armor equipped from loot equals its tier. Each slot shows its name on one row, with the value, type, and buttons on the row below so the name has room.
- **2 weapon slots:** each weapon is marked **physical or magical**, **1 or 2 hands**, and **touch or ranged**. The roll button shows the exact roll: 1d6 or 2d6 for touch, 1d4 or 2d4 for ranged, plus the matching bonus (Strength minus magical armor for physical, Intellect minus physical armor for magical). A **+N weapon** rolls N extra copies of its dice, so a +1 one-handed gun rolls 2d4 and a +2 rolls 3d4. If both slots hold matching one-handed weapons, a **Both hands** button rolls them together as one attack.
- **2 magic item slots:** each has a name, a value, and a type: **Phys dmg**, **Magic dmg**, **Str**, **Int**, **Con**, **Spd**, **Cha**, or **Luck**.
  - **A flat number** (like 2 or +2) is a passive bonus while the item is equipped. Phys dmg adds to the physical damage bonus and Magic dmg to the magic damage bonus, without changing any stat. A stat type adds to that stat, so a +2 Str belt raises Strength by 2 (which also raises physical damage and Strength checks). The slot shows what it adds, like "+2 physical damage."
  - **Dice** (like 1d6) make the item work like an ability, with its own **Roll** button that adds its stat, for things like healing (Luck) or shields (Con). Phys dmg and Magic dmg take only a whole number and never roll, since a magic item doesn't attack; if dice are entered, the slot shows a note instead of a roll button.
- **Equip and unequip:** weapons, armor, and jewelry in the Loot list have an **Equip** button that moves them into the first open slot of the right kind. Jewelry goes in a magic item slot. If every slot is full, the app shows an error. **Unequip** returns the item to the Loot list. An equipped item's +N adds to its stat.

## Coins and the Loot List

- **Spirit coins** are tracked in six tiers: Common, Uncommon, Rare, Epic, Legendary, and Divine. The CM has an Amount box, a tier dropdown, and Add and Subtract buttons. Coins stay tidy: **every 100 coins of a tier become 1 coin of the next tier up**, and paying or subtracting breaks bigger coins as needed, with any remainder placed in the right tier. If a hero does not have enough in total, the app shows an error. The stash works the same way. Older tables saved at 1,000 per tier convert on their own the next time a total changes (the value never changes, only how it's split).
- **Sellable reagents** combine into one running total per hero, listed by coin tier, with a single **Sell** button. They sell for their number, with the price dial applied.
- **Soul cores** stack by level and tier. **Use** appears only when the table uses the XP bar, and **Sell** only for the CM or when the CM allows selling cores. Each asks for a quantity.
- **Items** have **Equip** (not for gems or shop gear) and **Sell** (not for shop goods). Selling rolls a d100, which can boom, and pays that many coins of the item's tier, with the price dial applied. The roll appears in the feed.
- **Shop goods** (bought in the Shop) say "from the market" in the list and have no Sell button, since shops never buy their own stock back. Their owner can discard them with the × (Remove) button; the CM's × discards anything.
- **Who can sell:** the Core Master, or the player whose hero it is, and players only while the market is open (below).
- The notes box is only for notes.

## The Market

- **Market** is a toggle on the CM tab's button bar, next to Dawn. It reads **Market open** (filled in) or **Market closed**. One tap opens or closes it for the whole table; it's shared like the theme and saved with session exports.
- **Buying and selling need an open market.** Every Sell button (reagents, cores, items, gems, and potions) and every Buy button works for players only while the market is open. A player who tries while it's closed gets a **The market is closed** message. The Core Master can always buy and sell.
- **The price dial** (Table Rules) applies to every sale and every purchase, after any roll, rounded down: +20% turns a d100 sale of 60 into 72 and a 10-coin potion into 12. A shop price never drops below 1 coin. Sale messages note the dial when it isn't 0%.
- **Cores:** sell only if the CM has checked **Cores can be sold at the market**. Each core sells for its own d100 (all rolled together, so a stack can boom), in coins of the core's box tier, with the dial applied.
- **The feed notes it:** opening posts "The market is open," closing posts "The market is closed," and changing the dial posts the new setting.
- **Loot tab:** a line at the top shows whether the market is open (and the dial, if it isn't 0%), with the **Shop** button when it's open (always for the CM).
- **Starts closed:** a new table, or one made before the market existed, starts with the market closed until the CM opens it.
- Using cores, drinking potions, equipping, and the stash work the same whether the market is open or closed.

## The Shop

The **Shop** opens a pop-up over the app. Its stock is the Boom Shop Tables (shops.js in the repo, built from docs/shop-tables.md, the same lists as the Shops page).

- **Buying for:** a player buys only for their own hero (This is me); the CM picks any living hero. The hero's coins show as a purse line.
- **Shops:** a dropdown of Core and Fantasy, Pirate, Steampunk, Horror, Street Grit, and Space, starting on the table theme's set (both Core looks and both Fantasy looks use Core and Fantasy; both Street Grit looks use Street Grit). Each set has six shops as tabs.
- **Prices** are fixed, in coins of each item's tier, with the dial applied. Healing potions (and medgel, med kits) have a T1 to T6 picker and cost 10 coins of the chosen tier.
- **What you get:** a healing potion stacks with the hero's potions of that tier. A **weapon** lands in the Loot list as a plain physical weapon with its hands and reach from the shop list (no plus), ready to Equip. **Armor** lands as armor worth 1, physical or magical as listed. **Ammo** and everything else land as **gear** with no stats (ammo is marked "refills from storage").
- **Paying** takes the coins from the hero's totals, breaking bigger coins as needed; not enough coins shows the price instead. Each purchase posts to the feed, like "Mira buys Rope, 50 steps for 2 Common coins."

## XP Bar

- Shown only when the Table Rules say **XP bar**. A 0 to 10 bar under the HP bar, with a note of what's needed to reach the next level.
- **Only cores fill it.** A core of the hero's level fills 1/10; ten of them make a level. A core of a higher level fills the rest of the bar, so the hero gains exactly one level and the bar starts empty. A core of a lower level can't move the bar: Use spends nothing and says to train with it instead. Coins never buy levels.
- **Use** starts at the number of cores that reaches the next level. Using a stack applies the cores one at a time, so after a level up, cores that are now too small stay in the stack. A level up posts to the feed.
- The bar empties when a hero loses a level, is resurrected, or is leveled up by hand or by a milestone. Sheets saved with the old coin-value level meter convert to tenths of a bar the first time they're read.

## Colors

- Eight colors: red, amber, green, teal, blue, purple, pink, and slate. Each has a lighter shade in dark mode and a darker shade in light mode so text stays readable.
- Each hero's color is a **Color** dropdown at the bottom of their open sheet. The hero's player and the CM can change it; Default clears it. Rolls made from a sheet use that color.
- A player's free rolls (typed in the Dice tab) use their own hero's color.
- The CM picks their own roll color from the **Your color** dropdown next to the **Theme** dropdown in the CM tab's Table theme card.
- The color also tints the stat numbers, the level text, and the roll, ability, and Level up buttons.

## Loot Tab

The CM makes boxes in the CM tab's **Make a loot box** card (if the app can't save boxes at all, the card sits in the Loot tab and opens boxes at once): pick who it's for, set **Enemy lvl** and **Box tier** (the hero's level doesn't matter), and tap **Make loot box**. A box for one hero waits in the Loot tab until that hero's player (or the CM) opens it; a group box for the whole party or the stash has a timer, and everyone taps Grab it. Enemies can be level 1 to 99. Results post to the shared feed with a celebration.

- **Loot name tables:** the Make a loot box card has on/off toggles, in this order: **Fantasy**, **Pirate**, **Steampunk**, **Horror**, **Street Grit**, **Grit 18+** (crude, punny bonus names for adult tables, made to pair with Street Grit), and **Space**. Any mix works. Each part of an item's name rolls its own table from the ones that are on: the clever name from one and the base item from another (a Space name on a Horror weapon), and for gems the quality word and the gem each roll separately. The base item still sets a weapon's hands, reach, and physical or magical, and armor's type. With none on, names come from Core/Fantasy. The choice is remembered on the CM's device and saved on each box when it's made, so the box names its loot from those tables whoever opens it. The CM's **Random name** button for stash items uses the same toggles.
- **One die does everything:** the box rolls only d100s, no coin roll, no item-type roll, and no stat roll. The feed card shows every d100 (booms struck through), the coins in large type (or "No coins in this box"), and each pull on its own line.
- **The d100 pool:** start with 1d100. A 1 becomes 2 dice. A 100 upgrades the box one tier (up to T6) and becomes 2 dice. Every other die is its own loot at the final tier, and the pool stops growing at 100 dice.
- **2-21:** coins, the number rolled, in coins of the tier for the enemy's level. **22-35:** a sellable reagent worth the number rolled in coins of the box's tier. **36-50:** a healing potion of the box's tier.
- **51-70:** an ability token.
- **71-78 weapon, 79-86 armor, 87-93 jewelry, 94-99 gem.** From T2 up, a weapon, armor, or jewelry gets +1 to +5 (the box tier minus 1) on the stat its ones digit picks: 0-2 Constitution, 3-4 Strength, 5-6 Intellect, 7 Speed, 8 Charm, 9 Spirit/Luck. Gems never get a stat.
- **Names:** the number rolled picks clever name #N (and gem #N) from one of the toggled tables; the base item is rolled. The CM's Random name button for stash items is still fully random.
- **Any even roll from 2-98:** also drops a soul core of the monster's level, at the box's final tier. The loot list marks it "+ core."
- **Where it goes:** a hero's box goes to that hero's coins and Loot list. **Whole party** gives every hero a full copy; **Party stash** puts one shared copy in the stash. The Loot button on a boss's monster card selects the whole party.

## The Party Stash

- The stash is a shared pile of coins by tier, items, tokens, and cores, in the Loot tab.
- Everyone picks which hero they are (it is remembered on their device). Players can **Put in** items, cores (with a quantity), and coins from their hero's Loot list and **Take** anything out. Each move is announced in the feed. There is no direct give.
- The CM chooses **CM** in the Act as menu to see the CM tools, or picks a hero to see exactly what that player sees. The CM tools have a lock checkbox (Players can put in and take out), a button to remove anything, and forms to add items (name, type, tier, stat, and bonus), tokens, cores (level and amount), and coins. These add forms fold under CM: add to stash.
- The stash takes the color of the hero acting.

## CM Tab: Initiative and Monsters

- **Initiative:** the Init button on each card rolls d20 + Speed. The CM can roll for everyone (heroes and monsters), move to the next turn, and clear the order, and the round counter goes up automatically. The current turn is marked "Now:".
- **Monster generator:** enter a name and a level (1 to 99), choose Minion, Standard, or Boss, and choose a rarity. Boss defaults to Epic and the others to Common. After an encounter, Remove all monsters (tap twice to confirm) clears every monster card and takes them out of initiative.
- **Grit 18+ monsters:** while the Grit 18+ loot table toggle is on (Make a loot box), the Bestiary's Grit 18+ monsters join the name box suggestions and the map's New encounter lists in every theme, mixed in with the theme's own. Typing a Grit 18+ name builds it even with the toggle off.
- **Bestiary monsters:** the name box suggests every Bestiary monster for the table's theme: that theme's own monsters plus the crossover monsters under its local names (in Pirate, Bilge Rat for Rats). Typing or picking one sets the type and rarity and says so under the button. Generate then deals its stat points in the bestiary's point order instead of randomly, adds its abilities (none for a minion, the signature for a standard, all three for a boss) at its tier cap with a short description of what each does (targets, effects, and rounds), labels its attacks (Melee · Claws), and puts its tactics in the card's note. A name with a number on the end (Goblin 2) still matches. The New encounter button builds its monsters the same way and uses each one's bestiary rarity. **Reroll stats** always deals random points. The data is bestiary.js, built from the bestiary's source files.
- **Points:** a minion gets (level - 1) divided by 2 points, a standard monster gets level - 1, and a boss gets 2 × (level - 1) + 3. A monster not in the bestiary gets them dealt randomly across the six stats.
- **HP:** 5 × (level + Constitution), halved for a minion (rounded up) and tripled for a boss. **Armor** is one total: a minion has none, a standard monster gets level divided by 5, and a boss gets level divided by 3, rounded down. You can edit it.
- **Attacks:** melee is 2d6 + Strength, and ranged is 2d4 + Intellect, **or 1d6 and 1d4 for a level 1 monster** (one hand, like the commoners it fights), unless a one-shot kit set an override. The dice follow the level, so raising a level 1 monster to level 2 switches it to 2d6 and 2d4. Monsters have no gold.
- **Abilities:** up to 3 per monster, each with a name, dice, and stat type. The Abilities heading shows the **tier cap**: the monster's rarity tier, but no higher than its level ÷ 3, rounded up (a level 7 Epic boss shows "up to T3 (3d6)"), and the add box suggests that many d6. The cap is a guide; the app doesn't block bigger dice.
- **No-roll abilities:** a bestiary ability that calls allies or does something without dice (Call the Hive, Raise the Dead) shows "no roll"; using it posts what it does to the feed.
- **Once per fight:** tapping an ability rolls it and marks it **used** (the button dims and reads "· used"). Tapping a used ability shows "already used this fight"; a second tap within 3 seconds uses it anyway. **Ready abilities** (on the card whenever one is used) clears the marks for the next fight. The map's roll card shares the same marks.
- **The card:** the name, level, rarity, and tier (from the level band) stay at the top, with the type, and a kit monster's note under the stats. It has an Amount box with **Dmg** (damage), Heal, and Full buttons, Reroll stats, Initiative, a Loot button that opens the loot box maker set to the monster's level and rarity, and Remove.
- **Swarms:** two or more living minions of the same kind (the same name, ignoring a number at the end, and the same level) get a swarm card at the top of the Monsters list, showing how many are in it. **Swarm melee** and **Swarm ranged** pool every living minion's attack dice into one roll and add the highest bonus once (four 2d6 + 1 minions roll 8d6 + 1; level 1 minions pool 1d6 each). **Swarm initiative** rolls once with the highest Speed and puts one "swarm" line in the initiative order in place of each minion's own. As minions drop, the swarm's dice shrink; at one left, the swarm card goes away. Splitting the dice between heroes is the CM's call out loud.

## Damage, Level Loss, and Death

- The CM's **Dmg** (damage) button takes the final amount. Temp HP absorbs damage first, and armor is not subtracted automatically.
- If HP would drop below 1 at level 1, the character dies.
- At level 2 or higher, the character drops a level, returns to full HP at the new maximum, and their XP bar empties. If they have no unspent stat points, they lose 1 point from a random stat, and any abilities beyond the new slot limit are lost at random.
- The CM's Resurrect button returns a dead character to level 1 with all stat points cleared.

## Other Tracking

- **Conditions:** Poisoned, Stunned, Prone, Burning, Bleeding, Frightened, Blessed, Slowed, Invisible, plus custom ones the CM types in.
- Heal, Temp HP, and Full heal buttons on heroes. **Dawn** clears every hero's temp HP.

## Where the App and the Core Guidelines Still Differ

- **Level loss:** the app restores full HP.
- **Armor:** the app does not subtract it from damage automatically.
- **Resurrection:** the app resets a dead character to level 1. The Core Guidelines recommend 24 hours, and the CM can change that.
- **Holding a turn:** the Core Guidelines let a player hold their turn. The table handles it out loud; the app's initiative order stays as rolled, by design.
- **Saving actions:** the Core Guidelines let a player save actions for later in the round. The table tracks saved actions out loud; the app doesn't.
- **Ties:** the app doesn't track who conceded or double the bigger person's next roll; the table handles it out loud.
- **Swarm targets:** the app rolls a swarm's pooled dice at one target; splitting them between heroes is done by hand.
- **Monsters:** they use a simple model with one armor total and no level loss, and the CM tweaks them by hand.
- **Monster abilities:** the app shows the tier cap but doesn't enforce it on abilities the CM types in. A bestiary monster's abilities are set at its tier when it's made and don't change if its level changes later.
