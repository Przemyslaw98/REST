import React from 'react';
import Button from "@material-ui/core/Button";
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import {register} from './requests';
import {useHistory} from "react-router-dom";
const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export const Register = () => {
    const history = useHistory();
    const classes = useStyles();
    const [ret, setRet] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [secondpass,set2ndPass] = React.useState('');
    const [email,setEmail] = React.useState('');

    const [nameError,setNameError]= React.useState(false);
    const [msgName,setMsgName]= React.useState(' ');
    const [passError,setPassError]= React.useState(false);
    const [msgPass,setMsgPass]= React.useState(' ');
    const [passError2,setPassError2]= React.useState(false);
    const [msgPass2,setMsgPass2]= React.useState(' ');
    const [mailError,setMailError]= React.useState(false);
    const [msgMail,setMsgMail]= React.useState(' ');
    const errorHooks={
        setNameError:setNameError,
        setMsgName:setMsgName,
        setPassError:setPassError,
        setMsgPass:setMsgPass,
        setPassError2:setPassError2,
        setMsgPass2:setMsgPass2,
        setMailError:setMailError,
        setMsgMail:setMsgMail
    }

    const handleNameChange = (event) => {
        setUsername(event.target.value);
    };
    const handlePassChange = (event) => {
        setPassword(event.target.value);
    };
    const handle2ndPassChange = (event) => {
        set2ndPass(event.target.value);
    };
    const handleMailChange = (event) => {
        setEmail(event.target.value);
    };
    const handleSubmit=(event)=> {
        event.preventDefault();
        register(username, password,secondpass, email,setRet,history,errorHooks);
    }
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
                <TextField
                    size='small'
                    label="ConfirmPassword"
                    variant='outlined'
                    value={secondpass}
                    type="password"
                    error={passError2}
                    helperText={msgPass2}
                    onChange={handle2ndPassChange}
                /><br/><br/>
                <TextField
                    size='small'
                    label="E-Mail"
                    variant='outlined'
                    value={email}
                    error={mailError}
                    helperText={msgMail}
                    onChange={handleMailChange}
                /><br/><br/>
                <Button variant="outlined" type="submit" onClick={handleSubmit}>Sign up</Button>
                {ret}
            </form>
        </div>
    );
}