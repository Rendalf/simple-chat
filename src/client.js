// chat client for connection with chat server

const Observer = require("./observer.js");

// client class
const Client = class extends Observer {
  constructor(url) {
    super();

    // initialize state
    this.state = {
      connected: false,
      login: null
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

  // send message
  send(data) {
    this.socket.send(JSON.stringify(data));
  }

  // try login
  login(login) {
    this.send({
      type: "login",
      login
    });
  }

  // handle event opened connection
  _onOpen() {
    this.state.connected = true;
    console.log("Connected...");
    this.notify("open");
  }

  // handle event closed connection
  _onClose(event) {
    this.state.connected = false;
    console.log("Disconnected...");
    this.notify("closed");
  }

  // handle received data
  _onReceived(event) {
    let data = JSON.parse(event.data);
    switch (data.type) {
      case "login":
        this._onLogin(data);
        break;
      case "message":
        this.notify("message", data);
        break;
      case "join":
        this.notify("join", data);
        break;
      case "leave":
        this.notify("leave", data);
        break;
      case "history":
        this.notify("history", data);
        break;
      case "users":
        this.notify("users", data.users);
        break;
      default:
        throw new Error(`Unknown message type: ${data.type}`);
        break;
    }
  }

  // on login message
  _onLogin(data) {
    if (data.status) {
      this.state.login = data.login;
      this.notify("login.success");
    } else {
      this.notify("login.error");
    }
  }
}

module.exports = Client;