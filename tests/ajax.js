var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('../lib');
}

(function(){
    var logger = jm.logger;
    var obj = {};
    jm.enableAjax(obj, {timeout: 5000});
    obj.get({
        url: 'http://localhost:3000/users/123',
        data: {
            name: 123
        },
        headers: {
            'X-Forwarded-For': '128.0.0.1, 129.0.0.1'
        }
    }, function(err, doc){
        if(err) logger.error(err.stack);
        if(doc) logger.debug(JSON.stringify(doc));
    })
})();
