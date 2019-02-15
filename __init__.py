from flask import Flask
import config
from flask_mongoengine import MongoEngine
from flask_login import LoginManager, login_user, UserMixin, current_user, login_required, logout_user
from flask_bcrypt import Bcrypt
from flask_wtf.csrf import CSRFProtect
from . import auth, views

login = LoginManager()
db = MongoEngine()
csrf = CSRFProtect()

def create_app(**config_class):
    app = Flask(__name__)
    print(config_class)
    app.config.from_object('config.DevelopmentConfig')
    app.config.update(config_class)

    from . import auth
    login.init_app(app)
    db.init_app(app)
    csrf.init_app(app)
    app.register_blueprint(auth.bp)
    app.register_blueprint(views.bp)

    return app
