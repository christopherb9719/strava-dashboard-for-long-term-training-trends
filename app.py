from flask import Flask, render_template, redirect, request, session
import json
import numpy as np
import stravalib
from stravalib.client import Client

app = Flask(__name__)


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
    
    for run in runs:
        summary = {}
        summary['distance'] = run.distance.num
        summary['heart_rate'] = run.average_heartrate
        summary['average_speed'] = run.average_speed.num
        summaries.append(summary.copy())

    return render_template("index.html", sample = summaries)
    


@app.route("/index")
def index():
    with open('sample.json') as json_data:
        data = json.load(json_data)
        return render_template('index.html', sample=data)


if __name__ == "__main__":
    app.secret_key = '988e4784dc468d83a3fc32b69f469a0571442806'
    app.run(debug=True)
