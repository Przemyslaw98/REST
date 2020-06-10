import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {getUser, changePassword,removeUser} from './requests';
import {useHistory} from "react-router-dom";
import { useParams } from "react-router";
import jwt_decode from 'jwt-decode';
import {Container} from "@material-ui/core";
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export const Profile=()=>{
    const history = useHistory();
    React.useEffect(() => {
        try {
            const id = jwt_decode(localStorage.getItem('token'))['identity'];
            history.push('/users/' + id);
        }catch(error){
            history.push('/login');
        }
    });
    return null;
}
export const User = () => {
    let {id}=useParams();
    const history = useHistory();
    const classes = useStyles();
    const[username,setUsername]=React.useState('');
    const[userdata,setUserData]=React.useState({
        lastSeen:'',
        registered:'',
        eloS:'',
        eloB:'',
        eloL:'',
    });
    const[visibility,setVisibility]=React.useState('none');
    const [open, setOpen] = React.useState(false);
    const handleClose = (value) => {
        setOpen(false);
    };
    const handleEdit = (event) => {
        event.preventDefault();
        setOpen(true);
    };
    const handleRemove = (event) => {
        event.preventDefault();
        removeUser(id,history);
    };
    const links=(
            <Box component="div" display={visibility}>
                <Grid container spacing={1}>
                    <Grid item>
                        <Link href='#' onClick={handleEdit}>
                            Change Password
                        </Link>
                    </Grid>
                    <Grid item>
                        <Link href='#' onClick={handleRemove}>
                            Remove account
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        );
    React.useEffect(() => {
        if(parseInt(id)===jwt_decode(localStorage.getItem('token'))['identity'])
            setVisibility('inline');
        getUser(setUserData,history,id,setUsername);
    },[history,id]);
    return (
        <Container className={classes.root} maxWidth='sm'>
            <Grid container direction='column'>
                <Grid item>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item xs={12} sm={6}>
                            <Typography display="inline" variant="h4" align='right'>{username} </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {links}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <Grid container spacing={1}>
                        <Grid item>
                            <Typography variant="body1">Registered:</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body1">{userdata.registered}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <Grid container spacing={1}>
                        <Grid item>
                            <Typography variant="body1">Last Seen:</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body1">{userdata.lastSeen}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <Typography variant="h6">Elo rating:</Typography>
                </Grid>
                <Grid item>
                    <Grid container spacing={1}>
                        <Grid item>
                            <Typography variant="body2" align='right'>Standard:</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body2" >{userdata.eloS}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <Grid container spacing={1}>
                        <Grid item>
                            <Typography variant="body2" align='right'>Blitz:</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body2">{userdata.eloB}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <Grid container spacing={1}>
                        <Grid item>
                            <Typography variant="body2" align='right'>Lightning:</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body2">{userdata.eloL}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Edit open={open} onClose={handleClose} id={id}/>
        </Container>
    );
}
export const Edit = (props) => {
    const { onClose, open ,id} = props;
    const [error1,setError1]=React.useState(false);
    const [msg1,setMsg1]=React.useState(' ');
    const [error2,setError2]=React.useState(false);
    const [msg2,setMsg2]=React.useState(' ');
    const [error3,setError3]=React.useState(false);
    const [msg3,setMsg3]=React.useState(' ');
    const [oldpass,setOld]=React.useState('');
    const [newpass,setNew]=React.useState('');
    const [secondpass,set2nd]=React.useState('');
    const errorHooks={
        one:setError1,
        two:setError2,
        three:setError3,
        msg1:setMsg1,
        msg2:setMsg2,
        msg3:setMsg3
    }
    const handleOldPassChange=(event)=>{
        setOld(event.target.value);
    }
    const handleNewPassChange=(event)=>{
        setNew(event.target.value);
    }
    const handle2ndPassChange=(event)=>{
        set2nd(event.target.value);
    }
    const handleClose = () => {
        onClose();
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        changePassword(oldpass,newpass,secondpass,errorHooks,id,history,onClose)
    };
    const history = useHistory();

    return (
        <Dialog PaperProps={{style: {backgroundColor: '#80ff00'}}} maxWidth='sm' fullWidth onClose={handleClose} open={open}>
            <br/><br/>
            <Grid container direction='column' alignItems='center' spacing={5}>
                <Grid item>
                    <TextField
                        size='small'
                        label="Old Password"
                        variant='outlined'
                        value={oldpass}
                        type="password"
                        error={error1}
                        helperText={msg1}
                        onChange={handleOldPassChange}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        size='small'
                        label="New Password"
                        variant='outlined'
                        value={newpass}
                        type="password"
                        error={error2}
                        helperText={msg2}
                        onChange={handleNewPassChange}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        size='small'
                        label="Confirm New Password"
                        type='password'
                        variant='outlined'
                        value={secondpass}
                        error={error3}
                        helperText={msg3}
                        onChange={handle2ndPassChange}
                    />
                </Grid>
                <Grid item>
                    <Button color='primary' variant="contained" onClick={handleSubmit}>Sign up</Button>
                </Grid>
            </Grid>
            <br/><br/>
        </Dialog>
    );
}