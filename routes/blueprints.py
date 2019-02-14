from flask import Blueprint, render_template, abort
from flask_login import current_user
from jinja2 import TemplateNotFound

page = Blueprint('page', __name__, template_folder='templates')

@page.route('/', defaults={'page':'dashboard'})
@page.route('/<page>')
def show(page):
    try:
        return render_template('pages/%s.html' % page)
    except TemplateNotFound:
        abort(404)

@page.route('/register', methods=['POST', 'GET'])
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
