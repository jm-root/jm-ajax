import enableAjax from './enableajax';
import ajax from 'najax';

let $ = {};
$.ajax = ajax;
$.enableAjax = enableAjax($);

if (typeof global !== 'undefined' && global) {
    global.jm || (global.jm = {});
    let jm = global.jm;
    if(!jm.ajax) {
        jm.ajax = $.ajax;
        jm.enableAjax = $.enableAjax;
    }
}

export default $;
