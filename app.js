

console.log("Importing frontend application");
var fe_app = require("./src/frontend").create_app();
console.log("Application loaded");

module.exports = {
  'frontend': fe_app
}
