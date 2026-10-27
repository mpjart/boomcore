"""Build one-shot adventures from Markdown: a print-ready PDF for each, plus oneshots.js for the app's one-shot picker.

Run from the repo root:  python3 tools/build_oneshots.py   (needs: pip install reportlab)

Every docs/oneshots/*.md file is one adventure. Add a file, run this, and the app's One-shots card lists it
with all of its monsters, fights, and loot boxes. The Markdown is ordinary text plus a few special blocks:

  Front matter (between --- lines at the top): id, title, kicker, subtitle, tagline, pdf, heroes, levels, theme.
  # Heading            starts a new part (an act or appendix) on a new page; *italic line* right after is its subtitle
  ## Heading           a scene or area (the app groups fights and loot boxes under these)
  > [!read]            read-aloud box          > [!rules] Title   rules spotlight     > [!cm] Title   CM-only box
  ```monster           a stat block: name, level, type (minion/standard/boss), rarity, stats ("Strength 2, Speed 1"),
                       melee / ranged (dice before stat bonus, or "none"), melee note, melee label, movement,
                       ability: Name | tags (e.g. signature, T1, Strength) | what it does   (repeatable), note
  ```fight             title, header (column name), then "3: Monster x2, Other x1" lines per party size
  ```loot              for (each / party / stash), level (monster level), tier (1-6), note
  ```item              name, kind, then any "Label: text" rows, and note
  ```poem / ```journal a handout: title, by, then lines (**bold** works)
  ```monsters          an auto-built quick-reference table of every monster in the adventure
"""
import glob, json, os, re
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
                                PageBreak, KeepTogether, Image, NextPageTemplate, CondPageBreak)

RED, GOLD, INK, MUTE = HexColor("#b2401c"), HexColor("#c8962e"), HexColor("#2a2420"), HexColor("#6b6158")
BLUE, CREAM = HexColor("#3c6e91"), HexColor("#fbf5e8")
READ_BG, RULES_BG, CM_BG, MON_BG = HexColor("#f6eedb"), HexColor("#e8edf2"), HexColor("#f3e3d3"), HexColor("#f3e3d3")
TH_BG, TD_BG, GRID = HexColor("#f0e0d0"), HexColor("#fbf6ee"), HexColor("#c9b89a")

STATS = {"constitution": "con", "strength": "str", "intellect": "int", "speed": "spd", "charm": "cha", "spirit/luck": "lck"}
STAT_T = {"strength": "p", "intellect": "m", "constitution": "c", "speed": "s", "charm": "h", "spirit/luck": "l"}
RARITY = ["common", "uncommon", "rare", "epic", "legendary", "divine"]
TIERS = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Divine"]

def band(n):
    return 0 if n <= 10 else 1 if n <= 20 else 2 if n <= 40 else 3 if n <= 60 else 4 if n <= 80 else 5

def mon_hp(m):
    import math
    mult = 0.5 if m["kind"] == "minion" else 3 if m["kind"] == "boss" else 1
    return max(1, math.ceil(5 * (m["level"] + m["con"]) * mult))

# ---------- parsing ----------
def parse(path):
    text = open(path, encoding="utf-8").read()
    meta = {}
    if text.startswith("---"):
        head, text = text[3:].split("\n---", 1)
        for line in head.strip().splitlines():
            k, v = line.split(":", 1); meta[k.strip()] = v.strip()
    blocks, lines, i = [], text.splitlines(), 0
    while i < len(lines):
        ln = lines[i]
        if ln.startswith("```"):
            kind, body = ln[3:].strip(), []
            i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                body.append(lines[i]); i += 1
            blocks.append((kind, body)); i += 1; continue
        if ln.startswith("> [!"):
            m = re.match(r"> \[!(\w+)\]\s*(.*)", ln); body = []
            i += 1
            while i < len(lines) and lines[i].startswith(">"):
                body.append(lines[i][1:].strip()); i += 1
            blocks.append(("call:" + m.group(1), (m.group(2), body))); continue
        if ln.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                if not re.match(r"\|\s*-", lines[i]):
                    rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            blocks.append(("table", rows)); continue
        if ln.startswith("- "):
            items = []
            while i < len(lines) and lines[i].startswith("- "):
                items.append(lines[i][2:]); i += 1
            blocks.append(("ul", items)); continue
        if ln.startswith("#"):
            lvl = len(ln) - len(ln.lstrip("#")); blocks.append(("h%d" % lvl, ln[lvl:].strip())); i += 1; continue
        if ln.strip() == "<<<":
            blocks.append(("break", None)); i += 1; continue
        if ln.strip():
            para = [ln]; i += 1
            while i < len(lines) and lines[i].strip() and not re.match(r"(```|> \[!|\||- |#)", lines[i]):
                para.append(lines[i]); i += 1
            blocks.append(("p", " ".join(para))); continue
        i += 1
    return meta, blocks

def kv(body):
    out, multi = {}, {}
    for ln in body:
        if ":" not in ln: continue
        k, v = ln.split(":", 1); k, v = k.strip(), v.strip()
        if k in ("ability",): multi.setdefault(k, []).append(v)
        else: out[k] = v
    out.update(multi); return out

def monster(body):
    d = kv(body)
    m = {"name": d["name"], "level": int(d["level"]), "kind": d.get("type", "standard").lower(),
         "rarity": RARITY.index(d.get("rarity", "Common").lower()),
         "con": 0, "str": 0, "int": 0, "spd": 0, "cha": 0, "lck": 0, "abil": [], "src": d}
    for part in filter(None, [p.strip() for p in d.get("stats", "").split(",")]):
        nm, n = part.rsplit(" ", 1); m[STATS[nm.lower()]] = int(n)
    for k, key, dflt in (("melee", "mel", "2d6"), ("ranged", "rng", "2d4")):
        v = d.get(k, dflt).split()[0]
        if v.lower() == "none": m[key] = ""
        elif v != dflt: m[key] = v
    for a in d.get("ability", []):
        name, tags, what = [x.strip() for x in a.split("|")]
        tl = [t.strip() for t in tags.split(",")]
        tier = int(next(t for t in tl if re.match(r"T\d", t))[1:])
        stat = next((t for t in tl if t.lower() in STAT_T), "Strength")
        m["abil"].append({"n": name, "e": "%dd6" % tier, "t": STAT_T[stat.lower()], "r": tier, "sig": "signature" in tags,
                          "tags": tags, "what": what})
    m["hp"] = mon_hp(m)
    return m

def bonus(n):
    return " + %d" % n if n > 0 else ""

# ---------- PDF ----------
def clean(s):
    # the PDF fonts are the standard 14 (WinAnsi): drop emoji and turn odd dashes into plain ones
    s = s.replace("−", "-").replace("‑", "-")
    return "".join(ch for ch in s if ord(ch) < 0x2000 or ch in "–—‘’“”•…×").strip()

def inline(s):
    s = clean(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?!\w)", r"<i>\1</i>", s)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<link href="\2" color="#b2401c">\1</link>', s)
    return s

ST = {
    "body": ParagraphStyle("body", fontName="Times-Roman", fontSize=11.5, leading=15.5, textColor=INK, spaceAfter=6),
    "h1": ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=22, leading=27, textColor=RED, spaceAfter=2),
    "h1sub": ParagraphStyle("h1sub", fontName="Helvetica-Oblique", fontSize=11.5, leading=15, textColor=GOLD, spaceAfter=10),
    "h2": ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=16, leading=20, textColor=RED, spaceBefore=12, spaceAfter=6),
    "h3": ParagraphStyle("h3", fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=INK, spaceBefore=8, spaceAfter=4),
    "cell": ParagraphStyle("cell", fontName="Helvetica", fontSize=9.5, leading=12, textColor=INK),
    "th": ParagraphStyle("th", fontName="Helvetica-Bold", fontSize=9.5, leading=12, textColor=INK),
    "ctitle": ParagraphStyle("ctitle", fontName="Helvetica-Bold", fontSize=10.5, leading=14, spaceAfter=3),
    "cbody": ParagraphStyle("cbody", fontName="Helvetica", fontSize=10, leading=13.5, textColor=INK, spaceAfter=4),
    "read": ParagraphStyle("read", fontName="Times-Italic", fontSize=11.5, leading=15.5, textColor=INK, spaceAfter=5),
    "bullet": ParagraphStyle("bullet", fontName="Times-Roman", fontSize=11.5, leading=15, textColor=INK, leftIndent=14, bulletIndent=3, spaceAfter=2),
    "mname": ParagraphStyle("mname", fontName="Helvetica-Bold", fontSize=13, leading=16, textColor=RED),
    "msub": ParagraphStyle("msub", fontName="Helvetica-Oblique", fontSize=9.5, leading=12, textColor=INK, spaceAfter=4),
    "poem": ParagraphStyle("poem", fontName="Times-Italic", fontSize=13, leading=20, textColor=INK, alignment=TA_CENTER),
    "ptitle": ParagraphStyle("ptitle", fontName="Times-Bold", fontSize=20, leading=26, textColor=RED, alignment=TA_CENTER),
    "pby": ParagraphStyle("pby", fontName="Times-Italic", fontSize=11, leading=15, textColor=MUTE, alignment=TA_CENTER, spaceAfter=14),
    "journal": ParagraphStyle("journal", fontName="Times-Italic", fontSize=12, leading=17, textColor=INK, spaceAfter=9),
}

W = letter[0] - 2 * 0.85 * inch

def box(flows, bg, bar=None, border=None, pad=10):
    t = Table([[flows]], colWidths=[W])
    s = [("BACKGROUND", (0, 0), (-1, -1), bg), ("LEFTPADDING", (0, 0), (-1, -1), pad + (3 if bar else 0)),
         ("RIGHTPADDING", (0, 0), (-1, -1), pad), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]
    if bar: s.append(("LINEBEFORE", (0, 0), (0, -1), 4, bar))
    if border: s += [("BOX", (0, 0), (-1, -1), 1.4, border), ("LINEABOVE", (0, 0), (-1, 0), 3, border)]
    t.setStyle(TableStyle(s)); return t

def table(rows, widths=None):
    data = [[Paragraph(inline(c), ST["th"] if r == 0 else ST["cell"]) for c in row] for r, row in enumerate(rows)]
    n = len(rows[0])
    if not widths:
        lens = [max(len(clean(r[i])) for r in rows) for i in range(n)]
        lens = [min(max(l, 10), 60) for l in lens]; tot = sum(lens); widths = [W * l / tot for l in lens]
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), TH_BG), ("BACKGROUND", (0, 1), (-1, -1), TD_BG),
                           ("GRID", (0, 0), (-1, -1), 0.6, GRID), ("VALIGN", (0, 0), (-1, -1), "TOP"),
                           ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    return t

def mon_block(m):
    d, kind = m["src"], m["kind"].capitalize()
    fl = [Paragraph(inline(m["name"]), ST["mname"]),
          Paragraph("Level %d %s • %s • %s tier" % (m["level"], kind, TIERS[m["rarity"]], TIERS[band(m["level"])]), ST["msub"])]
    rows = []
    stats = [("%s %d" % (n.title() if n != "spirit/luck" else "Spirit/Luck", m[k])) for n, k in STATS.items() if m[k]]
    if stats: rows.append(("Stats", ", ".join(stats)))
    rows += [("HP", str(m["hp"])), ("Armor", str(0 if kind == "Minion" else m["level"] // 3 if kind == "Boss" else m["level"] // 5)),
             ("Initiative", "d20 + %d" % m["spd"]), ("Actions", str(1 + m["spd"] // 4))]
    if d.get("movement"): rows.append(("Movement", d["movement"]))
    for k, key, dflt, st in (("melee", "mel", "2d6", "str"), ("ranged", "rng", "2d4", "int")):
        v = m.get(key, dflt)
        if v == "": continue
        label = d.get(k + " label", k.title())
        note = d.get(k + " note")
        rows.append((label, v + bonus(m[st]) + (" (%s)" % note if note else "")))
    data = [[Paragraph("<b>%s</b>" % inline(a), ST["cell"]), Paragraph(inline(b), ST["cell"])] for a, b in rows]
    t = Table(data, colWidths=[1.5 * inch, W - 1.5 * inch - 24])
    t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -2), 0.5, HexColor("#d9c3a8")), ("TOPPADDING", (0, 0), (-1, -1), 2.5),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5), ("LEFTPADDING", (0, 0), (-1, -1), 2), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    fl.append(t)
    if m["abil"]:
        fl.append(Paragraph("<b>Abilities</b>", ST["cell"]))
        for a in m["abil"]:
            fl.append(Paragraph("<b>%s</b> (%s): %s" % (inline(a["n"]), inline(a["tags"]), inline(a["what"])),
                                ParagraphStyle("ab", parent=ST["cell"], leftIndent=8, spaceAfter=1)))
    if d.get("note"): fl.append(Spacer(1, 3)); fl.append(Paragraph(inline(d["note"]), ST["cell"]))
    return KeepTogether([Spacer(1, 4), box(fl, MON_BG, border=RED), Spacer(1, 8)])

def fight_rows(body, mons):
    d = kv(body); rows = [["Heroes", d.get("header", "Enemies")]]; sizes = {}
    for k, v in d.items():
        if not k.isdigit(): continue
        parts = []
        for p in v.split(","):
            nm, n = re.match(r"\s*(.+?)\s+x(\d+)\s*$", p).groups()
            assert nm in mons, "unknown monster in fight: " + nm
            parts.append([nm, int(n)])
        sizes[k] = parts
        rows.append([k, ", ".join(("%s" % nm if n == 1 else "%d %ss" % (n, nm)) for nm, n in parts)])
    return d.get("title", ""), rows, sizes

def build_pdf(meta, blocks, mons, out):
    header = meta["title"].upper()
    def deco(c, doc):
        c.saveState(); c.setFont("Helvetica", 8.5); c.setFillColor(GOLD)
        c.drawString(0.85 * inch, letter[1] - 0.55 * inch, header)
        c.drawRightString(letter[0] - 0.85 * inch, letter[1] - 0.55 * inch, meta.get("kicker", ""))
        c.setStrokeColor(GOLD); c.setLineWidth(0.8); c.line(0.85 * inch, letter[1] - 0.62 * inch, letter[0] - 0.85 * inch, letter[1] - 0.62 * inch)
        c.drawCentredString(letter[0] / 2, 0.5 * inch, str(doc.page)); c.restoreState()
    def cover(c, doc):
        c.saveState(); c.setFillColor(CREAM); c.rect(0, 0, letter[0], letter[1], stroke=0, fill=1)
        c.setStrokeColor(GOLD); c.setLineWidth(2); c.rect(0.6 * inch, 0.6 * inch, letter[0] - 1.2 * inch, letter[1] - 1.2 * inch)
        c.restoreState()
    doc = BaseDocTemplate(out, pagesize=letter, title=meta["title"], author="Boom Core",
                          leftMargin=0.85 * inch, rightMargin=0.85 * inch, topMargin=0.85 * inch, bottomMargin=0.8 * inch)
    fr = Frame(doc.leftMargin, doc.bottomMargin, W, doc.height, id="f")
    doc.addPageTemplates([PageTemplate("cover", [fr], onPage=cover), PageTemplate("main", [fr], onPage=deco)])
    S = []
    S += [Spacer(1, 1.6 * inch), Paragraph(inline(meta.get("kicker", "").upper()), ParagraphStyle("k", fontName="Helvetica-Bold", fontSize=10, textColor=GOLD, alignment=TA_CENTER, spaceAfter=10)),
          Paragraph(inline(meta["title"]), ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=34, leading=40, textColor=RED, alignment=TA_CENTER, spaceAfter=10)),
          Paragraph(inline(meta.get("subtitle", "")), ParagraphStyle("s", fontName="Helvetica", fontSize=11, textColor=INK, alignment=TA_CENTER, spaceAfter=22)),
          Paragraph(inline(meta.get("tagline", "")), ParagraphStyle("tg", fontName="Times-Italic", fontSize=14, leading=19, textColor=INK, alignment=TA_CENTER, leftIndent=30, rightIndent=30, spaceAfter=40))]
    logo = os.path.join(os.path.dirname(out) or ".", "logo.png")
    if os.path.exists(logo): S.append(Image(logo, width=3.4 * inch, height=3.4 * inch * 584 / 1200))
    S += [NextPageTemplate("main"), PageBreak()]
    first_h1, last = True, None
    for kind, val in blocks:
        if kind == "h1":
            S.append(PageBreak()); S.append(Paragraph(inline(val), ST["h1"])); last = "h1"; continue
        if kind == "p" and last == "h1" and re.match(r"^\*[^*].*\*$", val.strip()):
            S.append(Paragraph(inline(val.strip()[1:-1]), ST["h1sub"])); last = "p"; continue
        last = kind
        if kind == "h2": S += [CondPageBreak(1.6 * inch), Paragraph(inline(val), ST["h2"])]
        elif kind == "h3": S += [CondPageBreak(2 * inch), Paragraph(inline(val), ST["h3"])]
        elif kind == "p": S.append(Paragraph(inline(val), ST["body"]))
        elif kind == "ul": S += [Paragraph(inline(x), ST["bullet"], bulletText="•") for x in val]; S.append(Spacer(1, 4))
        elif kind == "table": S += [table(val), Spacer(1, 8)]
        elif kind == "break": S.append(PageBreak())
        elif kind.startswith("call:"):
            k, (title, body) = kind[5:], val
            paras, cur = [], []
            for ln in body + [""]:
                if ln: cur.append(ln)
                elif cur: paras.append(" ".join(cur)); cur = []
            if k == "read":
                fl = [Paragraph("Read aloud", ParagraphStyle("rt", parent=ST["ctitle"], textColor=GOLD, fontSize=11.5))] + [Paragraph(inline(p), ST["read"]) for p in paras]
                S += [box(fl, READ_BG, bar=GOLD), Spacer(1, 9)]
            else:
                col, bg = (BLUE, RULES_BG) if k == "rules" else (RED, CM_BG)
                fl = [Paragraph(inline(title), ParagraphStyle("ct", parent=ST["ctitle"], textColor=col))] + [Paragraph(inline(p), ST["cbody"]) for p in paras]
                S += [KeepTogether([box(fl, bg, bar=col)]), Spacer(1, 9)]
        elif kind == "monster": S.append(mon_block(mons[kv(val)["name"]]))
        elif kind == "fight":
            _, rows, _ = fight_rows(val, mons); S += [CondPageBreak(1.4 * inch), table(rows, [1.2 * inch, W - 1.2 * inch]), Spacer(1, 8)]
        elif kind == "loot":
            d = kv(val); who = {"each": "Each hero opens one", "party": "Party loot: every hero gets a full copy of one", "stash": "Into the party stash:"}[d["for"]]
            txt = "<b>Loot box:</b> %s T%s %s box from a level %s monster%s. In the app: One-shots, then <b>Make box</b>." % (
                who, d["tier"], TIERS[int(d["tier"]) - 1], d["level"], (" (" + inline(d["note"]) + ")") if d.get("note") else "")
            S += [box([Paragraph(txt, ST["cbody"])], TD_BG, bar=GOLD, pad=8), Spacer(1, 8)]
        elif kind == "item":
            d = kv(val); rows = [(k, v) for k, v in d.items() if k not in ("name", "kind", "note")]
            fl = [Paragraph(inline(d["name"]), ST["mname"]), Paragraph(inline(d.get("kind", "")), ST["msub"])]
            t = Table([[Paragraph("<b>%s</b>" % inline(a), ST["cell"]), Paragraph(inline(b), ST["cell"])] for a, b in rows], colWidths=[1.2 * inch, W - 1.2 * inch - 24])
            t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -2), 0.5, HexColor("#d9c3a8")), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 2)]))
            fl.append(t)
            if d.get("note"): fl += [Spacer(1, 3), Paragraph(inline(d["note"]), ST["cell"])]
            S += [KeepTogether([box(fl, MON_BG, border=GOLD)]), Spacer(1, 8)]
        elif kind == "monsters":
            rows = [["Monster", "Lvl", "Type", "HP", "Armor", "Melee", "Ranged"]]
            for m in mons.values():
                ar = 0 if m["kind"] == "minion" else m["level"] // 3 if m["kind"] == "boss" else m["level"] // 5
                rows.append([m["name"], str(m["level"]), m["kind"].title(), str(m["hp"]), str(ar),
                             (m.get("mel", "2d6") or "-") + bonus(m["str"]), (m.get("rng", "2d4") or "-") + (bonus(m["int"]) if m.get("rng", "2d4") else "")])
            rest = (W - 4.1 * inch) / 2
            S += [table(rows, [1.8 * inch, 0.45 * inch, 0.8 * inch, 0.45 * inch, 0.6 * inch, rest, rest]), Spacer(1, 8)]
        elif kind in ("poem", "journal"):
            d, lines = {}, []
            for ln in val:
                m = re.match(r"(title|by):\s*(.*)", ln)
                if m: d[m.group(1)] = m.group(2)
                elif ln.strip(): lines.append(ln)
            if kind == "poem":
                fl = [Spacer(1, 20), Paragraph(inline(d.get("title", "")), ST["ptitle"]), Paragraph(inline(d.get("by", "")), ST["pby"])]
                fl += [Paragraph(inline(x), ST["poem"]) for x in lines] + [Spacer(1, 20)]
                S += [box(fl, CREAM, border=GOLD), Spacer(1, 12)]
            else:
                fl = [Paragraph(inline(d.get("title", "")), ParagraphStyle("jt", parent=ST["h3"], textColor=GOLD))] + [Paragraph(inline(x), ST["journal"]) for x in lines]
                S += [KeepTogether([box(fl, CREAM, border=GOLD, pad=18)]), Spacer(1, 12)]
    doc.build(S)

# ---------- app data ----------
def kit(meta, blocks, mons):
    parts, part, scene = [], None, None
    def new_scene(t):
        nonlocal scene
        scene = {"t": t, "fights": [], "loot": []}; part["scenes"].append(scene)
    for kind, val in blocks:
        if kind == "h1":
            part = {"t": val, "scenes": []}; parts.append(part); scene = None
        elif kind == "h2" and part is not None:
            new_scene(val)
        elif kind in ("fight", "loot") and part is not None:
            if scene is None: new_scene(part["t"])
            if kind == "fight":
                t, _, sizes = fight_rows(val, mons); scene["fights"].append({"t": t or scene["t"], "by": sizes})
            else:
                d = kv(val); scene["loot"].append({"for": d["for"], "L": int(d["level"]), "t0": int(d["tier"]) - 1, "note": d.get("note", "")})
    parts = [p for p in parts if any(s["fights"] or s["loot"] for s in p["scenes"])]
    for p in parts: p["scenes"] = [s for s in p["scenes"] if s["fights"] or s["loot"]]
    app_mons = {}
    for n, m in mons.items():
        app_mons[n] = {k: m[k] for k in ("name", "level", "kind", "rarity", "con", "str", "int", "spd", "cha", "lck")}
        if "mel" in m: app_mons[n]["mel"] = m["mel"]
        if "rng" in m: app_mons[n]["rng"] = m["rng"]
        app_mons[n]["abil"] = [{"n": a["n"], "e": a["e"], "t": a["t"]} for a in m["abil"]]
        if m["src"].get("note"): app_mons[n]["note"] = clean(m["src"]["note"])
        if m["src"].get("swarm", "").lower() == "no": app_mons[n]["solo"] = True
    return {"id": meta["id"], "title": meta["title"], "pdf": meta.get("pdf", ""), "heroes": meta.get("heroes", ""),
            "levels": meta.get("levels", ""), "theme": meta.get("theme", ""), "monsters": app_mons, "parts": parts}

def main():
    kits = []
    for path in sorted(glob.glob("docs/oneshots/*.md")):
        meta, blocks = parse(path)
        mons = {}
        for kind, val in blocks:
            if kind == "monster":
                m = monster(val); mons[m["name"]] = m
        out = meta.get("pdf") or (meta["id"] + ".pdf")
        build_pdf(meta, blocks, mons, out)
        k = kit(meta, blocks, mons); kits.append(k)
        print(path, "->", out, "|", len(mons), "monsters,", sum(len(s["fights"]) for p in k["parts"] for s in p["scenes"]), "fights,",
              sum(len(s["loot"]) for p in k["parts"] for s in p["scenes"]), "loot boxes")
    js = "// Built by tools/build_oneshots.py from docs/oneshots/*.md. Do not edit by hand.\nwindow.BOOM_ONESHOTS=" + json.dumps(kits, ensure_ascii=False, separators=(",", ":")) + ";\n"
    open("oneshots.js", "w", encoding="utf-8").write(js)
    print("oneshots.js", len(js))

if __name__ == "__main__":
    main()
