if (typeof XMLHttpRequest !== 'undefined') {
  module.exports = require('./lib/browser')
} else {
  module.exports = require('./lib')
}
