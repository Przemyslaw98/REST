import React from 'react'
import {Switch, Route} from 'react-router-dom';
import {Users} from './users';
import {User} from './user';
import {Login} from './login';
import {Register} from './register';
import {Replays} from './replays';
import {Replay,UploadReplay} from './replay';
import {NotFound,Unauthorized,OtherError} from './errors'

export const Routing = () => {
    return(
        <>
            <Switch>
                <Route exact path='/'>
                    Home Page
                </Route>
                <Route exact path="/users">
                    <Users/>
                </Route>
                <Route path="/users/:id">
                    <User/>
                </Route>
                <Route path="/offers">
                    Offers
                </Route>
                <Route exact path="/replays">
                    <Replays/>
                </Route>
                <Route path="/replays/:id">
                    <Replay/>
                </Route>
                <Route path="/replay_upload">
                    <UploadReplay/>
                </Route>
                <Route path="/login">
                    <Login/>
                </Route>
                <Route path="/register">
                    <Register/>
                </Route>
                <Route path="/not_found">
                    <NotFound/>
                </Route>
                <Route path="/authorization_error">
                    <Unauthorized/>
                </Route>
                <Route path="/error">
                    <OtherError/>
                </Route>
                <Route>
                    404: Not found :(
                </Route>

            </Switch>
        </>
    );
}