import error from 'jm-err'
import enableAjax from './enableajax'
let Err = error.Err

let $ = {};
(function ($) {
  let utils = {
    extend: function (o) {
      utils.each(Array.prototype.slice.call(arguments, 1), function (a) {
        for (let p in a) if (a[p] !== void 0) o[p] = a[p]
      })
      return o
    },

    each: function (o, fn, ctx) {
      if (o === null) return
      if (nativeForEach && o.forEach === nativeForEach) { o.forEach(fn, ctx) } else if (o.length === +o.length) {
        for (let i = 0, l = o.length; i < l; i++) { if (i in o && fn.call(ctx, o[i], i, o) === breaker) return }
      } else {
        for (let key in o) {
          if (hasOwnProperty.call(o, key)) { if (fn.call(ctx, o[key], key, o) === breaker) return }
        }
      }
    }

  }

  let Ajax = {}
  let nativeForEach = Array.prototype.forEach
  let _extend = utils.extend

  Ajax.xhr = function () {
    return new XMLHttpRequest()
  }
  Ajax._xhrResp = function (xhr) {
    switch (xhr.getResponseHeader('Content-Type').split(';')[0]) {
      case 'text/xml':
        return xhr.responseXML
      case 'text/json':
      case 'application/json':
      case 'text/javascript':
      case 'application/javascript':
      case 'application/x-javascript':
        try {
          return JSON.parse(xhr.responseText)
        } catch (e) {
          return Err.FAIL
        }
      default:
        return xhr.responseText
    }
  }
  Ajax._formData = function (o) {
    let kvps = []
    let regEx = /%20/g
    for (let k in o) {
      if (o[k] != undefined && o[k] != null) { kvps.push(encodeURIComponent(k).replace(regEx, '+') + '=' + encodeURIComponent(o[k].toString()).replace(regEx, '+')) }
    }
    return kvps.join('&')
  }
  Ajax.ajax = function (o) {
    let xhr = Ajax.xhr()
    let timer = null
    let n = 0
    if (typeof xhr.open !== 'function') return
    o = _extend({
      userAgent: 'XMLHttpRequest',
      lang: 'en',
      type: 'GET',
      data: null,
      contentType: 'application/x-www-form-urlencoded'
    }, o)
    if (o.timeout) {
      timer = setTimeout(function () {
        o.error.timeout = true
        xhr.abort()
        if (o.timeoutFn) o.timeoutFn(o.url)
      }, o.timeout)
    }
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (timer != null) {
          clearTimeout(timer)
          timer = null
        }
        if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
          if (o.success) o.success(Ajax._xhrResp(xhr))
        } else if (o.error) o.error(xhr, xhr.status, xhr.statusText)
        if (o.complete) o.complete(Ajax._xhrResp(xhr), xhr, xhr.statusText)
      } else if (o.progress) o.progress(++n)
    }
    let url = o.url
    let data = null
    o.type = (o.type || 'GET').toUpperCase()
    let isPost = o.type === 'POST' || o.type === 'PUT'
    if (!isPost && o.data) url += '?' + Ajax._formData(o.data)
    xhr.open(o.type, url)
    if (o.headers) {
      for (let key in o.headers) {
        o.headers[key] && (xhr.setRequestHeader(key, o.headers[key]))
      }
    }
    if (isPost) {
      let isJson = o.contentType.indexOf('json') >= 0
      data = isJson ? JSON.stringify(o.data) : Ajax._formData(o.data)
      xhr.setRequestHeader('Content-Type', isJson ? 'application/json' : 'application/x-www-form-urlencoded')
    }
    if (data) {
      xhr.send(data)
    } else {
      xhr.send()
    }
  }
  $.ajax = Ajax.ajax
}($))

$.enableAjax = enableAjax($)

if (typeof global !== 'undefined' && global) {
  global.jm || (global.jm = {})
  let jm = global.jm
  if (!jm.ajax) {
    jm.ajax = $.ajax
    jm.enableAjax = $.enableAjax
  }
}

export default $
