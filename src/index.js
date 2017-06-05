import enableAjax from './enableajax';
import ajax from 'najax';

let $ = {};
$.ajax = ajax;
$.enableAjax = enableAjax($);

export default $;
