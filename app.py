from flask import Flask, render_template, redirect, request, session, jsonify
from flask_pymongo import PyMongo as pm
import sys
sys.path.append('./static/lib/python/')
from gaussianregression import calculateRegression
import json
import numpy as np
import stravalib
from stravalib.client import Client
import GPy


def convertDecimalToMinutes(num):
    decimal = num%1
    decimal = decimal*.6
    integer = int(num)
    return (integer + decimal)

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'memcached'
app.config['SECRET_KEY'] = '988e4784dc468d83a3fc32b69f469a0571442806'
app.config["MONGO_URI"] = "mongodb://localhost:27017/UserDatabase"
mongo = pm(app)


@app.route("/")
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
    print("AJAX recieved")
    activities=None
    if request.method == "POST":
        activities = request.json
        return jsonify(calculateRegression(activities))

@app.route("/index")
def index():
    with open('sample.json') as json_data:
        data = json.load(json_data)
        return render_template('index.html', sample=data)


if __name__ == "__main__":
    app.run(debug=True)
