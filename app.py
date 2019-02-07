import flask
from flask import Flask, render_template, redirect, request, session, jsonify, url_for
import sys
sys.path.append('./static/lib/python/')
from gaussianregression import calculateRegression
from forms import RegistrationForm, LoginForm
import json
import time
from stravalib.client import Client
from flask_login import LoginManager, login_user, UserMixin, current_user, login_required, logout_user
from flask_mongoengine import MongoEngine
from flask_bcrypt import Bcrypt

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'memcached'
app.config['SECRET_KEY'] = '988e4784dc468d83a3fc32b69f469a0571442806'
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
    refresh_token = db.StringField()
    expires_at = db.IntField()


@login_manager.user_loader
def load_user(user_id):
    return User.objects(id=user_id).first()

@app.route("/")
def index():
    return redirect(url_for('login'))

@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm(request.form)
    if request.method == 'POST' and form.validate():
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

                return flask.redirect(next or flask.url_for('loadDashboard'))
    return flask.render_template('login.html', form=form)


@app.route("/register", methods=['POST', 'GET'])
def register():
    form = RegistrationForm(request.form)
    if request.method == 'POST' and form.validate():
        existing_user = User.objects(username=form.username.data).first()
        if existing_user is None:
            session['username'] = form.username.data;
            session['email'] = form.email.data;
            session['password'] = bcrypt.generate_password_hash(form.password.data)
            client = Client()
            authorize_url = client.authorization_url(client_id='29429', redirect_uri='http://localhost:5000/redirect')
            return redirect(authorize_url)

    return render_template('register.html', form=form)

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route("/redirect")
def redir():
    import requests
    client=Client()
    code = request.args.get('code')
    tokens = client.exchange_code_for_token(client_id='29429', client_secret='988e4784dc468d83a3fc32b69f469a0571442806', code=code)
    user = User(username=session['username'], email=session['email'], password=session['password'], token=tokens['access_token'], refresh_token=tokens['refresh_token'], expires_at=tokens['expires_at']).save()
    login_user(user);

    return redirect(url_for('loadDashboard'))

@app.route("/dashboard")
@login_required
def loadDashboard():
    activities = parse_data(current_user)
    if len(activities) > 0:
        line_coords = calculateRegression(activities)
    else:
        line_coords = []
    return render_template("index.html", sample = activities, regression = line_coords)


@app.route("/get_user_data", methods=['POST'])
@login_required
def getUserData():
    user = User.objects(username = request.data.decode('utf-8')).first()
    print(user.username)
    activities = parse_data(user)
    print(len(activities))
    if len(activities) > 0:
        line_coords = calculateRegression(activities)
    else:
        line_coords = []
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


def parse_data(user):
    client = Client();
    client.access_token = user['token'];
    client.refresh_token = user['refresh_token'];
    client.token_expires_at = user['expires_at'];

    #This is only here because the test user for Simon was made before refresh tokens became a thing and so does not have one
    #REMOVE THIS IF STATEMENT WHEN A NEW ACCOUNT FOR SIMON IS MADE!!!!!!!!!
    if client.token_expires_at != None:
        if time.time() > client.token_expires_at:
            print("Token expired, getting new token")
            new_token = client.refresh_access_token(client_id=29429, client_secret='988e4784dc468d83a3fc32b69f469a0571442806', refresh_token=client.refresh_token)
            user.update(token = new_token['access_token'], refresh_token = new_token['refresh_token'], expires_at = new_token['expires_at'])

    athlete = client.get_athlete()
    print(athlete.firstname);
    activities = client.get_activities()
    for activity in activities:
        print(activity.average_speed)

    runs = filter(lambda a: a.type=="Run" and a.average_heartrate != None and a.average_speed.num != 0.00, activities)

    summaries = []
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
    return summaries

if __name__ == "__main__":
    app.run(debug=True)
