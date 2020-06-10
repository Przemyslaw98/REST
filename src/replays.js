import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {getReplayList} from './requests';
import {useHistory} from "react-router-dom";
import Pagination from '@material-ui/lab/Pagination';
import queryString from 'query-string';
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {Upload} from "./replay";
import Hidden from '@material-ui/core/Hidden';
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export const Replays = () => {
    const history = useHistory();
    const classes = useStyles();
    const[userList,setUserList]=React.useState('');
    const[listFragment,setListFragment]=React.useState('');
    const [page, setPage] = React.useState(1);
    const [range,setRange] = React.useState(1);
    const [query,setQuery] = React.useState(queryString.parse(window.location.search));
    const [own,setOwn]=React.useState(false);
    const [name, setName] = React.useState('');
    const handleNameChange = (event) => {
        setName(event.target.value);
    };
    const handlePageChange = (event, value) => {
        setPage(value);
        setListFragment(userList.slice((value-1)*10,value*10));
    };
    React.useEffect(() => {
        getReplayList(queryString.stringify(query),setUserList,history,setRange,page,setListFragment);
    },[history,page,query]);
    const handleSwitch=(event)=>{
        if(own)
            setOwn(false);
        else setOwn(true);
    }
    const handleClose = (value) => {
        setOpen(false);
    };
    const handleSubmit=(event)=>{
        event.preventDefault();
        var q={};
        var s='';
        if(name!=='')
            q.name = name;
        if(own)
            q.own='true';
        if(q!=={})
            s='?'+queryString.stringify(q);
        history.push('/replays'+s);
        setQuery(q)
    };
    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    return (
        <div className={classes.root}>
            <Button color='primary' variant="contained" onClick={handleClickOpen}>Upload a replay</Button>
            <Upload open={open} onClose={handleClose} />
            <br/>
            <Grid container >
                <Grid item xs={12} sm>
                    <TextField
                        size='small'
                        placeholder='Name'
                        variant='outlined'
                        value={name}
                        onChange={handleNameChange}
                    />
                </Grid>
                <Grid item xs={12} sm>
                    <FormControlLabel
                        control={
                            <Checkbox
                                color='primary'
                                checked={own}
                                onChange={handleSwitch}
                            />
                        }
                        label='Show my replays'
                    />
                </Grid>
                <Grid item xs={12} sm>
                    <Button color='primary' variant="contained" onClick={handleSubmit}>Search</Button>
                </Grid>
            </Grid>
            <br/><br/><br/><br/>
            <Hidden smDown>
                <Grid container>
                    <Grid item xs={6}>
                        <Typography variant='h5'>Players</Typography>
                    </Grid>
                    <Grid item xs>
                        <Typography variant='h5'>Outcome</Typography>
                    </Grid>
                    <Grid item xs>
                        <Typography variant='h5'>Date</Typography>
                    </Grid>
                    <Grid item xs>

                    </Grid>
                    <br/><br/>
                </Grid>
            </Hidden>
            {listFragment}
            <Pagination count={range} shape="rounded" color="primary" page={page} onChange={handlePageChange}/>
        </div>
    );
}