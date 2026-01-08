"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/strip-final-newline";
exports.ids = ["vendor-chunks/strip-final-newline"];
exports.modules = {

/***/ "(rsc)/./node_modules/strip-final-newline/index.js":
/*!***************************************************!*\
  !*** ./node_modules/strip-final-newline/index.js ***!
  \***************************************************/
/***/ ((module) => {

eval("\n\nmodule.exports = input => {\n\tconst LF = typeof input === 'string' ? '\\n' : '\\n'.charCodeAt();\n\tconst CR = typeof input === 'string' ? '\\r' : '\\r'.charCodeAt();\n\n\tif (input[input.length - 1] === LF) {\n\t\tinput = input.slice(0, input.length - 1);\n\t}\n\n\tif (input[input.length - 1] === CR) {\n\t\tinput = input.slice(0, input.length - 1);\n\t}\n\n\treturn input;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvc3RyaXAtZmluYWwtbmV3bGluZS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTs7QUFFYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXGFqYXlcXE9uZURyaXZlXFxEb2N1bWVudHNcXEludGVydmlld19Db2RlXFxhaS1pbnRlcnZpZXctZWR5c29yLW1haW5cXGFpLWludGVydmlldy1lZHlzb3ItbWFpblxcc3R1ZGVudC1zaWRlXFxzdHVkZW50LXNpZGVcXG5vZGVfbW9kdWxlc1xcc3RyaXAtZmluYWwtbmV3bGluZVxcaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlucHV0ID0+IHtcblx0Y29uc3QgTEYgPSB0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnID8gJ1xcbicgOiAnXFxuJy5jaGFyQ29kZUF0KCk7XG5cdGNvbnN0IENSID0gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/ICdcXHInIDogJ1xccicuY2hhckNvZGVBdCgpO1xuXG5cdGlmIChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA9PT0gTEYpIHtcblx0XHRpbnB1dCA9IGlucHV0LnNsaWNlKDAsIGlucHV0Lmxlbmd0aCAtIDEpO1xuXHR9XG5cblx0aWYgKGlucHV0W2lucHV0Lmxlbmd0aCAtIDFdID09PSBDUikge1xuXHRcdGlucHV0ID0gaW5wdXQuc2xpY2UoMCwgaW5wdXQubGVuZ3RoIC0gMSk7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQ7XG59O1xuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/strip-final-newline/index.js\n");

/***/ })

};
;