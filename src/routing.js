import React from 'react'
import {Switch, Route} from 'react-router-dom';
import {Users} from './users';
import {Login} from './login';

export const Routing = () => {
    return(
        <>
            <Switch>
                <Route exact path='/'>
                    Home Page
                </Route>
                <Route path="/users">
                    <Users/>
                </Route>
                <Route path="/offers">
                    Offers
                </Route>
                <Route path="/replays">
                    Replays
                </Route>
                <Route path="/login">
                    <Login/>
                </Route>
                <Route path="/register">
                    Register
                </Route>
                <Route>
                    404: Not found :(
                </Route>

            </Switch>
        </>
    );
}