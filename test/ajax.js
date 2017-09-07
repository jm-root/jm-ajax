import chai from 'chai'

let expect = chai.expect
import $ from '../src'

let obj = {}
$.enableAjax(obj)

let cb = (err, doc) => {
  if (err) console.log(err.stack)
  console.log('%j', doc)
}

describe('route', function () {
  it('ajax', function (done) {
    $.ajax({
      type: 'get',
      url: 'http://api.jamma.cn',
      data: {
        name: 123
      },
      headers: {
        'X-Forwarded-For': '128.0.0.1, 129.0.0.1'
      }
    }, function (doc) {
      cb(null, doc)
      done()
    })
  })

  it('get', function (done) {
    obj.get({
      url: 'http://api.jamma.cn'
    }, function (err, doc) {
      cb(err, doc)
      done()
    })
  })

  it('get promise', function (done) {
    obj.get({
      url: 'http://api.jamma.cn/'
    })
      .then(function (doc) {
        cb(null, doc)
        done()
      })
      .catch(function(err){
        cb(err)
        done()
      })
  })
})
