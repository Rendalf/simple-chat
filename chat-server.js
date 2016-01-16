"use strict";

const WebSocketServer = require('ws').Server;

// history storage
const History = class {
  constructor() {
    this.messages = [];
  }

  // set time and id, add to storage and return
  push(message) {
    message.time = (new Date()).toTimeString();
    message.id = this.messages.push() - 1;
    return message;
  }

  // get message as id
  get(id) {
    return this.messages[id];
  }

  // get last message
  get last() {
    return this.messages[this.messages.length - 1];
  }

  // get chunk of messages
  chunk(first, size) {
    return this.messages.slice(first, first + size);
  }

  // get chunk of history (by last sent message id)
  chunkHistory(last, size) {
    var first = last - size;
    first = first < 0 ? 0 : first;
    return this.messages.slice(first, last);
  }
}


// server of chat
const ChatServer = class {
  constructor(serverData) {
    // name of server that will be used in chat
    this.name = "Server";
    // size of chunk history
    this._historyChunkSize = 1;
    // connections (authorized users)
    this.connections = [];
    // create history storage
    this.history = new History();
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

  // add to storage and send to users
  broadcast(data) {
    this.send(this.history.push(data));
  }

  // send history chunk to user
  _sendHistoryChunk(connection, lastId) {
    if (typeof lastId === "undefined" || typeof lastId === "null") {
      lastId = this.history.last.id;
    }
    var messages = this.history.chunkHistory(lastId, this._historyChunkSize);

    this.send({
      type: "history",
      messages,
      hasMore: messages[0].id > 0
    }, connection);
  }

  // send users that connected to chat
  _sendUsers(connection) {
    var users = this.connections.map(connection => connection.login);
    this.send({
      type: "users",
      users
    }, connection);
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
        case "history":
          this._sendHistoryChunk(connection, data.lastId);
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
    if (data.login === this.name || this.connections.find(connection => connection.login === data.login)) {
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
      this._sendHistoryChunk(connection);
      // broadcast message that joined
      this.broadcast({
        type: "join",
        author: this.name,
        body: `${connection.login} has joined`,
        login: connection.login,
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
      login: connection.login,
      body: `${connection.login} has left chat`,
    });
  }
}

// export chat-server
module.exports = ChatServer;