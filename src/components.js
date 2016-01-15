const Observer = require("./observer.js");

// form for authorization
const AuthForm = class extends Observer {
  constructor() {
    super();
    this.state = {error: false};

    // create event handlers
    this.eventHandlers = {};
    this.eventHandlers.onChangeInput = this.unsetError.bind(this);
    this.eventHandlers.onSubmit = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.notify("submit", {login: this.elements.input.value});
    }

    // create map of elements
    this.elements = {};

    // create input field
    let input = document.createElement("input");
    input.setAttribute("name", "login");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "Nickname");
    input.className = "form-control";
    this.elements.input = input;

    // create button submit
    let button = document.createElement("button");
    button.setAttribute("type", "submit");
    button.className = "btn btn-primary form-control";
    button.innerHTML = "Login";
    this.elements.button = button;

    // create fieldset
    let fieldSet = document.createElement("fieldset");
    fieldSet.className = "form-group";
    fieldSet.appendChild(input);
    fieldSet.appendChild(button);
    this.elements.fieldSet = fieldSet;

    // create form
    let form = document.createElement("form");
    form.setAttribute("id", "auth-form");
    form.className = "form-inline text-center";
    form.appendChild(fieldSet);
    form.addEventListener("submit", this.eventHandlers.onSubmit);
    this.elements.form = form;

    // create error notice
    let errorNotice = document.createElement("span");
    errorNotice.className = "text-danger";
    errorNotice.innerHTML = "This nickname is used. Choose another nickname";
    this.elements.errorNotice = errorNotice;
  }

  setError() {
    if (!this.state.error) {
      this.state.error = true;
      this.elements.form.appendChild(this.elements.errorNotice);
      this.elements.input.addEventListener("keydown", this.eventHandlers.onChangeInput);
    }
  }

  unsetError() {
    if (this.state.error) {
      this.state.error = false;
      this.elements.form.removeChild(this.elements.errorNotice);
      this.elements.input.removeEventListener("keydown", this.eventHandlers.onChangeInput);
    }
  }

  get node() {
    return this.elements.form;
  }
};

// message form
const MessageForm = class extends Observer {
  constructor() {
    super();

    // event handlers
    this.eventHandlers = {};
    this.eventHandlers.onSubmit = (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.notify("submit", {
        message: this.elements.input.value
      });
      this.elements.input.value = "";
    }
    this.eventHandlers.onInputKeyPress = (event) => {
      if (event.ctrlKey && event.keyCode === 10) {
        this.eventHandlers.onSubmit();
      }
    }

    // elements
    this.elements = {};

    // input textarea
    let input = document.createElement("textarea");
    input.className = "form-control";
    input.setAttribute("placeholder", "Input message here");
    input.setAttribute("name", "message");
    input.setAttribute("rows", 4);
    input.addEventListener("keypress", this.eventHandlers.onInputKeyPress);
    this.elements.input = input;

    // button
    let button = document.createElement("button");
    button.className = "btn btn-primary";
    button.innerHTML = "Send";
    button.setAttribute("type", "submit");
    this.elements.button = button;

    // fieldsets
    let fieldSetInput = document.createElement("fieldset");
    fieldSetInput.className = "form-group";
    let fieldSetButton = fieldSetInput.cloneNode();
    fieldSetInput.appendChild(this.elements.input);
    fieldSetButton.appendChild(this.elements.button);
    this.elements.fieldSetInput = fieldSetInput;
    this.elements.fieldSetButton = fieldSetButton;

    // form
    let form = document.createElement("form");
    form.className = "text-center";
    form.setAttribute("id", "send-message");
    form.appendChild(this.elements.fieldSetInput);
    form.appendChild(this.elements.fieldSetButton);
    form.addEventListener("submit", this.eventHandlers.onSubmit);
    this.elements.form = form;
  }

  // root node
  get node() {
    return this.elements.form;
  }
}

// list of messages
const MessagesList = class extends Observer {
  // message must have props: author, time, body
  constructor(messages) {
    super();
    // create container
    this.container = document.createElement("ul");
    this.container.className = "list-group";
    this.container.style["overflow-y"] = "scroll";
    this.container.style["max-height"] = "480px";

    if (messages) {
      this.addMessages(messages);
    }
  }

  get node() {
    return this.container;
  }

  addMessage(message) {
    this._addMessageNode(this._createMessageNode(message));
  }

  addMessages(messages) {
    messages.reverse();
    messages.forEach(this.addMessage.bind(this));
  }

  _addMessageNode(messageNode) {
    if (this.container.childNodes.length > 0) {
      this.container.insertBefore(messageNode, this.container.childNodes[0]);
    } else {
      this.container.appendChild(messageNode);
    }
  }

  _createMessageNode({author, time, body}) {
    let header = document.createElement("header");
    header.className = "list-group-item-heading";
    header.innerHTML = `<strong>${author}</strong> <i class="text-muted">${time}</i>`;

    let content = document.createElement("p");
    content.className = "list-group-item-text";
    content.innerHTML = body.replace(/\n/g, "<br>");

    let node = document.createElement("li");
    node.className = "list-group-item";
    node.appendChild(header);
    node.appendChild(content);

    return node;
  }
}

const UsersList = class {
  constructor(users = []) {
    // counter of users
    this.counter = document.createElement("span");
    this.counter.className = "badge";

    // header of container
    let header = document.createElement("li");
    header.className = "list-group-item list-group-item-info";
    header.appendChild(document.createTextNode("Users online"));
    header.appendChild(this.counter);
    this.header = header;

    // container
    let ul = document.createElement("ul");
    ul.className = "list-group";
    this.container = ul;

    this.set(users);
  }

  get node() {
    return this.container;
  }

  add(name) {
    let node = this._createUserNode(name)
    this.users.push({name, node});
    this.container.appendChild(node);
    this._updateCounter();
  }

  remove(name) {
    for (let i = this.users.length; i--;) {
      if (name === this.users[i].name) {
        this.container.removeChild(this.users[i].node);
        this.users.splice(i, 1);
        break;
      }
    }
    this._updateCounter();
  }

  set(users) {
    this.users = [];
    this.container.innerHTML = "";
    this.container.appendChild(this.header);
    users.forEach(name => this.add(name));
    this._updateCounter();
  }

  _updateCounter() {
    this.counter.innerHTML = this.users.length;
  }

  _createUserNode(name) {
    let node = document.createElement("li");
    node.className = "list-group-item";
    node.innerHTML = name;
    return node;
  }
}

module.exports = {AuthForm, MessageForm, MessagesList, UsersList};