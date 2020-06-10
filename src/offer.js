import React from 'react';
import {useHistory} from "react-router-dom";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Dialog from '@material-ui/core/Dialog';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import {postOffer} from "./requests";


export const Upload =(props)=>{
    const timeOptions=[
        {
            value:0,
            label:'None'
        },
        {
            value:1,
            label:'1 minute'
        },
        {
            value:2,
            label:'2 minutes'
        },
        {
            value:3,
            label:'3 minutes'
        },
        {
            value:4,
            label:'4 minutes'
        },
        {
            value:5,
            label:'5 minutes'
        },
        {
            value:6,
            label:'6 minutes'
        },
        {
            value:7,
            label:'7 minutes'
        },
        {
            value:8,
            label:'8 minutes'
        },
        {
            value:9,
            label:'9 minutes'
        },
        {
            value:10,
            label:'10 minutes'
        },
        {
            value:15,
            label:'15 minutes'
        },
        {
            value:30,
            label:'30 minutes'
        },
        {
            value:60,
            label:'60 minutes'
        },
    ];
    const addOptions=[
        {
            value:0,
            label:'0 seconds'
        },
        {
            value:1,
            label:'1 seconds'
        },
        {
            value:2,
            label:'2 seconds'
        },
        {
            value:3,
            label:'3 seconds'
        },
        {
            value:4,
            label:'4 seconds'
        },
        {
            value:5,
            label:'5 seconds'
        },
        {
            value:6,
            label:'6 seconds'
        },
        {
            value:7,
            label:'7 seconds'
        },
        {
            value:8,
            label:'8 seconds'
        },
        {
            value:9,
            label:'9 seconds'
        },
        {
            value:10,
            label:'10 seconds'
        },
        {
            value:15,
            label:'15 seconds'
        },
        {
            value:30,
            label:'30 seconds'
        },
    ]
    const history=useHistory();
    const [time,setTime]=React.useState(0)
    const [add,setAdd]=React.useState(0)
    const [color,setColor]=React.useState('random')
    const { onClose, open } = props;
    const [output,setOutput]=React.useState('');

    const handleClose = () => {
        onClose();
    };
    const handleTimeChange = (event) => {
        setTime(event.target.value);
    };
    const handleColorChange = (event) => {
        setColor(event.target.value);
    };
    const handleAddChange = (event) => {
        setAdd(event.target.value);
    };

    const handleSubmit = () => {
        postOffer(history,setOutput,time*60,add,color);
        onClose();
    };
    return(
        <Dialog PaperProps={{style: {backgroundColor: '#80ff00'}}} maxWidth='sm' fullWidth onClose={handleClose} open={open}>
            <br/>
            <Grid container justify="center" spacing={1}>
                <Grid item>
                    <TextField
                        select
                        label='Time'
                        size='small'
                        variant='outlined'
                        type='number'
                        value={time}
                        onChange={handleTimeChange}
                        style = {{width: 144}}
                    >
                        {timeOptions.map((option)=>(
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item>
                    <TextField
                        select
                        label='Addition per move'
                        size='small'
                        variant='outlined'
                        type='number'
                        value={add}
                        onChange={handleAddChange}
                        style = {{width: 144}}
                    >
                        {addOptions.map((option)=>(
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>
            <Grid container alignItems="center" direction="column">
                <Grid item>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Color:</FormLabel>
                    <RadioGroup value={color} onChange={handleColorChange} row>
                        <FormControlLabel value="black" control={<Radio color='primary'/>} label="Black" />
                        <FormControlLabel value="white" control={<Radio color='primary'/>} label="White" />
                        <FormControlLabel value="random" control={<Radio color='primary'/>} label="Random" />
                    </RadioGroup>
                </FormControl>
                </Grid>
                <Grid item>
                    <Button color='primary' variant="contained" onClick={handleSubmit}>OK</Button>
                    {output}
                </Grid>
            </Grid>
        </Dialog>
    )
}