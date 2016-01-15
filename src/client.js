"use strict";

const Observer = require("./observer.js");

const Client = class extends Observer {
  constructor(url) {
    super();
    // initialize state
    this.state = {
      connected: false
    };
    // save url
    this.url = url;
    // create socket
    this.socket = new WebSocket(this.url);
    // event handlers
    this.socket.onopen = this._onOpen.bind(this);
    this.socket.onclose = this._onClose.bind(this);
    this.socket.onmessage = this._onReceived.bind(this);
  }

  send(data) {
    this.socket.send(JSON.stringify(data));
  }

  login(login) {
    this.send({
      type: "login",
      login
    });
  }

  _onOpen() {
    this.state.connected = true;
    console.log("Connected...");
    this.notify("open");
  }

  _onClose(event) {
    this.state.connected = false;
    console.log("Disconnected...");
    this.notify("closed");
  }

  _onReceived(event) {
    let data = JSON.parse(event.data);
    switch (data.type) {
      case "login":
        this._onLogin(data);
        break;
      case "message":
        this._onMessage(data);
        break;
      case "messages":
        this._onMessages(data);
        break;
      default:
        throw new Error("Unknown message type:" + data.type);
        break;
    }
  }

  _onLogin(data) {
    if (data.status) {
      this.state.login = data.login;
      this.notify("login.success");
    } else {
      this.notify("login.error");
    }
  }

  _onMessages(data) {
    this.notify("messages", data.messages);
  }

  _onMessage(data) {
    this.notify("messages", [data]);
  }
}

module.exports = Client;