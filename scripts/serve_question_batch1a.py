"""Local-only deterministic browser QA fixture; never used by the shipped app.

python scripts/serve_question_batch1a.py
Open http://127.0.0.1:8766/batch1a. Uses the actual app with only the 10
reviewed questions in memory. Browser storage is replaced with memory storage,
exam confirmation auto-accepts, and unrelated background PDF prewarming is off.
This fixture checks content/rendering/scoring, not sampling or native dialogs.
"""
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from audit_question_cues import ROOT, BATCH, extract


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != '/batch1a':
            self.send_error(404)
            return
        source = (ROOT / 'index.html').read_text(encoding='utf-8')
        db, _ = extract(source)
        original = json.dumps(db, ensure_ascii=False, separators=(',', ':'))
        db['questions'] = [q for q in db['questions'] if q['id'] in BATCH]
        assert source.count(original) == 1
        source = source.replace(original, json.dumps(db, ensure_ascii=False, separators=(',', ':')), 1)
        setup = '''<script>
        const qaStorage = new Map();
        Object.defineProperty(window, 'localStorage', {value: {
          getItem(k){return qaStorage.get(k) ?? null},
          setItem(k,v){qaStorage.set(k,String(v))}, removeItem(k){qaStorage.delete(k)}
        }});
        window.confirm = () => true;
        </script>'''
        source = source.replace('<script>', setup + '<script>', 1)
        # Keep external official sources outside this deterministic content fixture.
        source = source.replace('setTimeout(()=>prewarmOfficialCache(),1200);', '')
        data = source.encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)


if __name__ == '__main__':
    print('Batch 1A fixture: http://127.0.0.1:8766/batch1a', flush=True)
    HTTPServer(('127.0.0.1', 8766), Handler).serve_forever()
