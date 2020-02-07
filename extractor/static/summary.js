colorExtractionThread = new Worker("/extract.js");

imageCanvas = document.createElement("canvas");

imageCanvasData = imageCanvas.getContext("2d");

var imageAttributes = {
    imageData: imageCanvasData.getImageData(0, 0, l.width, l.height),
    width: imageCanvas.width,
    height: imageCanvas.height,
    swatchCount: 5,
    colorMood: "Colorful"
};

colorExtractionThread.postMessage(imageAttributes)