import json
import time
from stravalib.client import Client

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
    activities = client.get_activities()

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
