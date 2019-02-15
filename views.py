import flask
from flask import Blueprint, render_template, abort, request, redirect, current_app, jsonify
from flask_login import current_user, login_required
from .static.lib.python.forms import RegistrationForm, LoginForm
from .db import *
from jinja2 import TemplateNotFound
from flask_mongoengine import MongoEngine
from flask_login import LoginManager, login_user, UserMixin, current_user, login_required, logout_user
from flask_bcrypt import Bcrypt
from .app import parse_data
from .static.lib.python.gaussianregression import *


bp = Blueprint('views', __name__, template_folder='templates')

@bp.route('/<page>')
def show(page):
    try:
        return render_template('%s.html' % page)
    except TemplateNotFound:
        abort(404)

@bp.route("/redirect")
def redir():
    import requests
    client=Client()
    code = request.args.get('code')
    tokens = client.exchange_code_for_token(client_id='29429', client_secret='988e4784dc468d83a3fc32b69f469a0571442806', code=code)
    user = User(username=session['username'], email=session['email'], password=session['password'], token=tokens['access_token'], refresh_token=tokens['refresh_token'], expires_at=tokens['expires_at']).save()
    login_user(user);

    return redirect(url_for('loadDashboard'))

@bp.route("/dashboard", methods=['POST', 'GET'])
@login_required
def loadDashboard():
    activities = parse_data(current_user)
    if len(activities) > 0:
        line_coords = calculateRegression(activities)
    else:
        line_coords = []
    return render_template("index.html", sample = activities, regression = line_coords)

@bp.route("/multi_user")
@login_required
def loadMultiUser():
    activities = parse_data(current_user)
    if len(activities) > 0:
        line_coords = calculateRegression(activities)
    else:
        line_coords = []
    return render_template("multi_user.html", sample = activities, regression = line_coords)


@bp.route("/get_user_data", methods=['POST'])
@login_required
def getUserData():
    user = User.objects(username = request.data.decode('utf-8')).first()
    print(user)
    activities = parse_data(user)
    print(len(activities))
    if len(activities) > 0:
        line_coords = calculateRegression(activities)
    else:
        line_coords = []
    response = [activities, line_coords]
    return jsonify(response)

@bp.route("/_gaussian_calculation", methods=['POST'])
@login_required
def getGaussian():
    activities=None
    if request.method == "POST":
        activities = request.json
        return jsonify(calculateRegression(activities))

@bp.route("/find_users", methods = ["POST"])
@login_required
def findUsers():
    query = request.data.decode('utf-8')
    users = User.objects(username__contains=query).only('username')
    return users.to_json()
