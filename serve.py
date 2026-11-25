"""Local dev server for the prototype with caching disabled (so edits show on refresh).
Usage: python3 serve.py   →  http://127.0.0.1:5178"""
import http.server, socketserver, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', 5178), NoCache) as s:
    print('Serving on http://127.0.0.1:5178'); s.serve_forever()
