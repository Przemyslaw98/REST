import sqlite3
import datetime
from definitions import Date
from passlib.hash import pbkdf2_sha256 as sha256
import chess.pgn
import io
from pgn import OverriddenGameBuilder

def getUser(id):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("select name,lastseen,registered,email,elo_standard,elo_blitz,elo_lightning from users where id=?", (id,))
    userData = c.fetchone()
    conn.close()
    fieldNames = ["Name", "Last Seen", "Registered", "E-Mail", "EloStandard", "EloBlitz", "EloLightning"]
    if userData==None: return None
    response = {}
    for i in range(len(fieldNames)):
        response[fieldNames[i]] = userData[i]
    return response
def getStats(id):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("select won,lost,drawn from stats_standard where id=?", (id,))
    stats_standard = c.fetchone()[1:]
    c.execute("select won,lost,drawn from stats_blitz where id=?", (id,))
    stats_blitz = c.fetchone()[1:]
    c.execute("select won,lost,drawn from stats_lightning where id=?", (id,))
    stats_lightning = c.fetchone()[1:]
    conn.close()
    return (stats_standard,stats_blitz,stats_lightning)
def changePassword(id,oldpass,newpass):
    name=getName(id)
    check=authenticate(name,oldpass)
    if check=="Password":
        return False
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    hash=sha256.hash(newpass)
    c.execute("update users set password=? where id=?", (hash, id))
    conn.commit()
    conn.close()
    return True
def removeUser(id):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("delete from stats_standard where id=?", (id,))
    c.execute("delete from stats_blitz where id=?", (id,))
    c.execute("delete from stats_lightning where id=?", (id,))
    c.execute("delete from users where id=?", (id,))
    conn.commit()
    conn.close()
def getId(name):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("select id from users where name=?", (name,))
    data = c.fetchone()
    conn.close()
    if data!=None:
        return data[0]
    return None
def getName(id):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("select name from users where id=?", (id,))
    data = c.fetchone()
    conn.close()
    if data!=None:
        return data[0]
    return None
def authenticate(name,password):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("select id,name,password from users where name=?", (name,))
    data = c.fetchone()
    conn.close()
    if data==None: return "Name"
    id = data[0]
    hash = data[2]
    if sha256.verify(password,hash): return id
    return "Password"

def updateDate(id):
    day = datetime.date.today().day
    month = datetime.date.today().month
    year = datetime.date.today().year
    date=str(Date(day,month,year))
    arguments = (date, id)
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("update users set lastseen=? where id=?", arguments)
    conn.commit()
    conn.close()
def checkForDuplicates(field,value):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("select "+field+" from users where "+field+"=?", (value,))
    result=c.fetchone()
    conn.close()
    if result==None: return True
    else: return False
def register(name,password,email):
    day = datetime.date.today().day
    month = datetime.date.today().month
    year = datetime.date.today().year
    date = str(Date(day, month, year))
    hash=sha256.hash(password)
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("insert into users(name,password,email,registered,lastseen)values(?,?,?,?,?)", (name,hash,email,date,date))
    c.execute("select id,name from users where name=?", (name,))
    id=c.fetchone()[0]
    c.execute("insert into stats_standard(id)values(?)",(id,))
    c.execute("insert into stats_blitz(id)values(?)", (id,))
    c.execute("insert into stats_lightning(id)values(?)", (id,))
    conn.commit()
    conn.close()
    return id

def getReplayList(id,args):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    request="select * from games"
    params=[]
    if 'name' in args or ('own' in args and args['own'] in (1,'1','true',"True","TRUE")):
        request+=' where'
        name=''
        if 'name' in args:
            request+= ' (white_name like ? or black_name like ?)'
            name='%'+args['name']+'%'
            params.append(name)
            params.append(name)

        if 'own' in args and args['own'] in (1,'1','true',"True","TRUE"):
            if 'name' in args:
                request+=' and'
            request+=" (white=? or black=? or uploader=?)"
            params.append(id)
            params.append(id)
            params.append(id)
    c.execute(request,tuple(params))
    list = c.fetchall()
    conn.close()
    return list
def getUserList(args):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    name=''
    if 'name' in args:
        name='%'+args['name']+'%'
    if name=='':
        c.execute("select name,id,lastseen,elo_standard,elo_blitz,elo_lightning from users")
    else: c.execute("select name,id,lastseen,elo_standard,elo_blitz,elo_lightning from users where name like ?",(name,))
    list = c.fetchall()
    conn.close()
    return list
def getReplay(id):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("select pgn from games where id=?", (id,))
    replay = c.fetchone()
    conn.close()
    if replay!=None: return replay[0]
    return None
def postReplay(pgn,time="NULL",time_add="NULL",white_id="NULL",black_id="NULL",uploader_id="NULL"):
    game=chess.pgn.read_game(io.StringIO(pgn),Visitor=OverriddenGameBuilder)
    for tag in ['Event','Site','Date','Round','White','Black','Result']:
        if tag not in game.headers:
            return "Missing Tag: "+tag
    event=game.headers['Event']
    site=game.headers['Site']
    date=game.headers['Date']
    round=game.headers['Round']
    white_name=game.headers['White']
    black_name=game.headers['Black']
    outcome=game.headers['Result']
    pgn=str(game)
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("insert into games(event,site,date,round,white_name,black_name,result,uploader,white,black,time,time_add,pgn) values(?,?,?,?,?,?,?,?,?,?,?,?,?)", (event,site,str(date),round,white_name,black_name,outcome,uploader_id,white_id,black_id,time,time_add,pgn))
    c.execute("select id from games where pgn=?",(pgn,))
    id=c.fetchone()
    conn.commit()
    conn.close()
    if id!=None: return id[0]
    return None
def removeReplays(id):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("delete from games where white=? or black=? or uploader=?",(id,id,id))
    conn.commit()
    conn.close()
