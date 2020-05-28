import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {getUser} from './requests';
import {useHistory} from "react-router-dom";
import { useParams } from "react-router";

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export const User = () => {
    let {id}=useParams();
    const history = useHistory();
    const classes = useStyles();
    const[output,setOutput]=React.useState('');
    React.useEffect(() => {
        getUser(setOutput,history,id);
    },[history,id]);
    return (
        <div className={classes.root}>
            {output}
        </div>
    );
}