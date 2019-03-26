import os
import tempfile
import unittest
from urlparse import urlparse
from app import create_app
import sys
sys.path.append('./static/python/')
from forms import *


class BasicTests(unittest.TestCase):

    ############################
    #### setup and teardown ####
    ############################

    # executed prior to each test
    def setUp(self):
        app = create_app()
        app.config['TESTING'] = True
        app.config['MONGODB_SETTINGS'] = { 'db' : 'testCopy'}
        app.config['DEBUG'] = False
        app.config['WTF_CSRF_ENABLED'] = False
        app.login_manager.init_app(app)
        self.app = app.test_client()
        # Disable sending emails during unit testing
        self.assertEqual(app.debug, False)

    # executed after each test
    def tearDown(self):
        pass

    ###############
    #### tests ####
    ###############

    def test_main_page(self):
        response = self.app.get('/login', follow_redirects=True)
        self.assertEqual(response.status_code, 200)

    ########################
    #### helper methods ####
    ########################

    def register(self, username, email, password, confirm):
        return self.app.post(
            'register',
            data=dict(username=username, email=email, password=password, confirm=confirm),
            follow_redirects=False
        )

    def login(self, email, password):
        return self.app.post(
            '/login',
            data=dict(email=email, password=password),
            follow_redirects=False
        )

    def logout(self):
        return self.app.get(
            '/logout',
            follow_redirects=False
        )


    def test_invalid_user_login(self):
        response = self.app.post('login', {'email': 'chriiiis@gmail.com', 'password': 'pass'})
        assert b'Login Form' in response.data

        response = self.app.post('login', {'email': 'chris.boland97@gmail.com', 'password': 'pass'})
        assert b'Login Form' in response.data


    def test_valid_user_login_and_logout(self):
        response = self.login('chris.boland97@gmail.com', 'testpass')
        self.assertEqual(response.status_code, 302)

        response = self.logout()
        self.assertEqual(response.status_code, 302)

    def test_invalid_user_registration(self):
        response = self.register('chirs', 'chris@gmail.com', 'testPassword1', 'TestPassword12')
        assert b'Log In here' in response.data

        response = self.register('chirs', 'chris.boland97@gmail.com', 'TestPassword12', 'TestPassword12')
        assert b'Log In here' in response.data

        response = self.register('chirs', 'chris@gmail.com', 'testpassword12', 'testpassword12')
        assert b'Log In here' in response.data

        response = self.register('chirs', 'chris@gmail.com', 'testpasswordtwelve', 'testpasswordtwelve')
        assert b'Log In here' in response.data

        response = self.register('chirs', 'chris@gmail.com', 'TESTPASSWORD12', 'TESTPASSWORD12')
        assert b'Log In here' in response.data

        response = self.register('test', 'chris@gmail.com', 'TestPassword12', 'TestPassword12')
        assert b'Log In here' in response.data

    def test_valid_user_registration(self):
        response = self.register('chirs2', 'chris2@gmail.com', 'TestPassword12', 'TestPassword12')
        self.assertEqual(response.status_code, 302)
        assert b'Redirecting' in response.data

    def test_unauthorised_access(self):
        response = self.app.get('/dashboard', follow_redirects=True)
        self.assertEqual(response.status_code, 401)

        response = self.app.get('/multi_user', follow_redirects=True)
        self.assertEqual(response.status_code, 401)

        response = self.app.get('/logout', follow_redirects=True)
        self.assertEqual(response.status_code, 401)

        response = self.app.post('/_gaussian_calculation', follow_redirects=True)
        self.assertEqual(response.status_code, 401)

        response = self.app.post('/get_user_data', follow_redirects=True)
        self.assertEqual(response.status_code, 401)

        response = self.app.post('/find_users', follow_redirects=True)
        self.assertEqual(response.status_code, 401)

    def test_authorised_access(self):
        self.login('chris.boland97@gmail.com', 'testpass')
        response = self.app.get('/dashboard', follow_redirects=True)
        self.assertEqual(response.status_code, 200)

        response = self.app.get('/multi_user', follow_redirects=True)
        self.assertEqual(response.status_code, 200)

        response = self.app.get('/logout', follow_redirects=True)
        self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main()
