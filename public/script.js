const videoContainer = document.getElementById("videoContainer")
const canvasSize = {
    width: videoContainer.width,
    height: videoContainer.height
};


function loadWebcam(){
    let video = videoContainer

    if(navigator.mediaDevices.getUserMedia){
        navigator.mediaDevices.getUserMedia({ video: true})
            .then(function(stream){
                video.srcObject   = stream;
            })
    }
}

async function captureVideo(){
    let detections;
    let resizeCanvas;
    let arrayDescriptor;
    let canvas = faceapi.createCanvasFromMedia(videoContainer);

    faceapi.matchDimensions(canvas, canvasSize);
    document.body.append(canvas);
    setInterval(async () => {
        detections = await faceapi.detectSingleFace(
            videoContainer,
            new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor()
        
        resizeCanvas = faceapi.resizeResults(detections, canvasSize);
        console.log(resizeCanvas);
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizeCanvas);
        arrayDescriptor = await loadFace();
        
        console.log(faceapi.euclideanDistance(arrayDescriptor, detections.descriptor));
    }, 100)
}

async function loadFace(){
    const image = await faceapi.fetchImage("/db/WIN_20200531_15_28_18_Pro.jpg");
    const detections = await faceapi.detectSingleFace(image)
    .withFaceLandmarks()
    .withFaceDescriptor()

    return detections.descriptor;
}


Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(loadWebcam)

videoContainer.addEventListener('play', captureVideo)