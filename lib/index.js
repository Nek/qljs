(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("react-dom"));
	else if(typeof define === 'function' && define.amd)
		define(["react", "react-dom"], factory);
	else if(typeof exports === 'object')
		exports["qljs"] = factory(require("react"), require("react-dom"));
	else
		root["qljs"] = factory(root["React"], root["ReactDOM"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE_react__, __WEBPACK_EXTERNAL_MODULE_react_dom__) {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.tsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.tsx":
/*!***********************!*\
  !*** ./src/index.tsx ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(/*! react */ "react");
var ReactDOM = __webpack_require__(/*! react-dom */ "react-dom");
var parserNoMatch = function (id, key) {
    console.warn(String(id) + " parser for \"" + String(key) + "\" is missing.");
};
var alreadyDefined = function (id, key) {
    throw new Error(String(id) + " parser is already defined for \"" + String(key) + "\".");
};
var metaParser = function (name, dict) { return function (id, parser) {
    var maybeParser = dict[id];
    if (maybeParser) {
        alreadyDefined(name, id);
    }
    else {
        dict[id] = parser;
    }
}; };
var readDict = {};
var read = metaParser("Read", readDict);
var mutateDict = {};
var mutate = metaParser("Mutate", mutateDict);
var remoteDict = {};
var remote = metaParser("Remote", remoteDict);
var syncDict = {};
var sync = metaParser("Sync", syncDict);
exports.parsers = {
    read: read,
    mutate: mutate,
    remote: remote,
    sync: sync
};
var render = function (ctx, Component) {
    return Array.isArray(ctx) ? (ctx.map(function (ctx) { return (React.createElement(Component, __assign({}, ctx, { transact: function (query) { return transact(ctx, query); }, render: render }))); })) : (React.createElement(Component, __assign({}, ctx, { transact: function (query) { return transact(ctx, query); }, render: render })));
};
var RootComponent;
var element;
var state;
var remoteHandler;
var registry = new Map();
function isParams(term) {
    return Object.prototype.toString.call(term) === "[object Object]";
}
function isTerm(curr) {
    return typeof curr[0] === "string";
}
function isQuery(curr) {
    return Array.isArray(curr[0]);
}
function isStrictlyParametrizedTerm(term) {
    return term.length > 1 && isParams(term[1]);
}
function normalize(rest) {
    return rest.reduce(function (res, curr) {
        if (isTerm(curr)) {
            return __spread(res, [curr]);
        }
        else if (isQuery(curr)) {
            return __spread(res, curr);
        }
        else {
            var query = getQuery(curr);
            return __spread(res, query);
        }
    }, []);
}
function tagToTerm(tag) {
    return typeof tag === "string" ? [tag] : tag;
}
function addParamsAndNormalize(term) {
    if (isStrictlyParametrizedTerm(term)) {
        var _a = __read(term), rest = _a.slice(2);
        return __spread([term[0], term[1]], normalize(rest));
    }
    else {
        var _b = __read(term), rest = _b.slice(1);
        return __spread([term[0], {}], normalize(rest));
    }
}
exports.component = function (dsl, key) {
    var query = dsl
        // Convert query tag to a Term ['todoId'] -> [['todoId', {}]]
        .map(tagToTerm)
        .map(addParamsAndNormalize);
    registry.set(key, query);
    return key;
};
function getQuery(key) {
    return registry.get(key);
}
exports.getQuery = getQuery;
function clearRegistry() {
    registry.clear();
}
exports.clearRegistry = clearRegistry;
var parseQueryTerm = function (term, __env) {
    var mutateFn = mutateDict[term[0]];
    if (mutateFn) {
        return mutateFn([term[0], term[1]], __env, state);
    }
    else {
        var parser = readDict[term[0]];
        if (parser === undefined) {
            parserNoMatch("Read", term[0]);
            return null;
        }
        return parser(term, __env, state);
    }
};
var parseQuery = function (query, __env) {
    if (__env === undefined) {
        return parseQuery(query, {});
    }
    return query.map(function (queryTerm) { return parseQueryTerm(queryTerm, __env); });
};
function makeProps(res, _a) {
    var _b;
    var _c = __read(_a, 2), k = _c[0], v = _c[1];
    return __assign(__assign({}, res), (_b = {}, _b[k] = v, _b));
}
function parseQueryIntoProps(__query, __env, _state) {
    if (__env === void 0) { __env = {}; }
    if (_state === void 0) { _state = state; }
    var queryNames = __query.map(function (v) { return v[0]; });
    var queryResult = parseQuery(__query, __env);
    var props = zip(queryNames, queryResult).reduce(makeProps, {});
    var key = props[queryNames[0]];
    return __assign({ __env: __env,
        __query: __query, key: typeof key === "string" ? key : "unique" }, props);
}
function parseQueryRemote(query) {
    var result = query.reduce(function (acc, term) {
        var remote = remoteDict[term[0]];
        if (remote) {
            var v = remote(term, state);
            return v ? __spread(acc, [v]) : acc;
        }
        else {
            return acc;
        }
    }, []);
    return result;
}
function parseChildrenRemote(_a) {
    var _b = __read(_a), dispatchKey = _b[0], params = _b[1], chi = _b.slice(2);
    var chiRemote = parseQueryRemote(chi);
    return __spread([dispatchKey, params], chiRemote);
}
exports.parseChildrenRemote = parseChildrenRemote;
function parseQueryTermSync(term, result, __env) {
    var syncFun = syncDict[term[0]];
    if (syncFun) {
        syncFun(term, result, __env, state);
    }
    else {
        var hasRemote = remoteHandler(term[0]);
        hasRemote && parserNoMatch("Sync", term[0]);
    }
}
function zip(a1, a2) {
    return a1.map(function (x, i) { return [x, a2[i]]; });
}
function compressTerm(term) {
    var compressInner = function (term, res) {
        if (term === undefined) {
            return res;
        }
        else {
            res.tags.push(term[0]);
            res.params.push(term[1]);
            return compressInner(term[2], res);
        }
    };
    var _a = compressInner(term, { tags: [], params: [] }), tags = _a.tags, params = _a.params;
    return [tags.reverse()[0], params.reduce(function (res, p) { return (__assign(__assign({}, res), p)); }, {})];
}
/*
Call remote handler for a query and zip result to
*/
function performRemoteQuery(query) {
    var _a = __read(query, 1), firstTerm = _a[0];
    var _b = __read(compressTerm(firstTerm), 2), tag = _b[0], params = _b[1];
    var remoteResult = remoteHandler(tag, params);
    if (typeof remoteResult !== "boolean") {
        remoteResult.then(function (results) {
            zip(query, results).forEach(function (_a) {
                var _b = __read(_a, 2), k = _b[0], v = _b[1];
                parseQueryTermSync(compressTerm(k), v, {});
            });
            refresh({ skipRemote: true });
        });
    }
}
function refresh(_a) {
    var skipRemote = _a.skipRemote;
    if (RootComponent !== undefined) {
        var rootQuery = getQuery(RootComponent);
        !skipRemote && performRemoteQuery(parseQueryRemote(rootQuery));
        var props_1 = parseQueryIntoProps(rootQuery);
        ReactDOM.render(React.createElement(RootComponent, __assign({}, props_1, { transact: function (query) { return transact(props_1, query); }, render: render })), element);
    }
}
function mapDelta(map1, map2) {
    return Object.entries(map2)
        .filter(function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        return v !== map1[k];
    })
        .reduce(function (res, _a) {
        var _b;
        var _c = __read(_a, 2), k = _c[0], v = _c[1];
        return (__assign(__assign({}, res), (_b = {}, _b[k] = v, _b)));
    }, {});
}
function loopRootQuery(queryTerm, __env) {
    if (__env) {
        var newEnv = __assign(__assign({}, (__env.__parentEnv ? mapDelta(__env.__parentEnv, __env) : __env)), { __parentEnv: undefined, __queryKey: undefined });
        return loopRootQuery([__env.__queryKey, newEnv, queryTerm], __env.__parentEnv);
    }
    else {
        return queryTerm;
    }
}
function parseChildren(term, __env, _state) {
    if (_state === void 0) { _state = state; }
    var _a = __read(term), query = _a.slice(2);
    var newEnv = __assign(__assign({}, __env), { __parentEnv: __assign(__assign({}, __env), { __queryKey: term[0] }) });
    return parseQueryIntoProps(query, newEnv, _state);
}
exports.parseChildren = parseChildren;
function transact(_a, query, _state) {
    var __env = _a.__env, componentQuery = _a.__query;
    if (_state === void 0) { _state = state; }
    var rootQuery = __spread(query, componentQuery).map(function (queryTerm) {
        return loopRootQuery(queryTerm, __env.__parentEnv);
    });
    parseQuery(rootQuery, __env);
    performRemoteQuery(parseQueryRemote(rootQuery));
    refresh({ skipRemote: false });
}
function init(_a) {
    var _st = _a.state, _rh = _a.remoteHandler;
    state = _st;
    remoteHandler = _rh;
    return function (_a) {
        var Component = _a.Component, _el = _a.element;
        RootComponent = Component;
        element = _el;
        refresh({ skipRemote: true });
    };
}
exports.init = init;


/***/ }),

/***/ "react":
/*!****************************************************************************************************!*\
  !*** external {"root":"React","commonjs2":"react","commonjs":"react","amd":"react","umd":"react"} ***!
  \****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_react__;

/***/ }),

/***/ "react-dom":
/*!***********************************************************************************************************************!*\
  !*** external {"root":"ReactDOM","commonjs2":"react-dom","commonjs":"react-dom","amd":"react-dom","umd":"react-dom"} ***!
  \***********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_react_dom__;

/***/ })

/******/ });
});
//# sourceMappingURL=index.js.map