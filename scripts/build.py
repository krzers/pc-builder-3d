"""Assemble index.html from src/template.html + data/parts.json."""
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
t=open(os.path.join(ROOT,'src','template.html'),encoding='utf-8').read()
d=open(os.path.join(ROOT,'data','parts.json'),encoding='utf-8').read().strip()
assert '/*DATA*/' in t,'placeholder /*DATA*/ missing in src/template.html'
open(os.path.join(ROOT,'index.html'),'w',encoding='utf-8').write(t.replace('/*DATA*/',d))
print('built index.html')
