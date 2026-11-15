"""Preserve search provenance and extract attributed candidates, not endorsements."""
import json,re,hashlib,sqlite3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
base=ROOT/'data/reviews'
threads=json.loads((base/'reddit-research.json').read_text())
byid={re.search(r'/comments/([^/]+)',t['url'])[1]:t for t in threads}
quotes={}; searches=[]
for path in sorted((base/'search-expansion').glob('*.json')):
 data=json.loads(path.read_text()); key,query,pids,space=data['spec']; matched=[]
 text='\n'.join(c.get('text','') for c in data['result'].get('content',[]) if c.get('type')=='text')
 for block in re.split(r'\n-{20,}\n',text):
  m=re.match(r'(.+?) \((https?://[^\s]+reddit.com/r/[^\s]+/comments/([^/\s)]+)[^\s]*)\)',block)
  if not m: continue
  title,url,tid=m.groups(); markers=list(re.finditer(r'\[([^\]\n]+\d{4})\]\s*\[([+-]?\d+) votes?\]',block))
  if not markers:continue
  matched.append(tid)
  if tid not in byid:byid[tid]={'title':title,'url':url,'text':block,'batch':'scenario-expansion','productIds':[], 'scope':'category-search-candidate','retrievedAt':'2026-11-15','status':'collected_needs_review'}
  t=byid[tid];t.setdefault('queryMatches',[])
  if key not in t['queryMatches']:t['queryMatches'].append(key)
  # Search relevance does not establish that the passage is about any exact product.
  if t['scope']=='category-search-candidate':t['productIds']=sorted(set(t['productIds']+pids))
  for i,mark in enumerate(markers):
   body=block[mark.end():markers[i+1].start() if i+1<len(markers) else len(block)].strip().replace('SHARED URL','').strip()
   if not 70<=len(body)<=2400 or 'redacted for privacy' in body.lower():continue
   if not re.search(r'grow|harvest|light|water|soil|seed|tray|pot|basil|radish|lettuce',body,re.I):continue
   qid=hashlib.sha256((tid+'\n'+body).encode()).hexdigest()[:24]
   if qid not in quotes:quotes[qid]={'id':qid,'threadId':tid,'url':url,'title':title,'dateLabel':mark[1],'votes':int(mark[2]),'quote':body,'sourceOrdinal':i,'recordKind':'post_or_comment_excerpt','queryMatches':[],'status':'needs_review','exactProductVerified':False}
   quotes[qid]['queryMatches'].append(key)
 searches.append({'id':key,'query':query,'productIds':pids,'searchContext':space,'threadIds':sorted(set(matched))})
(base/'reddit-research.json').write_text(json.dumps(list(byid.values()),indent=2)+'\n')
(base/'scenario-searches.json').write_text(json.dumps(searches,indent=2)+'\n')
(base/'scenario-quote-candidates.json').write_text(json.dumps(list(quotes.values()),indent=2)+'\n')
# Shortlist for manual inspection. Full quotation remains unchanged in candidate file.
for s in searches:
 candidates=[q for q in quotes.values() if s['id'] in q['queryMatches']]
 def score(q):
  b=q['quote'].lower(); return (bool(re.search(r'\bi\b|\bmy\b|\bwe\b',b))*8 + sum(w in b for w in s['query'].lower().split()) + min(q['votes'],8)/4 - len(b)/2000)
 top=sorted(candidates,key=score,reverse=True)[:2]
 print(json.dumps({'search':s['id'],'threads':len(s['threadIds']),'candidates':len(candidates),'shortlist':[{'id':q['id'],'url':q['url'],'quote':q['quote'][:900]} for q in top]}))
