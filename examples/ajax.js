if (typeof module !== 'undefined' && module.exports) {
  require('../')
}

(function () {
  var logger = console
  var obj = {}
  jm.enableAjax(obj, {timeout: 5000})
  obj.get({
    url: 'http://api.jamma.cn',
    data: {
    }
  }, function (err, doc) {
    if (err) logger.error(err.stack)
    if (doc) logger.info(JSON.stringify(doc))
  })
})()
