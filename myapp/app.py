import flask
from flask import Flask, render_template, abort, request, url_for, redirect, current_app, jsonify, session
from flask_mongoengine import MongoEngine
from flask_login import LoginManager, UserMixin
from flask_wtf.csrf import CSRFProtect
from stravalib import Client
from flask_login import current_user, login_required, login_user, logout_user
from jinja2 import TemplateNotFound
from flask_bcrypt import Bcrypt
import time
import json
from config import *

import sys
sys.path.append('./static/python/')
from parse import parse_data
from forms import RegistrationForm, LoginForm
from gaussianregression import calculateRegression


def getLineCoords(activities):
        if len(activities) > 0:
            return calculateRegression(activities)
        else:
            return []

############################# BUILD THE APP #############################
def create_app(**config_class):
    login = LoginManager()
    db = MongoEngine()

    app = Flask(__name__)

    #set up database
    app.config.from_object(DevelopmentConfig)
    app.config.update(config_class)

    ###### INITIALISE LOGIN MANAGER AND DATABASE ######
    login.init_app(app)
    db.init_app(app)


    ###### DEFINE THE USER OBJECT ######
    class User(db.Document, UserMixin):
        username = db.StringField()
        email = db.EmailField()
        password = db.StringField()
        token = db.StringField()
        refresh_token = db.StringField()
        expires_at = db.IntField()


    ###### BUILD THE USER LOADER ######
    @login.user_loader
    def load_user(user_id):
        return User.objects(id=user_id).first()



    ###### DEFINE APPLICATION ROUTES ######
    @app.route('/<page>')
    def show(page):
        try:
            return render_template('%s.html' % page)
        except TemplateNotFound:
            abort(404)

    @app.route('/register', methods=['POST', 'GET'])
    def register():
        form = RegistrationForm(request.form)
        error = None
        if request.method == 'POST' and form.validate():
            existing_username = User.objects(username=form.username.data).first()
            existing_email = User.objects(email=form.email.data).first()

            if existing_username is None and existing_email is None and form.validate():
                bcrypt = Bcrypt(current_app)
                session['username'] = form.username.data;
                session['email'] = form.email.data;
                session['password'] = bcrypt.generate_password_hash(form.password.data)
                client = Client()
                authorize_url = client.authorization_url(client_id=CLIENT_ID, redirect_uri='http://localhost:5000/redirect')
                return redirect(authorize_url)
        return render_template('register.html', form=form)

    @app.route('/', methods=["GET", "POST"])
    @app.route("/login", methods=["GET", "POST"])
    def login():
        form = LoginForm(request.form)
        if request.method == 'POST' and form.validate():
            check_user = User.objects(email = form.email.data).first()
            if check_user:
                bcrypt = Bcrypt(current_app)
                if bcrypt.check_password_hash(check_user.password, str(form.password.data)):
                    login_user(check_user)

                    client = Client()
                    client.access_token = current_user['token']
                    client.refresh_token = current_user['refresh_token']
                    client.token_expires_at = current_user['expires_at']

                    if client.token_expires_at != None: #TAKE THIS OUT!
                        if time.time() > client.token_expires_at:
                            new_token = client.refresh_access_token(client_id=CLIENT_ID, client_secret=CLIENT_SECRET, refresh_token=client.refresh_token)
                            user.update(token = new_token['access_token'], refresh_token = new_token['refresh_token'], expires_at = new_token['expires_at'])

                    return redirect(flask.url_for('loadDashboard'))
        return render_template('login.html', form=form)

    @app.route("/logout")
    @login_required
    def logout():
        logout_user()
        return redirect(flask.url_for('login'))


    @app.route("/redirect")
    def redir():
        import requests
        client=Client()
        code = request.args.get('code')
        tokens = client.exchange_code_for_token(client_id=CLIENT_ID, client_secret=CLIENT_SECRET, code=code)
        user = User(username=session['username'], email=session['email'], password=session['password'], token=tokens['access_token'], refresh_token=tokens['refresh_token'], expires_at=tokens['expires_at']).save()
        login_user(user);

        return redirect(url_for('loadDashboard'))

    @app.route("/dashboard", methods=['POST', 'GET'])
    @login_required
    def loadDashboard():
        activities = parse_data(current_user)
        line_coords = getLineCoords(activities)
        return render_template("index.html", sample = activities, regression = line_coords)

    @app.route("/multi_user")
    @login_required
    def loadMultiUser():
        activities = parse_data(current_user)
        line_coords = getLineCoords(activities)
        return render_template("multi_user.html", sample = activities, regression = line_coords)


    @app.route("/get_user_data", methods=['POST'])
    @login_required
    def getUserData():
        user = User.objects(username = request.data.decode('utf-8')).first()
        activities = parse_data(user)
        line_coords = getLineCoords(activities)
        response = [activities, line_coords]
        return jsonify(response)

    @app.route("/_gaussian_calculation", methods=['POST'])
    @login_required
    def getGaussian():
        activities=None
        if request.method == "POST":
            activities = request.json
            return jsonify(calculateRegression(activities))

    @app.route("/find_users", methods = ["POST"])
    @login_required
    def findUsers():
        query = request.data.decode('utf-8')
        users = User.objects(username__contains=query).only('username')
        return users.to_json()

    ###### RETURN APPLICATION ######
    return app


if __name__=="__main__":
    app = create_app(DevelopmentConfig)
