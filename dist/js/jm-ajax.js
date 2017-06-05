(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function ($) {
    return function (obj, opts) {
        opts = opts || {};
        var ignoreDocErr = opts.ignoreDocErr || false;
        var types = opts.types || ['get', 'post', 'put', 'delete'];
        var timeout = opts.timeout || 0;
        if (!Array.isArray(types)) {
            types = [types];
        }
        types.forEach(function (method) {
            obj[method] = function (opts, cb) {
                var params = {};
                for (var key in opts) {
                    params[key] = opts[key];
                }
                params.type = method.toUpperCase();
                params.contentType = params.contentType || 'application/json';
                params.dataType = params.dataType || 'json';
                params.timeout = params.timeout || timeout;
                params.success = params.success || function (doc) {
                    if (!cb) return;
                    var err = null;
                    if (doc && doc.err && !ignoreDocErr) {
                        err = new Error(doc.msg || doc.err);
                    }
                    cb(err, doc);
                };
                params.error = params.error || function (XMLHttpRequest, textStatus, errorThrown) {
                    var s = method.toUpperCase() + ' ' + opts.url;
                    if (params.error.timeout) errorThrown = new Error('timeout');
                    errorThrown = errorThrown || new Error(s);
                    logger.debug('failed. ' + s);
                    if (cb) cb(errorThrown, Err.FA_NETWORK);
                };
                $.ajax(params);
            };
        });
    };
};

var _jmErr = require('jm-err');

var _jmErr2 = _interopRequireDefault(_jmErr);

var _jmLogger = require('jm-logger');

var _jmLogger2 = _interopRequireDefault(_jmLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Err = _jmErr2.default.Err;
var logger = _jmLogger2.default.getLogger('jm:ajax');

/**
 * 为obj对象增加快捷ajax接口
 * @param {Object} obj 对象
 * @param {Object} [opts={}] 参数
 * @example
 * opts参数:{
         *  types: 支持的请求类型, 默认['get', 'post', 'put', 'delete']
         *  ignoreDocErr: 是否忽略返回的doc中的err(可选, 默认false, 不忽略, 检测doc.err不为空时, 生成Error)
         *  timeout: 设置默认超时检测, 单位毫秒, 默认0代表不检测超时
         * }
 */

;
module.exports = exports['default'];
},{"jm-err":4,"jm-logger":5}],2:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _jmErr = require('jm-err');

var _jmErr2 = _interopRequireDefault(_jmErr);

var _jmLogger = require('jm-logger');

var _jmLogger2 = _interopRequireDefault(_jmLogger);

var _enableajax = require('./enableajax');

var _enableajax2 = _interopRequireDefault(_enableajax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Err = _jmErr2.default.Err;
var logger = _jmLogger2.default.getLogger('jm:ajax');

var $ = {};
(function ($) {
    var utils = {
        extend: function extend(o) {
            utils.each(Array.prototype.slice.call(arguments, 1), function (a) {
                for (var p in a) {
                    if (a[p] !== void 0) o[p] = a[p];
                }
            });
            return o;
        },

        each: function each(o, fn, ctx) {
            if (o === null) return;
            if (nativeForEach && o.forEach === nativeForEach) o.forEach(fn, ctx);else if (o.length === +o.length) {
                for (var i = 0, l = o.length; i < l; i++) {
                    if (i in o && fn.call(ctx, o[i], i, o) === breaker) return;
                }
            } else {
                for (var key in o) {
                    if (hasOwnProperty.call(o, key)) if (fn.call(ctx, o[key], key, o) === breaker) return;
                }
            }
        }

    };

    var Ajax = {};
    var nativeForEach = Array.prototype.forEach,
        _each = utils.each,
        _extend = utils.extend;

    Ajax.xhr = function () {
        return new XMLHttpRequest();
    };
    Ajax._xhrResp = function (xhr) {
        switch (xhr.getResponseHeader("Content-Type").split(";")[0]) {
            case "text/xml":
                return xhr.responseXML;
            case "text/json":
            case "application/json":
            case "text/javascript":
            case "application/javascript":
            case "application/x-javascript":
                try {
                    return JSON.parse(xhr.responseText);
                } catch (e) {
                    return Err.FAIL;
                }
            default:
                return xhr.responseText;
        }
    };
    Ajax._formData = function (o) {
        var kvps = [],
            regEx = /%20/g;
        for (var k in o) {
            if (o[k] != undefined && o[k] != null) kvps.push(encodeURIComponent(k).replace(regEx, "+") + "=" + encodeURIComponent(o[k].toString()).replace(regEx, "+"));
        }
        return kvps.join('&');
    };
    Ajax.ajax = function (o) {
        var xhr = Ajax.xhr(),
            timer = null,
            n = 0;
        if (typeof xhr.open !== 'function') return;
        o = _extend({ userAgent: "XMLHttpRequest", lang: "en", type: "GET", data: null, contentType: "application/x-www-form-urlencoded" }, o);
        if (o.timeout) timer = setTimeout(function () {
            o.error.timeout = true;xhr.abort();if (o.timeoutFn) o.timeoutFn(o.url);
        }, o.timeout);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (timer != null) {
                    clearTimeout(timer);
                    timer = null;
                }
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    if (o.success) o.success(Ajax._xhrResp(xhr));
                } else if (o.error) o.error(xhr, xhr.status, xhr.statusText);
                if (o.complete) o.complete(Ajax._xhrResp(xhr), xhr, xhr.statusText);
            } else if (o.progress) o.progress(++n);
        };
        var url = o.url,
            data = null;
        o.type = (o.type || 'GET').toUpperCase();
        var isPost = o.type == "POST" || o.type == "PUT";
        if (!isPost && o.data) url += "?" + Ajax._formData(o.data);
        xhr.open(o.type, url);
        if (o.headers) for (var key in o.headers) {
            o.headers[key] && xhr.setRequestHeader(key, o.headers[key]);
        }
        if (isPost) {
            var isJson = o.contentType.indexOf("json") >= 0;
            data = isJson ? JSON.stringify(o.data) : Ajax._formData(o.data);
            xhr.setRequestHeader("Content-Type", isJson ? "application/json" : "application/x-www-form-urlencoded");
        }
        if (data) {
            xhr.send(data);
        } else {
            xhr.send();
        }
    };
    $.ajax = Ajax.ajax;
})($);

$.enableAjax = (0, _enableajax2.default)($);

if (typeof global !== 'undefined' && global) {
    global.jm && (global.jm.enableAjax = $.enableAjax);
}

exports.default = $;
module.exports = exports['default'];
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./enableajax":1,"jm-err":4,"jm-logger":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * err module.
 * @module err
 */

/**
 * common error defines
 *
 */
var Err = {
    SUCCESS: {
        err: 0,
        msg: 'Success'
    },

    FAIL: {
        err: 1,
        msg: 'Fail'
    },

    FA_SYS: {
        err: 2,
        msg: 'System Error'
    },

    FA_NETWORK: {
        err: 3,
        msg: 'Network Error'
    },

    FA_PARAMS: {
        err: 4,
        msg: 'Parameter Error'
    },

    FA_BUSY: {
        err: 5,
        msg: 'Busy'
    },

    FA_TIMEOUT: {
        err: 6,
        msg: 'Time Out'
    },

    FA_ABORT: {
        err: 7,
        msg: 'Abort'
    },

    FA_NOTREADY: {
        err: 8,
        msg: 'Not Ready'
    },

    OK: {
        err: 200,
        msg: 'OK'
    },

    FA_BADREQUEST: {
        err: 400,
        msg: 'Bad Request'
    },

    FA_NOAUTH: {
        err: 401,
        msg: 'Unauthorized'
    },

    FA_NOPERMISSION: {
        err: 403,
        msg: 'Forbidden'
    },

    FA_NOTFOUND: {
        err: 404,
        msg: 'Not Found'
    },

    FA_INTERNALERROR: {
        err: 500,
        msg: 'Internal Server Error'
    },

    FA_UNAVAILABLE: {
        err: 503,
        msg: 'Service Unavailable'
    }
};

/**
 * return message from template
 *
 * ```javascript
 * errMsg('sampe ${name} ${value}', {name: 'jeff', value: 123});
 * // return 'sample jeff 123'
 * ```
 *
 * @param {String} msg message template
 * @param {Object} opts params
 * @return {String} final message
 */
var errMsg = function errMsg(msg, opts) {
    if (opts) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = Object.keys(opts)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var key = _step.value;

                msg = msg.split('${' + key + '}').join(opts[key]);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return msg;
};

/**
 * return an Error Object
 * @param {Object|String} E Err object or a message template
 * @param {Object} [opts] params
 * @return {Error}
 */
var err = function err(E, opts) {
    if (typeof E === 'string') {
        E = {
            msg: E
        };
    }
    var msg = errMsg(E.msg, opts);
    var e = new Error(msg);
    E.err && (e.code = E.err);
    return e;
};

/**
 * enable Err Object, errMsg and err function for obj
 * @param {Object} obj target object
 * @param {String} [name] name to bind
 * @return {boolean}
 */
var enableErr = function enableErr(obj) {
    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Err';

    if (obj[name]) return false;
    obj[name] = Err;
    obj.err = err;
    obj.errMsg = errMsg;
    return true;
};

/**
 * disable Err Object, errMsg and err function for obj
 * @param {Object} obj target object
 * @param {String} [name] name to bind
 */
var disableErr = function disableErr(obj) {
    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Err';

    if (!obj[name]) return;
    delete obj[name];
    delete obj.err;
    delete obj.errMsg;
};

/**
 * module usable
 * @param {Object} obj target object
 * @param {String} [name] name to bind
 * @return {{name: string, unuse: unuse}}
 */
var moduleErr = function moduleErr(obj) {
    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Err';

    enableErr(obj, name);

    return {
        name: name,
        unuse: function unuse(obj) {
            disableErr(obj, name);
        }
    };
};

exports.default = {
    Err: Err,
    errMsg: errMsg,
    err: err,
    enableErr: enableErr,
    disableErr: disableErr,
    moduleErr: moduleErr
};
module.exports = exports['default'];
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _err = require('./err');

var _err2 = _interopRequireDefault(_err);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _err2.default;
module.exports = exports['default'];
},{"./err":3}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var getLogger = function getLogger(loggerCategoryName) {
    console.debug || (console.debug = console.log);
    return console;
};

var moduleLogger = function moduleLogger(obj) {
    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'logger';

    obj.getLogger = getLogger;
    obj.logger = getLogger();
    return {
        name: name,
        unuse: function unuse() {
            delete obj.logger;
            delete obj.getLogger;
        }
    };
};

exports.default = {
    logger: getLogger(),
    getLogger: getLogger,
    moduleLogger: moduleLogger
};
module.exports = exports['default'];
},{}]},{},[2])