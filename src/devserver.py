#!/usr/bin/env python3
# Dev static server with caching disabled, so edited JS modules never go stale.
import http.server, socketserver

PORT = 8775

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"serving on http://localhost:{PORT} (no-store)")
    httpd.serve_forever()
