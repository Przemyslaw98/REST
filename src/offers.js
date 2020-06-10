import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {getOfferList} from './requests';
import {useHistory} from "react-router-dom";
import Pagination from '@material-ui/lab/Pagination';
import queryString from 'query-string';
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import {Upload} from './offer';
import Hidden from '@material-ui/core/Hidden';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));


export const Offers = () => {
    const history = useHistory();
    const classes = useStyles();
    const[userList,setUserList]=React.useState('');
    const[listFragment,setListFragment]=React.useState('');
    const [page, setPage] = React.useState(1);
    const [minElo, setMinElo] = React.useState('');
    const [maxElo, setMaxElo] = React.useState('');
    const [range,setRange] = React.useState(1);
    const [query,setQuery] = React.useState(queryString.parse(window.location.search));
    const [standard,setStandard]=React.useState(true);
    const [blitz,setBlitz]=React.useState(true);
    const [lightning,setLightning]=React.useState(true);
    const [name, setName] = React.useState('');
    const handleNameChange = (event) => {
        setName(event.target.value);
    };
    const handleEloMin = (event) => {
        setMinElo(event.target.value);
    };
    const handleEloMax = (event) => {
        setMaxElo(event.target.value);
    };
    const handlePageChange = (event, value) => {
        setPage(value);
        setListFragment(userList.slice((value-1)*10,value*10));
    };
    React.useEffect(() => {
        getOfferList(queryString.stringify(query),setUserList,history,setRange,page,setListFragment);
    },[history,page,query]);
    const handleSwitchS=(event)=>{
        if(standard)
            setStandard(false);
        else setStandard(true);
    }
    const handleSwitchB=(event)=>{
        if(blitz)
            setBlitz(false);
        else setBlitz(true);
    }
    const handleSwitchL=(event)=>{
        if(lightning)
            setLightning(false);
        else setLightning(true);
    }
    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
        history.push('/offers');
    };
    const handleSubmit=(event)=>{
        event.preventDefault();
        var q={};
        var s='';
        if(name!=='')
            q.name = name;
        if(minElo!=='')
            q.min_elo=minElo;
        if(maxElo!=='')
            q.max_elo=maxElo;
        var exclude='';
        if(!standard)
            exclude+='s';
        if(!blitz)
            exclude+='b';
        if(!lightning)
            exclude+='l';
        if(exclude!=='')
            q.exclude=exclude;
        if(q!=={})
            s='?'+queryString.stringify(q);
        history.push('/offers'+s);
        setQuery(q)
    };
    return (
        <div className={classes.root}>
            <Button color='primary' variant="contained" onClick={handleClickOpen}>Create an offer</Button>
            <Upload open={open} onClose={handleClose} />
            <br/><br/>
            <Grid container alignItems="center" spacing={1}>
                <Grid item lg md sm={6} xs={12}>
                    <TextField
                        size='small'
                        placeholder='Player Name'
                        variant='outlined'
                        value={name}
                        onChange={handleNameChange}
                    />
                </Grid>
                <Grid item lg md={4} sm={6} xs={12}>
                    <Grid container alignItems="center">
                        <Grid item>
                            <Typography display='inline'>Elo range: </Typography>
                        </Grid>
                        <Grid item>
                            <TextField
                                size='small'
                                placeholder='From'
                                variant='outlined'
                                type='number'
                                value={minElo}
                                onChange={handleEloMin}
                                style = {{width: 96}}
                            />
                        </Grid>
                        <Grid item>
                            <Typography display='inline'> - </Typography>
                        </Grid>
                        <Grid item>
                            <TextField
                                size='small'
                                placeholder='To'
                                variant='outlined'
                                type='number'
                                value={maxElo}
                                onChange={handleEloMax}
                                style = {{width: 96}}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item lg md={4} sm={8} xs={12}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                color='primary'
                                checked={standard}
                                onChange={handleSwitchS}
                            />
                        }
                        label='standard'
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                color='primary'
                                checked={blitz}
                                onChange={handleSwitchB}
                            />
                        }
                        label='blitz'
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                color='primary'
                                checked={lightning}
                                onChange={handleSwitchL}
                            />
                        }
                        label='lightning'
                    />
                </Grid>
                <Grid item lg={1} md={1} sm={4} xs={12}>
                    <Button color='primary' variant="contained" onClick={handleSubmit}>Search</Button>
                </Grid>
            </Grid>

            <br/><br/>
            <Hidden xsDown>
                <Grid container>
                    <Grid item xs>
                        <Typography variant='h5'>Player</Typography>
                    </Grid>
                    <Grid item xs>
                        <Typography variant='h5'>Type</Typography>
                    </Grid>
                    <Grid item xs>
                        <Typography variant='h5'>Elo</Typography>
                    </Grid>
                    <Grid item xs>
                        <Typography variant='h5'>Color</Typography>
                    </Grid>
                    <Grid item xs>
                        <Typography variant='h5'>Time</Typography>
                    </Grid>
                    <Grid item xs>
                    </Grid>
                </Grid>
                <br/><br/>
            </Hidden>

            {listFragment}
            <Pagination count={range} shape="rounded" color="primary" page={page} onChange={handlePageChange}/>
        </div>
    );
}