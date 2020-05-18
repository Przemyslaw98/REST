import sqlite3
import offers


class Date:
    def __init__(self,day,month,year):
        self.day=day
        self.month=month
        self.year=year
    def __str__(self):
        months={1:"January",2:"February",3:"March",4:"April",5:"May",6:"June",7:"July",8:"August",9:"September",10:"October",11:"November",12:"December"}
        return str(self.day)+' '+months[self.month]+' '+str(self.year)

class Offer:
    def __init__(self,owner_id,time,time_add,color):
        self.id=offers.ids
        offers.ids+=1
        self.owner_id=owner_id
        self.time=time
        self.time_add=time_add
        if color in ('black','white'):
            self.color=color
        else: self.color='random'

        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        c.execute("select name,elo_standard,elo_blitz,elo_lightning from users where id=?",(owner_id,))
        ownerData = c.fetchone()
        conn.close()

        self.owner_name=ownerData[0]
        if time==None or time>600:
            self.type="standard"
            self.elo=ownerData[1]
        elif time>180:
            self.type="blitz"
            self.elo = ownerData[2]
        else:
            self.type="lightning"
            self.elo = ownerData[3]
    def dict(self):
        dict={}
        dict['id']=self.id
        dict['owner_id']=self.owner_id
        dict['time']=self.time
        dict['time_add']=self.time_add
        dict['color']=self.color
        dict['owner_name']=self.owner_name
        dict['type']=self.type
        dict['elo']=self.elo
        return dict
