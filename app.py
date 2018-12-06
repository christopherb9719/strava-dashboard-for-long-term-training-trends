from flask import Flask, render_template, redirect, request, session
import json
import numpy as np
import stravalib
from stravalib.client import Client
import GPy


app = Flask(__name__)
app.config['SESSION_TYPE'] = 'memcached'
app.config['SECRET_KEY'] = '988e4784dc468d83a3fc32b69f469a0571442806'


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
        print(type(run.start_date))
        summary = {}
        summary['id'] = run.id
        summary['distance'] = run.distance.num
        summary['heart_rate'] = run.average_heartrate
        summary['average_speed'] = run.average_speed.num
        summary['average_pace'] = 1/run.average_speed.num
        summary['description'] = run.description
        summary['total_elevation_gain'] = run.total_elevation_gain.num
        summary['year'] = run.start_date.year
        summary['month'] = run.start_date.month
        summary['day'] = run.start_date.day
        summary['date'] = run.start_date
        summaries.append(summary.copy())


    hr = [run['heart_rate'] for run in summaries]
    avs = [run['average_pace'] for run in summaries]
    #print avs
    end = len(summaries)
    #m = GPy.models.GPRegression(gr['heart_rates'], gr['average_pace'])
    m = GPy.models.GPRegression(np.array(hr)[:end,None],np.array(avs)[:end,None])
    m.optimize('bfgs')
    pred_x = np.arange(min(hr),max(hr),0.1)
    f, u = m.predict(pred_x[:,None])
    line_coords = []
    i = 0
    while i < len(u):
        coords = {}
        coords['x'] = pred_x[i]
        coords['y'] = f[i][0]
        line_coords.append(coords.copy())
        i += 1

    return render_template("index.html", sample = summaries, regression = line_coords)



@app.route("/index")
def index():
    with open('sample.json') as json_data:
        data = json.load(json_data)
        return render_template('index.html', sample=data)


if __name__ == "__main__":
    app.run(debug=True)
