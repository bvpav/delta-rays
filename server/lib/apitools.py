import http.server
import json
from typing import Any


class JSONGetHandler(http.server.BaseHTTPRequestHandler):
    """Respond to an HTTP GET request w/ a JSON payload, serialized from a dict"""

    def get_json(self) -> dict[str, Any]:
        raise NotImplementedError('The `get_json` method must be implemented.')

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type','application/json')
        self.end_headers()
        payload = json.dumps(self.get_json()).encode('utf-8')
        self.wfile.write(payload)