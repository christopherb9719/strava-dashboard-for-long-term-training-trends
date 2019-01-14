from wtforms import fields, validators, ValidationError
from flask_wtf import FlaskForm

def isAllLowerCase(form, field):
    if (field.data.lower() == field.data):
        raise ValidationError('Password must contain at least one upper case character')

def isAllUpperCase(form, field):
    if (field.data.upper() == field.data):
        raise ValidationError('Password must contain at least one lower case character')

def hasNumber(form, field):
    allChars = True
    if (any(char.isdigit() for char in field.data)):
        allChars = False
    if allChars:
        raise ValidationError('Password must contain at least one number')

class RegistrationForm(FlaskForm):
    username = fields.TextField(validators=[validators.required()])
    email = fields.TextField('Email', [validators.Email(message='Not a valid email')])
    password = fields.PasswordField('New Password', [
        validators.DataRequired(),
        validators.Length(min=10, message='Password must be at least 10 characters long'),
        validators.EqualTo('confirm', message='Passwords must match'),
        isAllLowerCase,
        isAllUpperCase,
        hasNumber
    ])
    confirm = fields.PasswordField('Repeat Password')

    def validate_login(self, field):
        if User.objects(username=self.username.data):
            raise validators.ValidationError('Duplicate username')

class LoginForm(FlaskForm):
    email = fields.TextField('Email')
    password = fields.PasswordField('Password')
    remember_me = fields.BooleanField('Keep me logged in')
    submit = fields.SubmitField('Log In')
