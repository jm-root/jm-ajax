import error from 'jm-err';
import log from 'jm-logger';
import enableAjax from './enableajax';
import ajax from 'najax';
let Err = error.Err;
let logger = log.getLogger('jm:ajax');

let $ = {};
$.ajax = ajax;
$.enableAjax = enableAjax($);

export default $;

