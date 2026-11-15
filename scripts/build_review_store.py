"""Rebuild the SQLite evidence database and the public, read-only lookup index."""
import json, sqlite3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
payload=json.loads((ROOT/'data/reviews/evidence.json').read_text())
records=payload['records']; seen=set()
for r in records:
    assert r['id'] not in seen; seen.add(r['id'])
    assert r['platform'] in ('reddit','amazon') and r['url'].startswith('https://')
    assert r['excerpt'] and r['retrievedAt'] and r['question']
    if r['platform']=='amazon': assert r['productIds'], 'Amazon reviews require exact catalog product IDs'
con=sqlite3.connect(ROOT/'data/reviews/evidence.sqlite3')
con.execute('CREATE TABLE IF NOT EXISTS evidence(id TEXT PRIMARY KEY, platform TEXT, source_url TEXT, retrieved_at TEXT, payload TEXT)')
with con:
    con.execute('DELETE FROM evidence')
    con.executemany('INSERT INTO evidence VALUES (?,?,?,?,?)',[(r['id'],r['platform'],r['url'],r['retrievedAt'],json.dumps(r)) for r in records])
con.close()
(ROOT/'js/review-evidence.js').write_text('window.SSG_REVIEW_EVIDENCE = '+json.dumps(payload,ensure_ascii=True)+';\n')
print(f'Built SQLite store and browser index: {len(records)} sourced excerpts')
