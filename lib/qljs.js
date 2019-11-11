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
/*! exports provided: parsers, component, getQuery, clearRegistry, parseQueryIntoProps, parseChildrenRemote, zip, mapDelta, loopRootQuery, parseChildren, makeRootQuery, transact, init */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parsers", function() { return parsers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "component", function() { return component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getQuery", function() { return getQuery; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearRegistry", function() { return clearRegistry; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseQueryIntoProps", function() { return parseQueryIntoProps; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseChildrenRemote", function() { return parseChildrenRemote; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "zip", function() { return zip; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mapDelta", function() { return mapDelta; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loopRootQuery", function() { return loopRootQuery; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseChildren", function() { return parseChildren; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeRootQuery", function() { return makeRootQuery; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transact", function() { return transact; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "init", function() { return init; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);


const parserNoMatch = (id, key) => {
    console.warn(`${String(id)} parser for "${String(key)}" is missing.`);
};
const alreadyDefined = (id, key) => {
    throw new Error(`${String(id)} parser is already defined for "${String(key)}".`);
};
const metaParser = (name, dict) => (id, parser) => {
    const maybeParser = dict[id];
    if (maybeParser) {
        alreadyDefined(name, id);
    }
    else {
        dict[id] = parser;
    }
};
const readDict = {};
const read = metaParser("Read", readDict);
const mutateDict = {};
const mutate = metaParser("Mutate", mutateDict);
const remoteDict = {};
const remote = metaParser("Remote", remoteDict);
const syncDict = {};
const sync = metaParser("Sync", syncDict);
const parsers = {
    read,
    mutate,
    remote,
    sync
};
const render = (ctx, Component) => Array.isArray(ctx) ? (ctx.map(ctx => (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Component, Object.assign({}, ctx, { transact: (query) => transact(ctx, query), render: render }))))) : (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Component, Object.assign({}, ctx, { transact: (query) => transact(ctx, query), render: render })));
let RootComponent;
let element;
let state;
let remoteHandler;
const registry = new Map();
function flattenRest(rest) {
    return rest.reduce((res, term) => {
        return Array.isArray(term[0]) ? [...res, ...term] : [...res, term];
    }, []);
}
const component = (dsl, key) => {
    const query = dsl
        // Convert query tag to a Term ['todoId'] -> [['todoId', {}]]
        .map((term) => (typeof term === "string" ? [term, {}] : term))
        // Add parameters to single item Term [['todoId']] -> [['todoId', {}]]
        .map((term) => (term.length === 1 ? [term[0], {}] : term))
        // Insert parameters into a longer query [['todos', [...]...]] -> [['todos', {}, [...]...]]
        .map((term) => {
        if (term.length > 1 && Array.isArray(term[1])) {
            const [, ...rest] = term;
            return [term[0], {}, ...flattenRest(rest)];
        }
        return term;
    });
    registry.set(key, query);
    return key;
};
function getQuery(key) {
    return registry.get(key);
}
function clearRegistry() {
    registry.clear();
}
const parseQueryTerm = (term, __env) => {
    const mutateFn = mutateDict[term[0]];
    if (mutateFn) {
        return mutateFn(term, __env, state);
    }
    else {
        const parser = readDict[term[0]];
        if (parser === undefined) {
            parserNoMatch("Read", term[0]);
            return null;
        }
        return readDict[term[0]](term, __env, state);
    }
};
const parseQuery = (query, __env) => {
    if (__env === undefined) {
        return parseQuery(query, {});
    }
    return query.map(queryTerm => parseQueryTerm(queryTerm, __env));
};
function makeProps(res, [k, v]) {
    return Object.assign(Object.assign({}, res), { [k]: v });
}
function parseQueryIntoProps(__query, __env = {}, _state = state) {
    const queryNames = __query.map(v => v[0]);
    const queryResult = parseQuery(__query, __env);
    const props = zip(queryNames, queryResult).reduce(makeProps, {});
    const key = props[queryNames[0]];
    return Object.assign({ __env,
        __query, key: typeof key === "string" ? key : "unique" }, props);
}
function parseQueryRemote(query) {
    const result = query.reduce((acc, term) => {
        const remote = remoteDict[term[0]];
        if (remote) {
            const v = remote(term, state);
            return v ? [...acc, v] : acc;
        }
        else {
            return acc;
        }
    }, []);
    return result;
}
function parseChildrenRemote([dispatchKey, params, ...chi]) {
    const chiRemote = parseQueryRemote(chi);
    return [dispatchKey, params, ...chiRemote];
}
function parseQueryTermSync(term, result, __env) {
    const syncFun = syncDict[term[0]];
    if (syncFun) {
        syncFun(term, result, __env, state);
    }
    else {
        parserNoMatch("Sync", term[0]);
    }
}
function zip(a1, a2) {
    return a1.map((x, i) => [x, a2[i]]);
}
function compressTerm(term) {
    const compressInner = (term, res) => {
        if (term === undefined) {
            return res;
        }
        else {
            res.tags.push(term[0]);
            res.params.push(term[1]);
            return compressInner(term[2], res);
        }
    };
    const { tags, params } = compressInner(term, { tags: [], params: [] });
    return [tags.reverse()[0], params.reduce((res, p) => (Object.assign(Object.assign({}, res), p)), {})];
}
/*
Call remote handler for a query and zip result to
*/
function performRemoteQuery(query) {
    if (remoteHandler && Array.isArray(query) && query.length > 0) {
        const [term] = query;
        const [tag, params] = compressTerm(term);
        remoteHandler(tag, params).then(results => {
            zip(query, results).forEach(([k, v]) => {
                parseQueryTermSync(compressTerm(k), v, {});
            });
            refresh({ skipRemote: true });
        });
    }
}
function refresh({ skipRemote }) {
    if (RootComponent !== undefined) {
        const perfRQ = skipRemote
            ? v => v
            : (query) => {
                performRemoteQuery(parseQueryRemote(query));
                return query;
            };
        const props = parseQueryIntoProps(perfRQ(getQuery(RootComponent)));
        react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.render(react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(RootComponent, Object.assign({}, props, { transact: (query) => transact(props, query), render: render })), element);
    }
}
function mapDelta(map1, map2) {
    return Object.entries(map2)
        .filter(([k, v]) => v !== map1[k])
        .reduce((res, [k, v]) => (Object.assign(Object.assign({}, res), { [k]: v })), {});
}
function loopRootQuery(queryTerm, __env) {
    if (__env) {
        const __parentEnv = __env.__parentEnv;
        const newEnv = Object.assign({}, (__parentEnv ? mapDelta(__parentEnv, __env) : __env));
        delete newEnv.__parentEnv;
        delete newEnv.__queryKey;
        return loopRootQuery([__env.__queryKey, newEnv, queryTerm], __parentEnv);
    }
    else {
        return queryTerm;
    }
}
function parseChildren(term, __env, _state = state) {
    const [, , ...query] = term;
    const newEnv = Object.assign(Object.assign({}, __env), { __parentEnv: Object.assign(Object.assign({}, __env), { __queryKey: term[0] }) });
    return parseQueryIntoProps(query, newEnv, _state);
}
function makeRootQuery(__env, query) {
    return query.map(queryTerm => {
        return loopRootQuery(queryTerm, __env.__parentEnv);
    });
}
function transact({ __env, __query: componentQuery }, query, _state = state) {
    const rootQuery = [...query, ...componentQuery].map(queryTerm => {
        return loopRootQuery(queryTerm, __env.__parentEnv);
    });
    parseQuery(rootQuery, __env);
    performRemoteQuery(parseQueryRemote(rootQuery));
    refresh({ skipRemote: false });
}
function init({ state: _st, remoteHandler: _rh }) {
    state = _st;
    remoteHandler = _rh;
    return ({ Component, element: _el }) => {
        RootComponent = Component;
        element = _el;
        refresh({ skipRemote: true });
    };
}


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
//# sourceMappingURL=qljs.js.map