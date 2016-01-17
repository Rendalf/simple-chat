// chat client application class

const Client = require("./client.js");
const Observer = require("./observer.js");
const AuthForm = require("./components/auth-form.js");
const MessageForm = require("./components/message-form.js");
const MessagesList = require("./components/messages-list.js");
const UsersList = require("./components/users-list.js");
const Disconnected = require("./components/disconnected.js");

// application class
const App = class extends Observer {
  // settings:
  //  socketUrl
  //  node (appNode)
  constructor(settings) {
    super();

    // client
    this.client = new Client(settings.socketUrl);
    this.client.on("closed", () => this.setDisconnectedState());

    // node that will be used to mount root node
    this.node = settings.node;
    // set components of app
    this.components = {
      authForm: new AuthForm(),
      messageForm: new MessageForm(),
      messagesList: new MessagesList(),
      usersList: new UsersList(),
      disconnected: new Disconnected(),
    };

    this.setInitialState();
  }

  // set initial state of application
  setInitialState() {
    this.state = "login";
    // mount auth form node
    this.node.innerHTML = "";
    this.node.appendChild(this.components.authForm.node);

    // set handlers for login
    this.client.on("login.success", () => this.setAuthorizedState());
    this.client.on("login.error", () => this.components.authForm.showError());
    this.components.authForm.on("submit", ({login}) => this.client.login(login));

    // set basic handlers
    this.client.on("message", message => this.components.messagesList.addMessage(message));
    this.client.on("join", message => {
      this.components.usersList.add(message.login);
      this.components.messagesList.addMessage(message);
    });
    this.client.on("leave", message => {
      this.components.usersList.remove(message.login);
      this.components.messagesList.addMessage(message);
    });
    this.client.on("users", users => this.components.usersList.set(users));
    this.client.on("history", history => this.components.messagesList.addMessages(history));
    this.components.messageForm.on("submit", (data) => {
      this.client.send(Object.assign({type: "message"}, data))
    });
    this.components.messagesList.on("history.more", (data) => {
      this.client.send(Object.assign({type: "history"}, data));
    });
  }

  // set state after login
  setAuthorizedState() {
    this.state = "authorized";
    // main region of chat applicaton
    var main = document.createElement("section");
    main.className = "col-xs-12 col-sm-9";
    main.appendChild(this.components.messageForm.node);
    main.appendChild(this.components.messagesList.node);

    // aside region of chat applicaton
    var aside = document.createElement("aside");
    aside.className = "col-xs-12 col-sm-3";
    aside.appendChild(this.components.usersList.node);

    // mount regions
    this.node.innerHTML = "";
    this.node.appendChild(main);
    this.node.appendChild(aside);
  }

  // when disconnected
  setDisconnectedState() {
    this.state = "disconnected";

    // main region of chat applicaton
    var main = document.createElement("section");
    main.className = "col-xs-12 col-sm-9";
    main.appendChild(this.components.disconnected.node);
    main.appendChild(this.components.messagesList.node);

    // aside region of chat applicaton
    var aside = document.createElement("aside");
    aside.className = "col-xs-12 col-sm-3";
    this.components.usersList.set([]);
    aside.appendChild(this.components.usersList.node);

    // mount regions
    this.node.innerHTML = "";
    this.node.appendChild(main);
    this.node.appendChild(aside);
  }
};

module.exports = App;