import React from 'react';
import Button from "@material-ui/core/Button";
import { makeStyles } from '@material-ui/core/styles';
import {login} from './requests';
import TextField from "@material-ui/core/TextField";
import {useHistory} from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export const Logout=()=>{
    const history=useHistory();
    React.useEffect(() => {
        localStorage.removeItem('token');
        history.push('/login')
    });
    return null;
}
export const Login = () => {
    const classes = useStyles();
    const history=useHistory();
    const [ret, setRet] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    const [nameError,setNameError]= React.useState(false);
    const [msgName,setMsgName]= React.useState(' ');
    const [passError,setPassError]= React.useState(false);
    const [msgPass,setMsgPass]= React.useState(' ');

    const errorHooks= {
        setNameError: setNameError,
        setMsgName: setMsgName,
        setPassError: setPassError,
        setMsgPass: setMsgPass,
    }

    const handleNameChange = (event) => {
        setUsername(event.target.value);
    };
    const handlePassChange = (event) => {
        setPassword(event.target.value);
    };
    const handleSubmit=(event)=>{
        event.preventDefault();
        login(username,password,setRet,history,errorHooks);
    };
    return (
        <div className={classes.root}>
            <form>
                <br/>
                <TextField
                    size='small'
                    label="Username"
                    variant='outlined'
                    value={username}
                    error={nameError}
                    helperText={msgName}
                    onChange={handleNameChange}
                /><br/><br/>
                <TextField
                    size='small'
                    label="Password"
                    variant='outlined'
                    value={password}
                    type="password"
                    error={passError}
                    helperText={msgPass}
                    onChange={handlePassChange}
                /><br/><br/>
                <Button color='primary' variant="contained" type="submit" onClick={handleSubmit}>Sign in</Button>
                {ret}
            </form>
        </div>
    );
}