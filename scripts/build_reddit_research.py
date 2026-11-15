"""Import retrieved Reddit excerpts without claiming complete threads or verified buyers."""
import hashlib,json,re,sqlite3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
threads=json.loads((ROOT/'data/reviews/reddit-research.json').read_text())
products=json.loads((ROOT/'src/finder.json').read_text())['products']
con=sqlite3.connect(ROOT/'data/reviews/evidence.sqlite3')
con.executescript('''
CREATE TABLE IF NOT EXISTS research_threads(id TEXT PRIMARY KEY,url TEXT,title TEXT,retrieved_at TEXT,scope TEXT,source_text TEXT);
CREATE TABLE IF NOT EXISTS research_excerpts(id TEXT PRIMARY KEY,thread_id TEXT,source_ordinal INTEGER,date_label TEXT,votes INTEGER,body TEXT,record_kind TEXT,status TEXT);
CREATE TABLE IF NOT EXISTS research_product_links(thread_id TEXT,product_id TEXT,scope TEXT,PRIMARY KEY(thread_id,product_id));
CREATE TABLE IF NOT EXISTS catalog_coverage(product_id TEXT PRIMARY KEY,asin TEXT,name TEXT,threads INTEGER,excerpts INTEGER,exact_asin_verified INTEGER,note TEXT);
''')
count=0
with con:
 for table in ['research_threads','research_excerpts','research_product_links','catalog_coverage']:con.execute('DELETE FROM '+table)
 for t in threads:
  tid=re.search(r'/comments/([^/]+)',t['url'])[1]
  con.execute('INSERT INTO research_threads VALUES(?,?,?,?,?,?)',(tid,t['url'],t['title'],t['retrievedAt'],t['scope'],t['text']))
  for pid in t['productIds']:
   assert pid in products
   con.execute('INSERT INTO research_product_links VALUES(?,?,?)',(tid,pid,t['scope']))
  markers=list(re.finditer(r'\[([^\]\n]+\d{4})\]\s*\[([+-]?\d+) votes?\]',t['text']))
  for i,m in enumerate(markers):
   body=t['text'][m.end():markers[i+1].start() if i+1<len(markers) else len(t['text'])].strip()
   body=body.replace('SHARED URL','').strip()
   if len(body)<45 or 'redacted for privacy' in body.lower():continue
   eid=hashlib.sha256((tid+'\n'+body).encode()).hexdigest()[:24]
   con.execute('INSERT OR IGNORE INTO research_excerpts VALUES(?,?,?,?,?,?,?,?)',(eid,tid,i,m[1],int(m[2]),body,'post_or_comment_excerpt','needs_review'))
 coverage=[]
 for pid,p in products.items():
  nt=con.execute('SELECT count(*) FROM research_product_links WHERE product_id=?',(pid,)).fetchone()[0]
  nc=con.execute('SELECT count(*) FROM research_excerpts e JOIN research_product_links l ON e.thread_id=l.thread_id WHERE l.product_id=?',(pid,)).fetchone()[0]
  scopes=[x[0] for x in con.execute('SELECT DISTINCT scope FROM research_product_links WHERE product_id=?',(pid,))]
  note='No exact ASIN verified. '+('Research scope: '+', '.join(scopes) if nt else 'No relevant indexed source found; evidence gap.')
  con.execute('INSERT INTO catalog_coverage VALUES(?,?,?,?,?,?,?)',(pid,p['asin'],p['name'],nt,nc,0,note))
  coverage.append(dict(productId=pid,name=p['name'],asin=p['asin'],threads=nt,excerpts=nc,exactAsinVerified=False,scope=scopes,note=note))
 count=con.execute('SELECT count(*) FROM research_excerpts').fetchone()[0]
 assert con.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
con.close()
report={'retrievedAt':'2026-11-15','threads':len(threads),'excerpts':count,'coverage':coverage,'rainforest':{'status':'blocked_missing_credentials','testAsin':'B00TF9E6XE','testCredential':'documented demo value, not a private key','httpStatus':401,'message':'Please sign up for a Plan or Free Trial','amazonReviewsImported':0},'limitations':['Search-returned excerpts, not full Reddit thread exports.','Comment IDs/authors were not provided; thread URLs and excerpt ordinals retained.','Product links express research relevance, not endorsement or verified purchase.','Collected excerpts need review before being enabled in the visitor experience.']}
(ROOT/'data/reviews/coverage.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'threads':len(threads),'excerpts':count,'catalogItems':len(products),'itemsWithContext':sum(x['threads']>0 for x in coverage),'amazonReviews':0}))
