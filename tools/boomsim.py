"""Boom combat simulator. Follows the Boom Core Guidelines (Oct 28, 2026).

Modeled: the Boom Rule (explode and replace with 2 dice, 100-dice cap), initiative d20 + Speed,
actions 1 + Speed//4, attack dice by hands and reach, bonus = Str - magical armor (physical) or
Int - physical armor (magic), armor subtracted from every hit, multi-target abilities roll once,
minion swarms (pooled dice, bonus once), falling (level 2+ drop a level and come back at full HP,
lose a stat point; level 1 dies), monsters built from the Chapter 9 template, and the app's
encounter builder (threat points per hero, halved at party level 1-2).
Not modeled: conditions (Prone, Stunned, ...), movement and cover, traps, temp HP, potions.
"""
import random, math
from collections import Counter

R = random.Random()

def explodes(v, s):
    if s <= 6: return v == 1
    if s <= 20: return v == 1 or v == s
    return R.random() < 0.10

def roll(n, s):
    """Roll n dice of size s with the Boom Rule. Returns the total."""
    if n <= 0: return 0
    total, pending, used = 0, n, n
    while pending:
        pending -= 1
        v = R.randint(1, s)
        if used < 100 and explodes(v, s):
            pending += 2; used += 1
        else:
            total += v
    return total

STATS = ["con", "str", "int", "spd", "cha", "lck"]

# ---------- heroes ----------
# role: point order, weapon (dice, sides, physical?), armor type, ability (kind, stat)
ROLES = {
    "fighter": dict(order=["str", "con", "spd"], w=(2, 6, True), arm="phys", ab=("dmg", "str")),
    "mage":    dict(order=["int", "con", "spd"], w=(2, 4, False), arm="mag", ab=("dmg", "int")),
    "healer":  dict(order=["lck", "con", "int"], w=(2, 6, False), arm="mag", ab=("heal", "lck")),
    "ranger":  dict(order=["spd", "str", "con"], w=(2, 4, True), arm="phys", ab=("dmg", "spd")),
}
PARTY_ORDER = ["fighter", "mage", "healer", "ranger", "fighter"]

class Unit:
    pass

def gear_tier(level, gear):
    if gear == "shop": return 1
    if gear == "rich": return min(6, 1 + (level - 1) // 3)
    return min(6, 1 + (level - 1) // 5)          # "modest": T1 at 1-5, T2 at 6-10, ...

def ability_tier(level, gear):
    if level < 2: return 0                        # commoners start with no abilities
    if gear == "shop": return 1
    if gear == "rich": return min(6, 1 + (level - 1) // 3)
    return min(6, 1 + (level - 1) // 4)           # T1 at 2-4, T2 at 5-8, T3 at 9-12

def make_hero(role, level, gear):
    h = Unit(); h.side = "hero"; h.role = role; r = ROLES[role]
    h.level = level; h.st = Counter()
    for i in range(level - 1): h.st[r["order"][i % 3]] += 1
    gt = gear_tier(level, gear)
    h.plus = gt - 1                               # weapon +N = N extra copies of its dice
    h.pa = 2 * gt if r["arm"] == "phys" else 0    # two armor pieces, worth their tier each
    h.ma = 2 * gt if r["arm"] == "mag" else 0
    h.st[r["order"][0]] += gt - 1                 # the gear's +N goes to the main stat
    h.wn, h.ws, h.wphys = r["w"]
    h.ab = r["ab"]; h.abt = ability_tier(level, gear)
    h.gear = gear; h.fell = 0; h.dead = False
    h.hp = h.maxhp = 5 * (level + h.st["con"])
    return h

def fall(h):
    """Level 2+ drop a level and return at full HP (minus a stat point). Level 1 dies."""
    if h.level <= 1:
        h.dead = True; return
    h.level -= 1; h.fell += 1
    have = [s for s in STATS if h.st[s] > 0]
    if have: h.st[R.choice(have)] -= 1
    h.hp = h.maxhp = 5 * (h.level + h.st["con"])

# ---------- monsters ----------
CFG = dict(abcap=None, boss_ab_once=False, l1_dice=2, halve_upto=2, l1_mult=0.5)
def make_monster(kind, level, rarity, abilities=True):
    m = Unit(); m.side = "mon"; m.kind = kind; m.level = level; m.rar = rarity
    if CFG["abcap"]: m.rar = min(rarity, CFG["abcap"](level))
    m.used = 0
    pts = (level - 1) // 2 if kind == "minion" else 2 * (level - 1) + 3 if kind == "boss" else level - 1
    m.st = Counter()
    for _ in range(pts): m.st[R.choice(STATS)] += 1
    mult = 0.5 if kind == "minion" else 3 if kind == "boss" else 1
    m.hp = m.maxhp = max(1, math.ceil(5 * (level + m.st["con"]) * mult))
    m.armor = 0 if kind == "minion" else level // 3 if kind == "boss" else level // 5
    m.dead = False
    nab = 0 if (kind == "minion" or not abilities) else 3 if kind == "boss" else 1
    # its abilities are damage abilities of its rarity tier, using its best stat
    m.abs = [max(STATS, key=lambda s: m.st[s]) for _ in range(nab)]
    return m

def build_encounter(diff, n, avg, per_override=None, rarity_boss=4, rarity_std=1, abilities=True):
    """The app's builder (map.js genEncounter), plus Deadly from the rules table."""
    per = per_override if per_override is not None else {"easy": 1, "fair": 1.5, "hard": 2, "deadly": 3}[diff]
    budget = max(1, math.floor(0.5 + per * n * (CFG["l1_mult"] if avg <= 1 else 0.5 if avg <= CFG["halve_upto"] else 1)))
    kinds = []
    if diff in ("hard", "deadly") and budget >= 4: kinds.append("boss"); budget -= 4
    elif diff == "fair" and budget >= 6 and R.random() < 0.5: kinds.append("boss"); budget -= 4
    while budget > 0 and len(kinds) < 8:
        if budget >= 2 and R.random() < (0.35 if diff == "easy" else 0.65): kinds.append("standard"); budget -= 2
        else: kinds.append("minion"); budget -= 1
    mons = []
    for k in kinds:
        lvl = max(1, avg + (-1 if k == "minion" else 0) + (1 if diff in ("hard", "deadly") and k != "minion" else 0))
        rar = rarity_boss if k == "boss" else rarity_std if k == "standard" else 1
        mons.append(make_monster(k, lvl, rar, abilities))
    return mons

# ---------- combat ----------
def alive(us): return [u for u in us if not u.dead]

def hero_bonus(h, phys):
    return h.st["str"] - h.ma if phys else h.st["int"] - h.pa

def hit(target, dmg):
    target.hp -= max(0, dmg)
    if target.hp < 1:
        if target.side == "hero": fall(target)
        else: target.dead = True

def hero_act(h, heroes, mons):
    ms = alive(mons)
    if not ms: return
    # healer: heal when an ally is under half HP
    if h.ab[0] == "heal" and h.abt:
        hurt = sorted([x for x in alive(heroes) if x.hp < x.maxhp / 2], key=lambda x: x.hp / x.maxhp)
        if hurt:
            amt = max(0, roll(h.abt, 6) + h.st[h.ab[1]])
            for x in hurt[:h.abt]: x.hp = min(x.maxhp, x.hp + amt)  # temp HP not modeled
            return
    tgt = min(ms, key=lambda m: m.hp)            # focus the weakest monster
    bonus = hero_bonus(h, h.wphys)
    dice = h.wn * (1 + h.plus)
    atk_avg = dice * (5 if h.ws == 6 else 4.5) + bonus - tgt.armor
    if h.ab[0] == "dmg" and h.abt:
        stat = h.st[h.ab[1]]
        if h.ab[1] == "str": stat -= h.ma
        if h.ab[1] == "int": stat -= h.pa
        targets = sorted(ms, key=lambda m: m.hp)[:h.abt]
        ab_avg = sum(max(0, h.abt * 5 + stat - m.armor) for m in targets)
        if ab_avg > atk_avg:
            total = max(0, roll(h.abt, 6) + stat)
            for m in targets: hit(m, total - m.armor)
            return
    hit(tgt, max(0, roll(dice, h.ws) + bonus) - tgt.armor)

def mon_act(m, heroes, swarm_done):
    hs = alive(heroes)
    if not hs: return
    if m.kind == "minion":
        key = m.level
        if key in swarm_done: return             # the swarm already acted this round
        swarm_done.add(key)
        pool = [x for x in m.swarm if not x.dead]
        tgt = R.choice(hs)
        best = max(pool, key=lambda x: x.st["str"])
        total = max(0, roll(CFG["l1_dice"] if m.level <= 1 and False else (1 if (m.level<=1 and CFG["l1_dice"]==1) else 2) * len(pool), 6) + best.st["str"])
        hit(tgt, total - tgt.pa - tgt.ma)
        return
    # standard and boss: an ability if it beats an attack, else melee
    tier = m.rar
    if m.abs and (not CFG["boss_ab_once"] or m.used < len(m.abs)):
        stat = m.st[m.abs[0]]
        targets = R.sample(hs, min(tier, len(hs)))
        ab_avg = sum(max(0, tier * 5 + stat - t.pa - t.ma) for t in targets)
        tgt = R.choice(hs)
        atk_avg = 10 + m.st["str"] - tgt.pa - tgt.ma
        if ab_avg > atk_avg:
            total = max(0, roll(tier, 6) + stat)
            for t in targets: hit(t, total - t.pa - t.ma)
            m.used += 1
            return
    tgt = R.choice(hs)
    total = max(0, roll(1 if (m.level<=1 and CFG["l1_dice"]==1) else 2, 6) + m.st["str"])
    hit(tgt, total - tgt.pa - tgt.ma)

def fight(heroes, mons, max_rounds=40):
    minions = [m for m in mons if m.kind == "minion"]
    for m in minions: m.swarm = minions          # same kind and level: one swarm
    rounds = 0
    while alive(heroes) and alive(mons) and rounds < max_rounds:
        rounds += 1
        order = []
        for u in alive(heroes) + alive(mons):
            order.append((roll(1, 20) + u.st["spd"] + R.random(), u))
        order.sort(key=lambda x: -x[0])
        swarm_done = set()
        for _, u in order:
            if u.dead: continue
            if u.side == "hero":
                for _a in range(1 + u.st["spd"] // 4):
                    hero_act(u, heroes, mons)
            else:
                acts = 1 if u.kind == "minion" else 1 + u.st["spd"] // 4
                for _a in range(acts):
                    mon_act(u, heroes, swarm_done)
            if not alive(heroes) or not alive(mons): break
    return dict(win=not alive(mons), rounds=rounds,
                lost=sum(h.fell for h in heroes), dead=sum(h.dead for h in heroes),
                anyfall=any(h.fell or h.dead for h in heroes))

def trial(n, level, diff, N=2000, gear="modest", **kw):
    agg = Counter()
    for _ in range(N):
        heroes = [make_hero(PARTY_ORDER[i], level, gear) for i in range(n)]
        mons = build_encounter(diff, n, level, **kw)
        r = fight(heroes, mons)
        agg["win"] += r["win"]; agg["rounds"] += r["rounds"]; agg["lost"] += r["lost"]
        agg["dead"] += r["dead"] > 0; agg["anyfall"] += r["anyfall"]
    return {k: agg[k] / N for k in ("win", "rounds", "lost", "dead", "anyfall")}
