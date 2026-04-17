import os
from pymongo import MongoClient

_client = None

def get_db():
    global _client
    if _client is None:
        uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
        _client = MongoClient(uri)
    db_name = os.getenv('MONGO_DB_NAME', 'tea-weather')
    return _client[db_name]