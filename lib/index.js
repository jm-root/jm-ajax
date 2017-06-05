'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jmErr = require('jm-err');

var _jmErr2 = _interopRequireDefault(_jmErr);

var _jmLogger = require('jm-logger');

var _jmLogger2 = _interopRequireDefault(_jmLogger);

var _enableajax = require('./enableajax');

var _enableajax2 = _interopRequireDefault(_enableajax);

var _najax = require('najax');

var _najax2 = _interopRequireDefault(_najax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Err = _jmErr2.default.Err;
var logger = _jmLogger2.default.getLogger('jm:ajax');

var $ = {};
$.ajax = _najax2.default;
$.enableAjax = (0, _enableajax2.default)($);

exports.default = $;
module.exports = exports['default'];