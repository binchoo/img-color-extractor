importScripts("./imageExtraction.js");

addEventListener('message', function(options) {
    var points = self.extractColorFromImage(options.data.imageData, options.data.width, options.data.height, options.data.swatchCount, options.data.colorMood);
    this.postMessage(points);
}, false);

addEventListener('error', function() {
  // error returned here
  this.postMessage("Error");
}, false);
