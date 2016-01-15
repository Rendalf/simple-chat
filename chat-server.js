"use strict";

const WebSocketServer = require('ws').Server;

module.exports = class {
  constructor(serverData) {
    // name of server that will be used in chat
    this.name = "Server";
    // connections
    this.connections = [];
    // map of users: user => connection
    this.users = {};
    // array of messages
    this.messages = [];
    // create server
    this.server = new WebSocketServer(serverData);
    // on connection
    this.server.on("connection", this._onConnect.bind(this));
  }

  // send message to all authorized users and add time to message
  broadcast(data) {
    data.time = (new Date()).toTimeString();
    this.messages.unshift(data);
    let keys = Object.keys(this.users);
    keys.forEach(userName => this.users[userName].send(JSON.stringify(data)));
  }

  // handle new connection
  _onConnect(connection) {
    // add handlers
    connection.on("message", this._onReceived.bind(this, connection));
    connection.on("close", this._onClose.bind(this, connection));
    // add to array
    this.connections.push(connection);
    // log connections
    console.log("New connection", "Count of connections: " + this.connections.length);
  }

  // handle received data
  _onReceived(connection, event) {
    // logging
    try {
      var data = JSON.parse(event);
    } catch (error) {
      console.log(`Cannot parse message: ${event}`);
    }
    switch (data.type) {
      case "login":
        this._onLogin(connection, data);
        break;
      case "message":
        this._onMessage(connection, data);
        break;
      default:
        console.log(`Undefined type of message: ${data.type}`);
        break;
    }
  }

  // handle login
  _onLogin(connection, data) {
    // if user has login - drop
    if (connection.login) {
      return;
    }
    // if data has login - try authorize
    if (data.login) {
      // if login is used - drop
      if (data.login === this.name || this.users[data.login]) {
        connection.send(JSON.stringify({
          type: "login",
          login: data.login,
          status: false,
        }));
      } else {
        // set login and add to authorized
        connection.login = data.login;
        this.users[data.login] = connection;
        // send notice that authorized
        connection.send(JSON.stringify({
          type: "login",
          login: data.login,
          status: true,
        }));
        // send old messages
        connection.send(JSON.stringify({
          type: "messages",
          messages: this.messages
        }));
        // broadcast message that invited
        this.broadcast({
          type: "message",
          author: this.name,
          body: `${connection.login} has arrived`
        });
      }
    } else {
      console.log("Expected login into message");
    }
  }

  // handle input message
  _onMessage(connection, data) {
    // if no body - ignore
    if (data.body) {
      this.broadcast({
        type: data.type,
        body: data.body,
        author: connection.login,
      });
    }
  }

  // handle closed connection
  _onClose(connection) {
    // remove connection
    this.connections.splice(this.connections.indexOf(connection), 1);
    // remove from authorized if authorized
    if (this.users[connection.login]) {
      delete this.users[connection.login];
      this.broadcast({
        type: "message",
        author: this.name,
        body: `${connection.login} has left chat`
      });
    }
    // logging
    console.log("Close connection", `Count of connections: ${this.connections.length}`);
  }
}