import json
import time
from stravalib import Client

def parse_data(user, CLIENT_ID, CLIENT_SECRET):
    client=Client();
    client.access_token = user['token'];
    client.refresh_token = user['refresh_token'];
    client.token_expires_at = user['expires_at'];

    ###### RETRIEVE USER ACTIVITY DATA ######
    #This is only here because the test user for Simon was made before refresh tokens became a thing and so does not have one
    #REMOVE THIS IF STATEMENT WHEN A NEW ACCOUNT FOR SIMON IS MADE!!!!!!!!!
    if client.token_expires_at != None:
        if time.time() > client.token_expires_at:
            print("Token expired, getting new token")
            new_token = client.refresh_access_token(client_id=CLIENT_ID, client_secret=CLIENT_SECRET, refresh_token=client.refresh_token)
            user.update(token = new_token['access_token'], refresh_token = new_token['refresh_token'], expires_at = new_token['expires_at'])

    activities = client.get_activities()

    ###### FILTER OUT ACTIVITIES THAT AREN'T RUNS OR THAT DOEN'T HAVE NECESSARY DATA ######
    runs = filter(lambda a: a.type=="Run" and a.average_heartrate != None and a.average_speed.num != 0.00, activities)

    ###### PARSE ACTIVITY DATA FOR RELEVANT DATA AND CONVERT TO JSON ######
    summaries = []
    for run in runs:
        summaries.append({
            'id' : run.id,
            'name': run.name,
            'distance' : run.distance.num,
            'heart_rate' : run.average_heartrate,
            'average_speed' : (run.average_speed.num*60*60)/1000,
            'average_pace' : 60/((run.average_speed.num*60*60)/1000),
            'description' : run.description,
            'total_elevation_gain' : run.total_elevation_gain.num,
            'year' : run.start_date.year,
            'month' : run.start_date.month,
            'day' : run.start_date.day,
            'hour' : run.start_date.hour,
            'minute' : run.start_date.minute,
            'second' : run.start_date.second
        })
    return summaries
