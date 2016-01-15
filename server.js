const http = require("http");
const nodeStatic = require("node-static");
const staticServer = new nodeStatic.Server("./public/");
const ChatServer = require("./chat-server.js");

const staticPort = 10030;
const wsPort = 9000;

// create static server
http.createServer((request, response) => {
  // redirect to index.html
  if (request.url === "/") {
    request.url = "/index.html";
  }
  staticServer.serve(request, response);
}).listen(staticPort);

console.log("static server is running on http://localhost:" + staticPort);

new ChatServer({
  port: wsPort
});

console.log("chat server is running on ws://localhost:" + wsPort);