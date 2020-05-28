import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {getReplay} from './requests';
import {useHistory} from "react-router-dom";
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import {postReplay} from './requests';
import { useParams } from "react-router";
import Chessboard from 'reactjs-chessboard'


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


    const { Chess } = require('./chess.js')
    const board=new Chess();
    const[pgn,setPgn]=React.useState('');
    const[position,setPosition]=React.useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    const[moves,setMoves]=React.useState([])
    const[currentMove,setCurrentMove]=React.useState(0);
    const previousMove = (event) => {
        board.undo();
        setPosition(board.fen());
        setCurrentMove(currentMove-1);
    };
    const nextMove = (event) => {
        board.move(moves[currentMove]);
        console.log(moves[currentMove]);
        setPosition(board.fen());
        setCurrentMove(currentMove+1);

    };
    React.useEffect(() => {
        getReplay(setPgn,history,id,board,setMoves,setPosition);
    },[history,id]);
    return (
        <div className={classes.root}>
            <Chessboard
                width={600}
                fen={position}
                style={{
                    border: '2px solid lightgrey',
                }}
            />
            <Button variant="outlined" disabled={currentMove===0} onClick={previousMove}>Previous move</Button>
            <Button variant="outlined" disabled={currentMove===moves.length} onClick={nextMove}>Next move</Button>
            {pgn}
        </div>

    );
}

export const UploadReplay = () => {
    const classes = useStyles();
    const [error,setError]=React.useState(false);
    const [msg,setMsg]=React.useState(' ');
    const [pgn,setPgn]=React.useState('');
    const handleChange=(event)=>{
        setPgn(event.target.value);
    }
    const uploadReplay = (event) => {
        postReplay(pgn,history,setError,setMsg)
    };
    const history = useHistory();

    return (
        <div className={classes.root}>
            Paste text in PGN format, then click Upload.
            <Button variant="outlined" onClick={uploadReplay}>Upload</Button>
            <br/>
            <TextField error={error} helperText={msg} value={pgn} onChange={handleChange} fullWidth rows={15} variant="outlined" multiline />
        </div>
    );
}