/* eslint-disable */
var color = {
  hexToString: function (value) {
    var hex = value.toString(16);
    hex = "000000".substr(0, 6 - hex.length) + hex;
    return hex;
  },

  rgbToHsv: function (rgb) {
    var h = 0;
    var r = rgb.r;
    var g = rgb.g;
    var b = rgb.b;
    var min = (r < g && r < b) ? r : (g < b) ? g : b;
    // faster version of Math.min(r, g, b);
    var v = (r > g && r > b) ? r : (g > b) ? g : b;
    // faster version of Math.max(r, g, b)
    var s = (v === 0) ? 0 : (v - min) / v;
    var delta = (s === 0) ? 0.00001 : v - min;
    switch (v) {
      case r:
        h = (g - b) / delta;
        break;
      case g:
        h = 2 + (b - r) / delta;
        break;
      case b:
        h = 4 + (r - g) / delta;
        break;
    }
    return {
      h: (1000 + h / 6) % 1,
      s: s,
      v: v
    };
  },

  hsvToRgb: function (hsv) {
    var h = hsv.h;
    var s = hsv.s;
    var v = hsv.v;
    h = (h + 1000) % 1;
    // keep in positive 0-1 range.
    var r = 0;
    var g = 0;
    var b = 0;
    var i = h * 6 >> 0;
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - s * f);
    var t = v * (1 - s * (1 - f));
    switch (i) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
    }
    return {
      r: r,
      g: g,
      b: b
    };
  },

  rgbToCmyk: function (rgb) {
    var c = 1 - rgb.r;
    var m = 1 - rgb.g;
    var y = 1 - rgb.b;
    var k = (c < m && c < y) ? c : (m < y) ? m : y; // faster version of Math.min(c, m, y);
    if (k === 1) {
      c = m = y = 0;
    } else {
      c = (c - k) / (1 - k);
      m = (m - k) / (1 - k);
      y = (y - k) / (1 - k);
    }
    return {
      c: c,
      m: m,
      y: y,
      k: k
    };
  },

  cmykToRgb: function (cmyk) {
    var k = cmyk.k;
    return {
      r: 1 - (cmyk.c * (1 - k) + k),
      g: 1 - (cmyk.m * (1 - k) + k),
      b: 1 - (cmyk.y * (1 - k) + k)
    };
  },

  rgbToXyz: function (rgb) {
    var r = rgb.r;
    var g = rgb.g;
    var b = rgb.b;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    // GDS: The last multiplier on x & z are to normalize to white, 2 degree D65.
    // GDS: I'm not entirely certain if this should live here or in the lab conversion, or if it is necessary when we use fp10's color correction.
    var x = (0.4124 * r + 0.3576 * g + 0.1805 * b) * 100 / 95.047;
    var y = (0.2126 * r + 0.7152 * g + 0.0722 * b);
    // * 100/100
    var z = (0.0193 * r + 0.1192 * g + 0.9505 * b) * 100 / 108.883;
    return {
      x: x,
      y: y,
      z: z
    };
  },

  xyzToRgb: function (xyz) {
    var x = xyz.x;
    var y = xyz.y;
    var z = xyz.z;
    // multiply by white point, 2 degree D65
    // GDS: I'm not entirely certain if this should live here or in the lab conversion, or if it is necessary when we use fp10's color correction.
    x *= 95.047 / 100;
    //y *= 100/100;
    z *= 108.883 / 100;
    var r = 3.24063 * x - 1.53721 * y - 0.498629 * z;
    var g = -0.968931 * x + 1.87576 * y + 0.0415175 * z;
    var b = 0.0557101 * x - 0.204021 * y + 1.057 * z;
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 0.4167) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 0.4167) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 0.4167) - 0.055 : 12.92 * b;
    return {
      r: r,
      g: g,
      b: b
    };
  },

  rgbToLab: function (rgb) {
    var xyz = this.rgbToXyz(rgb);
    var x = xyz.x;
    var y = xyz.y;
    var z = xyz.z;
    var fx = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 0.1379;
    var fy = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 0.1379;
    var fz = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 0.1379;
    return {
      l: (116 * fy - 16) / 100.00,
      a: (500 * (fx - fy) + 0x80) / 0xFF,
      b: (200 * (fy - fz) + 0x80) / 0xFF
    };
  },

  labToRgb: function (lab) {
    var y = ((lab.l * 100) + 16) / 116;
    var x = y + (lab.a * 0xFF - 0x80) / 500;
    var z = y - (lab.b * 0xFF - 0x80) / 200;
    return this.xyzToRgb({
      x: x > 0.2069 ? x * x * x : 0.1284 * (x - 0.1379),
      y: y > 0.2069 ? y * y * y : 0.1284 * (y - 0.1379),
      z: z > 0.2069 ? z * z * z : 0.1284 * (z - 0.1379)
    });
  },

  // lab = [l, a, b]
  labToLAB: function (lab) {
    var op = [];
    op[0] = lab[0] * 100;
    op[1] = lab[1] * 0xFF - 0x80;
    op[2] = lab[2] * 0xFF - 0x80;
    return op;
  },

  // lab = [L, A, B]
  labToLABInverse: function (lab) {
    var op = [];
    op[0] = lab[0] / 100;
    op[1] = (lab[1] + 0x80) / 0xFF;
    op[2] = (lab[2] + 0x80) / 0xFF;
    return op;
  },

  valuesToRgb: function (mode, values) {
    var rgb, lab, cmyk, hsv;
    switch (mode) {
      case "lab":
        lab = {
          l: values[0],
          a: values[1],
          b: values[2]
        };
        rgb = this.labToRgb(lab);
        break;
      case "rgb":
        rgb = {
          r: values[0],
          g: values[1],
          b: values[2]
        };
        break;
      case "cmyk":
        cmyk = {
          c: values[0],
          m: values[1],
          y: values[2],
          k: values[3]
        };
        rgb = this.cmykToRgb(cmyk);
        break;
      case "hsv":
        hsv = {
          h: values[0],
          s: values[1],
          v: values[2]
        };
        rgb = this.hsvToRgb(hsv);
        break;
    }

    function limit01(val) {
      return val < 0 ? 0 :
        val > 1 ? 1 :
        val;
    }
    rgb = {
      r: limit01(rgb.r),
      g: limit01(rgb.g),
      b: limit01(rgb.b)
    };

    return rgb;
  },

  valuesToHex: function (mode, values) {

    var rgb = this.valuesToRgb(mode, values);

    return this.hexToString((Math.round(rgb.r * 255) << 16 | Math.round(rgb
      .g * 255) << 8 | Math.round(rgb.b * 255)) >>> 0).toUpperCase();
  }

};
var NUM_BINS_H = 64;
var NUM_BINS_S = 64;
var NUM_BINS_V = 10;
var HISTOGRAM_SIZE = NUM_BINS_H * NUM_BINS_S * NUM_BINS_V;

function emptyArray(length) {
  if (self.Float64Array) {
    return new Float64Array(length);
  }
  var array = new Array(length);
  while (--length >= 0) {
    array[length] = 0;
  }
  return array;
}

function copyArray(length, oldArray) {
  if (self.Float64Array) {
    var copy = new Float64Array(length);
    copy.set(oldArray);
    return copy;
  }
  var array = new Array(length);
  for (var i = 0; i < length; i++) {
    array[i] = oldArray[i];
  }
  return array;
}

function copyHistogram(oldHistogram) {
  return copyArray(HISTOGRAM_SIZE, oldHistogram);
}

function getPixel(bitmapData, x, y) {
  var i = (x + y * bitmapData._width) * 4;
  return {
    r: bitmapData._data.data[i],
    g: bitmapData._data.data[i + 1],
    b: bitmapData._data.data[i + 2],
    a: bitmapData._data.data[i + 3]
  };
}


/**************************************************************************************/
//  Class ImageHarmonyMath
/**************************************************************************************/
function ImageHarmonyMath() {

}

ImageHarmonyMath.weight = function (hue, saturation, value, colorfulnessEnhancement, shadowHighlightSuppression) {
  var minWeight = 0.001;
  var weightNew = ImageHarmonyMath.suppression(ImageHarmonyMath.colorfulness(hue, saturation, value), colorfulnessEnhancement) *
    ImageHarmonyMath.suppression(value, shadowHighlightSuppression) *
    ImageHarmonyMath.tripleCubicSigmoid(saturation, 0.0, 30.0) * ImageHarmonyMath.tripleCubicSigmoid(value, 0.0, 30.0);
  return (weightNew < minWeight) ? minWeight : weightNew;
};


ImageHarmonyMath.colorfulness = function (hue, saturation, value) {
  var lab = color.rgbToLab(color.hsvToRgb({
    h: hue / 255,
    s: saturation / 255,
    v: value / 255
  }));
  var a = lab.a * 2.0 - 1.0;
  var b = lab.b * 2.0 - 1.0;

  return 255.0 * Math.sqrt(0.5 * (a * a + b * b));
};


ImageHarmonyMath.tripleCubicSigmoid = function (x, x1, x2) {
  var range = x2 - x1;
  return (range > 0.0) ? ImageHarmonyMath.cubicSigmoid((x - x1) / range) : 1.0;
};


ImageHarmonyMath.suppression = function (value, amount) {
  if (amount < 0.0) {
    amount *= -1.0;
    value = 255.0 - value;
  }
  var s = value / 255.0;

  // 0 to 1 for saturationEnhancement between 0 and 0.5
  var f = (amount < 0.5) ? 2.0 * amount : 1.0;

  // 0 to 1 for saturationEnhancement between 0.5 and 1
  var g = (amount < 0.5) ? 0 : 2.0 * amount - 1.0;

  return Math.pow(f * ImageHarmonyMath.cubicSigmoid(s) + (1.0 - f), 1.0 + g * 3.0);
};


ImageHarmonyMath.cubicSigmoid = function (x) {
  if (x < 0.0) {
    return 0.0;
  }
  if (x > 1.0) {
    return 1.0;
  }
  var y = 2.0 * x - 1.0;
  return 0.5 * (1.0 + y * (1.5 - 0.5 * y * y));
};

var hsv, lab;
ImageHarmonyMath.hsvToLab = function (p) {
  hsv = p.hsv;
  p.rgb = color.hsvToRgb({
    h: hsv.h,
    s: hsv.s,
    v: hsv.v
  });
  lab = color.rgbToLab(p.rgb);
  lab.l *= 255;
  lab.a *= 255;
  lab.b *= 255;
  p.gregLab = lab;
};

var l1, a1, b1, l2, a2, b2;
ImageHarmonyMath.weightedDistanceLab = function (p1, p2, gBB, gSS) {
  if (!p1.gregLab) {
    ImageHarmonyMath.hsvToLab(p1);
  }
  if (!p2.gregLab) {
    ImageHarmonyMath.hsvToLab(p2);
  }
  l1 = p1.gregLab.l;
  l2 = p2.gregLab.l;
  a1 = p1.gregLab.a;
  a2 = p2.gregLab.a;
  b1 = p1.gregLab.b;
  b2 = p2.gregLab.b;
  var dL = l1 - l2;
  var da = a1 - a2;
  var db = b1 - b2;

  var s1 = Math.sqrt(a1 * a1 + b1 * b1);
  var s2 = Math.sqrt(a2 * a2 + b2 * b2);
  var s12 = (s1 - s2);
  var dSaturation2 = s12 * s12;
  var dHue2 = da * da + db * db - dSaturation2;

  return Math.sqrt(gBB * dL * dL + gSS * dSaturation2 + dHue2);
};

/**************************************************************************************/


/**************************************************************************************/
//  Class BitmapData
/**************************************************************************************/
function BitmapData(imageData, width, height) {
  this._data = imageData;
  this._width = width;
  this._height = height;
}


/**************************************************************************************/

//TODO: Not correct!
var epsilon = 1.0e-10,
  hardCoreEnergy, d;
var practicallyInfiniteEnergy = 1.79769e+305; //Math.pow(2,64)/1000.0;
function intersectionEnergy(p1, p2, hardCoreInteractionRadius, colorRepulsion, gBB, gSS) {
  if (p1.density < epsilon || p2.density < epsilon) {
    return practicallyInfiniteEnergy;
  }

  d = ImageHarmonyMath.weightedDistanceLab(p1.color, p2.color, gBB, gSS);

  hardCoreEnergy = (d < hardCoreInteractionRadius) ? practicallyInfiniteEnergy : 0;

  // GDS: always uses the "kLoose" harmony mode, because nothing else was ever used in the original Kuler version.
  // A hard core repulsion to keep points farther away than fHardCoreInteractionRadius
  // and a Coulomb repulsion outside
  return (d < hardCoreInteractionRadius) ? hardCoreEnergy * (1.0 - d / hardCoreInteractionRadius) : colorRepulsion * (1.0 / d - 1.0 / hardCoreInteractionRadius);
}

/**************************************************************************************/
//  Class HarmonyPoint
/**************************************************************************************/

function HarmonyPoint(color, density) {
  this.color = color;
  this.density = density;
}

HarmonyPoint.harmonyPointsSort = function (hp1, hp2) {
  var hsv1 = hp1.color.hsv;
  var hsv2 = hp2.color.hsv;
  if (hsv1.h > hsv2.h) {
    return -1;
  } else if (hsv1.h < hsv2.h) {
    return 1;
  } else if (hsv1.s > hsv2.s) {
    return -1;
  } else if (hsv1.s < hsv2.s) {
    return 1;
  } else if (hsv1.v > hsv2.v) {
    return -1;
  } else if (hsv1.v < hsv2.v) {
    return 1;
  }
  return 0;
};


/**************************************************************************************/


/**************************************************************************************/
//  Class ColorStyle
/**************************************************************************************/
function ColorStyle(mood) {

  var colorfulnessEnhancement, shadowHighlightSuppression;
  switch (mood.toLowerCase()) {
    case "bright":
      colorfulnessEnhancement = 0.88;
      shadowHighlightSuppression = 0.75;
      break;

    case "dark":
      colorfulnessEnhancement = -0.8;
      shadowHighlightSuppression = -0.8;
      break;

    case "muted":
      colorfulnessEnhancement = -0.8;
      shadowHighlightSuppression = 0.6;
      break;

    case "deep":
      colorfulnessEnhancement = 0.6;
      shadowHighlightSuppression = -0.7;
      break;

    case "colorful":
      colorfulnessEnhancement = 0.5;
      shadowHighlightSuppression = 0;
      break;

    case "blank":
      colorfulnessEnhancement = 0;
      shadowHighlightSuppression = 0;
      break;

    default:
      colorfulnessEnhancement = 0.5;
      shadowHighlightSuppression = 0;
  }


  //Assign Values:
  this.gHH = 1.0;
  this.gSS = 0.23;
  this.gBB = 0.04;
  this.colorRepulsion = 2.5;
  this.hardCoreInteractionRadius = 4.0;
  this.saturationScaleFactor = 1.0;
  this.style = mood;
  this.colorfulnessEnhancement = colorfulnessEnhancement;
  this.shadowHighlightSuppression = shadowHighlightSuppression;

}




/**************************************************************************************/


/**************************************************************************************/
//  Class ImageHarmony
/**************************************************************************************/
function ImageHarmony() {

  this._colors = [];
  this.points = [];

  this.finalColor = [];
  this._numColors = null;
  this._xMultiplier = 1;
  this._yMultiplier = 1;
  this._xOffset = 0;
  this._yOffset = 0;

  this._harmonyPoints = [];

}


ImageHarmony.prototype.extractColors = function (bitmapData, colorStyle, numColors) {
  this._bitmapData = bitmapData;
  this._colorStyle = colorStyle;
  this._numColors = numColors;

  this.synchronousExtract();

};

ImageHarmony.prototype.synchronousExtract = function () {
  this.clearHistogram();
  this.generateHistogram();
  this.weightAndNormalizeHistogram();
  this.findBestColors();
  this.findBestPoints();
};

ImageHarmony.prototype.clearHistogram = function () {
  this._histogram = emptyArray(HISTOGRAM_SIZE);
};


ImageHarmony.prototype.generateHistogram = function () {

  // Required Arguments.
  var bitmapData = this._bitmapData,
    _yOffset = this._yOffset,
    _xOffset = this._xOffset,
    _yMultiplier = this._yMultiplier,
    _xMultiplier = this._xMultiplier,

    nh = NUM_BINS_H,
    ns = NUM_BINS_S,
    nv = NUM_BINS_V,
    ch = 255.0 / 256.0 * nh,
    cs = 255.0 / 256.0 * ns,
    cv = 255.0 / 256.0 * nv,

    width = this._bitmapData._width,
    height = this._bitmapData._height,

    histogram = this._histogram || emptyArray(HISTOGRAM_SIZE),

    h, s, v, hsv, x, y, rgb;

  for (y = _yOffset; y < height; y += _yMultiplier) {
    for (x = _xOffset; x < width; x += _xMultiplier) {
      rgb = getPixel(bitmapData, x, y);
      rgb.r /= 255;
      rgb.g /= 255;
      rgb.b /= 255;

      hsv = color.rgbToHsv(rgb);

      h = ~~(hsv.h * ch);
      s = ~~(hsv.s * cs);
      v = ~~(hsv.v * cv);

      histogram[((h * NUM_BINS_S + s) * NUM_BINS_V + v)]++;
    }
  }

  this._histogram = histogram;
};

ImageHarmony.prototype.weightAndNormalizeHistogram = function () {

  var _numColors = this._numColors;
  var result = this.weightAndNormalize();
  //harmony = result.harmony;
  var volume = result.volume; //Volume is req to validate/determine _numcolors


  //TODO: Verify this case.
  if (volume < _numColors) {
    this._colorStyle = new ColorStyle("Blank");
    volume = this.weightAndNormalize();
    this._numColors = Math.min(volume, _numColors); // Reducing Number of colors as impossible to find.
  }

};


ImageHarmony.prototype.weightAndNormalize = function () {
  // Required Arguments.
  var colorfulnessEnhancement = this._colorStyle.colorfulnessEnhancement;
  var shadowHighlightSuppression = this._colorStyle.shadowHighlightSuppression;


  // Code
  var histogram = copyHistogram(this._histogram);

  var maxDensity = 0;
  var density;


  var nh = NUM_BINS_H;
  var ns = NUM_BINS_S;
  var nv = NUM_BINS_V;

  var h, s, v, hue, saturation, value;
  // GDS: equivalent to ImageData.weightDensities
  for (h = 0; h < nh; h++) {
    hue = ~~((h * 256 + nh / 2) / nh); // GDS: this math looks wrong to me.
    if (hue > 255) {
      hue = 255;
    }

    for (s = 0; s < ns; s++) {
      saturation = ~~((s * 256 + ns / 2) / ns); // GDS: this math looks wrong to me.
      if (saturation > 255) {
        saturation = 255;
      }

      for (v = 0; v < nv; v++) {

        if (histogram[((h * NUM_BINS_S + s) * NUM_BINS_V + v)] === 0) {
          continue;
        }

        value = ~~(((v + 0.5) * 256) / nv); // GDS: this also looks a little off.
        density = histogram[((h * NUM_BINS_S + s) * NUM_BINS_V + v)] *= ImageHarmonyMath.weight(hue, saturation, value, colorfulnessEnhancement, shadowHighlightSuppression);

        if (density > maxDensity) {
          maxDensity = density;
        }
      }
    }
  }

  var smallestAllowedDensity = 0.01;
  var maxLogDensity = (maxDensity > smallestAllowedDensity) ? Math.log(maxDensity / smallestAllowedDensity) : 0;

  // GDS: equivalent to fHSBHistogram.NormalizeLogDensities & fHSBHistogram.ColorVolume()
  var volume = 0,
    location, logDensity;
  if (maxLogDensity > 0) {
    for (h = 0; h < nh; h++) {
      for (s = 0; s < ns; s++) {
        for (v = 0; v < nv; v++) {
          location = ((h * NUM_BINS_S + s) * NUM_BINS_V + v);
          if (histogram[location] === 0) {
            continue;
          }
          density = histogram[location];
          logDensity = (density > smallestAllowedDensity) ? Math.log(density / smallestAllowedDensity) / maxLogDensity : 0;
          if (logDensity !== 0) {
            volume++;
          }
          histogram[location] = logDensity;
        }
      }
    }
  }

  this._weightedHistogram = histogram;

  return {
    volume: volume
  };
};




ImageHarmony.prototype.findBestColors = function () {

  // Required Arguments.
  var _colorStyle = this._colorStyle;
  var _numColors = this._numColors;


  //Code
  var histogram = this._weightedHistogram;

  var nh = NUM_BINS_H;
  var ns = NUM_BINS_S;
  var nv = NUM_BINS_V;
  var h, s, v, hue, saturation, value, color;

  // GDS: equivalent to ImageData.FindMinimumEnergyHarmonyPoints
  var harmonyPoints = [];

  // GDS: equivalent to HSBHistogram.ConvertToLabHarmonyPoints
  for (h = 0; h < nh; h++) {
    // GDS: I think this is innacurate, but mirrors what the unoptimized code did:
    // GDS: I think this is more accurate: ((h * 256 + (numHueBins/2)) / numHueBins)  *1.411;
    // ~~ is faster than Math.floor as it does not involve a function call.
    hue = ~~((~~((h * 256 + (nh / 2)) / nh)) * 1.411);
    for (s = 0; s < ns; s++) {
      saturation = ~~(((s * 256 + (ns / 2)) / ns) * 0.392);
      if (saturation > 100) {
        saturation = 100;
      }
      for (v = 0; v < nv; v++) {
        if (histogram[((h * NUM_BINS_S + s) * NUM_BINS_V + v)] === 0) {
          continue;
        }

        value = ~~(((v + 0.5) * 256) / nv * 0.392);

        //TODO: Verify. NOT SURE!!
        color = {
          hsv: {
            h: hue / 360,
            s: saturation / 100,
            v: value / 100
          }
        };

        harmonyPoints.push(new HarmonyPoint(color, histogram[((h * NUM_BINS_S + s) * NUM_BINS_V + v)]));

      }
    }
  }

  // Add one harmony point at a time
  // Each time, we add the one which contributes the least energy to the system
  var hardCoreInteractionRadius = _colorStyle.hardCoreInteractionRadius;
  var colorRepulsion = _colorStyle.colorRepulsion;

  var gBB = _colorStyle.gBB;
  var gSS = _colorStyle.gSS;
  var bestHarmonyPoints = [],
    a, i, j, smallestEnergyAddition, energy, bestHarmonyPoint;
  for (a = 0; a < _numColors; a++) {

    //TODO: Needs Review.
    smallestEnergyAddition = Math.pow(10, 100); //Math.pow(2,63) - 1;

    for (i = 0; i < harmonyPoints.length; i++) {
      energy = 1.0 - harmonyPoints[i].density;

      for (j = 0; j < bestHarmonyPoints.length; j++) {
        energy += intersectionEnergy(harmonyPoints[i], bestHarmonyPoints[j], hardCoreInteractionRadius, colorRepulsion, gBB, gSS);

      }

      if (energy < smallestEnergyAddition) {
        smallestEnergyAddition = energy;
        bestHarmonyPoint = harmonyPoints[i];
      }
    }
    bestHarmonyPoints.push(bestHarmonyPoint);
  }

  this._harmonyPoints = bestHarmonyPoints;
};


ImageHarmony.prototype.findBestPoints = function () {
  var harmonyPoints = this._harmonyPoints;

  harmonyPoints.sort(HarmonyPoint.harmonyPointsSort);

  for (var i = 0; i < harmonyPoints.length; i++) {
    this._colors.push(harmonyPoints[i].color);
    this.points.push(this.findPixel(this._colors[i]));
  }
  this.finalColor = this._colors;
};


ImageHarmony.prototype.findPixel = function (color) {

  var bitmapData = this._bitmapData;
  var width = this._bitmapData._width;
  var height = this._bitmapData._height;

  var cr = color.rgb.r * 255;
  var cg = color.rgb.g * 255;
  var cb = color.rgb.b * 255;

  //TODO: Needs Review.
  var smallestDistance = 1.79769e+305; //Math.pow(2,31) - 1;
  var escapeDistance = 12; // (2^2)*3
  var rx = 0;
  var ry = 0;
  var done_xloop = false;

  for (var y = 0; !done_xloop && y < height; y++) {
    for (var x = 0; !done_xloop && x < width; x++) {
      //TODO: Verify:
      var rgb = getPixel(bitmapData, x, y);
      var r = rgb.r - cr;
      var g = rgb.g - cg;
      var b = rgb.b - cb;
      var d = r * r + g * g + b * b;

      if (d < smallestDistance) {
        rx = x;
        ry = y;
        smallestDistance = d;
        if (d <= escapeDistance) {
          done_xloop = true;
        }
      }
    }
  }
  return {
    x: rx,
    y: ry
  };

};


/**************************************************************************************/
function extractColorFromImage(imageData, width, height, count, mood) {
  var harmony = new ImageHarmony();
  var bitmapData = new BitmapData(imageData, width, height);
  var colorStyle = new ColorStyle(mood);
  harmony.extractColors(bitmapData, colorStyle, count);
  return {
    finalColor: harmony.finalColor,
    points: harmony.points
  };
};


function findPixels(imageData, colors) {
  var harmony = new ImageHarmony();
  harmony._bitmapData = new BitmapData(imageData, imageData.width, imageData.height);
  var pixels = [];
  colors.forEach(function (color) {
    pixels.push(harmony.findPixel(color));
  });
  return pixels;
};