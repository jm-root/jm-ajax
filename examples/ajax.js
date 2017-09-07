if (typeof module !== 'undefined' && module.exports) {
  require('../')
}

(function () {
  var logger = console
  var obj = {}
  jm.enableAjax(obj, {timeout: 5000})
  obj.get({
    url: 'http://api.jamma.cn',
    data: {}
  }, function (err, doc) {
    if (err) logger.error(err.stack)
    if (doc) logger.info(JSON.stringify(doc))
  })

  obj.get({
    url: 'http://api.jamma.cn',
    headers: {
      'content-type': 'text/xml'
    },
    data: {
      abc: 123
    }
  })
    .then(function (doc) {
      logger.info(JSON.stringify(doc))
    })
    .catch(function(err) {
      if (err) logger.error(err.stack)
    })
})()
