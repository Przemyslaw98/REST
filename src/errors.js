import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export const Unauthorized = () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Typography variant='h1'>Error 401</Typography>
            <Typography variant='body1'>Authorization error! You are not logged in or your token has expired.</Typography>
        </div>
    );
}
export const NotFound= () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Typography variant='h1'>Error 404</Typography>
            <Typography variant='body1'>Page not found!</Typography>
        </div>
    );
}
export const OtherError= () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Typography variant='h1'>Unknown Error!</Typography>
            <Typography variant='body1'>Probably something wrong with backend API.</Typography>
        </div>
    );
}