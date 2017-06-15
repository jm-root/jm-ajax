import chai from 'chai';
let expect = chai.expect;
import $ from '../src';

let obj = {};
$.enableAjax(obj);

$.ajax({
    type: 'get',
    url: 'http://api.jamma.cn',
    data: {
        name: 123,
    },
    headers: {
        'X-Forwarded-For': '128.0.0.1, 129.0.0.1',
    },
}, function (err, doc) {
    if (err) logger.error(err.stack);
    if (doc) logger.info(JSON.stringify(doc));
});

let cb = (err, doc) => {
    if (err) console.log(err.stack);
    console.log('%j', doc);
};

describe('route', function () {
    it('ajax', function () {
        obj.get({
            url: 'http://api.jamma.cn/',
        }, cb);
    });
});
