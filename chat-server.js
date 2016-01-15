"use strict";

const WebSocketServer = require('ws').Server;


const ChatServer = class {

  constructor(serverData) {
    // name of server that will be used in chat
    this.name = "Server";
    // connections (authorized users)
    this.connections = [];
    // array of messages
    this.messages = [];
    // create server
    this.server = new WebSocketServer(serverData);
    // add handler of new connection
    this.server.on("connection", this._onConnect.bind(this));
  }


  // send data to connection; if connection is null or undefined, then send to all users
  send(data, connection) {
    let jsonData = JSON.stringify(data);
    if (connection) {
      connection.send(jsonData);
    } else {
      this.connections.forEach(connection => connection.send(jsonData));
    }
  }


  // add time to data, save it to storage and send to all
  broadcast(data) {
    data.time = this._currentTime;
    this.messages.unshift(data);
    this.send(data);
  }


  // send users that connected to chat
  _sendUsers(connection) {
    let users = this.connections.map(connection => connection.login);
    this.send({
      type: "users",
      users
    }, connection);
  }


  // get current time for adding to message
  get _currentTime() {
    return (new Date()).toTimeString();
  }


  // handle new connection
  _onConnect(connection) {
    // add handler
    connection.on("message", this._onReceived.bind(this, connection));
  }


  // handle received data
  _onReceived(connection, event) {
    // try parse json
    try {
      var data = JSON.parse(event);
    } catch (error) {
      console.log(`Cannot parse message: ${event}`);
    }

    // filter unauthorized connections
    if (connection.login) {
      // search handler
      switch(data.type) {
        case "message":
          this._onMessage(connection, data);
          break;
        default:
          console.log(`Undefined type of message: ${data.type}`);
          break;
      }
    } else if(data.type === "login") {
      // unless authorized then handle only login messages
      this._onLogin(connection, data);
    }
  }


  // handle login
  _onLogin(connection, data) {

    // if user has login or login is not passed - drop
    if (connection.login || !data.login) {
      return;
    }

    // if login is used - send failed
    let logins = this.connections.map(connection => connection.login);
    if (data.login === this.name || data.login in logins) {

      connection.send(JSON.stringify({
        type: "login",
        login: data.login,
        status: false,
      }));

    } else {

      // set login and add to authorized
      connection.login = data.login;
      this.connections.push(connection);

      // add handler of closing connection
      connection.on("close", this._onClose.bind(this, connection));

      // send notice that authorized
      connection.send(JSON.stringify({
        type: "login",
        login: data.login,
        status: true,
      }));

      // send history
      connection.send(JSON.stringify({
        type: "history",
        messages: this.messages
      }));

      // broadcast message that joined
      this.broadcast({
        type: "join",
        author: this.name,
        body: `${connection.login} has joined`,
        user: connection.login,
      });

      // send connected users
      this._sendUsers(connection);

    }
  }

  // handle input message
  _onMessage(connection, data) {
    // if has no body - ignore
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

    // broadcast that user has left the chat
    this.broadcast({
      type: "leave",
      author: this.name,
      user: connection.login,
      body: `${connection.login} has left chat`,
    });
  }
}

// export chat-server
module.exports = ChatServer;