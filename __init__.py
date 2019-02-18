from flask import Flask
import config
from flask_mongoengine import MongoEngine
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from flask_wtf.csrf import CSRFProtect
from . import models
from .routes import auth, views

login = LoginManager()
db = MongoEngine()

@login.user_loader
def load_user(user_id):
    return models.User.objects(id=user_id).first()

def create_app(**config_class):
    app = Flask(__name__)
    app.config.from_object('config.DevelopmentConfig')
    app.config.update(config_class)

    login.init_app(app)
    db.init_app(app)
    app.register_blueprint(auth.bp)
    app.register_blueprint(views.bp)

    return app
