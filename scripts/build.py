"""Assemble index.html from src/ (shell, styles, scripts) and data/parts.json.

The scripts in src/js are joined in file-name order into one <script>, so they share one scope.
"""
import glob, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
read = lambda *p: open(os.path.join(ROOT, *p), encoding="utf-8").read()
shell = read("src", "index.html")
css = read("src", "styles.css").rstrip("\n")
js = "".join(read(f) for f in sorted(glob.glob(os.path.join(ROOT, "src", "js", "*.js")))).rstrip("\n")
data = read("data", "parts.json").strip()
for mark in ("/*CSS*/", "/*JS*/"):
    assert mark in shell, f"placeholder {mark} missing in src/index.html"
assert "/*DATA*/" in js, "placeholder /*DATA*/ missing in src/js"
out = shell.replace("/*CSS*/", css).replace("/*JS*/", js.replace("/*DATA*/", data))
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(out)
print("built index.html")
