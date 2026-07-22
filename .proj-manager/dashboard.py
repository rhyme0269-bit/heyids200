#!/usr/bin/env python3
"""Project Manager Dashboard - 專案狀態儀表板
用法: python3 .proj-manager/dashboard.py
      python3 dashboard.py

掃描 .proj-manager/ 的內容，產出 dashboard.html 並自動開啟瀏覽器。
"""
import json
import os
import sys
import webbrowser
from datetime import datetime
from pathlib import Path

# Find .proj-manager/ directory
SCRIPT_DIR = Path(__file__).resolve().parent
if SCRIPT_DIR.name == ".proj-manager":
    PM_DIR = SCRIPT_DIR
else:
    PM_DIR = Path.cwd() / ".proj-manager"
    if not PM_DIR.exists():
        PM_DIR = SCRIPT_DIR / ".proj-manager"

OUTPUT = PM_DIR / "dashboard.html"


def read_json(path):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception:
        return None


def read_text(path):
    try:
        return Path(path).read_text(encoding="utf-8")
    except Exception:
        return None


def escape(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def inline_format(text):
    """Handle inline markdown: **bold**, `code`, *italic*."""
    import re
    text = escape(text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'`(.+?)`', r'<code class="inline-code">\1</code>', text)
    text = re.sub(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', r'<em>\1</em>', text)
    return text


def md_to_html(text):
    """Markdown to HTML with support for headings, lists, checkboxes, bold, code, hr, tables."""
    if not text:
        return ""
    lines = text.split("\n")
    html = []
    in_code = False
    in_list = False
    in_table = False
    in_thead = False
    for line in lines:
        if line.startswith("```"):
            if in_list:
                html.append("</ul>")
                in_list = False
            if in_table:
                html.append("</tbody></table>")
                in_table = False
            if in_code:
                html.append("</pre>")
                in_code = False
            else:
                html.append('<pre class="md-code">')
                in_code = True
            continue
        if in_code:
            html.append(escape(line))
            continue
        stripped = line.strip()
        # Table: separator row like |---|---|
        if stripped.startswith("|") and set(stripped.replace("|", "").replace("-", "").replace(":", "").strip()) == set():
            if stripped.replace("|", "").replace("-", "").replace(":", "").replace(" ", "") == "":
                in_thead = False
                continue
        # Table row
        if stripped.startswith("|") and stripped.endswith("|"):
            if in_list:
                html.append("</ul>")
                in_list = False
            cells = [c.strip() for c in stripped[1:-1].split("|")]
            if not in_table:
                html.append('<table class="md-table"><thead><tr>')
                for c in cells:
                    html.append(f"<th>{inline_format(c)}</th>")
                html.append("</tr></thead><tbody>")
                in_table = True
                in_thead = True
            elif in_thead:
                pass  # skip separator
            else:
                html.append("<tr>")
                for c in cells:
                    html.append(f"<td>{inline_format(c)}</td>")
                html.append("</tr>")
            in_thead = False
            continue
        if in_table:
            html.append("</tbody></table>")
            in_table = False
        if not stripped:
            if in_list:
                html.append("</ul>")
                in_list = False
            continue
        if stripped == "---" or stripped == "***" or stripped == "___":
            if in_list:
                html.append("</ul>")
                in_list = False
            html.append('<hr class="md-hr">')
        elif stripped.startswith("### "):
            if in_list:
                html.append("</ul>")
                in_list = False
            html.append(f"<h4>{inline_format(stripped[4:])}</h4>")
        elif stripped.startswith("## "):
            if in_list:
                html.append("</ul>")
                in_list = False
            html.append(f"<h3>{inline_format(stripped[3:])}</h3>")
        elif stripped.startswith("# "):
            if in_list:
                html.append("</ul>")
                in_list = False
            html.append(f"<h2>{inline_format(stripped[2:])}</h2>")
        elif stripped.startswith("- [x] ") or stripped.startswith("- [X] "):
            if not in_list:
                html.append('<ul class="checklist">')
                in_list = True
            html.append(f'<li class="checked">{inline_format(stripped[6:])}</li>')
        elif stripped.startswith("- [ ] "):
            if not in_list:
                html.append('<ul class="checklist">')
                in_list = True
            html.append(f'<li class="unchecked">{inline_format(stripped[6:])}</li>')
        elif stripped.startswith("- "):
            if not in_list:
                html.append("<ul>")
                in_list = True
            html.append(f"<li>{inline_format(stripped[2:])}</li>")
        else:
            if in_list:
                html.append("</ul>")
                in_list = False
            html.append(f"<p>{inline_format(stripped)}</p>")
    if in_list:
        html.append("</ul>")
    if in_table:
        html.append("</tbody></table>")
    if in_code:
        html.append("</pre>")
    return "\n".join(html)


def changelog_to_html(text):
    """Parse changelog.md into a timeline with collapsible entries."""
    import re
    if not text:
        return '<div class="empty">尚無變更記錄</div>'

    date_re = re.compile(r'\[?\s*(\d{4}-\d{2}-\d{2}(?:~\d{2})?)\s*\]?')
    type_colors = {
        "新增": "#10b981", "功能": "#10b981", "建置": "#10b981",
        "修正": "#f59e0b", "修復": "#f59e0b", "修補": "#f59e0b", "fix": "#f59e0b",
        "移除": "#ef4444", "刪除": "#ef4444", "移轉": "#ef4444",
        "安全": "#e11d48", "稽核": "#e11d48", "漏洞": "#e11d48",
        "部署": "#8b5cf6", "deploy": "#8b5cf6",
        "重構": "#06b6d4", "優化": "#06b6d4", "升級": "#06b6d4",
        "初始": "#6b7280", "init": "#6b7280",
    }

    sections = text.split("\n## ")
    entries = []
    for s in sections[1:]:
        lines = s.strip().split("\n")
        raw_title = lines[0] if lines else ""
        body = "\n".join(lines[1:]).strip()
        if not raw_title or "格式說明" in raw_title:
            continue

        # Extract date
        dm = date_re.search(raw_title)
        date_str = dm.group(1) if dm else ""
        # Clean title: remove date, brackets, dashes used as separators
        title = raw_title
        if dm:
            title = raw_title[:dm.start()] + raw_title[dm.end():]
        title = re.sub(r'^\s*[-–—]\s*', '', title)
        title = re.sub(r'\s*[-–—]\s*$', '', title)
        title = title.strip("[] \t")

        # Detect type color
        color = "#4361ee"
        for keyword, c in type_colors.items():
            if keyword in title.lower() or keyword in raw_title.lower():
                color = c
                break

        entries.append((date_str, title, body, color))

    if not entries:
        return '<div class="empty">尚無變更記錄</div>'

    html_parts = []
    for i, (date_str, title, body, color) in enumerate(entries[:30]):
        collapsed = 'style="display:none"' if i >= 3 else ''
        arrow = '&#9654;' if i >= 3 else '&#9660;'
        body_html = md_to_html(body) if body else ""
        date_badge = f'<span class="cl-date">{escape(date_str)}</span>' if date_str else ""
        html_parts.append(
            f'<div class="cl-entry" style="--cl-color:{color}">'
            f'<div class="cl-dot"></div>'
            f'<div class="cl-content">'
            f'<div class="cl-header" onclick="var b=this.nextElementSibling;var a=this.querySelector(\'.cl-arrow\');if(b.style.display===\'none\'){{b.style.display=\'block\';a.innerHTML=\'&#9660;\'}}else{{b.style.display=\'none\';a.innerHTML=\'&#9654;\'}}">'
            f'{date_badge}<span class="cl-title">{escape(title)}</span>'
            f'<span class="cl-arrow">{arrow}</span>'
            f'</div>'
            f'<div class="cl-body" {collapsed}>{body_html}</div>'
            f'</div>'
            f'</div>'
        )

    if len(entries) > 30:
        html_parts.append(f'<div class="empty">...還有 {len(entries) - 30} 筆記錄</div>')

    return '<div class="cl-timeline">' + "\n".join(html_parts) + '</div>'


def context_to_html(text):
    """Parse context.md into collapsible sections by ## headings."""
    if not text:
        return '<div class="empty">無上下文記錄</div>'

    sections = []
    current_title = None
    current_lines = []
    top_title = ""

    for line in text.split("\n"):
        stripped = line.strip()
        if stripped.startswith("# ") and not stripped.startswith("## "):
            top_title = stripped[2:]
            continue
        if stripped.startswith("## "):
            if current_title is not None:
                sections.append((current_title, "\n".join(current_lines)))
            current_title = stripped[3:]
            current_lines = []
        else:
            current_lines.append(line)

    if current_title is not None:
        sections.append((current_title, "\n".join(current_lines)))

    if not sections:
        return md_to_html(text)

    colors = ["#4361ee", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"]
    html_parts = []
    for i, (title, body) in enumerate(sections):
        color = colors[i % len(colors)]
        body_html = md_to_html(body.strip())
        if not body_html:
            continue
        sid = f"ctx-{i}"
        html_parts.append(
            f'<div class="ctx-section">'
            f'<div class="ctx-header" style="border-left-color:{color}" onclick="var b=this.nextElementSibling;var a=this.querySelector(\'.ctx-arrow\');if(b.style.display===\'none\'){{b.style.display=\'block\';a.textContent=\'&#9660;\'}}else{{b.style.display=\'none\';a.textContent=\'&#9654;\'}}">'
            f'<span class="ctx-arrow">&#9660;</span> {escape(title)}'
            f'</div>'
            f'<div class="ctx-body">{body_html}</div>'
            f'</div>'
        )

    return "\n".join(html_parts) if html_parts else '<div class="empty">無上下文記錄</div>'


def scan():
    data = {
        "project": read_json(PM_DIR / "project.json"),
        "dependencies": read_json(PM_DIR / "dependencies.json"),
        "context": read_text(PM_DIR / "context.md"),
        "changelog": read_text(PM_DIR / "changelog.md"),
        "features": [],
        "bugs": [],
        "tests": [],
    }
    features_dir = PM_DIR / "features"
    if features_dir.exists():
        for f in sorted(features_dir.glob("*.json")):
            d = read_json(f)
            if d:
                data["features"].append(d)
    bugs_dir = PM_DIR / "bugs"
    if bugs_dir.exists():
        for f in sorted(bugs_dir.glob("*.json")):
            d = read_json(f)
            if d:
                data["bugs"].append(d)
    tests_dir = PM_DIR / "tests"
    if tests_dir.exists():
        for f in sorted(tests_dir.glob("*.md"), reverse=True)[:5]:
            data["tests"].append({"name": f.name, "content": read_text(f)})
    return data


def build_html(data):
    p = data.get("project") or {}
    name = p.get("project_name", PM_DIR.parent.name)
    ptype = p.get("project_type", "")
    framework = p.get("framework", "")
    langs = ", ".join(p.get("languages", []))
    subtitle = " · ".join(filter(None, [ptype, framework, langs]))
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Stats
    n_features = len(data["features"])
    n_bugs_open = sum(1 for b in data["bugs"] if b.get("status") == "open")
    n_bugs = len(data["bugs"])
    n_tests = len(data["tests"])
    deps = data.get("dependencies") or {}
    n_deps = len(deps.get("runtime_dependencies", {}))

    # Features table
    features_html = ""
    if data["features"]:
        rows = ""
        for f in data["features"]:
            fid = f.get("feature_id", "")
            fname = f.get("name", f.get("feature_name", ""))
            status = f.get("status", "")
            cls = "badge-green" if status in ("active", "completed") else "badge-gray"
            rows += f'<tr><td>{escape(fid)}</td><td>{escape(fname)}</td><td><span class="badge {cls}">{escape(status)}</span></td></tr>\n'
        features_html = f'<table><thead><tr><th>ID</th><th>名稱</th><th>狀態</th></tr></thead><tbody>{rows}</tbody></table>'
    else:
        features_html = '<div class="empty">尚無功能記錄</div>'

    # Bugs table
    bugs_html = ""
    if data["bugs"]:
        rows = ""
        for b in data["bugs"]:
            bid = b.get("bug_id", "")
            title = b.get("title", b.get("description", ""))
            sev = b.get("severity", "")
            status = b.get("status", "")
            cls = "badge-red" if status == "open" else "badge-yellow" if status == "fixed" else "badge-gray"
            rows += f'<tr><td>{escape(bid)}</td><td>{escape(title)}</td><td>{escape(sev)}</td><td><span class="badge {cls}">{escape(status)}</span></td></tr>\n'
        bugs_html = f'<table><thead><tr><th>ID</th><th>標題</th><th>嚴重度</th><th>狀態</th></tr></thead><tbody>{rows}</tbody></table>'
    else:
        bugs_html = '<div class="empty">沒有缺陷記錄</div>'

    # Deps
    deps_html = ""
    rt = deps.get("runtime_dependencies", {})
    if rt:
        rows = ""
        for k, v in list(rt.items())[:20]:
            rows += f'<tr><td>{escape(k)}</td><td>{escape(str(v.get("version","")))}</td><td>{escape(v.get("type",""))}</td></tr>\n'
        if len(rt) > 20:
            rows += f'<tr><td colspan="3" style="color:#9ca3af">...還有 {len(rt)-20} 個</td></tr>'
        deps_html = f'<table><thead><tr><th>套件</th><th>版本</th><th>類型</th></tr></thead><tbody>{rows}</tbody></table>'
    else:
        deps_html = '<div class="empty">無相依套件記錄</div>'

    # Changelog
    changelog_html = ""
    cl = data.get("changelog", "")
    if cl:
        changelog_html = changelog_to_html(cl)
    else:
        changelog_html = '<div class="empty">尚無變更記錄</div>'

    # Context
    context_html = context_to_html(data.get("context", ""))

    # Tests
    tests_html = ""
    if data["tests"]:
        for t in data["tests"]:
            tests_html += f'<div class="test-item"><strong>{escape(t["name"])}</strong><div class="md-small">{md_to_html((t.get("content",""))[:300])}</div></div>'
    else:
        tests_html = '<div class="empty">尚無測試記錄</div>'

    return f"""<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{escape(name)} - Dashboard</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8f9fc;color:#333}}
.header{{background:linear-gradient(135deg,#1a1a2e,#2d2b55);color:#fff;padding:1.5rem 2rem}}
.header h1{{font-size:1.4rem}}
.header .sub{{color:rgba(255,255,255,.5);font-size:.82rem;margin-top:.3rem}}
.main{{max-width:1200px;margin:0 auto;padding:1.5rem}}
.stats{{display:flex;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}}
.stat-card{{background:#fff;border:1px solid #e8ecf1;border-radius:12px;padding:1rem 1.5rem;text-align:center;flex:1;min-width:120px}}
.stat-num{{font-size:1.8rem;font-weight:800}}
.stat-num.green{{color:#10b981}}.stat-num.red{{color:#ef4444}}.stat-num.blue{{color:#4361ee}}.stat-num.purple{{color:#7c3aed}}
.stat-label{{font-size:.78rem;color:#9ca3af;margin-top:.2rem}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:1rem;margin-bottom:1.5rem}}
.card{{background:#fff;border:1px solid #e8ecf1;border-radius:12px;padding:1.25rem}}
.card h2{{font-size:1rem;color:#1a1a2e;margin-bottom:.75rem;padding-bottom:.5rem;border-bottom:2px solid #e8ecf1}}
.full{{grid-column:1/-1}}
table{{width:100%;border-collapse:collapse;font-size:.83rem}}
th{{text-align:left;padding:.4rem .5rem;background:#f8f9fc;color:#6b7280;font-size:.78rem;border-bottom:1px solid #e8ecf1}}
td{{padding:.4rem .5rem;border-bottom:1px solid #f3f4f6}}
.badge{{display:inline-block;padding:.1rem .4rem;border-radius:4px;font-size:.72rem;font-weight:600}}
.badge-green{{background:#d1fae5;color:#065f46}}.badge-red{{background:#fee2e2;color:#991b1b}}.badge-yellow{{background:#fef3c7;color:#92400e}}.badge-gray{{background:#f3f4f6;color:#6b7280}}
.empty{{color:#9ca3af;font-size:.85rem;text-align:center;padding:1.5rem}}
.cl-timeline{{position:relative;padding-left:1.2rem}}
.cl-timeline::before{{content:'';position:absolute;left:.45rem;top:.5rem;bottom:.5rem;width:2px;background:#e8ecf1}}
.cl-entry{{position:relative;margin-bottom:.6rem;display:flex;gap:.75rem;align-items:flex-start}}
.cl-dot{{width:10px;height:10px;border-radius:50%;background:var(--cl-color,#4361ee);flex-shrink:0;margin-top:.45rem;position:relative;z-index:1;box-shadow:0 0 0 3px #fff}}
.cl-content{{flex:1;min-width:0}}
.cl-header{{display:flex;align-items:center;gap:.5rem;cursor:pointer;padding:.3rem 0;user-select:none}}
.cl-header:hover .cl-title{{color:#4361ee}}
.cl-date{{background:#f3f4f6;color:#6b7280;font-size:.72rem;padding:.1rem .4rem;border-radius:4px;white-space:nowrap;font-family:'SF Mono','Fira Code',monospace}}
.cl-title{{font-weight:600;font-size:.86rem;color:#1a1a2e;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
.cl-arrow{{font-size:.65rem;color:#9ca3af;flex-shrink:0}}
.cl-body{{font-size:.82rem;color:#374151;margin-top:.2rem;padding-left:.25rem;border-left:2px solid #f3f4f6}}
.cl-body h3,.cl-body h4{{font-size:.84rem;margin:.4rem 0 .2rem;color:#4b5563}}
.cl-body ul{{padding-left:1.2rem;margin:.2rem 0}}
.cl-body p{{margin-bottom:.25rem}}
.md-code{{background:#f3f4f6;padding:.5rem;border-radius:6px;font-size:.78rem;overflow-x:auto;font-family:'SF Mono','Fira Code',monospace}}
.test-item{{margin-bottom:.5rem;padding-bottom:.5rem;border-bottom:1px solid #f3f4f6}}
.md-small{{font-size:.8rem;color:#6b7280;margin-top:.2rem}}
.md-small h2,.md-small h3,.md-small h4{{font-size:.82rem}}
.footer{{text-align:center;padding:1rem;color:#d1d5db;font-size:.75rem}}
p{{margin-bottom:.3rem}}
h2{{margin:.5rem 0 .3rem}}h3{{margin:.4rem 0 .2rem}}h4{{margin:.3rem 0 .2rem}}
.inline-code{{background:#f3f4f6;padding:.1rem .3rem;border-radius:3px;font-size:.82rem;font-family:'SF Mono','Fira Code',monospace;color:#e11d48}}
.md-table{{width:100%;border-collapse:collapse;font-size:.83rem;margin:.4rem 0}}
.md-table th{{text-align:left;padding:.35rem .5rem;background:#f8f9fc;color:#6b7280;font-size:.78rem;border-bottom:1px solid #e8ecf1}}
.md-table td{{padding:.35rem .5rem;border-bottom:1px solid #f3f4f6}}
.md-hr{{border:none;border-top:1px solid #e8ecf1;margin:.6rem 0}}
.checklist{{list-style:none;padding-left:.5rem}}
.checklist li{{position:relative;padding-left:1.4rem;margin:.2rem 0}}
.checklist li::before{{position:absolute;left:0;font-size:.9rem}}
.checklist li.checked::before{{content:"\\2611";color:#10b981}}
.checklist li.unchecked::before{{content:"\\2610";color:#9ca3af}}
.ctx-section{{margin-bottom:.5rem;border-radius:8px;overflow:hidden;border:1px solid #f3f4f6}}
.ctx-header{{padding:.5rem .75rem;font-weight:600;font-size:.88rem;color:#1a1a2e;background:#fafbfc;border-left:3px solid;cursor:pointer;user-select:none;display:flex;align-items:center;gap:.4rem}}
.ctx-header:hover{{background:#f3f4f6}}
.ctx-arrow{{font-size:.7rem;color:#9ca3af;width:1rem;text-align:center}}
.ctx-body{{padding:.5rem .75rem .5rem 1.5rem;font-size:.84rem;color:#374151}}
.ctx-body h3{{font-size:.85rem;color:#4b5563;margin:.5rem 0 .2rem}}
.ctx-body h4{{font-size:.83rem;color:#6b7280;margin:.4rem 0 .2rem}}
.ctx-body ul{{padding-left:1.2rem;margin:.2rem 0}}
.ctx-body p{{margin-bottom:.25rem}}
</style>
</head>
<body>
<div class="header">
<h1>{escape(name)}</h1>
<div class="sub">{escape(subtitle)} · 產出時間：{now}</div>
</div>
<div class="main">

<div class="stats">
<div class="stat-card"><div class="stat-num blue">{n_features}</div><div class="stat-label">功能</div></div>
<div class="stat-card"><div class="stat-num red">{n_bugs_open}</div><div class="stat-label">開放缺陷</div></div>
<div class="stat-card"><div class="stat-num purple">{n_deps}</div><div class="stat-label">相依套件</div></div>
<div class="stat-card"><div class="stat-num green">{n_tests}</div><div class="stat-label">測試報告</div></div>
</div>

<div class="grid">
<div class="card"><h2>功能 Features</h2>{features_html}</div>
<div class="card"><h2>缺陷 Bugs</h2>{bugs_html}</div>
<div class="card"><h2>相依套件</h2>{deps_html}</div>
<div class="card"><h2>測試</h2>{tests_html}</div>
</div>

<div class="card full" style="margin-bottom:1rem"><h2>變更日誌</h2><div style="max-height:500px;overflow-y:auto">{changelog_html}</div></div>
<div class="card full"><h2>專案上下文</h2><div style="max-height:400px;overflow-y:auto">{context_html}</div></div>

</div>
<div class="footer">Project Manager Dashboard · {now}</div>
</body>
</html>"""


if __name__ == "__main__":
    if not PM_DIR.exists():
        print(f"找不到 .proj-manager/ 目錄")
        print(f"搜尋路徑: {PM_DIR}")
        sys.exit(1)

    data = scan()
    html = build_html(data)
    OUTPUT.write_text(html, encoding="utf-8")
    print(f"已產出: {OUTPUT}")

    # Auto open in browser
    if "--no-open" not in sys.argv:
        webbrowser.open(f"file://{OUTPUT}")
