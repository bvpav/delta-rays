import http
import json


class Handler(http.server.BaseHTTPRequestHandler):
    def get_json(self):
        return {'msg': 'hii from python 👋'}

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type','application/json')
        self.end_headers()
        payload = json.dumps(self.get_json()).encode('utf-8')
        self.wfile.write(payload)
