(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function ($) {
  return function (obj) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var types = opts.types || ['get', 'post', 'put', 'delete'];
    var timeout = opts.timeout || 0;
    if (!Array.isArray(types)) {
      types = [types];
    }
    types.forEach(function (method) {
      if (typeof Promise !== 'undefined') {
        obj[method] = function (opts, cb) {
          if (cb) {
            this[method](opts).then(function (doc) {
              cb(null, doc);
            }).catch(function (err) {
              cb(err);
            });
            return this;
          }
          return new Promise(function (resolve, reject) {
            var params = {};
            for (var key in opts) {
              params[key] = opts[key];
            }
            params.type = method.toUpperCase();
            params.contentType = params.contentType || 'application/json';
            params.dataType = params.dataType || 'json';
            params.timeout = params.timeout || timeout;
            params.success = params.success || function (doc) {
              if (doc && doc.err) {
                var s = method.toUpperCase() + ' ' + opts.url;
                logger.debug(s + ' failed. request: ' + JSON.stringify(opts) + ' response: ' + JSON.stringify(doc));
              }
              resolve(doc);
            };
            params.error = params.error || function (XMLHttpRequest, textStatus, errorThrown) {
              var s = method.toUpperCase() + ' ' + opts.url;
              if (params.error.timeout) {
                errorThrown = new Error(Err.FA_TIMEOUT.msg);
                errorThrown.code = Err.FA_TIMEOUT.err;
              }
              errorThrown || (errorThrown = new Error(s));
              logger.debug(s + ' failed. request: ' + JSON.stringify(opts));
              reject(errorThrown);
            };
            $.ajax(params);
          });
        };
      } else {
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
            if (doc && doc.err) {
              var s = method.toUpperCase() + ' ' + opts.url;
              logger.debug(s + ' failed. request: ' + JSON.stringify(opts) + ' response: ' + JSON.stringify(doc));
            }
            cb(null, doc);
          };
          params.error = params.error || function (XMLHttpRequest, textStatus, errorThrown) {
            var s = method.toUpperCase() + ' ' + opts.url;
            var doc = Err.FA_NETWORK;
            if (params.error.timeout) {
              errorThrown = new Error(Err.FA_TIMEOUT.msg);
              errorThrown.code = Err.FA_TIMEOUT.err;
              doc = Err.FA_TIMEOUT;
            }
            errorThrown || (errorThrown = new Error(s));
            logger.debug(s + ' failed. request: ' + JSON.stringify(opts) + ' response: ' + JSON.stringify(doc));
            if (cb) cb(errorThrown, doc);
          };
          $.ajax(params);
        };
      }
    });
  };
};

var _jmErr = require('jm-err');

var _jmErr2 = _interopRequireDefault(_jmErr);

var _jmLogger = require('jm-logger');

var _jmLogger2 = _interopRequireDefault(_jmLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Err = _jmErr2.default.Err;
var logger = _jmLogger2.default.getLogger('jm-ajax');

/**
 * 为obj对象增加快捷ajax接口
 * @param {Object} obj 对象
 * @param {Object} [opts={}] 参数
 * @example
 * opts参数:{
         *  types: 支持的请求类型, 默认['get', 'post', 'put', 'delete']
         *  timeout: 设置默认超时检测, 单位毫秒, 默认0代表不检测超时
         * }
 */
;
module.exports = exports['default'];
},{"jm-err":3,"jm-logger":6}],2:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _enableajax = require('./enableajax');

var _enableajax2 = _interopRequireDefault(_enableajax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
      if (nativeForEach && o.forEach === nativeForEach) {
        o.forEach(fn, ctx);
      } else if (o.length === +o.length) {
        for (var i = 0, l = o.length; i < l; i++) {
          if (i in o && fn.call(ctx, o[i], i, o) === breaker) return;
        }
      } else {
        for (var key in o) {
          if (hasOwnProperty.call(o, key)) {
            if (fn.call(ctx, o[key], key, o) === breaker) return;
          }
        }
      }
    }

  };

  var Ajax = {};
  var nativeForEach = Array.prototype.forEach;
  var _extend = utils.extend;

  Ajax.xhr = function () {
    return new XMLHttpRequest();
  };
  Ajax._xhrResp = function (xhr) {
    switch (xhr.getResponseHeader('Content-Type').split(';')[0]) {
      case 'text/xml':
        return xhr.responseXML;
      case 'text/json':
      case 'application/json':
      case 'text/javascript':
      case 'application/javascript':
      case 'application/x-javascript':
        return JSON.parse(xhr.responseText);
      default:
        return xhr.responseText;
    }
  };
  Ajax._formData = function (o) {
    var kvps = [];
    var regEx = /%20/g;
    for (var k in o) {
      if (o[k] != undefined && o[k] != null) {
        kvps.push(encodeURIComponent(k).replace(regEx, '+') + '=' + encodeURIComponent(o[k].toString()).replace(regEx, '+'));
      }
    }
    return kvps.join('&');
  };
  Ajax.ajax = function (o) {
    var xhr = Ajax.xhr();
    var timer = null;
    var n = 0;
    if (typeof xhr.open !== 'function') return;
    o = _extend({
      userAgent: 'XMLHttpRequest',
      lang: 'en',
      type: 'GET',
      data: null,
      contentType: 'application/x-www-form-urlencoded'
    }, o);
    if (o.timeout) {
      timer = setTimeout(function () {
        o.error.timeout = true;
        xhr.abort();
        if (o.timeoutFn) o.timeoutFn(o.url);
      }, o.timeout);
    }
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
    var url = o.url;
    var data = null;
    o.type = (o.type || 'GET').toUpperCase();
    var isPost = o.type === 'POST' || o.type === 'PUT';
    if (!isPost && o.data) url += '?' + Ajax._formData(o.data);
    xhr.open(o.type, url);
    if (o.headers) {
      for (var key in o.headers) {
        o.headers[key] && xhr.setRequestHeader(key, o.headers[key]);
      }
    }
    if (isPost) {
      var isJson = o.contentType.indexOf('json') >= 0;
      data = isJson ? JSON.stringify(o.data) : Ajax._formData(o.data);
      xhr.setRequestHeader('Content-Type', isJson ? 'application/json' : 'application/x-www-form-urlencoded');
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
  global.jm || (global.jm = {});
  var jm = global.jm;
  if (!jm.ajax) {
    jm.ajax = $.ajax;
    jm.enableAjax = $.enableAjax;
  }
}

exports.default = $;
module.exports = exports['default'];
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./enableajax":1}],3:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _locale = require('./locale');

var _locale2 = _interopRequireDefault(_locale);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

  FA_NOTEXISTS: {
    err: 9,
    msg: 'Not Exists'
  },

  FA_EXISTS: {
    err: 8,
    msg: 'Already Exists'
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
}; /**
    * err module.
    * @module err
    */

Err.t = _locale2.default;

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
    for (var key in opts) {
      msg = msg.split('${' + key + '}').join(opts[key]);
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

var $ = {
  Err: Err,
  errMsg: errMsg,
  err: err,
  enableErr: enableErr,
  disableErr: disableErr
};

if (typeof global !== 'undefined' && global) {
  global.jm || (global.jm = {});
  var jm = global.jm;
  if (!jm.enableErr) {
    enableErr(jm);
    for (var key in $) {
      jm[key] = $[key];
    }
  }
}

exports.default = $;
module.exports = exports['default'];
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./locale":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (msg, lng) {
  if (!lng || !lngs[lng]) return null;
  return lngs[lng][msg];
};

var _zh_CN = require('./zh_CN');

var _zh_CN2 = _interopRequireDefault(_zh_CN);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lngs = {
  zh_CN: _zh_CN2.default

  /**
   * translate
   * @param {string} msg - msg to be translate
   * @param {string} lng - language
   * @return {String | null}
   */
};;
module.exports = exports['default'];
},{"./zh_CN":5}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  'Success': '成功',
  'Fail': '失败',
  'System Error': '系统错误',
  'Network Error': '网络错误',
  'Parameter Error': '参数错误',
  'Busy': '忙',
  'Time Out': '超时',
  'Abort': '中止',
  'Not Ready': '未准备好',
  'Not Exists': '不存在',
  'Already Exists': '已存在',
  'OK': 'OK',
  'Bad Request': '错误请求',
  'Unauthorized': '未验证',
  'Forbidden': '无权限',
  'Not Found': '未找到',
  'Internal Server Error': '服务器内部错误',
  'Service Unavailable': '无效服务'
};
module.exports = exports['default'];
},{}],6:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * logger module.
 * @module logger
 */

var getLogger = function getLogger(loggerCategoryName) {
    console.debug || (console.debug = console.log);
    return console;
};

var moduleLogger = function moduleLogger() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'logger';

    var obj = this;
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

var $ = {
    logger: getLogger(),
    getLogger: getLogger,
    moduleLogger: moduleLogger
};

if (typeof global !== 'undefined' && global) {
    global.jm || (global.jm = {});
    var jm = global.jm;
    if (!jm.logger) {
        for (var key in $) {
            jm[key] = $[key];
        }
    }
}

exports.default = $;
module.exports = exports['default'];
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[2])