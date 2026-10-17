"""Build the rules and loot-name web pages from the Markdown in docs/.

Run from the repo root:  python3 tools/build_docs.py   (needs: pip install markdown)
docs/core-guidelines.md -> rules.html
docs/loot-names.md      -> loot-names.html
"""
import html, re, markdown

PAGES = [("docs/core-guidelines.md", "rules.html", "Boom Core Guidelines"),
         ("docs/loot-names.md", "loot-names.html", "Boom Loot Name Tables")]

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2l9 5v10l-9 5-9-5V7z' fill='%23c2410c'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;600;700&display=swap" rel="stylesheet">
<style>
:root{{--bg:#f6f3ee;--card:#fff;--ink:#1f1b16;--mute:#6f675d;--line:#e2dbd0;--acc:#c2410c;--head:#1F4E5F;--thfg:#fff;--alt:#f4efe7;color-scheme:light}}
@media(prefers-color-scheme:dark){{:root{{--bg:#17140f;--card:#221e17;--ink:#f3ede3;--mute:#a59b8e;--line:#3a3328;--acc:#fb8a4c;--head:#2a5d70;--alt:#2a251d;color-scheme:dark}}}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font:17px/1.6 Barlow,system-ui,sans-serif}}
.bar{{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;gap:4px 16px;align-items:center;padding:10px 16px;background:var(--head);font-family:'Barlow Condensed',sans-serif;font-size:18px}}
.bar a{{color:#fff;text-decoration:none;font-weight:700}}.bar a:hover,.bar a[aria-current]{{text-decoration:underline}}
.bar .logo{{font-family:'Alfa Slab One',serif;font-weight:400;margin-right:8px}}
.page{{max-width:860px;margin:0 auto;padding:24px 16px 80px}}
h1{{font-family:'Alfa Slab One',serif;font-weight:400;font-size:40px;line-height:1.15;color:var(--acc);margin:12px 0 8px}}
h2{{font-family:'Barlow Condensed',sans-serif;font-size:30px;text-transform:uppercase;letter-spacing:.03em;color:var(--ink);border-bottom:3px solid var(--acc);padding-bottom:4px;margin:44px 0 12px}}
h3{{font-family:'Barlow Condensed',sans-serif;font-size:23px;margin:28px 0 8px}}
a{{color:var(--acc)}}
.toc{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 16px;margin:16px 0 8px}}
.toc summary{{cursor:pointer;font-weight:700}}.toc ol{{margin:8px 0 4px;padding-left:22px}}.toc li{{margin:2px 0}}
.tw{{overflow-x:auto;margin:10px 0 16px;border:1px solid var(--line);border-radius:10px}}
table{{border-collapse:collapse;width:100%;font-size:15px;background:var(--card)}}
th{{background:var(--head);color:var(--thfg);font-family:'Barlow Condensed',sans-serif;font-size:16px;text-align:left;padding:6px 10px;position:sticky;top:0}}
td{{padding:5px 10px;border-top:1px solid var(--line);vertical-align:top}}
tr:nth-child(even) td{{background:var(--alt)}}
code{{font-size:.9em;background:var(--alt);padding:1px 5px;border-radius:5px}}
.top{{position:fixed;right:16px;bottom:16px;background:var(--acc);color:#fff;border-radius:99px;padding:8px 14px;text-decoration:none;font-weight:700;font-size:15px}}
@media print{{.bar,.toc,.top{{display:none}}body{{background:#fff;color:#000}}th{{position:static}}}}
</style>
</head>
<body>
<nav class="bar" aria-label="Boom pages"><span class="logo" style="color:#fff">BOOM</span><a href="./">Boom Dice app</a><a href="rules.html"{cur_rules}>Rules</a><a href="cm-screen.html">CM Screen</a><a href="loot-names.html"{cur_loot}>Loot Names</a><a href="the-hollow-crown.pdf" target="_blank" rel="noopener">Sample Adventure</a></nav>
<main class="page" id="top">
{toc}
{body}
</main>
<a class="top" href="#top">Top</a>
</body>
</html>
"""

def build(src, out, title):
    text = open(src, encoding="utf-8").read()
    md = markdown.Markdown(extensions=["tables", "toc", "sane_lists"])
    body = md.convert(text)
    body = body.replace("<table>", '<div class="tw"><table>').replace("</table>", "</table></div>")
    # table of contents from the level-2 headings
    items = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', body)
    toc = ""
    if items:
        lis = "".join(f'<li><a href="#{i}">{t}</a></li>' for i, t in items)
        toc = f'<details class="toc" open><summary>Contents</summary><ol>{lis}</ol></details>'
        first = body.index("</p>") + 4 if body.startswith("<h1") else 0  # after the title's intro line
        body = body[:first] + toc + body[first:]
    page = TEMPLATE.format(title=html.escape(title), toc="", body=body,
                           cur_rules=' aria-current="page"' if out == "rules.html" else "",
                           cur_loot=' aria-current="page"' if out == "loot-names.html" else "")
    open(out, "w", encoding="utf-8").write(page)
    print(out, len(page))

for p in PAGES:
    build(*p)
