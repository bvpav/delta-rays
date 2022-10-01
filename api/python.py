from server.lib import apitools


class Handler(apitools.JSONGetHandler):
    def get_json(self):
        return {'msg': 'hii from python 👋'}
