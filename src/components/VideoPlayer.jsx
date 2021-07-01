import React, {useContext, useEffect} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Grid, Paper, Typography} from "@material-ui/core"
import { SocketContext } from '../SocketContext';
import * as faceapi from "face-api.js";
//
const useStyles = makeStyles((theme) => ({
    video: {
        width: '550px',

        [theme.breakpoints.down('xs')]: {
            width: '300px',
        },

    },
    canvas:{
        position: 'absolute',
        top: 0,
        left: 0

    },
    gridContainer: {
        justifyContent: 'center',
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
        },
    },
    paper: {
        padding: '10px',
        border: '2px solid black',
        margin: '10px',
        // position: 'relative'
    },
}));
const VideoPlayer = () => {
    const { name, callAccepted, myVideo, userVideo, callEnded, stream, call,myVideoCanvas, userVideoCanvas   } = useContext(SocketContext);
    const classes = useStyles();

    const videoHeight = myVideo?.current?.clientHeight
    const videoWidth = myVideo?.current?.clientWidth
    console.log(myVideo?.current?.clientWidth)

    useEffect(()=>{
        const loadModels = async ()=>{
            console.log('loadModels')
            const model_uri = process.env.PUBLIC_URL+ "/models"

            Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(model_uri),
                faceapi.nets.faceLandmark68Net.loadFromUri(model_uri),
                faceapi.nets.faceRecognitionNet.loadFromUri(model_uri),
                faceapi.nets.faceExpressionNet.loadFromUri(model_uri),
            ]).then()
        }

        loadModels()
    },[])

  const handleMyVideoPlay = () => {
        console.log('handleMyVideoPlay')
      setInterval(async()=>{

          myVideoCanvas.current.innerHTML = faceapi.createCanvasFromMedia(myVideo.current)
          const displaySize = {width: myVideo.current.clientWidth,height: myVideo.current.clientHeight}
          faceapi.matchDimensions(myVideoCanvas.current,displaySize)

          const detections = await faceapi.detectAllFaces(myVideo.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
          const resizeDetections = faceapi.resizeResults(detections,displaySize)
          myVideoCanvas?.current?.getContext('2d').clearRect(0,0,videoHeight,videoWidth)

          faceapi.draw.drawDetections(myVideoCanvas?.current,resizeDetections)
          faceapi.draw.drawFaceLandmarks(myVideoCanvas?.current,resizeDetections)
          faceapi.draw.drawFaceExpressions(myVideoCanvas?.current,resizeDetections)
          // console.log(detections)


      },1000)
  }

  const handleUserVideoPlay = () => {
      console.log('handleUserVideoPlay')
      setInterval(async()=>{
          userVideoCanvas.current.innerHTML = faceapi.createCanvasFromMedia(userVideo.current)
          const displaySize = {width: userVideo.current.clientWidth,height: userVideo.current.clientHeight}
          faceapi.matchDimensions(userVideoCanvas.current,displaySize)

          //
          const detections = await faceapi.detectAllFaces(userVideo.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
          const resizeDetections = faceapi.resizeResults(detections,displaySize)
          userVideoCanvas?.current?.getContext('2d').clearRect(0,0,userVideo.current.clientWidth,userVideo.current.clientHeight)

          //
          faceapi.draw.drawDetections(userVideoCanvas?.current,resizeDetections)
          faceapi.draw.drawFaceLandmarks(userVideoCanvas?.current,resizeDetections)
          faceapi.draw.drawFaceExpressions(userVideoCanvas?.current,resizeDetections)

      },1000)
  }

  //
    return (
        <Grid container className={classes.gridContainer}>
         {stream && (
          <Paper className={classes.paper}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>{name|| "Name"}</Typography>
             <div style={{
                 position: "relative"
             }}>
                 <video playsInline muted ref={myVideo} autoPlay className={classes.video}  onPlay={()=> handleMyVideoPlay()}/>
                 <canvas ref={myVideoCanvas} className={classes.canvas}/>
             </div>
            </Grid>
          </Paper>

         )}
        
        {callAccepted && !callEnded &&(
             <Paper className={classes.paper}>
             <Grid item xs={12} md={6}>
               <Typography variant="h5" gutterBottom>User Name</Typography>
                 <div style={{position: "relative"}}>
                     <video playsInline ref={userVideo} autoPlay className={classes.video} onPlay={()=>handleUserVideoPlay()}/>
                     <canvas ref={userVideoCanvas} className={classes.canvas}/>
                 </div>

             </Grid>
           </Paper>
        )}
         
         
      
      </Grid>
    );
};

export default VideoPlayer  ;
