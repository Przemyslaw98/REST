import sqlite3
import datetime
from definitions import Date
from passlib.hash import pbkdf2_sha256 as sha256

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
def editUser(id,name=None,password=None):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    if name != None:
        c.execute("update users set name=? where id=?", (name, id))
    if password != None:
        hash=sha256.hash(password)
        c.execute("update users set password=? where id=?", (hash, id))
    conn.commit()
    conn.close()
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

def authenticate(name,password):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("select id,name,password from users where name=?", (name,))
    data = c.fetchone()
    conn.close()
    if data==None: return None
    id = data[0]
    hash = data[2]
    if sha256.verify(password,hash): return id
    return None

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
def checkForDuplicates(name,email="NULL"):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("select name from users where name=? or email=?", (name,email))
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

def getReplayList(id):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("select * from games where white=? or black=?",(id,id))
    list = c.fetchall()
    conn.close()
    return list
def getUserList():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("select name,id from users")
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
def postResult(white_id,black_id,date,outcome,pgn,time="NULL",time_add="NULL"):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("insert into games(white,black,date,outcome,time,time_add,pgn) values(?,?,?,?,?,?,?)", (white_id,black_id,str(date),outcome,time,time_add,pgn))
    conn.commit()
    conn.close()
def removeReplays(id):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("delete from games where white=? or black=?",(id,id))
    conn.commit()
    conn.close()
