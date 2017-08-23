'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jmErr = require('jm-err');

var _jmErr2 = _interopRequireDefault(_jmErr);

var _enableajax = require('./enableajax');

var _enableajax2 = _interopRequireDefault(_enableajax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Err = _jmErr2.default.Err;

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