"""Build the isolated /product-finder experience without changing Version A."""
import hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def build():
    for name,target in [('finder-b.js','js/finder-b.js'),('finder-b-core.js','js/finder-b-core.js'),('finder-b.css','css/finder-b.css')]:
        (ROOT/target).parent.mkdir(parents=True,exist_ok=True)
        (ROOT/target).write_bytes((ROOT/'src'/name).read_bytes())
    page=(ROOT/'src/product-finder/index.html').read_text()
    for key,name in [('STYLE','css/finder-b.css'),('SCRIPT','js/finder-b.js'),('DATA','js/finder-data.js'),('CORE','js/finder-core.js'),('B_CORE','js/finder-b-core.js')]:
        page=page.replace('__'+key+'_VERSION__',hashlib.sha256((ROOT/name).read_bytes()).hexdigest()[:12])
    target=ROOT/'product-finder/index.html';target.parent.mkdir(exist_ok=True);target.write_text(page)
if __name__=='__main__':build()
