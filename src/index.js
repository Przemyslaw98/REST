import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from "react-router-dom";
import {TabPanel} from "./menubar";
import {Routing} from './routing'
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";

const theme=createMuiTheme({
    palette: {
        primary: {
            main: "#306000",
        },
        error: {
            main: "#ffff00",
        },
        background: {
            default: "#80ff00"
        }
    },
});
function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <TabPanel/>
                <Routing/>
            </Router>
        </ThemeProvider>
    );
}

ReactDOM.render(<App />, document.querySelector('#app'));