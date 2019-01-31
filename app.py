import flask
from flask import Flask, render_template, redirect, request, session, jsonify, url_for
import sys
sys.path.append('./static/lib/python/')
from gaussianregression import calculateRegression
from forms import RegistrationForm, LoginForm
import json
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
    access_token = client.exchange_code_for_token(client_id='29429', client_secret='988e4784dc468d83a3fc32b69f469a0571442806', code=code)
    print(access_token['access_token'])
    print(session['password'])
    user = User(username=session['username'], email=session['email'], password=session['password'], token=access_token['access_token']).save()
    login_user(user);

    #This is just checking that the access token retrieved works
    client.access_token = access_token['access_token']
    a = client.get_athlete();
    print(a.firstname);

    return redirect(url_for('loadDashboard'))

@app.route("/dashboard")
@login_required
def loadDashboard():
    print("Loading dashboard")
    activities = parse_data(current_user['token'])
    if len(activities) > 0:
        line_coords = calculateRegression(activities)
        return render_template("index.html", sample = activities, regression = line_coords)
    else:
        return render_template("index.html", sample = activities, regression = [])

@app.route("/get_user_data", methods=['POST'])
@login_required
def getUserData():
    print(request.args)
    activities = parse_data(request.data)
    if len(activities) > 0:
        line_coords = calculateRegression(activities)
        response = [activities, line_coords]
    else:
        response = [activities]
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
    print(query)
    users = User.objects(username__contains=query)
    print(users)
    return users.to_json()



def parse_data(token):
    #'3c2e651e3382f3f391bbabe33d8df7b097bbc9fa'
    c=Client(access_token = token)
    print(c.access_token)
    #print(type(client.access_token))
    athlete = c.get_athlete()
    print(athlete.firstname);
    activities = c.get_activities()
    runs = filter(lambda a: a.type=="Run" and a.average_heartrate != None, activities)
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
