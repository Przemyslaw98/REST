import React from 'react';
import {useHistory} from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
}));

export const TabPanel = () => {
    const classes = useStyles();
    const [value, setValue] = React.useState('/');
    const history = useHistory();


    const handleChange = (event, newValue) => {
        setValue(newValue);
        history.push(newValue);
    };

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="simple tabs example">
                    <Tab label="Home" value={'/'}/>
                    <Tab label="Users" value={'/users'}/>
                    <Tab label="Games" value={'/offers'}/>
                    <Tab label="Replays" value={'/replays'}/>
                    <Tab label="Login" value={'/login'}/>
                    <Tab label="Register" value={'/register'}/>
                </Tabs>
            </AppBar>
        </div>
    );
}