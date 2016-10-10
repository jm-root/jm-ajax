var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('../lib');
}

(function(){
    var logger = jm.logger;
    var obj = {};
    jm.enableAjax(obj, {timeout: 1000});
    obj.get({
        url: 'http://localhost:20100/sso/issignon'
    }, function(err, doc){
        if(err) logger.error(err.stack);
        if(doc) logger.debug(JSON.stringify(doc));
    })
})();
