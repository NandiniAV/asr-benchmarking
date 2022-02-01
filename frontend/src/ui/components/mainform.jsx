import * as React from 'react';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import { Typography } from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
// for rating
import { withStyles } from '@material-ui/core/styles';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import startAudio  from '../../assets/mic.png';
import stopAudio  from '../../assets/stop.png';

const StyledRating = withStyles({
    iconFilled: {
      color: '#ff6d75',
    },
    iconHover: {
      color: '#ff3d47',
    },
  })(Rating);

const languages = [
    {
        value: 'en',
        label: 'English',
    },
    {
        value: 'kn',
        label: 'Kannada',
    },
    {
        value: 'hi',
        label: 'Hindi',
    },
]

export default function Mainform() {
  const [currency, setCurrency] = React.useState('EUR');

  const handleChange = (event) => {
    setCurrency(event.target.value);
  };

  return (
    <Grid item xs={12} sm={12} lg={12} xl={12}>
    
    <Box
      component="form"
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #cccc',
      padding: '3% 0', margin: '3%', '& .MuiTextField-root': { m: 1, width: '25ch' },
      }}
      noValidate
      autoComplete="off"
    >
        <Typography value="" variant="h4">Speech Recognition</Typography>
       
        <div style ={{marginTop:'4%', marginBottom: '1%', display: 'flex', width: '32rem', alignItems: 'center', justifyContent: 'center'}}>
            <TextField
            id="outlined-select-currency"
            select style={{width: '20ch', marginRight: '10%'}}
            value={currency} label="Select Language"
            onChange={handleChange}
            >
            {languages.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                {option.label}
                </MenuItem>
            ))}
            </TextField>
            
            <TextareaAutosize  aria-label="minimum height" minRows={3}  placeholder="Read text here"  style={{ width: '90%' }}  />
        </div>
        <div style ={{marginTop:'1.5%', marginBottom: '1%',  display: 'flex', width: '32rem', alignItems: 'center', justifyContent: 'center', 
        border: '1px solid #ccc', flexDirection: 'column', padding: '1.5% 0 2%'}}>
            <div style={{ marginBottom: '6%'}}>
                <img src={startAudio} id="mic_image" onclick="onMicClick()" height="100" width="100" alt="MIC" style={{ zoom: '87%'}} />
                {/* <img src={stopAudio} id="mic_image" onclick="onStopClick()" height="100" width="100" alt="STOP" style={{ zoom: '87%'}} />  */}
            </div>
            <TextareaAutosize  aria-label="minimum height" minRows={5}  placeholder="Transcribed text here"  style={{ width: '95%' }}  />
        </div>

        <div style ={{marginTop:'1%', marginBottom: '1%',  display: 'flex', width: '32rem', alignItems: 'center', justifyContent: 'center'}}>
            <Typography variant="subtitle" style={{ marginRight: '4%', marginTop: '1%'}}>Provide your feedback</Typography>
            <Rating name="customized-empty" defaultValue={1} size="large" emptyIcon={<StarBorderIcon fontSize="inherit"/> }
            style={{ fontSize: '2rem'}} />
        </div>

        <div style ={{marginTop:'1%', marginBottom: '1%',  display: 'flex', width: '32rem', alignItems: 'center', justifyContent: 'center'}}>
            <Button id="back" variant="contained" color="primary" size="small"  style={{
                    width: "150px",  backgroundColor: '#1C9AB7', borderRadius: "5px 5px 5px 5px",
                    color: "#FFFFFF",  height: '46px', marginRight: '5%'
                }}> Record again</Button>
            <Button id="back" variant="contained" color="primary" size="small"  style={{
                width: "135px",  backgroundColor: '#1C9AB7', borderRadius: "5px 5px 5px 5px",
                color: "#FFFFFF",  height: '46px'
            }}> Thank you</Button>
        </div>
    </Box>
    </Grid>
  );
}