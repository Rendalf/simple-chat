const Client = require("./client.js");
const Observer = require("./observer.js");
const Components = require("./components.js");

var authForm = new Components.AuthForm();

const App = class extends Observer {
  // settings:
  //  socketUrl
  //  node (appNode)
  constructor(settings) {
    super();
    this.client = new Client(settings.socketUrl);
    this.node = settings.node;
    this.components = {
      authForm: new Components.AuthForm(),
      messageForm: new Components.MessageForm(),
      messagesList: new Components.MessagesList(),
      usersList: new Components.UsersList(),
    };

    this.setInitialState();
  }

  setInitialState() {
    this.node.innerHTML = "";
    this.node.appendChild(this.components.authForm.node);

    // set handlers for login
    this.client.on("login.success", () => this.setAuthorizedState());
    this.client.on("login.error", () => this.components.authForm.setError());
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

  setAuthorizedState() {
    let main = document.createElement("section");
    main.className = "col-xs-12 col-sm-9";
    main.appendChild(this.components.messageForm.node);
    main.appendChild(this.components.messagesList.node);

    let aside = document.createElement("aside");
    aside.className = "col-xs-12 col-sm-3";
    aside.appendChild(this.components.usersList.node);

    this.node.innerHTML = "";
    this.node.appendChild(main);
    this.node.appendChild(aside);
  }
}

module.exports = App;