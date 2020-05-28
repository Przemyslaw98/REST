from flask import Flask
from flask_cors import CORS, cross_origin
import flask_jwt_extended
from flask_restful import Resource, Api
from resources import *




app = Flask(__name__)
CORS(app)
api = Api(app)
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string'
jwt=flask_jwt_extended.JWTManager(app)

api.add_resource(UserList, '/users')
api.add_resource(Users, '/users/<id>')
api.add_resource(Login, '/login')
api.add_resource(Register, '/register')
api.add_resource(OfferList, '/offers')
api.add_resource(Offers, '/offers/<id>')
api.add_resource(ReplayList, '/replays')
api.add_resource(Replays, '/replays/<id>')

if __name__ == '__main__':
    app.run(port='5000')



