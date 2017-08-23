import error from 'jm-err'
import log from 'jm-logger'

let Err = error.Err
let logger = log.getLogger('jm:ajax')

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
export default function ($) {
  return function (obj, opts) {
    opts = opts || {}
    let ignoreDocErr = opts.ignoreDocErr || false
    let types = opts.types || ['get', 'post', 'put', 'delete']
    let timeout = opts.timeout || 0
    if (!Array.isArray(types)) {
      types = [types]
    }
    types.forEach(function (method) {
      obj[method] = function (opts, cb) {
        let params = {}
        for (let key in opts) {
          params[key] = opts[key]
        }
        params.type = method.toUpperCase()
        params.contentType = params.contentType || 'application/json'
        params.dataType = params.dataType || 'json'
        params.timeout = params.timeout || timeout
        params.success = params.success ||
          function (doc) {
            if (!cb) return
            let err = null
            if (doc && doc.err) {
              logger.debug(method.toUpperCase() + ' failed. request: ' + JSON.stringify(opts) + ' response: ' + JSON.stringify(doc))
              if (!ignoreDocErr) err = new Error(doc.msg || doc.err)
            }
            cb(err, doc)
          }
        params.error = params.error ||
          function (XMLHttpRequest, textStatus, errorThrown) {
            let s = method.toUpperCase() + ' ' + opts.url
            let doc = Err.FA_NETWORK
            if (params.error.timeout) {
              errorThrown = new Error('timeout')
              doc = Err.FA_TIMEOUT
            }
            errorThrown = errorThrown || new Error(s)
            logger.debug(method.toUpperCase() + ' failed. request: ' + JSON.stringify(opts) + ' response: ' + JSON.stringify(doc))
            if (cb) cb(errorThrown, doc)
          }
        $.ajax(params)
      }
    })
  }
};
