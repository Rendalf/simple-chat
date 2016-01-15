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
    this.client.on("messages", (messages) => this.components.messagesList.addMessages(messages));
    this.components.messageForm.on("submit", ({message}) => {
      this.client.send({
        type: "message",
        body: message,
      })
    });
  }

  setAuthorizedState() {
    this.node.innerHTML = "";
    this.node.appendChild(this.components.messagesList.node);
    this.node.appendChild(this.components.messageForm.node);
  }
}

module.exports = App;