var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

(function(){
    if(jm.ajax) return;
    var $ = jm;
    var ERR = jm.ERR;
    var logger = jm.getLogger('jm:ajax');

    if (typeof module !== 'undefined' && module.exports) {
        $.ajax = require('najax');
    }else{
        (function($){
            var utils = {
                extend: function (o) {
                    utils.each(Array.prototype.slice.call(arguments, 1), function (a) {
                        for (var p in a) if (a[p] !== void 0) o[p] = a[p];
                    });
                    return o;
                },

                each: function (o, fn, ctx) {
                    if (o === null) return;
                    if (nativeForEach && o.forEach === nativeForEach)
                        o.forEach(fn, ctx);
                    else if (o.length === +o.length) {
                        for (var i = 0, l = o.length; i < l; i++)
                            if (i in o && fn.call(ctx, o[i], i, o) === breaker) return;
                    } else {
                        for (var key in o)
                            if (hasOwnProperty.call(o, key))
                                if (fn.call(ctx, o[key], key, o) === breaker) return;
                    }
                }

            };

            var Ajax = {};
            _xhrf = null;
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
                            return ERR.FAIL;
                        }
                    default:
                        return xhr.responseText;
                }
            };
            Ajax._formData = function (o) {
                var kvps = [], regEx = /%20/g;
                for (var k in o) {
                    if(o[k]!=undefined && o[k]!=null)
                        kvps.push(encodeURIComponent(k).replace(regEx, "+") + "=" + encodeURIComponent(o[k].toString()).replace(regEx, "+"));
                }
                return kvps.join('&');
            };
            Ajax.ajax = function (o) {
                var xhr = Ajax.xhr(), timer=null, n = 0;
                if(typeof xhr.open !== 'function') return;
                o = _extend({ userAgent: "XMLHttpRequest", lang: "en", type: "GET", data: null, contentType: "application/x-www-form-urlencoded" }, o);
                if (o.timeout) timer = setTimeout(function () {o.error.timeout = true; xhr.abort(); if (o.timeoutFn) o.timeoutFn(o.url); }, o.timeout);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (timer!=null) {
                            clearTimeout(timer);
                            timer = null;
                        }
                        if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                            if (o.success) o.success(Ajax._xhrResp(xhr));
                        }
                        else if (o.error) o.error(xhr, xhr.status, xhr.statusText);
                        if (o.complete) o.complete(Ajax._xhrResp(xhr), xhr, xhr.statusText);
                    }
                    else if (o.progress) o.progress(++n);
                };
                var url = o.url, data = null;
                o.type = (o.type||'GET').toUpperCase();
                var isPost = o.type == "POST" || o.type == "PUT";
                if (!isPost && o.data) url += "?" + Ajax._formData(o.data);
                xhr.open(o.type, url);
                if (isPost) {
                    var isJson = o.contentType.indexOf("json") >= 0;
                    data = isJson ? JSON.stringify(o.data) : Ajax._formData(o.data);
                    xhr.setRequestHeader("Content-Type", isJson ? "application/json" : "application/x-www-form-urlencoded");
                }
                if(data){
                    xhr.send(data);
                }else{
                    xhr.send();
                }
            };
            $.ajax = Ajax.ajax;
        }($));
    }

    /**
     * 为obj对象增加快捷ajax接口
     * @function jm#enableAjax
     * @param {Object} obj 对象
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
         *  types: 支持的请求类型, 默认['get', 'post', 'put', 'delete']
         *  ignoreDocErr: 是否忽略返回的doc中的err(可选, 默认false, 不忽略, 检测doc.err不为空时, 生成Error)
         *  timeout: 设置默认超时检测, 单位毫秒, 默认0代表不检测超时
         * }
     */
    jm.enableAjax = function(obj, opts){
        opts = opts || {};
        var ignoreDocErr = opts.ignoreDocErr || false;
        var types = opts.types || ['get', 'post', 'put', 'delete'];
        var timeout = opts.timeout || 0;
        if(!Array.isArray(types)){
            types = [types];
        }
        types.forEach(function(method) {
            obj[method] = function(opts, cb) {
                var params = {};
                for(var key in opts){
                    params[key] = opts[key];
                }
                params.type = method.toUpperCase();
                params.contentType = params.contentType || 'application/json';
                params.dataType = params.dataType || 'json';
                params.timeout = params.timeout || timeout;
                params.success = params.success ||
                    function(doc) {
                        if(!cb) return;
                        var err = null;
                        if(doc && doc.err && !ignoreDocErr){
                            err = new Error(doc.msg || doc.err);
                        }
                        cb(err, doc);
                    };
                params.error = params.error ||
                    function(XMLHttpRequest, textStatus, errorThrown){
                        var s = method.toUpperCase() + ' ' + opts.url;
                        if(params.error.timeout) errorThrown = new Error('timeout');
                        errorThrown = errorThrown || new Error(s);
                        logger.debug('failed. ' + s);
                        if(cb) cb(errorThrown, ERR.FA_NETWORK);
                    }
                $.ajax(params);
            };
        });
    };

})();
