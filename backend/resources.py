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
            return {'message':"Access denied!",'where':'elsewhere'}, 403
        else:
            args = request.form.to_dict()
            result=requests.changePassword(id,args['oldpass'],args['newpass'])
            if result==False:
                return {'message':"Wrong password!",'where':"password"}, 403
            userData = requests.getUser(id)
            return {'message':'success'},201

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
#         parser = reqparse.RequestParser()
#         parser.add_argument('owner', type=str, location='args')
#         parser.add_argument('min_time', type=int, location='args')
#         parser.add_argument('max_time', type=int, location='args')
#         parser.add_argument('min_elo', type=int, location='args')
#         parser.add_argument('max_elo', type=int, location='args')
#         parser.add_argument('color', type=str, location='args')
#         args = parser.parse_args()
        args=request.args.to_dict()
        outcome = []
        for offer in offers.offerList:
            flag=True
            if 'owner' in args and args['owner'] == offer.owner_name: flag = False
            if 'exclude' in args and 's' in args['exclude'] and offer.type=='standard': flag = False
            if 'exclude' in args and 'b' in args['exclude'] and offer.type=='blitz': flag = False
            if 'exclude' in args and 'l' in args['exclude'] and offer.type=='lightning': flag = False
            try:
                if 'min_elo' in args and int(args['min_elo']) > offer.elo: flag = False
            except ValueError:
                pass
            try:
                if 'max_elo' in args and int(args['max_elo']) < offer.elo: flag = False
            except ValueError:
                pass
            if 'color' in args and args['color'] in ['black','white','random'] and args['owner'] == offer.color: flag = False
            if flag: outcome.append(offer.dict())
        return {'message':"Success!",'list':outcome},200

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
        args=request.form.to_dict()
        time=None
        time_add=None
        color='random'

        if 'time' in args and args['time']!=None and int(args['time'])>0:
            time=args['time']
        if time!=None and 'time_add' in args and args['time_add']!=None and int(args['time_add'])>0:
            time_add=args['time_add']
        if 'color' in args and args['color'] in ['black','white']:
            color=args['color']
        offer=Offer(owner_id,time,time_add,color)
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
            return {'message':"PGN is incorrect or identical one is already uploaded!","where":"text"}, 400
        except ValueError:
            return {'message':'PGN contains illegal or ambiguous moves!',"where":"text"}, 400
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

