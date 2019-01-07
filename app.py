import flask
from flask import Flask, render_template, redirect, request, session, jsonify, url_for
from flask_pymongo import PyMongo as pm
import sys
sys.path.append('./static/lib/python/')
from gaussianregression import calculateRegression
from form import LoginForm
import json
import numpy as np
import stravalib
from stravalib.client import Client
import GPy
from flask_login import LoginManager
import bcrypt

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'memcached'
app.config['SECRET_KEY'] = '988e4784dc468d83a3fc32b69f469a0571442806'
app.config["MONGO_URI"] = "mongodb://localhost:27017/UserDatabase"
mongo = pm(app)

"""login_manager = LoginManager()
login_manager.init_app(app)
# NB: Make sure to add flask_user UserMixin !!!
class User(db.Model):
    active = db.BooleanField(default=True)

    # User authentication information
    username = db.StringField(default='')
    password = db.StringField()

    # User information
    first_name = db.StringField(default='')
    last_name = db.StringField(default='')

# Setup Flask-User and specify the User data-model
user_manager = UserManager(app, db, User)"""

@app.route("/")
def index():
    if 'username' in session:
        return redirect(url_for('authenticate'))
    return render_template('login.html')


@app.route("/login", methods=["GET", "POST"])
def login():
    users = mongo.db.users
    login_user = users.find_one({'name' : request.form['username']})

    if login_user:
        if bcrypt.hashpw(request.form['pass'].encode('utf-8'), login_user['password']) == login_user['password']:
            session['username'] = request.form['username']
            return redirect(url_for('index'))

    return 'Invalid username/password combination'


"""    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.get(form.email.data)
        flask.flash('Logged in successfully')
        next = flask.request.args.get('next')
        if not is_safe_url(next):
            return flask.abort(400)
        return flask.redirect(next or flask.url_for('index'))
    return flask.render_template('login.html', form=form)"""

@app.route("/register", methods=['POST', 'GET'])
def register():
    if request.method == 'POST':
        users = mongo.db.users
        existing_user = users.find_one({'name' : request.form['username']})

        if existing_user is None:
            hashpass = bcrypt.hashpw(request.form['pass'].encode('utf-8'), bcrypt.gensalt())
            users.insert({'name' : request.form['username'], 'password' : hashpass})
            session['username'] = request.form['username']
            return redirect(url_for('index'))

        return 'Username already exists'

    return render_template("register.html")


@app.route("/authenticate")
def authenticate():
    client = Client()
    authorize_url = client.authorization_url(client_id=29429, redirect_uri='http://localhost:5000/redirect')
    return redirect(authorize_url)

@app.route("/redirect")
def rdr():
    import requests
    client=Client()
    code = request.args.get('code')
    access_token = client.exchange_code_for_token(client_id=29429, client_secret='988e4784dc468d83a3fc32b69f469a0571442806', code=code)
    doc = mongo.db.user.insert({'access_token':code})
    client.access_token = '7c1612c0ce6d71f093402f23ab3d20e8a2be4c87'
    session['access_token'] = access_token
    athlete = client.get_athlete()
    activities = client.get_activities()
    runs = filter(lambda a: a.type=="Run" and a.average_heartrate != None,activities)
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
def getGaussian():
    activities=None
    if request.method == "POST":
        activities = request.json
        return jsonify(calculateRegression(activities))



if __name__ == "__main__":
    app.run(debug=True)
