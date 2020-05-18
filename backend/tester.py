import unittest
from requests import getId, removeUser, register, postResult, removeReplays, getReplayList
from resources import Users,Register
from server import app
import json
import offers
from definitions import Offer,Date
import datetime

class TestUsers(unittest.TestCase):

    def setUp(self):
        id = getId('Example')
        if id != None:
            removeUser(id)
        id = getId('Example2')
        if id != None:
            removeUser(id)
        register('Example','Password','example@gmail.com')

    def tearDown(self):
        id = getId('Example')
        if id != None:
            removeUser(id)
        id = getId('Example2')
        if id != None:
            removeUser(id)

    def testRegister(self):
        #name taken
        outcome = app.test_client().post('/register', data={'name': 'Example', 'password': 'Password','email': 'example@gmail.com'})
        self.assertEqual(outcome.status_code, 400)

        #good one
        outcome = app.test_client().post('/register', data={'name': 'Example2', 'password': 'Password','email': 'example2@gmail.com'})
        self.assertEqual(outcome.status_code, 201)

    def testLogin(self):
        #wrong password
        outcome = app.test_client().post('/login', data={'name': 'Example', 'password': 'WrongPassword'})
        self.assertEqual(outcome.status_code, 400)

        #good one
        outcome = app.test_client().post('/login', data={'name': 'Example', 'password': 'Password'})
        self.assertEqual(outcome.status_code, 201)

    def testUser(self):

        #GET

        #bad id
        outcome=app.test_client().get('/users/bad_id')
        self.assertEqual(outcome.status_code,404)

        #good one
        id = getId('Example')
        outcome = app.test_client().get('/users/'+str(id))
        self.assertEqual(outcome.status_code, 200)
        self.assertEqual(json.loads(outcome.data)['userdata']['Name'], "Example")
        self.assertEqual(json.loads(outcome.data)['userdata']['E-Mail'], "example@gmail.com")
        self.assertEqual(json.loads(outcome.data)['userdata']['EloStandard'], 1200)

        #PUT
        #getting token needed for further tests
        outcome = app.test_client().post('/login', data={'name': 'Example', 'password': 'Password'})
        token=json.loads(outcome.data)['access_token']

        #good one
        outcome=app.test_client().put('/users/'+str(id),headers={'Authorization': 'Bearer '+token},data={'name':'Example2','password':'EditedPassword'})
        self.assertEqual(outcome.status_code,201)
        self.assertEqual(json.loads(outcome.data)['userdata']['Name'],"Example2")

        #bad id
        outcome = app.test_client().put('/users/bad_id', headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 404)

        register('Example','Password','example2@gmail.com')
        id2 = getId('Example')

        #not an owner
        outcome = app.test_client().put('/users/'+str(id2), headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 403)

        #name taken
        outcome=app.test_client().put('/users/'+str(id),headers={'Authorization': 'Bearer '+token},data={'name':'Example'})
        self.assertEqual(outcome.status_code,400)

        #unauthorized
        outcome=app.test_client().put('/users/'+str(id))
        self.assertEqual(outcome.status_code,401)

        #bad token
        outcome = app.test_client().put('/users/' + str(id), headers={'Authorization': 'Non-token'})
        self.assertEqual(outcome.status_code, 401)

        #login attempt with old data
        outcome=app.test_client().post('/login',data={'name':'Example2','password':'Password'})
        self.assertEqual(outcome.status_code,400)

        #login with new data
        outcome=app.test_client().post('/login',data={'name':'Example2','password':'EditedPassword'})
        self.assertEqual(outcome.status_code,201)

        #DELETE

        #bad id
        outcome=app.test_client().delete('/users/bad_id',headers={'Authorization': 'Bearer '+token})
        self.assertEqual(outcome.status_code,404)

        #not an owner
        outcome=app.test_client().delete('/users/'+str(id2),headers={'Authorization': 'Bearer '+token})
        self.assertEqual(outcome.status_code,403)

        #unauthorized
        outcome=app.test_client().delete('/users/'+str(id))
        self.assertEqual(outcome.status_code,401)

        #bad token
        outcome = app.test_client().delete('/users/' + str(id), headers={'Authorization': 'Non-token'})
        self.assertEqual(outcome.status_code, 401)
        
        #good one
        outcome=app.test_client().delete('/users/'+str(id),headers={'Authorization': 'Bearer '+token})
        self.assertEqual(outcome.status_code,201)

class TestOffers(unittest.TestCase):
    def setUp(self):
        id = getId('Example')
        if id != None:
            removeUser(id)
        register('Example', 'Password', 'example@gmail.com')
        id = getId('Example')
        offers.ids = 0
        offers.offerList = []
        offers.offerList.append(Offer(id,300,None,'white'))

    def tearDown(self):
        id = getId('Example')
        if id != None:
            removeUser(id)
        offers.ids=0
        offers.offerList=[]

    def testOfferList(self):
        outcome = app.test_client().post('/login', data={'name': 'Example', 'password': 'Password'})
        token = json.loads(outcome.data)['access_token']

        #POST

        #good one
        outcome=app.test_client().post('/offers',headers={'Authorization': 'Bearer '+token},data={'time':900,'color':'badData'})
        self.assertEqual(outcome.status_code, 201)
        offer=json.loads(outcome.data)['offer']
        self.assertEqual(offer['time'], 900)
        self.assertEqual(offer['time_add'], None)
        self.assertEqual(offer['color'], 'random')
        self.assertEqual(offer['owner_name'], 'Example')
        self.assertEqual(offer['type'], 'standard')

        #unauthorized
        outcome=app.test_client().post('/offers',data={'time':900,'color':'white'})
        self.assertEqual(outcome.status_code, 401)

        #bad token
        outcome = app.test_client().post('/offers', data={'time': 900}, headers={'Authorization': 'Non-token'})
        self.assertEqual(outcome.status_code, 401)

        #GET

        #good ones (testing different query strings)
        outcome = app.test_client().get('/offers', headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 200)
        list=json.loads(outcome.data)['offerlist']
        self.assertEqual(len(list), 2)

        outcome = app.test_client().get('/offers?min_time=600', headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 200)
        list = json.loads(outcome.data)['offerlist']
        self.assertEqual(len(list), 1)
        self.assertEqual(list[0], offer)

        outcome = app.test_client().get('/offers?min_time=300&max_time=900', headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 200)
        list = json.loads(outcome.data)['offerlist']
        self.assertEqual(len(list), 2)

        outcome = app.test_client().get('/offers?max_time=120',headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 200)
        list = json.loads(outcome.data)['offerlist']
        self.assertEqual(list,[])

        #unauthorized
        outcome = app.test_client().get('/offers')
        self.assertEqual(outcome.status_code, 401)

        #bad token
        outcome = app.test_client().get('/offers',headers={'Authorization': 'Non-token'})
        self.assertEqual(outcome.status_code, 401)

    def testOffer(self):
        outcome = app.test_client().post('/login', data={'name': 'Example', 'password': 'Password'})
        token = json.loads(outcome.data)['access_token']

        #GET
        
        #bad id
        outcome = app.test_client().get('/offers/bad_id', headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 404)

        #good one
        id=offers.offerList[0].id
        outcome = app.test_client().get('/offers/'+str(id), headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 200)

        #unauthorized
        outcome = app.test_client().get('/offers/'+str(id))
        self.assertEqual(outcome.status_code, 401)

        #bad token
        outcome = app.test_client().get('/offers/' + str(id),headers={'Authorization': 'Non-token'})
        self.assertEqual(outcome.status_code, 401)

        #DELETE

        #unauthorized
        outcome = app.test_client().delete('/offers/' + str(id))
        self.assertEqual(outcome.status_code, 401)

        #bad token
        outcome = app.test_client().delete('/offers/' + str(id),headers={'Authorization': 'Non-token'})
        self.assertEqual(outcome.status_code, 401)

        # bad id
        outcome = app.test_client().delete('/offers/bad_id', headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 404)

        #not an owner
        offers.offerList[0].owner_id+=1
        outcome = app.test_client().delete('/offers/' + str(id), headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 403)

        #good one
        offers.offerList[0].owner_id -= 1
        outcome = app.test_client().delete('/offers/' + str(id), headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 201)

class TestReplays(unittest.TestCase):
    def setUp(self):
        id = getId('Example')
        if id != None:
            removeUser(id)
        register('Example', 'Password', 'example@gmail.com')
        id = getId('Example2')
        if id != None:
            removeUser(id)
        register('Example2', 'Password', 'example2@gmail.com')
        id = getId('Example')
        id2 = getId('Example2')
        day = datetime.date.today().day
        month = datetime.date.today().month
        year = datetime.date.today().year
        date = Date(day, month, year)
        pgnFile=open("example.pgn",'r')
        pgn=pgnFile.read()
        pgnFile.close()
        postResult(id, id2, date, "1-0", pgn)
        postResult(id+10, id2, date, "1/2-1/2", pgn)

    def tearDown(self):
        id = getId('Example')
        if id != None:
            removeReplays(id)
            removeUser(id)
        id = getId('Example2')
        if id != None:
            removeReplays(id)
            removeUser(id)


    def testReplayList(self):
        outcome = app.test_client().post('/login', data={'name': 'Example', 'password': 'Password'})
        token = json.loads(outcome.data)['access_token']

        #GET

        #unauthorized
        outcome = app.test_client().get('/replays')
        self.assertEqual(outcome.status_code, 401)

        #bad token
        outcome = app.test_client().get('/replays',headers={'Authorization': 'Non-token'})
        self.assertEqual(outcome.status_code, 401)

        #good one
        outcome = app.test_client().get('/replays', headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 200)
        self.assertEqual(len(json.loads(outcome.data)['list']),1)

    def testReplay(self):
        id = getId('Example')
        outcome=getReplayList(id)
        id=outcome[0][0]

        outcome = app.test_client().post('/login', data={'name': 'Example', 'password': 'Password'})
        token = json.loads(outcome.data)['access_token']

        # unauthorized
        outcome = app.test_client().get('/replays/'+str(id))
        self.assertEqual(outcome.status_code, 401)

        # bad token
        outcome = app.test_client().get('/replays/'+str(id), headers={'Authorization': 'Non-token'})
        self.assertEqual(outcome.status_code, 401)

        #bad id
        outcome = app.test_client().get('/replays/bad_id', headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 404)

        # good one
        outcome = app.test_client().get('/replays/'+str(id), headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(outcome.status_code, 200)
        print(json.loads(outcome.data)['replay'])

if __name__ == '__main__':
    unittest.main()
