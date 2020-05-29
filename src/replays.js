import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {getReplayList} from './requests';
import {useHistory} from "react-router-dom";
import Pagination from '@material-ui/lab/Pagination';
import queryString from 'query-string';
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

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
    const handlePageChange = (event, value) => {
        setPage(value);
        setListFragment(userList.slice((value-1)*10,value*10));
    };
    React.useEffect(() => {
        getReplayList(queryString.stringify(query),setUserList,history,setRange,page,setListFragment);
    },[history,page,query]);
    return (
        <div className={classes.root}>
            <Button variant="outlined" onClick={()=>history.push('/replay_upload')}>Upload a replay</Button>
            <br/><br/>
            <Grid container>
                <Grid item xs={6}>
                    Players
                </Grid>
                <Grid item xs>
                    Outcome
                </Grid>
                <Grid item xs>
                    Date
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