import React from 'react';
import Button from "@material-ui/core/Button";
import { makeStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export const Login = () => {
    const classes = useStyles();
    const [ret, setRet] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const handleNameChange = (event) => {
        setUsername(event.target.value);
    };
    const handlePassChange = (event) => {
        setPassword(event.target.value);
    };
    const handleSubmit=(event)=>{
        event.preventDefault();

        axios.post('/login',{'name':username,'password':password})
            .then(res => {
                setRet(res);
            })
            .catch(error => {
                setRet(Object.values(error.response['data']['message'])[0])
            });
    };
    return (
        <div className={classes.root}>
            <form>
                <FormControl>
                    <InputLabel htmlFor="name">Username</InputLabel>
                    <Input id="name" value={username} onChange={handleNameChange} />
                </FormControl>
                <FormControl>
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <Input id="password" value={password} type="password" onChange={handlePassChange}/><br/>
                </FormControl>
                <Button variant="outlined" type="submit" onClick={handleSubmit}>Sign in</Button>
            </form>
            {ret}
        </div>
    );
}