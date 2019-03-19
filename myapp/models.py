from .__init__ import db
from flask_login import UserMixin

class User(db.Document, UserMixin):
    username = db.StringField()
    email = db.EmailField()
    password = db.StringField()
    token = db.StringField()
    refresh_token = db.StringField()
    expires_at = db.IntField()
