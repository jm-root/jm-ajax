'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _enableajax = require('./enableajax');

var _enableajax2 = _interopRequireDefault(_enableajax);

var _najax = require('najax');

var _najax2 = _interopRequireDefault(_najax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $ = {};
$.ajax = _najax2.default;
$.enableAjax = (0, _enableajax2.default)($);

if (typeof global !== 'undefined' && global) {
  global.jm || (global.jm = {});
  var jm = global.jm;
  if (!jm.ajax) {
    jm.ajax = $.ajax;
    jm.enableAjax = $.enableAjax;
  }
}

exports.default = $;
module.exports = exports['default'];