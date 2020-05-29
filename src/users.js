import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {getUserList} from './requests';
import {useHistory} from "react-router-dom";
import Pagination from '@material-ui/lab/Pagination';
import queryString from 'query-string';
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export const Users = () => {
    const history = useHistory();
    const classes = useStyles();
    const[userList,setUserList]=React.useState('');
    const[listFragment,setListFragment]=React.useState('');
    const [page, setPage] = React.useState(1);
    const [range,setRange] = React.useState(1);
    const [query,setQuery] = React.useState(queryString.parse(window.location.search));
    const [username, setUsername] = React.useState(queryString.parse(window.location.search).name);
    const handleNameChange = (event) => {
        setUsername(event.target.value);
    };
    const handlePageChange = (event, value) => {
        setPage(value);
        setListFragment(userList.slice((value-1)*10,value*10));
    };
    const handleSubmit=(event)=>{
        event.preventDefault();
        var string='';
        if(username!=='')
            string+='name='+username;
        if(string!=='')
            string='?'+string;
        history.push('/users'+string);
        setQuery(queryString.parse(string))
    };
    React.useEffect(() => {
        getUserList(queryString.stringify(query),setUserList,history,setRange,page,setListFragment);
    },[history,page,query]);
    return (
        <div className={classes.root}>
            <form>
                <br/>
                <TextField
                    size='small'
                    variant='outlined'
                    value={username}
                    onChange={handleNameChange}
                />
                <Button variant="outlined" type="submit" onClick={handleSubmit}>Search</Button>
            </form><br/><br/>
            <Grid container>
                <Grid item xs>
                    Name
                </Grid>
                <Grid item xs>
                    Last Seen
                </Grid>
                <Grid item xs>
                    Elo rating
                </Grid>
                <Grid item xs>

                </Grid>
                <br/><br/>
            </Grid>
            {listFragment}
            <Pagination count={range} shape="rounded" color="primary" page={page} onChange={handlePageChange}/>
        </div>
    );
}