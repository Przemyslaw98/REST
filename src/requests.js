import axios from 'axios';
import Link from '@material-ui/core/Link';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

export function register(username,password,secondpass,email,setOutput,history,errorHooks){
    errorHooks.setNameError(false);
    errorHooks.setPassError(false);
    errorHooks.setPassError2(false);
    errorHooks.setMailError(false);
    errorHooks.setMsgName(' ');
    errorHooks.setMsgPass(' ');
    errorHooks.setMsgPass2(' ');
    errorHooks.setMsgMail(' ');
    if(username.length<6){
        errorHooks.setNameError(true);
        errorHooks.setMsgName("Name too short!");
        return;
    }
    if(password.length<6){
        errorHooks.setPassError(true);
        errorHooks.setMsgPass("Password too short!");
        return;
    }
    if(secondpass!==password){
        errorHooks.setPassError2(true);
        errorHooks.setMsgPass2("Passwords do not match!");
        return;
    }
    const args=new URLSearchParams();
    args.append('name',username);
    args.append('password',password);
    args.append('2ndpass',secondpass);
    args.append('email',email);
    var headers={};
    headers['Content-Type']='application/x-www-form-urlencoded';
    headers['Access-Control-Allow-Origin']='*';
    axios.post('/register',args,{headers: headers})
        .then(res => {
            setOutput(res['data']['message']);
            localStorage.setItem('token',res['data']['token']);
        })
        .catch(error => {
            if(error.response.status===400) {
                var location;
                switch(error.response['data']['where']){
                    case 'username':
                        location=[errorHooks.setNameError,errorHooks.setMsgName]
                        break;
                    case 'password':
                        location=[errorHooks.setPassError,errorHooks.setMsgPass]
                        break;
                    case '2ndpass':
                        location=[errorHooks.setPassError2,errorHooks.setMsgPass2]
                        break;
                    case 'email':
                        location=[errorHooks.setMailError,errorHooks.setMsgMail]
                        break;
                    default:
                        break;
                }
                location[0](true);
                location[1](error.response['data']['message']);
            }
            else history.push('/error');
        });
}
export function login(username,password,setOutput,history,errorHooks){
    errorHooks.setNameError(false);
    errorHooks.setPassError(false);
    errorHooks.setMsgName(' ');
    errorHooks.setMsgPass(' ');
    const args=new URLSearchParams();
    args.append('name',username);
    args.append('password',password);
    var headers={};
    headers['Content-Type']='application/x-www-form-urlencoded';
    headers['Access-Control-Allow-Origin']='*';
    axios.post('/login',args,{headers: headers})
        .then(res => {
            setOutput(res['data']['message']);
            localStorage.setItem('token',res['data']['token']);
        })
        .catch(error => {
            if(error.response.status===400) {
                var location;
                switch(error.response['data']['where']){
                    case 'username':
                        location=[errorHooks.setNameError,errorHooks.setMsgName]
                        break;
                    case 'password':
                        location=[errorHooks.setPassError,errorHooks.setMsgPass]
                        break;
                    default:
                        break;
                }
                location[0](true);
                location[1](error.response['data']['message']);
            }
            else history.push('/error');
        });
}
export function getUserList(query,setUserList,history,setRange,page,setListFragment){
    var string='';
    if(query!=='')
        string='?'+query;
    var headers={};
    headers['Content-Type']='application/x-www-form-urlencoded';
    headers['Access-Control-Allow-Origin']='*';
    if(localStorage.getItem('token')!=null)
        headers['Authorization']='Bearer '+localStorage.getItem('token')
    axios.get('/users'+string,{headers:headers})
        .then(res => {
            var usersList=[];
            for(var i=0;i<res['data']['list'].length;i++) {
                const link="/users/"+res['data']['list'][i][1];
                const user=res['data']['list'][i];
                usersList.push(
                    <Grid container>
                        <Grid item xs>
                            {user[0]}
                        </Grid>
                        <Grid item xs>
                            {user[2]}
                        </Grid>
                        <Grid item xs>
                            {user[3]} / {user[4]} / {user[5]}
                        </Grid>
                        <Grid item xs>
                            <Link
                                href={link}
                                onClick={(event)=>{event.preventDefault();history.push(link)}}>
                                View Profile
                            </Link>
                        </Grid>
                        <br/>
                    </Grid>
                );
            }
            setUserList(usersList);
            setRange(Math.max(1,Math.ceil(usersList.length/10)));
            setListFragment(usersList.slice((page-1)*10,page*10));
        })
        .catch(error => {
            if(error.response.status===401)
                history.push('/authorization_error');
            else history.push('/error');
        })

}
export function postReplay(pgn,history,setError,setMsg){
    setError(false);
    setMsg('');
    var headers={};
    headers['Content-Type']='application/x-www-form-urlencoded';
    headers['Access-Control-Allow-Origin']='*';
    if(localStorage.getItem('token')!=null)
        headers['Authorization']='Bearer '+localStorage.getItem('token')
    const args=new URLSearchParams();
    args.append('pgn',pgn);
    axios.post('/replays',args,{headers: headers})
        .then(res => {
            const id=res['data']['id'];
            history.push('replays/'+id);
        })
        .catch(error => {
            if(error.response.status===400&&error.response['data']['where']==='text') {
                setError(true);
                setMsg(error.response['data']['message'])
            }
            else if(error.response.status===401)
                history.push('/authorization_error');
            else history.push('/error');
        });

}
export function getReplay(setPGN,history,id,setFENs,setPosition){
    var headers={};
    headers['Content-Type']='application/x-www-form-urlencoded';
    headers['Access-Control-Allow-Origin']='*';
    if(localStorage.getItem('token')!=null)
        headers['Authorization']='Bearer '+localStorage.getItem('token')
    axios.get('/replays/'+id,{headers:headers})
        .then(res => {
            const { Chess } = require('./chess.js')
            const board=new Chess();
            const pgn=res['data']['replay'];
            setPGN(pgn);
            board.load_pgn(pgn);
            var FENlist=[board.fen()];
            while(board.undo()!==null)
                FENlist.push(board.fen());
            FENlist=FENlist.reverse();
            setFENs(FENlist);
            setPosition(board.fen());
            console.log(pgn);
        })
        .catch(error => {
            if(error.response.status===404)
                history.push('/not_found');
            else if(error.response.status===401)
                history.push('/authorization_error');
            else history.push('/error');
        })
}
export function getReplayList(query,setReplayList,history,setRange,page,setListFragment){
    var headers={};
    var string='';
    if(query!=='')
        string='?'+query;
    headers['Content-Type']='application/x-www-form-urlencoded';
    headers['Access-Control-Allow-Origin']='*';
    if(localStorage.getItem('token')!=null)
        headers['Authorization']='Bearer '+localStorage.getItem('token')
    axios.get('/replays'+string,{headers:headers})
        .then(res => {
            var replaysList=[];
            for(var i=0;i<res['data']['list'].length;i++) {
                const replay=res['data']['list'][i];
                const link="/replays/"+replay[0];
                replaysList.push(
                    <Grid container>
                        <Grid item xs={6}>
                            {replay[9]} vs {replay[10]}
                        </Grid>
                        <Grid item xs>
                            {replay[4]}
                        </Grid>
                        <Grid item xs>
                            {replay[3]}
                        </Grid>
                        <Grid item xs>
                            <Link
                                href={link}
                                onClick={(event)=>{event.preventDefault();history.push(link)}}>
                                View Replay
                            </Link>
                        </Grid>
                        <br/><br/>
                    </Grid>
                );
            }
            setReplayList(replaysList);
            setRange(Math.max(1,Math.ceil(replaysList.length/10)));
            setListFragment(replaysList.slice((page-1)*10,page*10));
        })
        .catch(error => {
            if(error.response.status===401)
                history.push('/authorization_error');
            else history.push('/error');
        })

}
export function getUser(setOutput,history,id){
    var headers={};
    headers['Content-Type']='application/x-www-form-urlencoded';
    headers['Access-Control-Allow-Origin']='*';
    if(localStorage.getItem('token')!=null)
        headers['Authorization']='Bearer '+localStorage.getItem('token')
    axios.get('/users/'+id,{headers:headers})
        .then(res => {
            var userData={
                name:res['data']['userdata']['Name'],
                lastSeen:res['data']['userdata']['Last Seen'],
                registered:res['data']['userdata']['Registered'],
                eloS:res['data']['userdata']['EloStandard'],
                eloB:res['data']['userdata']['EloBlitz'],
                eloL:res['data']['userdata']['EloLightning'],
            };
            const output=
                <div align="right">
                    <Typography variant="h4">{userData.name}</Typography>
                    <Typography variant="body1">Registered: {userData.registered}</Typography>
                    <Typography variant="body1">Last Seen: {userData.lastSeen}</Typography><br/>
                    <Typography variant="body1">Elo rating:</Typography>
                    <Typography variant="body2">Standard: {userData.eloS}</Typography>
                    <Typography variant="body2">Blitz: {userData.eloB}</Typography>
                    <Typography variant="body2">Lightning: {userData.eloL}</Typography>
                </div>
            setOutput(output);
        })
        .catch(error => {
            if(error.response.status===404)
                history.push('/not_found');
            else history.push('/error');
        })

}
