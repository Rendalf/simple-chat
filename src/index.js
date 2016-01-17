const config = require("../config.json");
const App = require("./app.js");

var app = new App({
  socketUrl: `ws://${config["chat-server"].origin}:${config["chat-server"].port}`,
  node: document.getElementById("app")
});