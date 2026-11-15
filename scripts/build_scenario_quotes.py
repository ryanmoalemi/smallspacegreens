"""Build searchable scenario evidence separately from public recommendation copy."""
import json,sqlite3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; base=ROOT/'data/reviews'
quotes=json.loads((base/'scenario-quote-candidates.json').read_text()); index={q['id']:q for q in quotes}
selected=[]
for qid,crop,space,note in json.loads((base/'quote-selections.json').read_text()):
 q=dict(index[qid]);q.update(cropContext=crop,spaceContext=space,editorNote=note,status='relevance_reviewed_not_published',author=None,commentPermalink=None)
 selected.append(q)
(base/'selected-scenario-quotes.json').write_text(json.dumps(selected,indent=2)+'\n')
con=sqlite3.connect(base/'evidence.sqlite3')
con.executescript('CREATE TABLE IF NOT EXISTS scenario_quotes(id TEXT PRIMARY KEY,thread_id TEXT,url TEXT,body TEXT,metadata_json TEXT); CREATE TABLE IF NOT EXISTS scenario_searches(id TEXT PRIMARY KEY,query TEXT,metadata_json TEXT); CREATE TABLE IF NOT EXISTS selected_scenario_quotes(id TEXT PRIMARY KEY,crop TEXT,space TEXT,editor_note TEXT,metadata_json TEXT);')
with con:
 for t in ['scenario_quotes','scenario_searches','selected_scenario_quotes']:con.execute('DELETE FROM '+t)
 for q in quotes:con.execute('INSERT INTO scenario_quotes VALUES(?,?,?,?,?)',(q['id'],q['threadId'],q['url'],q['quote'],json.dumps(q)))
 searches=json.loads((base/'scenario-searches.json').read_text())
 for s in searches:con.execute('INSERT INTO scenario_searches VALUES(?,?,?)',(s['id'],s['query'],json.dumps(s)))
 for q in selected:
  assert q['quote']==index[q['id']]['quote']
  con.execute('INSERT INTO selected_scenario_quotes VALUES(?,?,?,?,?)',(q['id'],q['cropContext'],q['spaceContext'],q['editorNote'],json.dumps(q)))
 assert con.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
report={'searches':len(searches),'candidateQuotes':len(quotes),'selectedQuotes':len(selected),'allPossibilitiesVerified':False,'remainingGaps':['Exact catalog product endorsements are not established by category discussions.','Successful root radishes on a sunny windowsill need stronger firsthand evidence.','Low-light herb or tomato searches mainly support limitations, not success without supplemental light.','Not every crop-space-setup path has a selected passage.'],'sourceLimitations':['Search-index excerpts, not complete thread exports.','Author names and comment permalinks unavailable in these results; thread URL and date retained.','Selection confirms relevance, not horticultural accuracy or permission to republish.','Candidate search tags must not be treated as verified crop or space context.']}
(base/'scenario-coverage.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
