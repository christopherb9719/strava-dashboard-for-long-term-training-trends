from .__init__ import db
from flask_login import LoginManager, login_user, UserMixin, current_user, login_required, logout_user

class User(db.Document, UserMixin):
    username = db.StringField()
    email = db.EmailField()
    password = db.StringField()
    token = db.StringField()
    refresh_token = db.StringField()
    expires_at = db.IntField()
