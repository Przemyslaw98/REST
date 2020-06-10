import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {getReplay} from './requests';
import {useHistory} from "react-router-dom";
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import {postReplay} from './requests';
import { useParams } from "react-router";
import Chessboard from 'reactjs-chessboard'
import {FirstPage,LastPage,NavigateBefore,NavigateNext,Autorenew} from "@material-ui/icons";
import Grid from "@material-ui/core/Grid";
import { Container } from '@material-ui/core';
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";


const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export const Replay=()=>{
    let {id}=useParams();
    const history = useHistory();
    const classes = useStyles();



    const[pgn,setPgn]=React.useState('');
    const[position,setPosition]=React.useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    const[FENlist,setFENlist]=React.useState([]);
    const[currentMove,setCurrentMove]=React.useState(0);
    const[side,setSide]=React.useState('w');
    const previousMove = (event) => {
        setPosition(FENlist[currentMove-1]);
        setCurrentMove(currentMove-1);

    };
    const nextMove = (event) => {
        setPosition(FENlist[currentMove+1]);
        setCurrentMove(currentMove+1);
    };
    const start = (event) => {
        setPosition(FENlist[0]);
        setCurrentMove(0);
    };
    const end = (event) => {
        setPosition(FENlist[FENlist.length-1]);
        setCurrentMove(FENlist.length-1);
    };
    const flip = (event) => {
        if (side==='w')
            setSide('b');
        else setSide('w');
    };
    React.useEffect(() => {
        getReplay(setPgn,history,id,setFENlist,setPosition);
    },[history,id]);
    return (
        <Container className={classes.root} maxWidth='sm'>
            <Grid container>
                <Grid item xs={12}>
                    <Chessboard
                        blackSquareColour="#306000"
                        whiteSquareColour="ffffff"
                        width={'100%'}
                        orientation={side}
                        fen={position}
                        style={{
                            border: '2px solid green',
                        }}
                    />
                </Grid>
                <Grid item xs>
                    <Button variant="outlined" disabled={currentMove===0} onClick={start} startIcon={<FirstPage/>}/>
                </Grid>
                <Grid item xs>
                    <Button variant="outlined" disabled={currentMove===0} onClick={previousMove} startIcon={<NavigateBefore/>}/>
                </Grid>
                <Grid item xs>
                    <Button variant="outlined" disabled={currentMove===FENlist.length-1} onClick={nextMove} endIcon={<NavigateNext/>}/>
                </Grid>
                <Grid item xs>
                    <Button variant="outlined" disabled={currentMove===FENlist.length-1} onClick={end} endIcon={<LastPage/>}/>
                </Grid>
                <Grid item xs>
                    <Button variant="outlined" onClick={flip} endIcon={<Autorenew/>}/>
                </Grid>
                <br/><br/>
            </Grid>
            <Typography style={{whiteSpace: 'pre-line'}} variant="body1">{pgn}</Typography>
        </Container>

    );
}

export const Upload = (props) => {
    const { onClose, open } = props;
    const [error,setError]=React.useState(false);
    const [msg,setMsg]=React.useState(' ');
    const [pgn,setPgn]=React.useState('');
    const handleChange=(event)=>{
        setPgn(event.target.value);
    }
    const handleClose = () => {
        onClose();
    };
    const uploadReplay = (event) => {
        postReplay(pgn,history,setError,setMsg)
    };
    const history = useHistory();

    return (
        <Dialog PaperProps={{style: {backgroundColor: '#80ff00'}}} maxWidth='md' fullWidth onClose={handleClose} open={open}>
            <br/>
            <Grid container direction='column' alignItems="center">
                <Grid item xs>
                    <Typography>Paste text in PGN format, then click Upload.</Typography>
                </Grid>
                <Grid item xs>
                    <Button color='primary' variant="contained" onClick={uploadReplay}>Upload</Button>
                </Grid>
            </Grid>
            <Grid container alignItems="center">
                <Grid item xs>
                </Grid>
                <Grid item xs={10}>
                    <TextField error={error} helperText={msg} value={pgn} onChange={handleChange} fullWidth rows={15} variant="outlined" multiline />
                </Grid>
                <Grid item xs>
                </Grid>
            </Grid>
        </Dialog>
    );
}