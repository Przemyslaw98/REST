import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from "react-router-dom";
import {TabPanel} from "./menubar";
import {Routing} from './routing'

function App() {
    return (
        <>
            <Router>
                <TabPanel/>
                <Routing/>
            </Router>
        </>
    );
}

ReactDOM.render(<App />, document.querySelector('#app'));