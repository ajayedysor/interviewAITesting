"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/npm-run-path";
exports.ids = ["vendor-chunks/npm-run-path"];
exports.modules = {

/***/ "(rsc)/./node_modules/npm-run-path/index.js":
/*!********************************************!*\
  !*** ./node_modules/npm-run-path/index.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nconst path = __webpack_require__(/*! path */ \"path\");\nconst pathKey = __webpack_require__(/*! path-key */ \"(rsc)/./node_modules/path-key/index.js\");\n\nconst npmRunPath = options => {\n\toptions = {\n\t\tcwd: process.cwd(),\n\t\tpath: process.env[pathKey()],\n\t\texecPath: process.execPath,\n\t\t...options\n\t};\n\n\tlet previous;\n\tlet cwdPath = path.resolve(options.cwd);\n\tconst result = [];\n\n\twhile (previous !== cwdPath) {\n\t\tresult.push(path.join(cwdPath, 'node_modules/.bin'));\n\t\tprevious = cwdPath;\n\t\tcwdPath = path.resolve(cwdPath, '..');\n\t}\n\n\t// Ensure the running `node` binary is used\n\tconst execPathDir = path.resolve(options.cwd, options.execPath, '..');\n\tresult.push(execPathDir);\n\n\treturn result.concat(options.path).join(path.delimiter);\n};\n\nmodule.exports = npmRunPath;\n// TODO: Remove this for the next major release\nmodule.exports[\"default\"] = npmRunPath;\n\nmodule.exports.env = options => {\n\toptions = {\n\t\tenv: process.env,\n\t\t...options\n\t};\n\n\tconst env = {...options.env};\n\tconst path = pathKey({env});\n\n\toptions.path = env[path];\n\tenv[path] = module.exports(options);\n\n\treturn env;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbnBtLXJ1bi1wYXRoL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhO0FBQ2IsYUFBYSxtQkFBTyxDQUFDLGtCQUFNO0FBQzNCLGdCQUFnQixtQkFBTyxDQUFDLHdEQUFVOztBQUVsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUJBQXNCOztBQUV0QixrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsY0FBYztBQUNkLHVCQUF1QixJQUFJOztBQUUzQjtBQUNBOztBQUVBO0FBQ0EiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcYWpheVxcT25lRHJpdmVcXERvY3VtZW50c1xcSW50ZXJ2aWV3X0NvZGVcXGFpLWludGVydmlldy1lZHlzb3ItbWFpblxcYWktaW50ZXJ2aWV3LWVkeXNvci1tYWluXFxzdHVkZW50LXNpZGVcXHN0dWRlbnQtc2lkZVxcbm9kZV9tb2R1bGVzXFxucG0tcnVuLXBhdGhcXGluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBwYXRoS2V5ID0gcmVxdWlyZSgncGF0aC1rZXknKTtcblxuY29uc3QgbnBtUnVuUGF0aCA9IG9wdGlvbnMgPT4ge1xuXHRvcHRpb25zID0ge1xuXHRcdGN3ZDogcHJvY2Vzcy5jd2QoKSxcblx0XHRwYXRoOiBwcm9jZXNzLmVudltwYXRoS2V5KCldLFxuXHRcdGV4ZWNQYXRoOiBwcm9jZXNzLmV4ZWNQYXRoLFxuXHRcdC4uLm9wdGlvbnNcblx0fTtcblxuXHRsZXQgcHJldmlvdXM7XG5cdGxldCBjd2RQYXRoID0gcGF0aC5yZXNvbHZlKG9wdGlvbnMuY3dkKTtcblx0Y29uc3QgcmVzdWx0ID0gW107XG5cblx0d2hpbGUgKHByZXZpb3VzICE9PSBjd2RQYXRoKSB7XG5cdFx0cmVzdWx0LnB1c2gocGF0aC5qb2luKGN3ZFBhdGgsICdub2RlX21vZHVsZXMvLmJpbicpKTtcblx0XHRwcmV2aW91cyA9IGN3ZFBhdGg7XG5cdFx0Y3dkUGF0aCA9IHBhdGgucmVzb2x2ZShjd2RQYXRoLCAnLi4nKTtcblx0fVxuXG5cdC8vIEVuc3VyZSB0aGUgcnVubmluZyBgbm9kZWAgYmluYXJ5IGlzIHVzZWRcblx0Y29uc3QgZXhlY1BhdGhEaXIgPSBwYXRoLnJlc29sdmUob3B0aW9ucy5jd2QsIG9wdGlvbnMuZXhlY1BhdGgsICcuLicpO1xuXHRyZXN1bHQucHVzaChleGVjUGF0aERpcik7XG5cblx0cmV0dXJuIHJlc3VsdC5jb25jYXQob3B0aW9ucy5wYXRoKS5qb2luKHBhdGguZGVsaW1pdGVyKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbnBtUnVuUGF0aDtcbi8vIFRPRE86IFJlbW92ZSB0aGlzIGZvciB0aGUgbmV4dCBtYWpvciByZWxlYXNlXG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gbnBtUnVuUGF0aDtcblxubW9kdWxlLmV4cG9ydHMuZW52ID0gb3B0aW9ucyA9PiB7XG5cdG9wdGlvbnMgPSB7XG5cdFx0ZW52OiBwcm9jZXNzLmVudixcblx0XHQuLi5vcHRpb25zXG5cdH07XG5cblx0Y29uc3QgZW52ID0gey4uLm9wdGlvbnMuZW52fTtcblx0Y29uc3QgcGF0aCA9IHBhdGhLZXkoe2Vudn0pO1xuXG5cdG9wdGlvbnMucGF0aCA9IGVudltwYXRoXTtcblx0ZW52W3BhdGhdID0gbW9kdWxlLmV4cG9ydHMob3B0aW9ucyk7XG5cblx0cmV0dXJuIGVudjtcbn07XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/npm-run-path/index.js\n");

/***/ })

};
;