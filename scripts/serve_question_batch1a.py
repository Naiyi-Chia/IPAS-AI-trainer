"""Local-only deterministic browser QA fixture; never used by the shipped app.

python scripts/serve_question_batch1a.py
Open http://127.0.0.1:8766/batch1a. Uses the actual app with only the 10
reviewed questions in memory. Browser storage is replaced with memory storage,
exam confirmation auto-accepts, and unrelated background PDF prewarming is off.
This fixture checks content/rendering/scoring, not sampling or native dialogs.

For Issue #46: python scripts/serve_question_batch1a.py --batch batch2a
Open http://127.0.0.1:8766/batch2a for the 21 reviewed Batch 2A questions.
"""
import json
import argparse
from http.server import BaseHTTPRequestHandler, HTTPServer
from audit_question_cues import ROOT, BATCHES, extract


class Handler(BaseHTTPRequestHandler):
    batch_name = 'batch1a'

    def do_GET(self):
        if self.path != '/' + self.batch_name:
            self.send_error(404)
            return
        source = (ROOT / 'index.html').read_text(encoding='utf-8')
        db, _ = extract(source)
        original = json.dumps(db, ensure_ascii=False, separators=(',', ':'))
        db['questions'] = [q for q in db['questions'] if q['id'] in BATCHES[self.batch_name]]
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
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--batch', choices=BATCHES, default='batch1a')
    Handler.batch_name = parser.parse_args().batch
    print(f'Fixture: http://127.0.0.1:8766/{Handler.batch_name}', flush=True)
    HTTPServer(('127.0.0.1', 8766), Handler).serve_forever()
