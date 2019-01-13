import flask
from flask import Flask, render_template, redirect, request, session, jsonify, url_for
from flask_pymongo import PyMongo as pm
import sys
sys.path.append('./static/lib/python/')
from gaussianregression import calculateRegression
import json
import numpy as np
import stravalib
from stravalib.client import Client
import GPy
from flask_login import LoginManager, login_user, UserMixin, current_user, login_required, logout_user
from flask_mongoengine import MongoEngine
from wtforms import fields, validators
from flask_wtf import FlaskForm
from flask_bcrypt import Bcrypt

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'memcached'
app.config['SECRET_KEY'] = '988e4784dc468d83a3fc32b69f469a0571442806'
#app.config["MONGO_URI"] = "mongodb://localhost:27017/UserDatabase"
app.config["MONGODB_CONFIG"] = {
    'db': 'UserDatabase',
    'host': 'mongodb://localhost:27017/UserDatabase'
}
db = MongoEngine()
db.init_app(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

class User(db.Document, UserMixin):
    username = db.StringField()
    email = db.EmailField()
    password = db.StringField()
    token = db.StringField()

class RegistrationForm(FlaskForm):
    username = fields.TextField(validators=[validators.required()])
    email = fields.TextField([validators.Email(message='Not a valid email')])
    password = fields.PasswordField('New Password', [
        validators.DataRequired(),
        validators.Length(min=10, message='Password must be at least 10 characters long'),
        validators.EqualTo('confirm', message='Passwords must match')
    ])
    confirm = fields.PasswordField('Repeat Password')

    def validate_login(self, field):
        if User.objects(username=self.username.data):
            raise validators.ValidationError('Duplicate username')

class LoginForm(FlaskForm):
    email = fields.TextField('Email')
    password = fields.PasswordField('Password')
    remember_me = fields.BooleanField('Keep me logged in')
    submit = fields.SubmitField('Log In')


@login_manager.user_loader
def load_user(user_id):
    return User.objects(id=user_id).first()

@app.route("/")
def index():
    return redirect(url_for('login'))

@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm(request.form)
    #print(form.validate())
    if request.method == 'POST' and form.validate():
        #print("POST")
        check_user = User.objects(email = form.email.data).first()
        if check_user:
            if bcrypt.check_password_hash(check_user.password, str(form.password.data)):
                print("Hash matched")
                login_user(check_user)

                flask.flash('Logged in successfully.')

                next = flask.request.args.get('next')
                # is_safe_url should check if the url is safe for redirects.
                # See http://flask.pocoo.org/snippets/62/ for an example.
                #if not is_safe_url(next):
                #    return flask.abort(400)

                return flask.redirect(next or flask.url_for('parse_data'))
    return flask.render_template('login.html', form=form)


@app.route("/register", methods=['POST', 'GET'])
def register():
    form = RegistrationForm(request.form)
    if request.method == 'POST' and form.validate():
        existing_user = User.objects(username=form.username.data).first()
        if existing_user is None:
            user = User(username=form.username.data, email=form.email.data, password=bcrypt.generate_password_hash(form.password.data)).save()
            login_user(user)
            client = Client()
            authorize_url = client.authorization_url(client_id=29429, redirect_uri='http://localhost:5000/redirect')
            return redirect(authorize_url)

    return render_template('register.html', form=form)

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route("/redirect")
@login_required
def redir():
    import requests
    client=Client()
    code = request.args.get('code')
    access_token = client.exchange_code_for_token(client_id=29429, client_secret='988e4784dc468d83a3fc32b69f469a0571442806', code=code)
    current_user.update(token = access_token['access_token'], upsert = True)
    return redirect(url_for('login'))

@app.route("/dashboard")
@login_required
def parse_data():
    client=Client()
    access_token = current_user['token']
    client.access_token = access_token
    #athlete = client.get_athlete()
    activities = client.get_activities()
    runs = filter(lambda a: a.type=="Run" and a.average_heartrate != None,activities)
    print(runs)
    summaries = []
    gr = {'heart_rates': [], 'average_pace': []}
    for run in runs:
        summary = {}
        summary['id'] = run.id
        summary['distance'] = run.distance.num
        summary['heart_rate'] = run.average_heartrate
        summary['average_speed'] = (run.average_speed.num*60*60)/1000
        summary['average_pace'] = 60/summary['average_speed']
        summary['description'] = run.description
        summary['total_elevation_gain'] = run.total_elevation_gain.num
        summary['year'] = run.start_date.year
        summary['month'] = run.start_date.month
        summary['day'] = run.start_date.day
        summary['hour'] = run.start_date.hour
        summary['minute'] = run.start_date.minute
        summary['second'] = run.start_date.second
        summaries.append(summary.copy())

    line_coords = calculateRegression(summaries)
    return render_template("index.html", sample = summaries, regression = line_coords)

@app.route("/_gaussian_calculation", methods=['POST'])
@login_required
def getGaussian():
    activities=None
    if request.method == "POST":
        activities = request.json
        return jsonify(calculateRegression(activities))



if __name__ == "__main__":
    app.run(debug=True)
