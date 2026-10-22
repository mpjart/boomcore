"""Pirate / Naval loot name tables (d100 each). Source data for names.js and docs/loot-names.md.

Run from the repo root:  python3 tools/pirate_names.py
It checks every table has 100 unique rows, then writes the "pirate" set into names.js
and the Pirate section into docs/loot-names.md (just after Fantasy, before Steampunk).
"""
import json, re

T, R, P, M = "t", "r", "p", "m"

# [name, hands, reach, damage]
WEAPONS = [
    ["Cutlass",1,T,P],["Twin Cutlasses",2,T,P],["Boarding Axe",1,T,P],["Boarding Pike",2,T,P],["Belaying Pin",1,T,P],
    ["Marlinspike",1,T,P],["Dirk",1,T,P],["Twin Dirks",2,T,P],["Hook Hand",1,T,P],["Twin Hooks",2,T,P],
    ["Sabre",1,T,P],["Officer's Sword",1,T,P],["Hanger",1,T,P],["Smallsword",1,T,P],["Rapier",1,T,P],
    ["Broadsword",1,T,P],["Claymore",2,T,P],["Boarding Hatchet",1,T,P],["Grappling Hook",1,T,P],["Anchor",2,T,P],
    ["Oar",2,T,P],["Gaff Hook",2,T,P],["Whaling Lance",2,T,P],["Flensing Knife",1,T,P],["Gutting Knife",1,T,P],
    ["Trident",2,T,P],["Capstan Bar",2,T,P],["Handspike",1,T,P],["Rum Bottle",1,T,P],["Broken Rum Bottle",1,T,P],
    ["Spare Peg Leg",1,T,P],["Brass Knuckles",1,T,P],["Cat o' Nine Tails",1,T,P],["Chain Flail",1,T,P],["Wheel Spoke",1,T,P],
    ["Deck Mop",2,T,P],["Bilge Pump Handle",1,T,P],["Holystone",1,T,P],["Galley Cleaver",1,T,P],["Galley Skillet",1,T,P],
    ["Swordfish Bill",2,T,P],["Shark Jawbone",1,T,P],["Narwhal Tusk",2,T,P],["Whalebone Club",1,T,P],["Sword Cane",1,T,P],
    ["Bayonet Musket",2,T,P],["Boarding Spear",2,T,P],["Boarding Halberd",2,T,P],["Machete",1,T,P],["Kris",1,T,P],
    ["Twin Sailor's Knives",2,T,P],["Cutlass and Dirk",2,T,P],["Eel-Skin Whip",1,T,P],["Ship's Lantern",1,T,P],["Knotted Rope",1,T,P],
    ["Flintlock Pistol",1,R,P],["Twin Flintlocks",2,R,P],["Brace of Pistols",2,R,P],["Blunderbuss",2,R,P],["Musket",2,R,P],
    ["Long Rifle",2,R,P],["Dragoon Pistol",1,R,P],["Duck-Foot Pistol",1,R,P],["Swivel Gun",2,R,P],["Hand Cannon",2,R,P],
    ["Grenado",1,R,P],["Harpoon",2,R,P],["Harpoon Gun",2,R,P],["Throwing Knives",1,R,P],["Throwing Hatchets",1,R,P],
    ["Grapple Gun",1,R,P],["Crossbow",2,R,P],["Speargun",2,R,P],["Sling",1,R,P],["Bag of Coconuts",1,R,P],
    ["Flare Pistol",1,R,P],["Bottle Bombs",1,R,P],["Chain Shot Bolas",1,R,P],["Stink Pot",1,R,P],["Weighted Net",2,R,P],
    ["Storm Staff",2,R,M],["Conch Shell",1,R,M],["Voodoo Doll",1,R,M],["Twin Voodoo Dolls",2,R,M],["Siren's Harp",2,R,M],
    ["Sea Witch's Wand",1,R,M],["Tide Orb",1,R,M],["Compass of Storms",1,R,M],["Cursed Doubloon",1,R,M],["Shanty Squeezebox",2,R,M],
    ["Fiddle",2,R,M],["Bone Rattle",1,R,M],["Coral Wand",1,R,M],["Kraken Ink Flask",1,R,M],["Ghost Lantern",1,R,M],
    ["Trident of Tides",2,T,M],["Stormglass Cutlass",1,T,M],["Drowned Man's Hook",1,T,M],["Leviathan Fang",1,T,M],["Barnacle Blade",1,T,M],
]

# [name, physical or magical]
ARMOR = [[n, P] for n in [
    "Tricorn Hat","Bicorne Hat","Captain's Coat","Frock Coat","Leather Doublet","Buff Coat","Sea Boots","Boarding Breastplate",
    "Cuirass","Gorget","Bandana","Eye Patch","Peg Leg","Sailcloth Vest","Oilskin Coat","Sou'wester Hat","Wool Peacoat",
    "Leather Gloves","Leather Bracers","Shark-Skin Vest","Turtle Shell Shield","Buckler","Hatch Cover Shield","Barrel Armor",
    "Cork Life Vest","Diving Helmet","Diving Suit","Chain Shirt","Wide Sash","Boarding Gauntlets","Bandolier","Crab Shell Pauldrons",
    "Whalebone Corset","Leather Jerkin","Striped Shirt","Monkey Jacket","Navy Greatcoat","Admiral's Epaulettes","Marine's Shako",
    "Stocking Cap","Ruffled Cuffs","Sea Turtle Helm","Rope Harness","Life Ring","Shin Splints","Fish-Scale Mail","Canvas Gaiters",
    "Galley Apron","Tarred Wraps","Iron Collar","Ship's Bell Helm","Cook Pot Helm","Gun Port Shield","Knee Breeches",
    "Powder-Burned Gloves","Hook Arm Brace","Cabin Door Shield","Sealskin Boots","Cutlass Baldric","Quilted Gambeson",
]] + [[n, M] for n in [
    "Mermaid Scale Vest","Siren's Shawl","Ghost Ship Cloak","Kraken Ink Cloak","Sea Witch Robe","Voodoo Mask","Coral Crown",
    "Pearl Diver's Veil","Tidecaller Robe","Storm Cloak","Fog Shroud","Seaweed Wrap","Barnacle Mantle","Davy Jones' Coat",
    "Drowned Captain's Hat","Albatross Feather Cape","Saint Elmo's Mantle","Glowing Plankton Sash","Jellyfish Veil","Sea Serpent Scales",
    "Selkie Pelt","Shark-Tooth Headdress","Shell Bracers","Starfish Pauldrons","Moonlit Sailcloth","Trade Wind Scarf","Mariner's Tattoos",
    "Compass Rose Tattoo","Lucky Bandana","Rum-Soaked Rags","Sea Foam Cloak","Lighthouse Lens Visor","Whale Song Vest","Stormglass Goggles",
    "Ghostly Chains","Cursed Treasure Cloak","Weather Eye Patch","Kraken-Hide Coat","Pearl Mail","Abyssal Diving Suit",
]]

CLEVER = [
    "Kraken","Jolly Roger","Salty","Davy Jones'","Sea Dog","Bilge Rat","Barnacle","Crimson Tide","Black Spot","Dead Man's",
    "Cap'n Redbeard's","One-Eyed Jack's","Peg-Leg Pete's","Mad Molly's","Calico","Scurvy","Landlubber's","Powder Monkey's","Quartermaster's","Bosun's",
    "First Mate's","Cabin Boy's","Admiral's","Commodore's","Privateer's","Buccaneer's","Corsair's","Marooned","Mutineer's","Stowaway's",
    "Shipwright's","Navigator's","Gunner's","Ship's Surgeon's","Galley Cook's","Harpooner's","Smuggler's","Rumrunner's","Wrecker's","Tortuga",
    "Port Royal","Barbary","Spanish Main","Seven Seas","Hurricane","Squall","Doldrums","Trade Wind","Riptide","Maelstrom",
    "Whirlpool","Fog-Bound","Storm-Tossed","Sunken","Drowned","Ghost Ship","Flying","Leviathan","Siren's","Mermaid's",
    "Sea Witch's","Shark-Tooth","Albatross","Parrot's","Gull","Seahorse","Octopus","Kraken-Bane","Black Flag","Skull-and-Bones",
    "Crow's Nest","Plank-Walker's","Keelhauled","Grog-Soaked","Rum-Soaked","Tar-Stained","Salt-Crusted","Briny","Brass","Gilded",
    "Pieces-of-Eight","Doubloon","Buried","X-Marks-the-Spot","Lucky Seven","Dead Calm","High Tide","Ebb Tide","Neptune's","Old Salt's",
    "Iron Anne's","Bloody Bess's","Gentleman Jim's","Ironjaw's","Mad Jack's","Scarlet Sally's","Captain Squid's","Admiral Gull's","Barnacle Bart's","Sea Hag's",
]

JEWELRY = [
    "Gold Hoop Earring","Skull Ring","Doubloon Necklace","Compass Pendant","Pocket Watch","Locket","Gold Tooth","Signet Ring","Captain's Medal","Anchor Pendant",
    "Shark Tooth Necklace","Pearl Necklace","Pearl Earring","Toe Ring","Nose Ring","Ankle Chain","Bone Bracelet","Cowrie Shell Necklace","Sailor's Knot Bracelet","Rope Bracelet",
    "Spyglass Charm","Ship in a Bottle","Message in a Bottle","Treasure Map Locket","Pieces of Eight Bracelet","Admiral's Star","Letter of Marque","Parrot Feather Earring","Mermaid Comb","Conch Pendant",
    "Starfish Brooch","Coral Bangle","Kraken Ring","Crossbones Pin","Jolly Roger Patch","Bosun's Whistle","Ship's Bell Charm","Sextant Pendant","Lighthouse Charm","Rabbit's Foot",
    "Monkey's Paw","Lucky Die","Dice Bracelet","Gold Chain","Ring of Keys","Captain's Key","Brass Buttons","Rum Flask","Tobacco Pipe","Corncob Pipe",
    "Gold Nose Stud","Jeweled Eye Patch","Glass Eye","Wedding Band","Mourning Ring","Puzzle Ring","Navy Medal","Coat of Arms Ring","Pirate Lord's Seal","Harbor Master's Badge",
    "Lighthouse Keeper's Ring","Scrimshaw Tooth","Scrimshaw Pendant","Sea Glass Necklace","Sea Glass Earrings","Tortoiseshell Comb","Seahorse Brooch","Octopus Ring","Mermaid Tear Pendant","Siren's Locket",
    "Voodoo Charm","Gris-Gris Bag","Juju Beads","Bone Nose Ring","Gold Anklet","Silver Cuff","Iron Shackle Bracelet","Broken Manacle","Anchor Chain Necklace","Hourglass Charm",
    "Compass Ring","Sundial Ring","Astrolabe Pendant","Star Chart Locket","North Star Brooch","Captain's Ring","Quartermaster's Chain","Cabin Boy's Medal","Mermaid Scale Earring","Pearl Toe Ring",
    "Shrunken Head","Lock of Hair Locket","Barnacle Ring","Krakenbone Bangle","Pocket Compass","Ruby Cufflinks","Silver Buckle","Gold Belt Buckle","Feathered Hat Pin","Trade Bead Necklace",
]

GEMS = [
    "Pearl","Black Pearl","Pink Pearl","Baroque Pearl","Ruby","Sapphire","Emerald","Diamond","Amethyst","Topaz",
    "Aquamarine","Coral","Red Coral","Amber","Jet","Jade","Opal","Fire Opal","Garnet","Peridot",
    "Tourmaline","Moonstone","Sunstone","Onyx","Lapis Lazuli","Turquoise","Carnelian","Citrine","Spinel","Zircon",
    "Sea Glass","Abalone","Mother of Pearl","Ambergris","Gold Nugget","Silver Ingot","Gold Bar","Mermaid's Tear","Kraken's Eye","Siren Stone",
    "Stormglass","Davy Jones' Pearl","Sailor's Sapphire","Leviathan Scale","Sea Serpent Eye","Abyssal Onyx","Tidestone","Moon Pearl","Bloodstone","Heliodor",
    "Chrysoberyl","Alexandrite","Tanzanite","Morganite","Kunzite","Beryl","Agate","Fire Agate","Moss Agate","Labradorite",
    "Obsidian","Hematite","Malachite","Rhodochrosite","Chalcedony","Jasper","Quartz","Rose Quartz","Smoky Quartz","Star Sapphire",
    "Star Ruby","Cat's Eye","Tiger's Eye","Lodestone","Meteorite Shard","Sunken Diamond","Spanish Emerald","Cursed Ruby","Lagoon Jade","Reef Opal",
    "Coral Rose","Conch Pearl","Blue Pearl","Golden Pearl","Ghost Pearl","Tortoiseshell","Benitoite","Larimar","Amazonite","Sodalite",
    "Iolite","Ametrine","Prasiolite","Sphene","Demantoid","Andalusite","Danburite","Euclase","Kyanite","Fluorite",
]

QUALITY = ["Barnacled", "Sea-Worn", "Polished", "Flawless", "Sunken-Treasure", "King's Ransom"]

def check():
    for name, rows, key in [("weapons", WEAPONS, lambda r: r[0]), ("armor", ARMOR, lambda r: r[0]),
                            ("clever names", CLEVER, str), ("jewelry", JEWELRY, str), ("gems", GEMS, str)]:
        ks = [key(r) for r in rows]
        dup = sorted({k for k in ks if ks.count(k) > 1})
        assert len(rows) == 100, f"{name}: {len(rows)} rows"
        assert not dup, f"{name} duplicates: {dup}"
        bad = [k for k in ks if re.search(r"\b(coins?|tokens?|cores?|box(es)?)\b", k, re.I)]
        assert not bad, f"{name} uses a renamed word: {bad}"
    assert len(QUALITY) == 6

def js_set():
    return {"w": WEAPONS, "a": ARMOR, "j": JEWELRY, "g": GEMS, "n": CLEVER, "q": QUALITY}

def write_names_js(path="names.js"):
    s = open(path).read()
    head, data = s.split("window.BOOM_NAMES=", 1)
    obj = json.loads(data.rstrip().rstrip(";"))
    new = {}
    for k, v in obj.items():          # keep pirate just before Grit 18+ (key adult)
        if k == "pirate":
            continue
        if k == "adult":
            new["pirate"] = js_set()
        new[k] = v
    new.setdefault("pirate", js_set())
    open(path, "w").write(head + "window.BOOM_NAMES=" + json.dumps(new, ensure_ascii=False, separators=(",", ":")) + ";\n")

HANDS = {1: "1", 2: "2"}
REACH = {T: "Touch", R: "Ranged"}
KIND = {P: "Physical", M: "Magical"}

def md_section():
    o = ["## Pirate", "",
         "Salt, steel, and powder smoke. Magical means sea magic: storms, tides, curses, and voodoo. "
         "Trinkets fill the jewelry role, and treasure fills the gem role.", "",
         "### Weapons", "", "| d100 | Weapon | Hands | Reach | Damage |", "| --- | --- | --- | --- | --- |"]
    o += [f"| {i} | {w[0]} | {HANDS[w[1]]} | {REACH[w[2]]} | {KIND[w[3]]} |" for i, w in enumerate(WEAPONS, 1)]
    o += ["", "### Armor", "", "| d100 | Armor | Type |", "| --- | --- | --- |"]
    o += [f"| {i} | {a[0]} | {KIND[a[1]]} |" for i, a in enumerate(ARMOR, 1)]
    o += ["", "### Clever Names, Trinkets, and Treasure", "", "| d100 | Clever name | Trinket | Treasure |", "| --- | --- | --- | --- |"]
    o += [f"| {i} | {CLEVER[i-1]} | {JEWELRY[i-1]} | {GEMS[i-1]} |" for i in range(1, 101)]
    o += ["", "### Treasure Quality by Tier", "", "| Tier | Treasure quality |", "| --- | --- |"]
    o += [f"| T{i} | {q} |" for i, q in enumerate(QUALITY, 1)]
    return "\n".join(o) + "\n\n"

def write_md(path="docs/loot-names.md"):
    s = open(path).read()
    s = re.sub(r"## Pirate\n.*?(?=## Steampunk)", "", s, flags=re.S)
    i = s.index("## Steampunk")
    open(path, "w").write(s[:i] + md_section() + s[i:])

if __name__ == "__main__":
    check()
    write_names_js()
    write_md()
    print("pirate tables written: 100 weapons, 100 armor, 100 names, 100 trinkets, 100 treasures, 6 qualities")
