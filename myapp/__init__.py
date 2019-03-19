from flask import Flask
from flask_mongoengine import MongoEngine
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
import auth
from stravalib import Client

login = LoginManager()
db = MongoEngine()

def create_app(**config_class):
    app = Flask(__name__)
    app.config['TESTING'] = False
    app.config['MONGODB_SETTINGS'] = { 'db' : 'test'}
    app.config['SECRET_KEY'] = '988e4784dc468d83a3fc32b69f469a0571442806'
    app.config['DEBUG'] = True
    app.config.update(config_class)

    login.init_app(app)
    db.init_app(app)
    app.register_blueprint(auth.bp)

    @login.user_loader
    def load_user(user_id):
        return models.User.objects(id=user_id).first()

    return app
