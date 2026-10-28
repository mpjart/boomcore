"""Build docs/bestiary.md from the theme data files in this folder.
Run from the repo root:  python3 tools/bestiary/build.py core pirate steampunk horror grit space
"""
import importlib.util, math, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
THEMES = sys.argv[1:] or ["core"]
SN = {"con":"Con","str":"Str","int":"Int","spd":"Spd","cha":"Charm","lck":"Spirit/Luck"}
SLONG = {"con":"Constitution","str":"Strength","int":"Intellect","spd":"Speed","cha":"Charm","lck":"Spirit/Luck"}
TIER = ["Common","Uncommon","Rare","Epic","Legendary","Divine"]
KIND = {"minion":"Minion","standard":"Standard","boss":"Boss"}
THREAT = {"minion":1,"standard":2,"boss":4}
def num(n): return ["zero","one","two","three","four","five","six"][n] if n < 7 else str(n)
def plus(b): return f" + {b}" if b > 0 else ""

def sample(m):
    lv, k = m["lv"], m["kind"]
    pts = (lv-1)//2 if k=="minion" else 2*(lv-1)+3 if k=="boss" else lv-1
    st = {s:0 for s in SN}
    for i in range(pts): st[m["order"][i % len(m["order"])]] += 1
    hp = math.ceil(5*(lv+st["con"])*(0.5 if k=="minion" else 3 if k=="boss" else 1))
    armor = 0 if k=="minion" else lv//3 if k=="boss" else lv//5
    return st, hp, armor

def ab_line(a, tier=None, st=None):
    name, stat, job, eff, note = a
    if tier is None:
        if job == "util":
            return f"**{name}:** {note}"
        what = {"dmg":"damage to up to T targets","heal":"healing for up to T allies","temp":"temp HP for up to T allies",
                "selfheal":"healing for itself","selftemp":"temp HP for itself"}[job]
        s = f"**{name}:** T d6 + {SLONG[stat]}, {what}."
        if len(eff) == 1: s += f" Effect: {eff[0]}."
        elif eff: s += " Effects, in order: " + ", ".join(eff) + "."
        if note: s += " " + note
        return s
    if job == "util":
        return f"{name} (T{tier})"
    roll = f"{tier}d6{plus(st[stat])}"
    many = lambda w, p: f"{num(tier)} {w if tier == 1 else p}"
    tg = {"dmg":many("target","targets"),"heal":"healing for "+many("ally","allies"),"temp":"temp HP for "+many("ally","allies"),
          "selfheal":"healing for itself","selftemp":"temp HP for itself"}[job]
    s = f"{name} {roll}, {tg}"
    use = eff[:tier]
    if use: s += ", " + " and ".join(use) + f" for {tier} round{'s' if tier>1 else ''}"
    return s

def entry(m):
    st, hp, armor = sample(m)
    k, lv, tier = m["kind"], m["lv"], min(m["rar"], max(1, math.ceil(m["lv"] / 3)))
    out = [f"### {m['n']}", "",
           f"*{KIND[k]} · {TIER[tier-1]} · points go {', '.join(SN[s] for s in m['order'])}*", "",
           m["d"], ""]
    mel, rng = m["atk"]
    out.append(f"- **Attacks:** {mel} (melee 2d6 + Str) and {rng.lower()} (ranged 2d4 + Int).")
    for i, a in enumerate(m.get("ab", [])):
        line = ab_line(a)
        if i == 0: line = line.replace(f"**{a[0]}:**", f"**{a[0]}** (signature):", 1)
        out.append("- " + line)
    out.append(f"- **Tactics:** {m['t']}")
    out.append("")
    stats = ", ".join(f"{SN[s]} {v}" for s, v in st.items() if v) or "no stat points"
    spd = st["spd"]
    bits = [f"HP {hp}", f"Armor {armor}", stats, f"Init d20{plus(spd)}", f"Move {5+lv+spd} steps",
            f"{1+spd//4} action{'s' if 1+spd//4>1 else ''}",
            f"{mel} {'1d6' if lv <= 1 else '2d6'}{plus(st['str'])}", f"{rng} {'1d4' if lv <= 1 else '2d4'}{plus(st['int'])}"]
    bits += [ab_line(a, tier, st) for a in m.get("ab", [])]
    bits += [f"Loot box T{m['rar']}", f"Threat {THREAT[k]}"]
    out.append(f"> **Ready to run at level {lv}:** " + " · ".join(bits))
    out.append("")
    return out

def load(t):
    spec = importlib.util.spec_from_file_location(t, os.path.join(HERE, t + ".py"))
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod

out = ["# Boom Bestiary", "",
"*Updated October 28, 2026. A starter bestiary for every theme: each monster the app's encounter button can make, plus Boom originals from the [Prep Tables](https://mpjart.github.io/boomcore/prep-tables.html). Rename anything; the math stays the same.*", "",
"## How to Use the Bestiary", "",
"- **Every monster works at any level.** Build it with the template in Chapter 9: its type sets its stat points, HP, armor, and threat. Its level is up to you, usually within a couple of levels of the party.",
"- **Points go** in the order listed, then repeat. A standard monster with *points go Str, Con* at level 4 gets 3 points: Str, Con, Str. (The app's monster maker deals them with a d6 instead. Either way works.)",
"- **Attacks** are always melee 2d6 + Strength and ranged 2d4 + Intellect (1d6 and 1d4 at level 1). The names are flavor.",
"- **Abilities use T, the monster's rarity tier** (Common is T1, up to Divine at T6), but **never above its level ÷ 3, rounded up** (Chapter 9): T d6 plus the stat, up to T targets, effects lasting T rounds. Effects are listed in order: take as many as the tier allows. A T2 Wing Buffet knocks targets Prone and Slows them.",
"- **Each ability is used once per fight.** After that, the monster attacks.",
"- **Minions** have no abilities and swarm (Chapter 3). **Standard** monsters have a signature ability. **Bosses** have three, and the first is the signature, the one an ability token can mimic.",
"- **Rarity** is the usual one. It sets the loot box tier, and the CM can raise or lower it for a tougher or easier version.",
"- **Ready to run** gives every number for one sample level and rarity, so you can use it straight from the page.",
"- **In the app:** in the CM tab's Monsters card, enter the name, level, type, and rarity, set the stats to match (or keep the rolled ones), and add its abilities. The card shows the tier cap and marks each ability once it's used.", ""]
for t in THEMES:
    mod = load(t)
    out += [f"# {mod.THEME}", "", mod.INTRO, ""]
    for k, h in [("minion","Minions"),("standard","Standard Monsters"),("boss","Bosses")]:
        out += [f"## {mod.THEME}: {h}" if len(THEMES) > 1 else f"## {h}", ""]
        for m in mod.M:
            if m["kind"] == k: out += entry(m)
open(os.environ.get("OUT", "/home/claude/boomcore/docs/bestiary.md"), "w").write("\n".join(out))
print("monsters:", sum(len(load(t).M) for t in THEMES))
