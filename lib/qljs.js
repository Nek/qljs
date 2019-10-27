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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! exports provided: multimethod, parsers, query, instance, getQuery, getId, clearRegistry, parseQueryIntoMap, parseChildrenRemote, zip, mapDelta, loopRootQuery, makeRootQuery, parseChildren, transact, componentToQuery, unfoldQueryTerm, unfoldQuery, mount */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multimethod", function() { return multimethod; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parsers", function() { return parsers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "query", function() { return query; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "instance", function() { return instance; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getQuery", function() { return getQuery; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getId", function() { return getId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearRegistry", function() { return clearRegistry; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseQueryIntoMap", function() { return parseQueryIntoMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseChildrenRemote", function() { return parseChildrenRemote; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "zip", function() { return zip; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mapDelta", function() { return mapDelta; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loopRootQuery", function() { return loopRootQuery; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeRootQuery", function() { return makeRootQuery; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseChildren", function() { return parseChildren; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transact", function() { return transact; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "componentToQuery", function() { return componentToQuery; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unfoldQueryTerm", function() { return unfoldQueryTerm; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unfoldQuery", function() { return unfoldQuery; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mount", function() { return mount; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);


const noMatchWarningDefault = (id, key) => {
    console.warn(`No match for "${key}" on multimethod "${id}".`);
};
const alreadyDefinedErrorDefault = (id, key) => {
    throw new Error(`Multimethod ${id} already has "${String(key)}" method.`);
};
function pipe(...fns) {
    return function reduce(x) {
        return fns.reduce((v, f) => f(v), x);
    };
}
/**
Ad-hoc polymorphism for JS.
dispatch - function that takes incoming parameteres and returns the actual method name
defaultMethod - default action for missing methods
alreadyDefined - overwriting existing method error message formatter
noMatchWarning -  missing method call warning message formatter
**/
function multimethod(dispatch, id = 'default', defaultMethod = () => null, alreadyDefined = alreadyDefinedErrorDefault, noMatchWarning = noMatchWarningDefault) {
    const dict = {};
    return new Proxy(defaultMethod, {
        set(_, property, value) {
            if (dict[property] !== undefined) {
                alreadyDefined(id, property);
            }
            dict[property] = value;
            return true;
        },
        get(_, property) {
            return dict[property];
        },
        apply(target, thisArg, args) {
            const key = dispatch.apply(null, args);
            const func = key && dict.hasOwnProperty(key)
                ? dict[key]
                : dict.hasOwnProperty('noMatch')
                    ? dict['noMatch']
                    : (...args) => {
                        noMatchWarning(id, key);
                        return target(...args);
                    };
            return func.apply(thisArg, args);
        },
    });
}
function first(a) { return a[0]; }
const parserNoMatch = (id, key) => {
    console.warn(`${String(id)} parser method for "${String(key)}" is missing.`);
};
const alreadyDefined = (id, key) => { throw new Error(`${String(id)} parser already has method for "${String(key)}".`); };
function id(v) {
    return v;
}
const read = multimethod(first, 'read', id, alreadyDefined, parserNoMatch);
const mutate = multimethod(first, 'mutate', id, alreadyDefined, parserNoMatch);
const remote = multimethod(first, 'remote', id, alreadyDefined, parserNoMatch);
const sync = multimethod(first, 'sync', id, alreadyDefined, parserNoMatch);
const parsers = {
    read,
    mutate,
    remote,
    sync,
};
let Component;
let element;
let state;
let remoteHandler;
const registry = new Map();
const idRegistry = new Map();
const query = (query, id) => (key) => {
    registry.set(key, query);
    id && idRegistry.set(key, id);
    return key;
};
const instance = (Component) => (atts) => react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Component, Object.assign({}, atts, { key: atts['__env'][getId(Component)] }));
function getQuery(key) {
    return registry.get(key);
}
function getId(key) {
    return idRegistry.get(key) || 'single';
}
function clearRegistry() {
    registry.clear();
    idRegistry.clear();
}
const parseQueryTerm = (term, __env) => {
    const mutateFn = parsers.mutate && parsers.mutate[term[0]];
    if (mutateFn) {
        return mutateFn(term, __env, state);
    }
    else {
        return parsers.read(term, __env, state);
    }
};
const parseQuery = (query, __env) => {
    if (__env === undefined) {
        return parseQuery(query, {});
    }
    return query.map(queryTerm => parseQueryTerm(queryTerm, __env));
};
function makeAtts(res, [k, v]) { return (Object.assign({}, res, { [k]: v })); }
function parseQueryIntoMap(__query, __env = {}, _state = state, _parsers = parsers) {
    const queryNames = __query.map(v => v[0]);
    const queryResult = parseQuery(__query, __env);
    const atts = zip(queryNames, queryResult).reduce(makeAtts, {});
    const key = atts[queryNames[0]];
    return Object.assign({ __env,
        __query, key: typeof key === 'string' ? key : 'unique' }, atts);
}
function parseQueryRemote(query) {
    return query.reduce((acc, term) => {
        if (parsers.remote[term[0]]) {
            const v = parsers.remote(term, state);
            if (v) {
                return [...acc, v];
            }
            else {
                return acc;
            }
        }
        else {
            return acc;
        }
    }, []);
}
function parseChildrenRemote([dispatchKey, params, ...chi]) {
    const chiRemote = parseQueryRemote(chi);
    return Array.isArray(chiRemote) && [...[dispatchKey, params], ...chiRemote];
}
function parseQueryTermSync(queryTerm, result, __env) {
    const syncFun = parsers.sync[queryTerm[0]];
    if (syncFun) {
        syncFun(queryTerm, result, __env, state);
    }
    else {
        //TODO: Missing sync parser warning
    }
}
function zip(a1, a2) { return a1.map((x, i) => [x, a2[i]]); }
/*
Call remote handler for a query and zip result to
*/
function performRemoteQuery(query) {
    if (remoteHandler && Array.isArray(query) && query.length > 0) {
        remoteHandler(query).then(results => {
            zip(query, results).forEach(([k, v]) => parseQueryTermSync(k, v, {}));
            refresh();
        });
    }
}
function refresh({ skipRemote } = { skipRemote: true }) {
    if (Component !== undefined) {
        const perfRQ = skipRemote ? v => v : (query) => {
            performRemoteQuery(parseQueryRemote(query));
            return query;
        };
        react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.render(instance(Component)(pipe(getQuery, unfoldQuery, perfRQ, parseQueryIntoMap)(Component)), element);
    }
}
function mapDelta(map1, map2) {
    return Object.entries(map2)
        .filter(([k, v]) => v !== map1[k])
        .reduce((res, [k, v]) => (Object.assign({}, res, { [k]: v })), {});
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
function makeRootQuery(__env, query) {
    return query.map(queryTerm => {
        return loopRootQuery(queryTerm, __env.__parentEnv);
    });
}
function parseChildren(term, __env, _state = state, _parsers = parsers) {
    const [, , ...query] = term;
    const newEnv = Object.assign({}, __env, { __parentEnv: Object.assign({}, __env, { __queryKey: term[0] }) });
    return parseQueryIntoMap(query, newEnv, _state, _parsers);
}
function transact(props, query, _state = state, _parsers = parsers) {
    const { __env, __query: componentQuery } = props;
    const rootQuery = makeRootQuery(__env, [...query, ...componentQuery]);
    parseQuery(rootQuery, __env);
    performRemoteQuery(parseQueryRemote(rootQuery));
    refresh({ skipRemote: false });
}
function componentToQuery(something) {
    const query = unfoldQuery(getQuery(something));
    return query || something;
}
function unfoldQueryTerm(term) {
    let terms;
    const [tag, maybeParams] = term;
    let res;
    if (maybeParams && (Object.getPrototypeOf(maybeParams) === Object.prototype)) {
        [, , ...terms] = term;
        res = [tag, maybeParams];
    }
    else {
        [, ...terms] = term;
        res = [tag, {}];
    }
    const fullTerms = terms.map(componentToQuery).reduce((res, arr) => ([...res, ...arr]), []);
    return [res[0], res[1], ...fullTerms];
}
function unfoldQuery(query) {
    return query.map(unfoldQueryTerm);
}
function mount({ state: _st, remoteHandler: _rh }) {
    state = _st;
    remoteHandler = _rh;
    return ({ component, element: _el }) => {
        Component = component;
        element = _el;
        refresh();
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