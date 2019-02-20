import flask
from flask import Blueprint, render_template, abort, request, redirect, current_app
from myapp import models
from flask_login import current_user, login_required, login_user, logout_user
from myapp.static.lib.python.forms import RegistrationForm, LoginForm
from jinja2 import TemplateNotFound
from flask_bcrypt import Bcrypt

bp = Blueprint('auth', __name__, template_folder='templates')

@bp.route('/<page>')
def show(page):
    try:
        return render_template('%s.html' % page)
    except TemplateNotFound:
        abort(404)

@bp.route('/register', methods=['POST', 'GET'])
def register():
    form = RegistrationForm(request.form)
    if request.method == 'POST' and form.validate():
        existing_user = models.User.objects(username=form.username.data).first()
        if existing_user is None:
            bcrypt = Bcrypt(current_app)
            session['username'] = form.username.data;
            session['email'] = form.email.data;
            session['password'] = bcrypt.generate_password_hash(form.password.data)
            client = Client()
            authorize_url = client.authorization_url(client_id='29429', redirect_uri='http://localhost:5000/redirect')
            return redirect(authorize_url)

    return render_template('register.html', form=form)

@bp.route('/', methods=["GET", "POST"])
@bp.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm(request.form)
    if request.method == 'POST' and form.validate():
        check_user = models.User.objects(email = form.email.data).first()
        if check_user:
            bcrypt = Bcrypt(current_app)
            if bcrypt.check_password_hash(check_user.password, str(form.password.data)):
                print("Hash matched")
                login_user(check_user)

                next = flask.request.args.get('next')
                # is_safe_url should check if the url is safe for redirects.
                # See http://flask.pocoo.org/snippets/62/ for an example.
                #if not is_safe_url(next):
                #    return flask.abort(400)

                return redirect(next or flask.url_for('views.loadDashboard'))
    return render_template('login.html', form=form)

@bp.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(flask.url_for('auth.login'))