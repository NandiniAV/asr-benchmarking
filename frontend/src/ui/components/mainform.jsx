import * as React from "react";
import { v1 as uuidv1 } from "uuid";
import { Component } from "react";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import { Typography, Tooltip } from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import Button from "@material-ui/core/Button";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import FetchModel from "../services/fetchModel";
import FetchSentence from "../services/fecthSentence";
import SubmitFeedback from "../services/submitfeedback";
import ExportResults from "../services/exportresults";
import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import GetTranscription from "../services/getTranscription";
import CircularProgress from "./ProgressBar";
import WerCerScore  from "../services/werCerScore";
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import MicIcon from '@material-ui/icons/Mic';
import SettingsVoiceIcon from '@material-ui/icons/SettingsVoice';
import StopIcon from '@material-ui/icons/Stop';
import Snackbar from "./Snackbar";
import { StreamingClient, SocketStatus } from '@project-sunbird/open-speech-streaming-client';

const languages = [
  {
    value: "en",
    label: "English",
  },
  {
    value: "kn",
    label: "Kannada",
  },
  {
    value: "hi",
    label: "Hindi",
  },
  {
    value: "ta",
    label: "Tamil",
  },
];

class Mainform extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: "en",
      rating: 0,
      micOn: true,
      setModel: "",
      modelID: "",
      setSentence: "",
      sessionID: uuidv1(),
      audioUri: "",
      audioContent: "",
      predictedText: "",
      predictedTime: "", 
      wer: "",
      cer: "",
      recordAudio: "",
      base: "",
      loading: false,
      show: false,
      currentCount: 20,
      dialogMessage: null,
      timeOut: 3000,
      variant: "info",
      text: 'Click Start to start speaking..',
      streaming: new StreamingClient(),
      showRT: false,
      start: false,
      disableNC: false,
  };
    // If you want to bind it with the object then add following lines
    this.handleStart = this.handleStart.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.models = []
  }

  timer() {
    this.setState({
      currentCount: this.state.currentCount - 1
    })
    if(this.state.currentCount < 1) { 
      if(this.state.showRT) {
        this.handleStop();
      } else {
        this.onStopClick();
      }
      clearInterval(this.intervalId);
    }
  }

  clearState = () => {
    this.setText('');
    this.setState(
      {
        rating: 0,
        micOn: true,
        sessionID: uuidv1(),
        audioUri: "",
        audioContent: "",
        predictedText: "",
        predictedTime: "",
        wer: "",
        cer: "",
        recordAudio: "",
        base: "",
        show: false,
        loading: false,
        currentCount: 20,
        showRT: false,
        startRT: false,
        disableNC: false,
      },
      () => {
        this.getModel(this.state.lang, "model");
        this.getSentence();
      }
    );
  };

  // for language selection
  handleChange = (event) => {
    this.setState({
      lang: event.target.value,
      audioUri: "",
      audioContent: "",
      base: "",
      recordAudio: "",
      predictedText: "",
      predictedTime: "",
      modelID: "",
      rating: 0,
      currentCount: 20,
      loading: false,
      setModel: this.models.length > 0 ? this.models[0].model_name : '',
    });
    if(this.state.setModel === 'vakyansh') {
      this.setState({ showRT: true, startRT: true });
    } else {
      this.setState({ showRT: false, startRT: false, disableNC: false });
    }
    this.getModel(event.target.value, "model");
    this.getSentence(event.target.value);
  };

  // for model selection
  handleModelChange = (event) => {
    this.models.forEach(item => {
      if(item.model_id === event.target.value) {
        this.setState({
          setModel: item.model_name,
          modelID: item.model_id,
          rating: 0,
        });
        if(item.model_name === 'vakyansh') {
          this.setState({ showRT: true, startRT: true });
        } else {
          this.setState({ showRT: false, startRT: false, disableNC: false });
        }
      }
    });
  };

  componentDidMount() {
    this.getModel("en", "model");
    this.getSentence();
  }

  getModel = (lan, type) => {
    const apiObj = new FetchModel(lan, type);
    fetch(apiObj.apiEndPoint(), {
      method: "POST",
      headers: apiObj.getHeaders().headers,
      body: JSON.stringify(apiObj.getBody()),
    })
      .then(async (res) => {
        const resData = await res.json();
        if (type === "model") {
          this.models = resData.model_info;
          if (this.state.setModel !== '' && this.state.modelID !== '') {
            this.setState({ loading: false});
          } else {
            this.setState({ modelID: this.models[0].model_id, setModel: this.models[0].model_name, loading: false});
          }

          if(this.state.setModel === 'vakyansh') {
            this.setState({ showRT: true, startRT: true });
          } else {
            this.setState({ showRT: false, startRT: false, disableNC: false });
          }
        } else {
          this.setState({
            loading: false,
          });
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  getSentence = (lan) => {
    const apiObj = lan ? new FetchSentence(lan) : new FetchSentence(this.state.lang);
    fetch(apiObj.apiEndPoint(), {
      method: "POST",
      headers: apiObj.getHeaders().headers,
      body: JSON.stringify(apiObj.getBody()),
    })
      .then(async (res) => {
        const resData = await res.json();
        this.setState({
            rating: 0,
            setSentence: resData.generated_text,
            loading: false,
            sessionID: uuidv1(),
            audioUri: '',
            predictedText: '',
            predictedTime: '',
        });
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  // for feedback ratings
  handleRating = (event) => {
    this.setState({ rating: event.target.value });
    // this.updateFeedback(
    //   event.target.value,
    //   this.state.sessionID,
    //   this.state.modelID
    // );
  };

  updateFeedback = () => {
    const apiObj = new SubmitFeedback(this.state.rating, this.state.sessionID, this.state.modelID);
    fetch(apiObj.apiEndPoint(), {
      method: "POST",
      headers: apiObj.getHeaders().headers,
      body: JSON.stringify(apiObj.getBody()),
    })
      .then(async (res) => {
        const resData = await res.json();
        console.log('resData', resData)
        this.setState({ loading: false, showRT: false });
        this.clearState();
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  getWerScrore = async () => {
    const obj = new WerCerScore(this.state.predictedText, this.state.setSentence, 'wer');
    const fetchObj = await fetch(obj.apiEndPoint(), {
      method: "post",
      headers: obj.getHeaders().headers,
      body: JSON.stringify(obj.getBody()),
    });
    if (fetchObj.ok) {
      const result = await fetchObj.json();
      this.setState({ loading: false, wer: result.wer_score,});
      this.getCerScrore()
    }
  }

  getCerScrore = async () => {
    const obj = new WerCerScore(this.state.predictedText, this.state.setSentence, 'cer');
    const fetchObj = await fetch(obj.apiEndPoint(), {
      method: "post",
      headers: obj.getHeaders().headers,
      body: JSON.stringify(obj.getBody()),
    });
    if (fetchObj.ok) {
      const result = await fetchObj.json();
      this.setState({ loading: false, cer: result.cer_score });
      this.setState({ dialogMessage: 'Please provide your feedback' })
      this.submitForm();
    }
  }

  submitForm = () => {
    const apiObj = new ExportResults(
      this.state.lang,
      this.state.sessionID,
      this.state.modelID,
      this.state.setModel,
      // this.state.audioUri,
      this.state.audioContent,
      this.state.predictedText,
      this.state.setSentence,
      this.state.wer,
      this.state.cer,
      this.state.showRT,
    );
    fetch(apiObj.apiEndPoint(), {
      method: "POST",
      headers: apiObj.getHeaders().headers,
      body: JSON.stringify(apiObj.getBody()),
    })
      .then(async (res) => {
        const resData = await res.json();
        console.log('resdata', resData);
        this.setState({ loading: false });
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  blobToBase64 = (blob) => {
    let reader = new FileReader();
    reader.readAsDataURL(blob.blob);
    reader.onloadend = () => {
      let base64data = reader.result;
      if (!this.state.showRT) {
        this.getTranscriptionAPICall(base64data.split("base64,")[1]);
      } else {
        this.setState({ audioContent: base64data.split("base64,")[1] });
        this.setState({ loading: false, startRT: true });
        if (this.state.predictedText) {
          this.getWerScrore()
        }
      }
      this.setState({ base: base64data });
    };
  };

  getTranscriptionAPICall = async (base) => {
    const start = new Date();
    const { modelID, lang, setModel } = this.state;
    this.setState({ audioContent: base });
    const obj = new GetTranscription(lang, base, modelID, setModel);
    const fetchObj = await fetch(obj.apiEndPoint(), {
      method: "post",
      headers: obj.getHeaders().headers,
      body: JSON.stringify(obj.getBody()),
    });
    if (fetchObj.ok) {
      const result = await fetchObj.json();
      const end= new Date();
      const diffInMs = Math.abs(end - start);
      const fsecs =  diffInMs / 1000;
      var secs = 0;
      if (this.state.setModel === 'ola-asr') {
        secs = result.prediction_time ? result.prediction_time : fsecs;
      } else {
        secs = result.prediction_time ? result.prediction_time.split(':')[2] : fsecs;
      }
      const nsecs =  Math.round(secs * 100) / 100
      this.setState({ predictedTime: nsecs, predictedText: result.transcript, loading: true, show: true });
      this.getWerScrore()
    }
  };

  onStopRecording = (data) => {
    if (this.state.showRT) {
      this.setState({ loading: false, startRT: true });
      clearInterval(this.intervalId);
    }
    this.setState({ audioUri: data.url, base: this.blobToBase64(data, this) });
  };

  onMicClick = () => {
    if (this.state.setSentence && !this.state.predictedText) {
      this.intervalId = setInterval(this.timer.bind(this), 1000);
      this.setState({
        micOn: false,
        recordAudio: RecordState.START,
        audioUri: "",
        predictedText: "",
        predictedTime: "",
        showRT: false,
      });
    } 
    // else if (this.state.setSentence && this.state.predictedText) {
    //   // this.intervalId = setInterval(this.timer.bind(this), 1000);
    //   this.setState({
    //     setSentence:'',
    //     rating: 0,
    //     micOn: false,
    //     audioUri: "",
    //     predictedText: "",
    //     wer: "",
    //     cer: "",
    //     recordAudio: RecordState.START,
    //   });
    //   this.getSentence();
    // }
  };

  onStopClick = () => {
    this.setState({
      micOn: true,
      recordAudio: RecordState.STOP,
      loading: true,
      showRT: false,
    });
    clearInterval(this.intervalId);
  };

  setText(text) {
    this.setState({text: text});
  }

  setStatus(text, val) {
    if(text) {
      this.setState({ startRT: false, predictedText: text, show: true })
    } if(val === 'start') {
      this.setState({ startRT: false, recordAudio: RecordState.START })
    }
  }

  // for realtime conversion
  handleStart() {
    this.setState({disableNC: true})
    const streaming = this.state.streaming;
    const language = this.state.lang;
    this.setText('Connecting to server..');
    const _this = this;
    streaming.connect('http://speech-one.eastus.cloudapp.azure.com:9009', language, function (action, id) {
        
        _this.intervalId = setInterval(_this.timer.bind(_this), 1000);
        if (action === SocketStatus.CONNECTED) {
            _this.setStatus('', 'start');
            _this.setText('Connected, Start Speaking..');
            _this.setState({startRT: false})
            streaming.startStreaming(function (transcript) {
                // _this.setText(transcript);
                _this.setText('Transcribing text..');
                _this.setStatus(transcript);
            }, (e) => {
                console.log("I got error", e);
            })
        } else if (action === SocketStatus.TERMINATED) {
            // Socket is closed and punctuation can be done here.
            console.log("Punctuating: ", _this.state.text);
            _this.setState({startRT: true})
            _this.setText('');
            // _this.handlePunctuation(_this.state.text);
        } else {
            console.log("Un expected action", action, id)
        }
    })  
  }

  handleStop() {
    this.setText('');
    console.log('Stopping: ' + this.state.text);
    this.state.streaming.stopStreaming();
    this.setState({ recordAudio: RecordState.STOP });
  }

  snackBarMessage = () => {
    return (
        <div>
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                open={!this.state.timeOut}
                autoHideDuration={this.state.timeOut}
                variant={this.state.variant}
                message={this.state.dialogMessage}
            />
        </div>
    );
  };

  render() {
    return (
        <div>
          <Grid container>
            <Grid item xs>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h4" style={{textAlign:'center', margin: '3% 0'}}>Speech Model Recognition</Typography>
              <Paper style={{ marginBottom: "4%"}}>
                <Box component="form" sx={{  }} noValidate  autoComplete="off" style={this.state.loading ? {pointerEvents: "none", opacity: "0.4"} : {}}>
                  <Card>
                    <CardContent>
                        <Grid style={{ marginTop: "2%", display: "flex"}} >
                           <Grid item xs>
                            <TextField
                              id="outlined-select-currency"
                              select
                              style={{ width: "96%", fontSize:'1.2em'}}
                              value={this.state.lang}
                              label="Select Language"
                              onChange={this.handleChange}
                              >
                              {languages.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                  </MenuItem>
                              ))}
                              </TextField>
                           </Grid>
                           <Grid item xs>
                              <TextField
                                id="outlined-select-currency"
                                select
                                style={{ width: "96%", fontSize:'1.2em', textTransform: 'capitalize' }}
                                value={this.state.modelID}
                                label="Select Model"
                                onChange={this.handleModelChange}
                                >
                                {this.models.map((option) => (
                                    <MenuItem key={option.model_id} value={option.model_id} style={{ textTransform: 'capitalize' }}>
                                    {option.model_name}
                                    </MenuItem>
                                ))}
                                </TextField>
                           </Grid>
                        </Grid>
                        <Grid style={{ marginTop: "5%", marginBottom: "1%", display: "flex", flexDirection: "column"}} >
                            <Typography variant="body1" style={{color: 'rgba(0, 0, 0, 0.54)', marginBottom: '1%' }}>Please read</Typography>
                            <TextareaAutosize aria-label="minimum height"  minRows={5}  placeholder="Loading text...."  
                            style={{ fontFamily: 'Arial', fontSize: '1.5rem', lineHeight: '1.4'}}  value={this.state.setSentence}  disabled  />
                        </Grid>
                        <Grid  style={{ marginTop: "4%", marginBottom: "1%", display: "flex", flexDirection: "column", alignItems: 'center' }} >
                            <Grid style={{ width: '100%', textAlign: 'center'}}>
                                <Grid style={this.state.disableNC ? {display: 'none'}
                                 : {display: 'inline-block', marginRight: '4%'}}>
                                  {this.state.micOn && (
                                    <Tooltip id="tooltip-fab" title="Record Audio">
                                    <IconButton aria-label="Record Audio" onClick={this.onMicClick} 
                                      style={{ background: '#1ea46c', color: '#ffffff', marginRight: '4%'}}> 
                                      <MicIcon style={{fontSize: '3.5rem'}} />
                                    </IconButton>
                                    </Tooltip>
                                  // <img src={startAudio} id="mic_image" onClick={this.onMicClick} alt="MIC"
                                  // style={{ display: "flex",  justifyContent: "center",  marginBottom: "2%",  cursor: 'pointer' }}
                                  // />
                                  )}
                                </Grid>
                                <Grid style={this.state.disableNC ? {pointerEvents: "none", opacity: "0.4", display: 'inline-block'}
                                 :{ display: 'inline-block'}}>
                                  {this.state.showRT && this.state.startRT &&  (
                                    <Tooltip id="tooltip-fab" title="Realtime Conversion">
                                    <IconButton aria-label="Realtime Conversion" onClick={this.handleStart} 
                                      style={{ background: '#1ea46c', color: '#ffffff'}}> 
                                      <SettingsVoiceIcon style={{fontSize: '3.5rem'}} />
                                    </IconButton>
                                    </Tooltip>
                                  )}
                                  </Grid>
                                  <Grid style={{ display: 'inline-block'}}>
                                  {this.state.showRT && !this.state.startRT && (
                                    <IconButton aria-label="Stop RT Audio" onClick={this.handleStop} 
                                    style={{ background: '#F44336', color: '#ffffff'}}> 
                                    <StopIcon style={{fontSize: '3.5rem'}} />
                                    </IconButton>
                                  )}
                                </Grid>
                            </Grid>
                            <Grid style={{ display: "none" }}>
                                <AudioReactRecorder
                                state={this.state.recordAudio}
                                onStop={this.onStopRecording}
                                style={{ display: "none" }}
                                />
                            </Grid>
                            <Grid style={{ marginBottom: "2%", width: '100%', textAlign: 'center'}}>
                                {!this.state.micOn && (
                                <IconButton aria-label="Stop Audio" onClick={this.onStopClick} 
                                  style={{ background: '#F44336', color: '#ffffff', marginRight: '4%'}}> 
                                  <StopIcon style={{fontSize: '3.5rem'}} />
                                </IconButton>
                                // <img src={stopAudio} id="mic_image" onClick={this.onStopClick} alt="STOP"
                                //     style={{  display: "flex", justifyContent: "center", cursor: 'pointer' }}
                                // />
                                )}
                            </Grid>

                            {!this.state.micOn && (
                              <Typography variant="body2" style={{  textAlign: "center",  display: "flex",  justifyContent: "center", marginBottom: "2%"}}>
                              Start speaking. We are recording...
                              </Typography>
                            )}
                            
                            {this.state.showRT && (
                              <p>{this.state.text}</p>
                            )}
                            {this.state.audioUri ? (
                            <audio  controls  src={this.state.audioUri} style={{ marginBottom: "2%" }}
                            ></audio>
                            ) : (
                            <></>
                            )}

                            {this.state.loading ? (
                              <CircularProgress variant="determinate" size={40} thickness={4} token={true} val={1000} eta={2000 * 1000} />
                            ) : (
                              <></>
                            )}
                            {this.state.loading ? (
                              <Typography variant="body2" style={{  textAlign: "center",  display: "flex",  justifyContent: "center", marginBottom: "2%"}}>
                              Text is getting transcribed...
                              </Typography>
                            ) : (
                              <></>
                            )}
                        </Grid>
                        <Grid  style={{ marginTop: "4%", marginBottom: "1%", display: "flex", flexDirection: "column" }} >
                            <Typography variant="body1" style={{color: 'rgba(0, 0, 0, 0.54)', marginBottom: '1%' }}>Transcribed text</Typography>
                            <TextareaAutosize
                            aria-label="minimum height"
                            minRows={5}
                            value={this.state.predictedText}
                            placeholder="Transcribed text here"
                            style={{ fontFamily: 'Arial', fontSize: '1.5rem', lineHeight: '1.4' }}
                            disabled
                            />

                            {this.state.predictedTime ? (
                              <Typography variant="body1" style={{color: 'rgba(0, 0, 0, 0.5)', marginTop: '1%' }}>Transcription time taken: {this.state.predictedTime} secs</Typography>
                              ) : (
                              <></>
                            )}
                            
                        </Grid>
                    </CardContent>
                    <CardActions style={{justifyContent: 'center'}}>
                        {this.state.show ? (
                            <>
                            <Grid style={{ marginBottom: "3%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: 'center'}}>
                                <Rating  name="customized-empty" defaultValue={0}  size="large" emptyIcon={<StarBorderIcon fontSize="inherit" />}  
                                style={{ marginBottom: "6%", fontSize: "4rem" }}
                                onChange={this.handleRating}
                                />

                                <Button id="back" variant="contained" size="large" color="primary" onClick={this.updateFeedback} disabled={this.state.rating === 0} >
                                {" "}  Submit feedback
                                </Button>
                            </Grid>
                            </>
                        ) : (
                            <></>
                        )}
                    </CardActions>
                  </Card>
                  {this.state.dialogMessage && this.snackBarMessage()}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs>
            </Grid>
          </Grid>
      </div>
    );
  }
}

export default Mainform;
