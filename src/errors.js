import React from "react";
import { makeStyles } from '@material-ui/core/styles';
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
            Authorization error!
        </div>
    );
}
export const NotFound= () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            Not found!
        </div>
    );
}
export const OtherError= () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            UnknownError!
        </div>
    );
}