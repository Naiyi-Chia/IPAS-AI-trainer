from pathlib import Path

path = Path("index.html")
text = path.read_text(encoding="utf-8")

old = "    status.textContent=`正在開啟 ${paper.year} 年 ${paper.session} ${paper.subject}…`;"
new = "    if(status)status.textContent=`正在開啟 ${paper.year} 年 ${paper.session} ${paper.subject}…`;"
if text.count(old) != 1:
    raise SystemExit("loading status line not found exactly once")
text = text.replace(old, new, 1)

old = "    status.innerHTML=`<span class=\"bad\">暫時無法開卷：</span>${esc(err.message||String(err))}　<a href=\"${paper.pdf}\" target=\"_blank\" rel=\"noopener\">查看官方 PDF</a>`;"
new = "    if(status)status.innerHTML=`<span class=\"bad\">暫時無法開卷：</span>${esc(err.message||String(err))}　<a href=\"${paper.pdf}\" target=\"_blank\" rel=\"noopener\">查看官方 PDF</a>`;"
if text.count(old) != 1:
    raise SystemExit("error status line not found exactly once")
text = text.replace(old, new, 1)

path.write_text(text, encoding="utf-8")
print("Issue #109 loader hardened for repeated programmatic QA")
