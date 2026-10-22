"""Steampunk loot name tables (d100 each). Source data for names.js and docs/loot-names.md.

Run from the repo root:  python3 tools/steampunk_names.py
It checks every table has 100 unique rows, then writes the "steampunk" set into names.js
and the Steampunk section into docs/loot-names.md (just before After Dark).
"""
import json, re

T, R, P, M = "t", "r", "p", "m"

# [name, hands, reach, damage]
WEAPONS = [
    # touch, physical
    ["Sword Cane",1,T,P],["Cavalry Sabre",1,T,P],["Pipe Wrench",1,T,P],["Monkey Wrench",1,T,P],["Piston Hammer",2,T,P],
    ["Steam Hammer",2,T,P],["Rivet Gauntlet",1,T,P],["Twin Rivet Gauntlets",2,T,P],["Brass Knuckles",1,T,P],["Clockwork Rapier",1,T,P],
    ["Bowie Knife",1,T,P],["Twin Stilettos",2,T,P],["Fire Axe",2,T,P],["Coal Shovel",2,T,P],["Crowbar",1,T,P],
    ["Chainsaw Sword",2,T,P],["Buzz-Saw Blade",1,T,P],["Drill Lance",2,T,P],["Hydraulic Fist",1,T,P],["Twin Hydraulic Fists",2,T,P],
    ["Gear-Toothed Mace",1,T,P],["Boiler Poker",1,T,P],["Railroad Spike",1,T,P],["Rail Hammer",2,T,P],["Bayonet Rifle",2,T,P],
    ["Umbrella Sword",1,T,P],["Walking Stick",1,T,P],["Bladed Fan",1,T,P],["Cleaver",1,T,P],["Surgeon's Bone Saw",1,T,P],
    ["Scalpel",1,T,P],["Piston Glaive",2,T,P],["Spring-Loaded Spear",2,T,P],["Clockwork Claws",2,T,P],["Anvil on a Chain",2,T,P],
    ["Brass Cudgel",1,T,P],["Tuning-Fork Halberd",2,T,P],["Lead Pipe",1,T,P],["Garrote Wire",2,T,P],["Spanner and Hammer",2,T,P],
    # ranged, physical
    ["Revolver",1,R,P],["Twin Revolvers",2,R,P],["Derringer",1,R,P],["Pepperbox Pistol",1,R,P],["Gatling Gun",2,R,P],
    ["Rivet Gun",1,R,P],["Harpoon Launcher",2,R,P],["Blunderbuss",2,R,P],["Elephant Gun",2,R,P],["Grapnel Pistol",1,R,P],
    ["Throwing Cogs",1,R,P],["Dart Pistol",1,R,P],["Flare Gun",1,R,P],["Repeating Crossbow",2,R,P],["Air Rifle",2,R,P],
    ["Steam Cannon",2,R,P],["Grenade Launcher",2,R,P],["Bolas",1,R,P],["Sniper Rifle",2,R,P],["Shotgun",2,R,P],
    ["Sawn-Off Shotgun",1,R,P],["Dynamite Sticks",1,R,P],["Smoke Bombs",1,R,P],["Nail Thrower",2,R,P],["Spring-Gun",1,R,P],
    ["Wrist Crossbow",1,R,P],["Twin Wrist Crossbows",2,R,P],["Slingshot",1,R,P],["Throwing Spanners",1,R,P],["Pneumatic Bolt Gun",2,R,P],
    ["Cane Gun",1,R,P],["Duck-Foot Pistol",1,R,P],["Mortar Tube",2,R,P],["Flechette Rifle",2,R,P],["Clockwork Pistol",1,R,P],
    # magical: aether, lightning, alchemy, and the occult
    ["Tesla Coil Staff",2,R,M],["Lightning Gun",2,R,M],["Aether Pistol",1,R,M],["Ray Gun",1,R,M],["Twin Ray Guns",2,R,M],
    ["Alchemical Flasks",1,R,M],["Phlogiston Thrower",2,R,M],["Sonic Horn",2,R,M],["Death Ray",2,R,M],["Mesmer Watch",1,R,M],
    ["Spirit Phonograph",2,R,M],["Aetheric Wand",1,R,M],["Static Rod",1,R,M],["Luminiferous Lantern",1,R,M],["Orrery of Doom",2,R,M],
    ["Galvanic Gauntlet",1,T,M],["Arc Blade",1,T,M],["Voltaic Whip",1,T,M],["Chrono Blade",1,T,M],["Spark Lance",2,T,M],
    ["Thunder Umbrella",1,T,M],["Ectoplasm Gloves",2,T,M],["Radium Knife",1,T,M],["Magnetic Hammer",2,T,M],["Galvanic Saber",1,T,M],
]

# [name, physical or magical]
ARMOR = [[n, P] for n in [
    "Leather Duster","Brass Goggles","Top Hat","Bowler Hat","Corset","Waistcoat","Frock Coat","Leather Apron","Welding Mask","Gas Mask",
    "Plague Doctor Mask","Brass Diving Helmet","Riveted Pauldron","Clockwork Arm","Brass Greaves","Hobnail Boots","Spats","Leather Gloves","Asbestos Gloves","Boiler Plate",
    "Stovepipe Hat","Pith Helmet","Aviator Cap","Flight Jacket","Bandolier","Tool Belt","Riveted Vest","Chainmail Waistcoat","Steel Bustle","Cog Shield",
    "Manhole Cover Shield","Umbrella Shield","Exo-Frame","Piston Legs","Hydraulic Arm","Brass Breastplate","Bulletproof Corset","Copper Bracers","Leather Bracers","Iron Lung",
    "Mechanical Spine","Spring Heels","Tweed Jacket","Greatcoat","Conductor's Coat","Fireman's Helmet","Miner's Helmet","Engineer's Overalls","Stoker's Smock","Leather Kilt",
    "Riveted Cuirass","Boilermaker's Gauntlets","Cast-Iron Kneecaps","Clockwork Leg","Brass Collar","Padded Tailcoat",
]] + [[n, M] for n in [
    "Aether Shield Belt","Tesla Armor","Galvanic Coat","Lightning Rod Hat","Faraday Cloak","Phlogiston Vest","Alchemist's Robe","Spiritualist's Shawl","Mesmerist's Cape","Clockwork Heart",
    "Chrono Vest","Gyroscopic Harness","Etheric Goggles","Luminous Goggles","Rocket Pack","Static Gloves","Arc-Field Bracers","Ectoplasm Veil","Seance Robes","Magnetic Boots",
    "Electro-Corset","Voltaic Cuirass","Rubber Insulation Suit","Copper Coil Crown","Radium-Painted Coat","Perpetual Motion Belt","Prism Monocle","Aether-Weave Gloves","Occultist's Waistcoat","Glowing Vacuum Tube Vest",
    "Spirit-Lens Spectacles","Hypnotic Bow Tie","Mercury Cloak","Ether Mask","Tesla Halo","Dirigible Cape","Thunder-Silk Scarf","Clockwork Wings","Phantom Opera Mask","Voltaic Top Hat",
    "Aurora Parasol","Galvanized Gown","Lodestone Girdle","Moon-Ray Visor",
]]

CLEVER = [
    "Brass","Copper","Cogwheel","Clockwork","Aether","Tesla","Gaslight","Soot-Stained","Coal-Fired","Steam-Powered",
    "Lord Ashcombe's","Professor Thistle's","Lady Cogsworth's","Dr. Vellum's","Baron Von Gearhart's","Madame Sprocket's","Captain Bellows'","Inspector Grimsby's","Old Tinker's","The Duchess'",
    "Mad Professor's","Engineer's","Stoker's","Chimney Sweep's","Airship","Dirigible","Zeppelin","Ironclad","Locomotive","Furnace",
    "Boilerworks","Foundry","Smog","Fog-Choked","Midnight Express","Victorian","Imperial","Royal Society","Patent-Pending","Prototype",
    "Overclocked","Spring-Loaded","Pneumatic","Hydraulic","Galvanic","Voltaic","Phlogiston","Radium","Mercury","Quicksilver",
    "Lightning","Thunderclap","Storm-Engine","Perpetual","Chrono","Gyroscopic","Magnetic","Electromagnetic","Ethereal","Luminiferous",
    "Mesmeric","Spiritualist's","Occult","Alchemist's","Apothecary's","Watchmaker's","Gunsmith's","Blacksmith's","Tinkerer's","Inventor's",
    "Rivet","Gearbox","Pistonhead","Flywheel","Sprocket","Valve","Ratchet","Crank","Bolt","Tick-Tock",
    "Smokestack","Coalheart","Ironside","Steelwhistle","Brassbound","Copperpot","Leatherback","Silvergear","Gilded Age","Grand Exhibition",
    "Whitechapel","Ironworks","Gutter","Chimney","Rooftop","Sky Pirate","Clocktower","Big Brass","Uncle Gizmo's","Granny Wrench's",
]

JEWELRY = [
    "Pocket Watch","Monocle","Cufflinks","Tie Pin","Cameo Brooch","Locket","Gear Pendant","Key Pendant","Signet Ring","Watch Fob",
    "Chatelaine","Hat Pin","Brass Compass","Copper Bangle","Brass Ring","Tesla Coil Earrings","Vacuum Tube Necklace","Clockwork Beetle Brooch","Wind-Up Songbird","Gyroscope Pendant",
    "Mainspring Bracelet","Escapement Earrings","Pressure Gauge Charm","Thermometer Pendant","Lightbulb Locket","Spark Plug Pin","Valve Wheel Ring","Rivet Ring","Bolt Earrings","Washer Bracelet",
    "Spectacles","Opera Glasses","Lorgnette","Pince-Nez","Ear Trumpet","Snuff Tin","Cigar Cutter","Pocket Knife","Hip Flask","Lucky Horseshoe",
    "Railway Pass","Airship Wings Pin","Inventor's Medal","Patent Medallion","Royal Society Badge","Guild Ring","Mourning Brooch","Hair Locket","Cog Cufflinks","Skeleton Key",
    "Clockwork Heart Pendant","Brass Choker","Lace Choker","Velvet Ribbon Choker","Pearl Drop Earrings","Jet Bead Necklace","Garnet Bracelet","Moonstone Ring","Opal Tiara","Copper Wire Torc",
    "Mechanical Spider Brooch","Wind-Up Mouse","Pocket Sundial","Pocket Barometer","Slide Rule Charm","Calipers Pendant","Gear Earrings","Sprocket Ring","Ratchet Bracelet","Hourglass Pendant",
    "Telegraph Key Charm","Morse Code Bracelet","Radium Ring","Glowing Vial Pendant","Mercury Vial Necklace","Aether Crystal Pendant","Lightning Jar Charm","Galvanic Ring","Magnet Ring","Lodestone Pendant",
    "Clockwork Hummingbird","Mechanical Owl Brooch","Tin Soldier Charm","Brass Thimble","Sewing Bird","Locomotive Charm","Zeppelin Pendant","Balloon Pendant","Propeller Earrings","Steam Whistle",
    "Pressure Valve Pendant","Boiler Badge","Engineer's Ring","Foundry Medal","Gentleman's Club Ring","Calling Card Case","Brass Buttons","Silver Shoe Buckles","Silk Pocket Square","Gilded Watch Chain",
]

GEMS = [
    "Ruby","Sapphire","Emerald","Diamond","Pearl","Opal","Topaz","Amethyst","Garnet","Jet",
    "Moonstone","Onyx","Jade","Turquoise","Aquamarine","Peridot","Citrine","Tourmaline","Agate","Carnelian",
    "Bloodstone","Tiger's Eye","Lapis Lazuli","Malachite","Hematite","Obsidian","Quartz","Rose Quartz","Smoky Quartz","Amber",
    "Coal Diamond","Aether Crystal","Phlogiston Ember","Radium Shard","Quartz Oscillator","Voltaic Crystal","Watch Jewel","Industrial Diamond","Brass Ingot","Copper Ingot",
    "Silver Ingot","Gold Ingot","Platinum Nugget","Mercury Bead","Lodestone","Meteorite Iron","Lightning Glass","Glowstone","Ectoplasm Pearl","Clockwork Ruby",
    "Black Opal","Fire Opal","Star Sapphire","Star Ruby","Cat's Eye","Alexandrite","Spinel","Zircon","Chrysoberyl","Tanzanite",
    "Morganite","Kunzite","Beryl","Heliodor","Iolite","Labradorite","Sunstone","Fluorite","Apatite","Kyanite",
    "Moss Agate","Fire Agate","Chalcedony","Jasper","Sodalite","Amazonite","Rhodonite","Rhodochrosite","Sphene","Demantoid",
    "Andalusite","Danburite","Benitoite","Painite","Taaffeite","Musgravite","Pink Diamond","Blue Diamond","Yellow Diamond","Champagne Diamond",
    "Steam Pearl","Smog Opal","Furnace Garnet","Engine Emerald","Gaslight Topaz","Tesla Sapphire","Boiler Ruby","Foundry Onyx","Chrono Quartz","Gearstone",
]

QUALITY = ["Sooty", "Tarnished", "Polished", "Precision-Cut", "Royal Society", "Imperial"]

def check():
    for name, rows in [("weapons", WEAPONS), ("armor", ARMOR), ("clever names", CLEVER), ("jewelry", JEWELRY), ("gems", GEMS)]:
        ks = [r[0] if isinstance(r, list) else r for r in rows]
        dup = sorted({k for k in ks if ks.count(k) > 1})
        bad = [k for k in ks if re.search(r"\b(coins?|tokens?|cores?|box(es)?)\b", k, re.I)]
        assert len(rows) == 100 and not dup and not bad, f"{name}: {len(rows)} rows, dup {dup}, renamed words {bad}"
    assert len(QUALITY) == 6

def write_names_js(path="names.js"):
    s = open(path).read()
    head, data = s.split("window.BOOM_NAMES=", 1)
    obj = json.loads(data.rstrip().rstrip(";"))
    st = {"w": WEAPONS, "a": ARMOR, "j": JEWELRY, "g": GEMS, "n": CLEVER, "q": QUALITY}
    new = {}
    for k, v in obj.items():          # keep steampunk just before After Dark
        if k == "steampunk":
            continue
        if k == "adult":
            new["steampunk"] = st
        new[k] = v
    new.setdefault("steampunk", st)
    open(path, "w").write(head + "window.BOOM_NAMES=" + json.dumps(new, ensure_ascii=False, separators=(",", ":")) + ";\n")

REACH = {T: "Touch", R: "Ranged"}
KIND = {P: "Physical", M: "Magical"}

def md_section():
    o = ["## Steampunk", "",
         "Brass, leather, and steam. Magical means aether, lightning, alchemy, and the occult. "
         "Gadgets and trinkets fill the jewelry role, and gems and ingots fill the gem role.", "",
         "### Weapons", "", "| d100 | Weapon | Hands | Reach | Damage |", "| --- | --- | --- | --- | --- |"]
    o += [f"| {i} | {w[0]} | {w[1]} | {REACH[w[2]]} | {KIND[w[3]]} |" for i, w in enumerate(WEAPONS, 1)]
    o += ["", "### Armor", "", "| d100 | Armor | Type |", "| --- | --- | --- |"]
    o += [f"| {i} | {a[0]} | {KIND[a[1]]} |" for i, a in enumerate(ARMOR, 1)]
    o += ["", "### Clever Names, Trinkets, and Gems", "", "| d100 | Clever name | Trinket | Gem |", "| --- | --- | --- | --- |"]
    o += [f"| {i} | {CLEVER[i-1]} | {JEWELRY[i-1]} | {GEMS[i-1]} |" for i in range(1, 101)]
    o += ["", "### Gem Quality by Tier", "", "| Tier | Gem quality |", "| --- | --- |"]
    o += [f"| T{i} | {q} |" for i, q in enumerate(QUALITY, 1)]
    return "\n".join(o) + "\n\n"

def write_md(path="docs/loot-names.md"):
    s = open(path).read()
    s = re.sub(r"## Steampunk\n.*?(?=## After Dark)", "", s, flags=re.S)
    i = s.index("## After Dark")
    open(path, "w").write(s[:i] + md_section() + s[i:])

if __name__ == "__main__":
    check()
    write_names_js()
    write_md()
    print("steampunk tables written: 100 weapons, 100 armor, 100 names, 100 trinkets, 100 gems, 6 qualities")
