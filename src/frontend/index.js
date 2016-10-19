
module.exports = {
  'create_app': function() {
    var factory = require('./rtxui');
    return factory.create_app();
  },

  // Dependencies
  'env': require('..'),
}
