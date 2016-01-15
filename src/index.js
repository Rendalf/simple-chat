"use strict";

const socketUrl = "ws://localhost:9000";

const App = require("./app.js");

var app = new App({
  socketUrl: socketUrl,
  node: document.getElementById("app")
});