from flask_restful import Resource, reqparse,request
import requests
import offers
from flask_jwt_extended import (create_access_token, create_refresh_token, get_jwt_identity, verify_jwt_in_request)
from definitions import Offer
from flask_jwt_extended.exceptions import NoAuthorizationError,InvalidHeaderError
from jwt.exceptions import ExpiredSignatureError
from werkzeug.datastructures import ImmutableMultiDict
from sqlite3 import IntegrityError
import chess.pgn

class UserList(Resource):
    def get(self):
        try:
            verify_jwt_in_request()
        except NoAuthorizationError:
            return {'message': "Unauthorized attempt"}, 401
        except InvalidHeaderError:
            return {'message': "Authorization error"}, 401
        except ExpiredSignatureError:
            return {'message': "Signature expired"}, 401
        args=request.args.to_dict()
        userList=requests.getUserList(args)
        return {'message':"Success!",'list':userList},200
class Users(Resource):
    def get(self,id):
        userData=requests.getUser(id)
        if userData==None:
            return {'message':"User doesn't exist!"}, 404
        return {'message':'success','userdata':userData},200

    def put(self,id):
        try:
            verify_jwt_in_request()
        except NoAuthorizationError:
            return {'message':"Unauthorized attempt"}, 401
        except InvalidHeaderError:
            return {'message':"Authorization error"}, 401
        except ExpiredSignatureError:
            return {'message': "Signature expired"}, 401
        userData = requests.getUser(id)
        if userData == None:
            return {'message': "User doesn't exist!"}, 404
        if str(get_jwt_identity())!=str(id):
            return {'message':"Access denied!"}, 403
        else:
            parser = reqparse.RequestParser()
            parser.add_argument('name', type=str,required=False, location='form',help='Invalid name')
            parser.add_argument('password', type=str,required=False, location='form',help='Invalid password')
            args = parser.parse_args()

            flag = requests.checkForDuplicates("name",args['name'])
            if flag == False:
                return {'message': "Name taken"}, 400

            requests.editUser(id,name=args['name'],password=args['password'])
            userData = requests.getUser(id)
            return {'message':'success','userdata':userData},201

    def delete(self,id):
        try:
            verify_jwt_in_request()
        except NoAuthorizationError:
            return {'message': "Unauthorized attempt"}, 401
        except InvalidHeaderError:
            return {'message': "Authorization error"}, 401
        except ExpiredSignatureError:
            return {'message': "Signature expired"}, 401
        userData = requests.getUser(id)
        if userData == None:
            return {'message': "User doesn't exist!"}, 404
        if str(get_jwt_identity())!=str(id):
            return {'message':"Access denied!"}, 403
        else:
            requests.removeUser(id)
            return {'message':"Removed succesfully!"}, 201

class Login(Resource):
    def post(self):
#         parser = reqparse.RequestParser()
#         parser.add_argument('name',type=str, required=True, location='form',help='Invalid name')
#         parser.add_argument('password',type=str,required=True, location='form',help='Invalid password')
#         args = parser.parse_args()
        args=request.form.to_dict()
        if isinstance(args['name'],str)==False:
            return {'message':"Invalid username!",'where':"username"}, 400
        if isinstance(args['password'],str)==False:
            return {'message':"Invalid Password!",'where':"password"}, 400
        id=requests.authenticate(args['name'],args['password'])
        if id == "Name":
            return {'message':"User doesn't exist!",'where':"username"}, 400
        elif id == "Password":
            return {'message':"Password incorrect!",'where':"password"}, 400
        requests.updateDate(id)
        access_token = create_access_token(identity=id)
        refresh_token = create_refresh_token(identity=id)
        return {'message':"Successfully logged in",'id':id,'token':access_token},201

class Register(Resource):
    def post(self):
#         parser = reqparse.RequestParser()
#         parser.add_argument('name', type=str,required=True, location='form',help='Invalid name')
#         parser.add_argument('password', type=str,required=True, location='form',help='Invalid password')
#         parser.add_argument('email', type=str,required=True, location='form',help='Invalid email')
#         args = parser.parse_args()
        args=request.form.to_dict()
        if isinstance(args['name'],str)==False:
            return {'message':"Invalid value!",'where':"username"}, 400
        if len(args['name'])<6:
            return {'message':"Name too short!",'where':"username"}, 400
        if requests.checkForDuplicates("name",args['name']) == False:
            return {'message':"Name taken",'where':"username"}, 400

        if isinstance(args['password'],str)==False:
            return {'message':"Invalid value!",'where':"password"}, 400
        if len(args['password'])<6:
            return {'message':"Password too short!",'where':"password"}, 400

        if isinstance(args['2ndpass'],str)==False:
            return {'message':"Invalid value!",'where':"2ndpass"}, 400
        if args['2ndpass']!=args['password']:
            return {'message':"Passwords don't match!",'where':"2ndpass"}, 400


        if isinstance(args['email'],str)==False:
            return {'message':"Invalid value!",'where':"email"}, 400
        if args['email'].find('@')==-1 or args['email'].find('.')==-1:
            return {'message':"Incorrect E-mail!",'where':"email"}, 400
        if requests.checkForDuplicates("email",args['email']) == False:
            return {'message':"E-mail taken",'where':"email"}, 400
        
        id=requests.register(args['name'],args['password'],args['email'])
        access_token = create_access_token(identity=id)
        return {'message':"Successfully registered",'id':id,'token':access_token},201

class OfferList(Resource):
    def get(self):
        try:
            verify_jwt_in_request()
        except NoAuthorizationError:
            return {'message': "Unauthorized attempt"}, 401
        except InvalidHeaderError:
            return {'message': "Authorization error"}, 401
        except ExpiredSignatureError:
            return {'message': "Signature expired"}, 401
        parser = reqparse.RequestParser()
        parser.add_argument('owner', type=str, location='args')
        parser.add_argument('min_time', type=int, location='args')
        parser.add_argument('max_time', type=int, location='args')
        parser.add_argument('min_elo', type=int, location='args')
        parser.add_argument('max_elo', type=int, location='args')
        parser.add_argument('color', type=str, location='args')
        args = parser.parse_args()
        outcome = []
        for offer in offers.offerList:
            flag=True
            if args['owner'] != None and args['owner'] == offer.owner_name: flag = False
            if args['min_time'] != None and args['min_time'] > offer.time: flag = False
            if args['max_time'] != None and args['max_time'] < offer.time: flag = False
            if args['min_elo'] != None and args['min_elo'] > offer.elo: flag = False
            if args['max_elo'] != None and args['max_elo'] < offer.elo: flag = False
            if args['color'] != None and args['owner'] == offer.color: flag = False
            if flag: outcome.append(offer.dict())
        return {'message':"Success!",'offerlist':outcome},200

    def post(self):
        try:
            verify_jwt_in_request()
        except NoAuthorizationError:
            return {'message': "Unauthorized attempt"}, 401
        except InvalidHeaderError:
            return {'message': "Authorization error"}, 401
        except ExpiredSignatureError:
            return {'message': "Signature expired"}, 401
        owner_id=get_jwt_identity()
        parser = reqparse.RequestParser()
        parser.add_argument('time', type=int,required=False, location='form',help="Invalid argument")
        parser.add_argument('time_add', type=int,required=False, location='form',help="Invalid argument")
        parser.add_argument('color', type=str,required=False, location='form',help="Invalid argument")
        args = parser.parse_args()

        if args['time']==None and args['time_add']!=None: args['time_add']=None
        offer=Offer(owner_id,args['time'],args['time_add'],args['color'])
        offers.offerList.append(offer)
        return {'message': "Success!",'offer':offer.dict()}, 201
class Offers(Resource):
    def get(self,id):
        try:
            verify_jwt_in_request()
        except NoAuthorizationError:
            return {'message': "Unauthorized attempt"}, 401
        except InvalidHeaderError:
            return {'message': "Authorization error"}, 401
        except ExpiredSignatureError:
            return {'message': "Signature expired"}, 401
        for offer in offers.offerList:
            if str(offer.id) == str(id):
                return {'message': "Success!",'offer':offer.dict()}, 200
        return {'message': "Offer not found!"}, 404

    def delete(self,id):
        try:
            verify_jwt_in_request()
        except NoAuthorizationError:
            return {'message': "Unauthorized attempt"}, 401
        except InvalidHeaderError:
            return {'message': "Authorization error"}, 401
        except ExpiredSignatureError:
            return {'message': "Signature expired"}, 401
        for offer in offers.offerList:
            if str(offer.id) == str(id):
                if str(get_jwt_identity())==str(offer.owner_id):
                    offers.offerList.remove(offer)
                    return {'message': "Success!"}, 201
                else: return {'message':"Access denied!"}, 403
        return {'message': "Offer not found!"}, 404

class ReplayList(Resource):
    def get(self):
        try:
            verify_jwt_in_request()
        except NoAuthorizationError:
            return {'message': "Unauthorized attempt"}, 401
        except InvalidHeaderError:
            return {'message': "Authorization error"}, 401
        except ExpiredSignatureError:
            return {'message': "Signature expired"}, 401
        args=request.args.to_dict()
        id=get_jwt_identity()
        replayList=requests.getReplayList(id,args)
        return {'message':"Success!",'list':replayList},200
    def post(self):
        try:
            verify_jwt_in_request()
        except NoAuthorizationError:
            return {'message': "Unauthorized attempt"}, 401
        except InvalidHeaderError:
            return {'message': "Authorization error"}, 401
        except ExpiredSignatureError:
            return {'message': "Signature expired"}, 401
        args=request.form.to_dict()
        if isinstance(args['pgn'],str)==False:
            return {'message':"Invalid argument!","where":"else"}, 400
        if len(args['pgn'])<1:
            return {'message':"Paste PGN file!","where":"text"}, 400
        try:
            id=requests.postReplay(pgn=args['pgn'],uploader_id=get_jwt_identity())
        except IntegrityError:
            return {'message':"PGN incorrect or identical one was already uploaded!","where":"text"}, 400
        except ValueError:
            return {'message':"PGN incorrect!","where":"text"}, 400
        if isinstance(id,str) and "Missing Tag: " in id:
            return {'message':id,"where":"text"}, 400
        if id==None:
            return {'message':'It shouldn\'t happen!'}, 500
        return {'message': "Success!",'id':id}, 201
class Replays(Resource):
    def get(self,id):
        try:
            verify_jwt_in_request()
        except NoAuthorizationError:
            return {'message': "Unauthorized attempt"}, 401
        except InvalidHeaderError:
            return {'message': "Authorization error"}, 401
        except ExpiredSignatureError:
            return {'message': "Signature expired"}, 401
        replay=requests.getReplay(id)
        if replay==None:
            return {'message': "Replay not found!"}, 404
        else: return {'message': "Success!",'replay':replay}, 200

