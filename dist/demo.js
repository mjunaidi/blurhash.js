/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var decode_1 = __webpack_require__(1);
function render() {
    var blurhash = document.getElementById('blurhash').value;
    var pixels = decode_1.default(blurhash, 32, 32);
    if (pixels) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext('2d');
        var imageData = new ImageData(pixels, 32, 32);
        ctx.putImageData(imageData, 0, 0);
    }
}
document.getElementById('blurhash').addEventListener('keyup', render);
render();


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var base83_1 = __webpack_require__(2);
var utils_1 = __webpack_require__(3);
var decodeDC = function (value) {
    var intR = value >> 16;
    var intG = (value >> 8) & 255;
    var intB = value & 255;
    return [utils_1.sRGBToLinear(intR), utils_1.sRGBToLinear(intG), utils_1.sRGBToLinear(intB)];
};
var decodeAC = function (value, maximumValue) {
    var quantR = Math.floor(value / (19 * 19));
    var quantG = Math.floor(value / 19) % 19;
    var quantB = value % 19;
    var rgb = [
        utils_1.signPow((quantR - 9) / 9, 2.0) * maximumValue,
        utils_1.signPow((quantG - 9) / 9, 2.0) * maximumValue,
        utils_1.signPow((quantB - 9) / 9, 2.0) * maximumValue,
    ];
    return rgb;
};
var decode = function (blurhash, width, height, punch) {
    punch = punch | 1;
    if (blurhash.length < 6) {
        console.error('too short blurhash');
        return null;
    }
    var sizeFlag = base83_1.decode83(blurhash[0]);
    var numY = Math.floor(sizeFlag / 9) + 1;
    var numX = (sizeFlag % 9) + 1;
    var quantisedMaximumValue = base83_1.decode83(blurhash[1]);
    var maximumValue = (quantisedMaximumValue + 1) / 166;
    if (blurhash.length !== 4 + 2 * numX * numY) {
        console.error('blurhash length mismatch', blurhash.length, 4 + 2 * numX * numY);
        return null;
    }
    var colors = new Array(numX * numY);
    for (var i = 0; i < colors.length; i++) {
        if (i === 0) {
            var value = base83_1.decode83(blurhash.substring(2, 6));
            colors[i] = decodeDC(value);
        }
        else {
            var value = base83_1.decode83(blurhash.substring(4 + i * 2, 6 + i * 2));
            colors[i] = decodeAC(value, maximumValue * punch);
        }
    }
    var bytesPerRow = width * 4;
    var pixels = new Uint8ClampedArray(bytesPerRow * height);
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var r = 0;
            var g = 0;
            var b = 0;
            for (var j = 0; j < numY; j++) {
                for (var i = 0; i < numX; i++) {
                    var basis = Math.cos(Math.PI * x * i / width) * Math.cos(Math.PI * y * j / height);
                    var color = colors[i + j * numX];
                    r += color[0] * basis;
                    g += color[1] * basis;
                    b += color[2] * basis;
                }
            }
            var intR = utils_1.linearTosRGB(r);
            var intG = utils_1.linearTosRGB(g);
            var intB = utils_1.linearTosRGB(b);
            pixels[4 * x + 0 + y * bytesPerRow] = intR;
            pixels[4 * x + 1 + y * bytesPerRow] = intG;
            pixels[4 * x + 2 + y * bytesPerRow] = intB;
            pixels[4 * x + 3 + y * bytesPerRow] = 255; // alpha
        }
    }
    return pixels;
};
exports.default = decode;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var digitCharacters = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
    "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d",
    "e", "f", "g", "h", "i", "j", "k", "l", "m", "n",
    "o", "p", "q", "r", "s", "t", "u", "v", "w", "x",
    "y", "z", "#", "$", "%", "*", "+", ",", "-", ".",
    ":", ";", "=", "?", "@", "[", "]", "^", "_", "{",
    "|", "}", "~",
];
exports.decode83 = function (str) {
    var value = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str[i];
        var digit = digitCharacters.indexOf(c);
        value = value * 83 + digit;
    }
    return value;
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.sRGBToLinear = function (value) {
    var v = value / 255;
    if (v <= 0.04045) {
        return v / 12.92;
    }
    else {
        return Math.pow((v + 0.055) / 1.055, 2.4);
    }
};
exports.linearTosRGB = function (value) {
    var v = Math.max(0, Math.min(1, value));
    if (v <= 0.0031308) {
        return Math.round(v * 12.92 * 255 + 0.5);
    }
    else {
        return Math.round((1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255 + 0.5);
    }
};
exports.sign = function (n) { return (n < 0 ? -1 : 1); };
exports.signPow = function (val, exp) { return exports.sign(val) * Math.pow(Math.abs(val), exp); };


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYWZlNjE3NDY1OGNmYzg4MjU5ZmYiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RlbW8udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RlY29kZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvYmFzZTgzLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7QUM3REEsc0NBQThCO0FBRTlCO0lBQ0ksSUFBTSxRQUFRLEdBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQXNCLENBQUMsS0FBSyxDQUFDO0lBQ2pGLElBQU0sTUFBTSxHQUFHLGdCQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4QyxFQUFFLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNSLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFzQixDQUFDO1FBQ3RFLElBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFcEMsSUFBTSxTQUFTLEdBQUcsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMs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QyxHQUFHLElBQUksQ0FBQztZQUMzQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUMzQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUMzQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVE7UUFDckQsQ0FBQztJQUNILENBQUM7SUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUMsQ0FBQztBQUVGLGtCQUFlLE1BQU0sQ0FBQzs7Ozs7Ozs7OztBQ3ZGdEIsSUFBTSxlQUFlLEdBQUc7SUFDdkIsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztJQUNoRCxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO0lBQ2hELEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7SUFDaEQsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztJQUNoRCxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO0lBQ2hELEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7SUFDaEQsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztJQUNoRCxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO0lBQ2hELEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztDQUNiO0FBRVksZ0JBQVEsR0FBRyxVQUFDLEdBQVc7SUFDaEMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsR0FBRyxFQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQzdCLElBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixJQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLEtBQUssR0FBRyxLQUFLLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQztJQUMvQixDQUFDO0lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNqQixDQUFDOzs7Ozs7Ozs7O0FDcEJZLG9CQUFZLEdBQUcsVUFBQyxLQUFhO0lBQ3hDLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7SUFDcEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDbkIsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzVDLENBQUM7QUFDSCxDQUFDLENBQUM7QUFFVyxvQkFBWSxHQUFHLFVBQUMsS0FBYTtJQUN4QyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDeEUsQ0FBQztBQUNILENBQUMsQ0FBQztBQUVXLFlBQUksR0FBRyxVQUFDLENBQVMsSUFBSyxRQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQztBQUV2QyxlQUFPLEdBQUcsVUFBQyxHQUFXLEVBQUUsR0FBVyxJQUFLLG1CQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUF4QyxDQUF3QyxDQUFDIiwiZmlsZSI6ImRlbW8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBhZmU2MTc0NjU4Y2ZjODgyNTlmZiIsImltcG9ydCBkZWNvZGUgZnJvbSAnLi9kZWNvZGUnO1xuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgY29uc3QgYmx1cmhhc2ggPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JsdXJoYXNoJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWU7XG4gICAgY29uc3QgcGl4ZWxzID0gZGVjb2RlKGJsdXJoYXNoLCAzMiwgMzIpO1xuICAgIGlmKHBpeGVscykge1xuICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpbWFnZURhdGEgPSBuZXcgSW1hZ2VEYXRhKHBpeGVscywgMzIsIDMyKTtcbiAgICAgICAgY3R4LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuICAgIH1cbn1cblxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JsdXJoYXNoJykuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCByZW5kZXIpO1xucmVuZGVyKCk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2RlbW8udHMiLCJpbXBvcnQgeyBkZWNvZGU4MyB9IGZyb20gJy4vYmFzZTgzJztcbmltcG9ydCB7IHNSR0JUb0xpbmVhciwgc2lnblBvdywgbGluZWFyVG9zUkdCIH0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IGRlY29kZURDID0gKHZhbHVlOiBudW1iZXIpID0+IHtcbiAgY29uc3QgaW50UiA9IHZhbHVlID4+IDE2O1xuICBjb25zdCBpbnRHID0gKHZhbHVlID4+IDgpICYgMjU1O1xuICBjb25zdCBpbnRCID0gdmFsdWUgJiAyNTU7XG4gIHJldHVybiBbc1JHQlRvTGluZWFyKGludFIpLCBzUkdCVG9MaW5lYXIoaW50RyksIHNSR0JUb0xpbmVhcihpbnRCKV07XG59O1xuXG5jb25zdCBkZWNvZGVBQyA9ICh2YWx1ZTogbnVtYmVyLCBtYXhpbXVtVmFsdWU6IG51bWJlcikgPT4ge1xuICBjb25zdCBxdWFudFIgPSBNYXRoLmZsb29yKHZhbHVlIC8gKDE5ICogMTkpKTtcbiAgY29uc3QgcXVhbnRHID0gTWF0aC5mbG9vcih2YWx1ZSAvIDE5KSAlIDE5O1xuICBjb25zdCBxdWFudEIgPSB2YWx1ZSAlIDE5O1xuXG4gIGNvbnN0IHJnYiA9IFtcbiAgICBzaWduUG93KChxdWFudFIgLSA5KSAvIDksIDIuMCkgKiBtYXhpbXVtVmFsdWUsXG4gICAgc2lnblBvdygocXVhbnRHIC0gOSkgLyA5LCAyLjApICogbWF4aW11bVZhbHVlLFxuICAgIHNpZ25Qb3coKHF1YW50QiAtIDkpIC8gOSwgMi4wKSAqIG1heGltdW1WYWx1ZSxcbiAgXTtcblxuICByZXR1cm4gcmdiO1xufTtcblxuY29uc3QgZGVjb2RlID0gKGJsdXJoYXNoOiBzdHJpbmcsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBwdW5jaD86IG51bWJlcikgPT4ge1xuICBwdW5jaCA9IHB1bmNoIHwgMTtcblxuICBpZiAoYmx1cmhhc2gubGVuZ3RoIDwgNikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3RvbyBzaG9ydCBibHVyaGFzaCcpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3Qgc2l6ZUZsYWcgPSBkZWNvZGU4MyhibHVyaGFzaFswXSk7XG4gIGNvbnN0IG51bVkgPSBNYXRoLmZsb29yKHNpemVGbGFnIC8gOSkgKyAxO1xuICBjb25zdCBudW1YID0gKHNpemVGbGFnICUgOSkgKyAxO1xuXG4gIGNvbnN0IHF1YW50aXNlZE1heGltdW1WYWx1ZSA9IGRlY29kZTgzKGJsdXJoYXNoWzFdKTtcbiAgY29uc3QgbWF4aW11bVZhbHVlID0gKHF1YW50aXNlZE1heGltdW1WYWx1ZSArIDEpIC8gMTY2O1xuXG4gIGlmIChibHVyaGFzaC5sZW5ndGggIT09IDQgKyAyICogbnVtWCAqIG51bVkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdibHVyaGFzaCBsZW5ndGggbWlzbWF0Y2gnLCBibHVyaGFzaC5sZW5ndGgsIDQgKyAyICogbnVtWCAqIG51bVkpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgY29sb3JzID0gbmV3IEFycmF5KG51bVggKiBudW1ZKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xvcnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgY29uc3QgdmFsdWUgPSBkZWNvZGU4MyhibHVyaGFzaC5zdWJzdHJpbmcoMiwgNikpO1xuICAgICAgY29sb3JzW2ldID0gZGVjb2RlREModmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGRlY29kZTgzKGJsdXJoYXNoLnN1YnN0cmluZyg0ICsgaSAqIDIsIDYgKyBpICogMikpO1xuICAgICAgY29sb3JzW2ldID0gZGVjb2RlQUModmFsdWUsIG1heGltdW1WYWx1ZSAqIHB1bmNoKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBieXRlc1BlclJvdyA9IHdpZHRoICogNDtcbiAgY29uc3QgcGl4ZWxzID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGJ5dGVzUGVyUm93ICogaGVpZ2h0KTtcblxuICBmb3IgKGxldCB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICBsZXQgciA9IDA7XG4gICAgICBsZXQgZyA9IDA7XG4gICAgICBsZXQgYiA9IDA7XG5cbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbnVtWTsgaisrKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtWDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgYmFzaXMgPSBNYXRoLmNvcyhNYXRoLlBJICogeCAqIGkgLyB3aWR0aCkgKiBNYXRoLmNvcyhNYXRoLlBJICogeSAqIGogLyBoZWlnaHQpO1xuICAgICAgICAgIGxldCBjb2xvciA9IGNvbG9yc1tpICsgaiAqIG51bVhdO1xuICAgICAgICAgIHIgKz0gY29sb3JbMF0gKiBiYXNpcztcbiAgICAgICAgICBnICs9IGNvbG9yWzFdICogYmFzaXM7XG4gICAgICAgICAgYiArPSBjb2xvclsyXSAqIGJhc2lzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBpbnRSID0gbGluZWFyVG9zUkdCKHIpO1xuICAgICAgbGV0IGludEcgPSBsaW5lYXJUb3NSR0IoZyk7XG4gICAgICBsZXQgaW50QiA9IGxpbmVhclRvc1JHQihiKTtcblxuICAgICAgcGl4ZWxzWzQgKiB4ICsgMCArIHkgKiBieXRlc1BlclJvd10gPSBpbnRSO1xuICAgICAgcGl4ZWxzWzQgKiB4ICsgMSArIHkgKiBieXRlc1BlclJvd10gPSBpbnRHO1xuICAgICAgcGl4ZWxzWzQgKiB4ICsgMiArIHkgKiBieXRlc1BlclJvd10gPSBpbnRCO1xuICAgICAgcGl4ZWxzWzQgKiB4ICsgMyArIHkgKiBieXRlc1BlclJvd10gPSAyNTU7IC8vIGFscGhhXG4gICAgfVxuICB9XG4gIHJldHVybiBwaXhlbHM7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBkZWNvZGU7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvZGVjb2RlLnRzIiwiY29uc3QgZGlnaXRDaGFyYWN0ZXJzID0gW1xuXHRcIjBcIiwgXCIxXCIsIFwiMlwiLCBcIjNcIiwgXCI0XCIsIFwiNVwiLCBcIjZcIiwgXCI3XCIsIFwiOFwiLCBcIjlcIixcblx0XCJBXCIsIFwiQlwiLCBcIkNcIiwgXCJEXCIsIFwiRVwiLCBcIkZcIiwgXCJHXCIsIFwiSFwiLCBcIklcIiwgXCJKXCIsXG5cdFwiS1wiLCBcIkxcIiwgXCJNXCIsIFwiTlwiLCBcIk9cIiwgXCJQXCIsIFwiUVwiLCBcIlJcIiwgXCJTXCIsIFwiVFwiLFxuXHRcIlVcIiwgXCJWXCIsIFwiV1wiLCBcIlhcIiwgXCJZXCIsIFwiWlwiLCBcImFcIiwgXCJiXCIsIFwiY1wiLCBcImRcIixcblx0XCJlXCIsIFwiZlwiLCBcImdcIiwgXCJoXCIsIFwiaVwiLCBcImpcIiwgXCJrXCIsIFwibFwiLCBcIm1cIiwgXCJuXCIsXG5cdFwib1wiLCBcInBcIiwgXCJxXCIsIFwiclwiLCBcInNcIiwgXCJ0XCIsIFwidVwiLCBcInZcIiwgXCJ3XCIsIFwieFwiLFxuXHRcInlcIiwgXCJ6XCIsIFwiI1wiLCBcIiRcIiwgXCIlXCIsIFwiKlwiLCBcIitcIiwgXCIsXCIsIFwiLVwiLCBcIi5cIixcblx0XCI6XCIsIFwiO1wiLCBcIj1cIiwgXCI/XCIsIFwiQFwiLCBcIltcIiwgXCJdXCIsIFwiXlwiLCBcIl9cIiwgXCJ7XCIsXG5cdFwifFwiLCBcIn1cIiwgXCJ+XCIsXG5dXG5cbmV4cG9ydCBjb25zdCBkZWNvZGU4MyA9IChzdHI6IFN0cmluZykgPT4ge1xuICAgIGxldCB2YWx1ZSA9IDA7XG4gICAgZm9yKGxldCBpPTA7IGk8c3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGMgPSBzdHJbaV07XG4gICAgICAgIGNvbnN0IGRpZ2l0ID0gZGlnaXRDaGFyYWN0ZXJzLmluZGV4T2YoYyk7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgKiA4MyArIGRpZ2l0O1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYmFzZTgzLnRzIiwiZXhwb3J0IGNvbnN0IHNSR0JUb0xpbmVhciA9ICh2YWx1ZTogbnVtYmVyKSA9PiB7XG4gIGxldCB2ID0gdmFsdWUgLyAyNTU7XG4gIGlmICh2IDw9IDAuMDQwNDUpIHtcbiAgICByZXR1cm4gdiAvIDEyLjkyO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBNYXRoLnBvdygodiArIDAuMDU1KSAvIDEuMDU1LCAyLjQpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgbGluZWFyVG9zUkdCID0gKHZhbHVlOiBudW1iZXIpID0+IHtcbiAgbGV0IHYgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCB2YWx1ZSkpO1xuICBpZiAodiA8PSAwLjAwMzEzMDgpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCh2ICogMTIuOTIgKiAyNTUgKyAwLjUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKCgxLjA1NSAqIE1hdGgucG93KHYsIDEgLyAyLjQpIC0gMC4wNTUpICogMjU1ICsgMC41KTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHNpZ24gPSAobjogbnVtYmVyKSA9PiAobiA8IDAgPyAtMSA6IDEpO1xuXG5leHBvcnQgY29uc3Qgc2lnblBvdyA9ICh2YWw6IG51bWJlciwgZXhwOiBudW1iZXIpID0+IHNpZ24odmFsKSAqIE1hdGgucG93KE1hdGguYWJzKHZhbCksIGV4cCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdXRpbHMudHMiXSwic291cmNlUm9vdCI6IiJ9