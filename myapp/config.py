CLIENT_SECRET = '988e4784dc468d83a3fc32b69f469a0571442806'
CLIENT_ID = '29429'


class Config(object):
    DEBUG = False
    TESTING = False
    MONGODB_SETTINGS = { 'db' : 'test'}
    SECRET_KEY = CLIENT_SECRET

class DevelopmentConfig(Config):
    DEBUG = True
