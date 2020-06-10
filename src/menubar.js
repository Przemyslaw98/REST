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
    const [var1,setVar1]=React.useState("Login");
    const [var2,setVar2]=React.useState("Register");
    const [link1,setLink1]=React.useState("/login");
    const [link2,setLink2]=React.useState("/register");


    const handleChange = (event, newValue) => {
        setValue(newValue);
        history.push(newValue);
    };

    React.useEffect(() => {
        if(localStorage.getItem('token')===null){
            setVar1("Login");
            setVar2("Register");
            setLink1('/login');
            setLink2('/register');
        }
        else{
            setVar1("My profile");
            setVar2("Logout");
            setLink1('/profile');
            setLink2('/logout');
        }

    });

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
                    <Tab label={var1} value={link1}/>
                    <Tab label={var2} value={link2}/>
                </Tabs>
            </AppBar>
        </div>
    );
}