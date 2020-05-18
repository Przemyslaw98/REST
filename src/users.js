import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export const Users = () => {
    const classes = useStyles();
    const[userList,setUserList]=React.useState('');
    React.useEffect(() => {
        axios.get('/users')
            .then(res => {
            setUserList(res);
            })
            .catch(error => {
                setUserList(error.response['data']['message'])
            });
    });
    return (
        <div className={classes.root}>
            {userList}
        </div>
    );
}