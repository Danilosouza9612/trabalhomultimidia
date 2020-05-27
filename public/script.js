const videoContainer = document.getElementById("videoContainer")
function loadWebcam(){
    let video = videoContainer

    if(navigator.mediaDevices.getUserMedia){
        navigator.mediaDevices.getUserMedia({ video: true})
            .then(function(stream){
                video.srcObject   = stream;
            })
    }
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(loadWebcam)

videoContainer.addEventListener('play', async () =>{
    const canvas = faceapi.createCanvasFromMedia(videoContainer);
    const canvasSize = {
        width: videoContainer.width,
        height: videoContainer.height
    }
    faceapi.matchDimensions(canvas, canvasSize);
    document.body.append(canvas);
    setInterval(async () => {
        const detections = await faceapi.detectSingleFace(
            videoContainer,
            new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions()
        
        const resizeCanvas = faceapi.resizeResults(detections, canvasSize)
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizeCanvas)
        faceapi.draw.drawFaceLandmarks(canvas, resizeCanvas)
        faceapi.draw.drawFaceExpressions(canvas, resizeCanvas)

    }, 100)
});