/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/elevenlabs/get-signed-url/route";
exports.ids = ["app/api/elevenlabs/get-signed-url/route"];
exports.modules = {

/***/ "(rsc)/./app/api/elevenlabs/get-signed-url/route.ts":
/*!****************************************************!*\
  !*** ./app/api/elevenlabs/get-signed-url/route.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var elevenlabs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! elevenlabs */ \"(rsc)/./node_modules/elevenlabs/index.js\");\n/* harmony import */ var elevenlabs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(elevenlabs__WEBPACK_IMPORTED_MODULE_1__);\n\n\nasync function GET() {\n    const apiKey = process.env.ELEVENLABS_API_KEY;\n    const agentId = process.env.ELEVENLABS_AGENT_ID;\n    if (!apiKey || !agentId) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"ElevenLabs configuration missing\"\n        }, {\n            status: 500\n        });\n    }\n    try {\n        const client = new elevenlabs__WEBPACK_IMPORTED_MODULE_1__.ElevenLabsClient({\n            apiKey: apiKey\n        });\n        const response = await client.conversationalAi.getSignedUrl({\n            agent_id: agentId\n        });\n        // Handle cases where response might be an object or a string\n        const signedUrl = typeof response === \"string\" ? response : response.signed_url;\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            signed_url: signedUrl\n        });\n    } catch (error) {\n        console.error(\"Error generating signed URL:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Failed to generate signed URL\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2VsZXZlbmxhYnMvZ2V0LXNpZ25lZC11cmwvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUEyQztBQUNHO0FBRXZDLGVBQWVFO0lBQ3BCLE1BQU1DLFNBQVNDLFFBQVFDLEdBQUcsQ0FBQ0Msa0JBQWtCO0lBQzdDLE1BQU1DLFVBQVVILFFBQVFDLEdBQUcsQ0FBQ0csbUJBQW1CO0lBRS9DLElBQUksQ0FBQ0wsVUFBVSxDQUFDSSxTQUFTO1FBQ3ZCLE9BQU9QLHFEQUFZQSxDQUFDUyxJQUFJLENBQ3RCO1lBQUVDLE9BQU87UUFBbUMsR0FDNUM7WUFBRUMsUUFBUTtRQUFJO0lBRWxCO0lBRUEsSUFBSTtRQUNGLE1BQU1DLFNBQVMsSUFBSVgsd0RBQWdCQSxDQUFDO1lBQ2xDRSxRQUFRQTtRQUNWO1FBRUEsTUFBTVUsV0FBVyxNQUFNRCxPQUFPRSxnQkFBZ0IsQ0FBQ0MsWUFBWSxDQUFDO1lBQzFEQyxVQUFVVDtRQUNaO1FBRUEsNkRBQTZEO1FBQzdELE1BQU1VLFlBQVksT0FBT0osYUFBYSxXQUFXQSxXQUFXLFNBQWtCSyxVQUFVO1FBRXhGLE9BQU9sQixxREFBWUEsQ0FBQ1MsSUFBSSxDQUFDO1lBQ3ZCUyxZQUFZRDtRQUNkO0lBQ0YsRUFBRSxPQUFPUCxPQUFPO1FBQ2RTLFFBQVFULEtBQUssQ0FBQyxnQ0FBZ0NBO1FBQzlDLE9BQU9WLHFEQUFZQSxDQUFDUyxJQUFJLENBQ3RCO1lBQUVDLE9BQU87UUFBZ0MsR0FDekM7WUFBRUMsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcYWpheVxcT25lRHJpdmVcXERvY3VtZW50c1xcSW50ZXJ2aWV3X0NvZGVcXGFpLWludGVydmlldy1lZHlzb3ItbWFpblxcYWktaW50ZXJ2aWV3LWVkeXNvci1tYWluXFxzdHVkZW50LXNpZGVcXHN0dWRlbnQtc2lkZVxcYXBwXFxhcGlcXGVsZXZlbmxhYnNcXGdldC1zaWduZWQtdXJsXFxyb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcclxuaW1wb3J0IHsgRWxldmVuTGFic0NsaWVudCB9IGZyb20gXCJlbGV2ZW5sYWJzXCI7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xyXG4gIGNvbnN0IGFwaUtleSA9IHByb2Nlc3MuZW52LkVMRVZFTkxBQlNfQVBJX0tFWTtcclxuICBjb25zdCBhZ2VudElkID0gcHJvY2Vzcy5lbnYuRUxFVkVOTEFCU19BR0VOVF9JRDtcclxuXHJcbiAgaWYgKCFhcGlLZXkgfHwgIWFnZW50SWQpIHtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgeyBlcnJvcjogXCJFbGV2ZW5MYWJzIGNvbmZpZ3VyYXRpb24gbWlzc2luZ1wiIH0sXHJcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgRWxldmVuTGFic0NsaWVudCh7XHJcbiAgICAgIGFwaUtleTogYXBpS2V5LFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjbGllbnQuY29udmVyc2F0aW9uYWxBaS5nZXRTaWduZWRVcmwoe1xyXG4gICAgICBhZ2VudF9pZDogYWdlbnRJZCxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhhbmRsZSBjYXNlcyB3aGVyZSByZXNwb25zZSBtaWdodCBiZSBhbiBvYmplY3Qgb3IgYSBzdHJpbmdcclxuICAgIGNvbnN0IHNpZ25lZFVybCA9IHR5cGVvZiByZXNwb25zZSA9PT0gXCJzdHJpbmdcIiA/IHJlc3BvbnNlIDogKHJlc3BvbnNlIGFzIGFueSkuc2lnbmVkX3VybDtcclxuXHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xyXG4gICAgICBzaWduZWRfdXJsOiBzaWduZWRVcmwsXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGdlbmVyYXRpbmcgc2lnbmVkIFVSTDpcIiwgZXJyb3IpO1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxyXG4gICAgICB7IGVycm9yOiBcIkZhaWxlZCB0byBnZW5lcmF0ZSBzaWduZWQgVVJMXCIgfSxcclxuICAgICAgeyBzdGF0dXM6IDUwMCB9XHJcbiAgICApO1xyXG4gIH1cclxufVxyXG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiRWxldmVuTGFic0NsaWVudCIsIkdFVCIsImFwaUtleSIsInByb2Nlc3MiLCJlbnYiLCJFTEVWRU5MQUJTX0FQSV9LRVkiLCJhZ2VudElkIiwiRUxFVkVOTEFCU19BR0VOVF9JRCIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsImNsaWVudCIsInJlc3BvbnNlIiwiY29udmVyc2F0aW9uYWxBaSIsImdldFNpZ25lZFVybCIsImFnZW50X2lkIiwic2lnbmVkVXJsIiwic2lnbmVkX3VybCIsImNvbnNvbGUiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/elevenlabs/get-signed-url/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Felevenlabs%2Fget-signed-url%2Froute&page=%2Fapi%2Felevenlabs%2Fget-signed-url%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Felevenlabs%2Fget-signed-url%2Froute.ts&appDir=C%3A%5CUsers%5Cajay%5COneDrive%5CDocuments%5CInterview_Code%5Cai-interview-edysor-main%5Cai-interview-edysor-main%5Cstudent-side%5Cstudent-side%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cajay%5COneDrive%5CDocuments%5CInterview_Code%5Cai-interview-edysor-main%5Cai-interview-edysor-main%5Cstudent-side%5Cstudent-side&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Felevenlabs%2Fget-signed-url%2Froute&page=%2Fapi%2Felevenlabs%2Fget-signed-url%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Felevenlabs%2Fget-signed-url%2Froute.ts&appDir=C%3A%5CUsers%5Cajay%5COneDrive%5CDocuments%5CInterview_Code%5Cai-interview-edysor-main%5Cai-interview-edysor-main%5Cstudent-side%5Cstudent-side%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cajay%5COneDrive%5CDocuments%5CInterview_Code%5Cai-interview-edysor-main%5Cai-interview-edysor-main%5Cstudent-side%5Cstudent-side&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_ajay_OneDrive_Documents_Interview_Code_ai_interview_edysor_main_ai_interview_edysor_main_student_side_student_side_app_api_elevenlabs_get_signed_url_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/elevenlabs/get-signed-url/route.ts */ \"(rsc)/./app/api/elevenlabs/get-signed-url/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/elevenlabs/get-signed-url/route\",\n        pathname: \"/api/elevenlabs/get-signed-url\",\n        filename: \"route\",\n        bundlePath: \"app/api/elevenlabs/get-signed-url/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\ajay\\\\OneDrive\\\\Documents\\\\Interview_Code\\\\ai-interview-edysor-main\\\\ai-interview-edysor-main\\\\student-side\\\\student-side\\\\app\\\\api\\\\elevenlabs\\\\get-signed-url\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_ajay_OneDrive_Documents_Interview_Code_ai_interview_edysor_main_ai_interview_edysor_main_student_side_student_side_app_api_elevenlabs_get_signed_url_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZlbGV2ZW5sYWJzJTJGZ2V0LXNpZ25lZC11cmwlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmVsZXZlbmxhYnMlMkZnZXQtc2lnbmVkLXVybCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmVsZXZlbmxhYnMlMkZnZXQtc2lnbmVkLXVybCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNhamF5JTVDT25lRHJpdmUlNUNEb2N1bWVudHMlNUNJbnRlcnZpZXdfQ29kZSU1Q2FpLWludGVydmlldy1lZHlzb3ItbWFpbiU1Q2FpLWludGVydmlldy1lZHlzb3ItbWFpbiU1Q3N0dWRlbnQtc2lkZSU1Q3N0dWRlbnQtc2lkZSU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDYWpheSU1Q09uZURyaXZlJTVDRG9jdW1lbnRzJTVDSW50ZXJ2aWV3X0NvZGUlNUNhaS1pbnRlcnZpZXctZWR5c29yLW1haW4lNUNhaS1pbnRlcnZpZXctZWR5c29yLW1haW4lNUNzdHVkZW50LXNpZGUlNUNzdHVkZW50LXNpZGUmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9c3RhbmRhbG9uZSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNvSTtBQUNqTjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcYWpheVxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcSW50ZXJ2aWV3X0NvZGVcXFxcYWktaW50ZXJ2aWV3LWVkeXNvci1tYWluXFxcXGFpLWludGVydmlldy1lZHlzb3ItbWFpblxcXFxzdHVkZW50LXNpZGVcXFxcc3R1ZGVudC1zaWRlXFxcXGFwcFxcXFxhcGlcXFxcZWxldmVubGFic1xcXFxnZXQtc2lnbmVkLXVybFxcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJzdGFuZGFsb25lXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2VsZXZlbmxhYnMvZ2V0LXNpZ25lZC11cmwvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9lbGV2ZW5sYWJzL2dldC1zaWduZWQtdXJsXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9lbGV2ZW5sYWJzL2dldC1zaWduZWQtdXJsL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcYWpheVxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcSW50ZXJ2aWV3X0NvZGVcXFxcYWktaW50ZXJ2aWV3LWVkeXNvci1tYWluXFxcXGFpLWludGVydmlldy1lZHlzb3ItbWFpblxcXFxzdHVkZW50LXNpZGVcXFxcc3R1ZGVudC1zaWRlXFxcXGFwcFxcXFxhcGlcXFxcZWxldmVubGFic1xcXFxnZXQtc2lnbmVkLXVybFxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Felevenlabs%2Fget-signed-url%2Froute&page=%2Fapi%2Felevenlabs%2Fget-signed-url%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Felevenlabs%2Fget-signed-url%2Froute.ts&appDir=C%3A%5CUsers%5Cajay%5COneDrive%5CDocuments%5CInterview_Code%5Cai-interview-edysor-main%5Cai-interview-edysor-main%5Cstudent-side%5Cstudent-side%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cajay%5COneDrive%5CDocuments%5CInterview_Code%5Cai-interview-edysor-main%5Cai-interview-edysor-main%5Cstudent-side%5Cstudent-side&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions","vendor-chunks/elevenlabs","vendor-chunks/readable-stream","vendor-chunks/asynckit","vendor-chunks/execa","vendor-chunks/math-intrinsics","vendor-chunks/es-errors","vendor-chunks/cross-spawn","vendor-chunks/qs","vendor-chunks/call-bind-apply-helpers","vendor-chunks/human-signals","vendor-chunks/isexe","vendor-chunks/get-proto","vendor-chunks/object-inspect","vendor-chunks/mime-db","vendor-chunks/has-symbols","vendor-chunks/gopd","vendor-chunks/get-stream","vendor-chunks/function-bind","vendor-chunks/form-data","vendor-chunks/command-exists","vendor-chunks/node-fetch","vendor-chunks/formdata-node","vendor-chunks/form-data-encoder","vendor-chunks/which","vendor-chunks/url-join","vendor-chunks/strip-final-newline","vendor-chunks/string_decoder","vendor-chunks/side-channel","vendor-chunks/side-channel-weakmap","vendor-chunks/side-channel-map","vendor-chunks/side-channel-list","vendor-chunks/shebang-regex","vendor-chunks/shebang-command","vendor-chunks/safe-buffer","vendor-chunks/process","vendor-chunks/path-key","vendor-chunks/onetime","vendor-chunks/npm-run-path","vendor-chunks/mimic-fn","vendor-chunks/mime-types","vendor-chunks/merge-stream","vendor-chunks/is-stream","vendor-chunks/hasown","vendor-chunks/has-tostringtag","vendor-chunks/get-intrinsic","vendor-chunks/event-target-shim","vendor-chunks/es-set-tostringtag","vendor-chunks/es-object-atoms","vendor-chunks/es-define-property","vendor-chunks/dunder-proto","vendor-chunks/delayed-stream","vendor-chunks/combined-stream","vendor-chunks/call-bound","vendor-chunks/abort-controller"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Felevenlabs%2Fget-signed-url%2Froute&page=%2Fapi%2Felevenlabs%2Fget-signed-url%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Felevenlabs%2Fget-signed-url%2Froute.ts&appDir=C%3A%5CUsers%5Cajay%5COneDrive%5CDocuments%5CInterview_Code%5Cai-interview-edysor-main%5Cai-interview-edysor-main%5Cstudent-side%5Cstudent-side%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cajay%5COneDrive%5CDocuments%5CInterview_Code%5Cai-interview-edysor-main%5Cai-interview-edysor-main%5Cstudent-side%5Cstudent-side&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();