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
      obj[method] = function (opts, cb) {
        if (typeof Promise !== 'undefined') {
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
        } else {
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
        }
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