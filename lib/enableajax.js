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