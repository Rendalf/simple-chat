(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "name": "Server",
  "historyChunkSize": 10,
  "chat-server" : {
    "origin": "localhost",
    "port": 9000
  },
  "static-server": {
    "port": 10030
  }
}
},{}],2:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Client = require("./client.js");
var Observer = require("./observer.js");
var Components = require("./components.js");

var authForm = new Components.AuthForm();

var App = function (_Observer) {
  _inherits(App, _Observer);

  // settings:
  //  socketUrl
  //  node (appNode)

  function App(settings) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this));

    _this.client = new Client(settings.socketUrl);
    _this.node = settings.node;
    _this.components = {
      authForm: new Components.AuthForm(),
      messageForm: new Components.MessageForm(),
      messagesList: new Components.MessagesList(),
      usersList: new Components.UsersList()
    };

    _this.setInitialState();
    return _this;
  }

  _createClass(App, [{
    key: "setInitialState",
    value: function setInitialState() {
      var _this2 = this;

      this.node.innerHTML = "";
      this.node.appendChild(this.components.authForm.node);

      // set handlers for login
      this.client.on("login.success", function () {
        return _this2.setAuthorizedState();
      });
      this.client.on("login.error", function () {
        return _this2.components.authForm.setError();
      });
      this.components.authForm.on("submit", function (_ref) {
        var login = _ref.login;
        return _this2.client.login(login);
      });

      // set basic handlers
      this.client.on("message", function (message) {
        return _this2.components.messagesList.addMessage(message);
      });
      this.client.on("join", function (message) {
        _this2.components.usersList.add(message.login);
        _this2.components.messagesList.addMessage(message);
      });
      this.client.on("leave", function (message) {
        _this2.components.usersList.remove(message.login);
        _this2.components.messagesList.addMessage(message);
      });
      this.client.on("users", function (users) {
        return _this2.components.usersList.set(users);
      });
      this.client.on("history", function (history) {
        return _this2.components.messagesList.addMessages(history);
      });
      this.components.messageForm.on("submit", function (data) {
        _this2.client.send(Object.assign({ type: "message" }, data));
      });
      this.components.messagesList.on("history.more", function (data) {
        _this2.client.send(Object.assign({ type: "history" }, data));
      });
    }
  }, {
    key: "setAuthorizedState",
    value: function setAuthorizedState() {
      var main = document.createElement("section");
      main.className = "col-xs-12 col-sm-9";
      main.appendChild(this.components.messageForm.node);
      main.appendChild(this.components.messagesList.node);

      var aside = document.createElement("aside");
      aside.className = "col-xs-12 col-sm-3";
      aside.appendChild(this.components.usersList.node);

      this.node.innerHTML = "";
      this.node.appendChild(main);
      this.node.appendChild(aside);
    }
  }]);

  return App;
}(Observer);

module.exports = App;

},{"./client.js":3,"./components.js":4,"./observer.js":6}],3:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Observer = require("./observer.js");

var Client = function (_Observer) {
  _inherits(Client, _Observer);

  function Client(url) {
    _classCallCheck(this, Client);

    // initialize state

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Client).call(this));

    _this.state = {
      connected: false,
      login: null
    };
    // save url
    _this.url = url;
    // create socket
    _this.socket = new WebSocket(_this.url);
    // event handlers
    _this.socket.onopen = _this._onOpen.bind(_this);
    _this.socket.onclose = _this._onClose.bind(_this);
    _this.socket.onmessage = _this._onReceived.bind(_this);
    return _this;
  }

  _createClass(Client, [{
    key: "send",
    value: function send(data) {
      this.socket.send(JSON.stringify(data));
    }
  }, {
    key: "login",
    value: function login(_login) {
      this.send({
        type: "login",
        login: _login
      });
    }
  }, {
    key: "_onOpen",
    value: function _onOpen() {
      this.state.connected = true;
      console.log("Connected...");
      this.notify("open");
    }
  }, {
    key: "_onClose",
    value: function _onClose(event) {
      this.state.connected = false;
      console.log("Disconnected...");
      this.notify("closed");
    }
  }, {
    key: "_onReceived",
    value: function _onReceived(event) {
      var data = JSON.parse(event.data);
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
          throw new Error("Unknown message type: " + data.type);
          break;
      }
    }
  }, {
    key: "_onLogin",
    value: function _onLogin(data) {
      if (data.status) {
        this.state.login = data.login;
        this.notify("login.success");
      } else {
        this.notify("login.error");
      }
    }
  }]);

  return Client;
}(Observer);

module.exports = Client;

},{"./observer.js":6}],4:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Observer = require("./observer.js");

var myEscape = function () {
  var toReplace = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;"
  };
  var regExp = new RegExp("[" + Object.keys(toReplace).join('') + "]", "g");
  var tagReplace = function tagReplace(tag) {
    return toReplace[tag];
  };
  return function (text) {
    return text.replace(regExp, tagReplace);
  };
}();

// form for authorization
var AuthForm = function (_Observer) {
  _inherits(AuthForm, _Observer);

  function AuthForm() {
    _classCallCheck(this, AuthForm);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AuthForm).call(this));

    _this.state = { error: false };

    // create event handlers
    _this.eventHandlers = {};
    _this.eventHandlers.onChangeInput = _this.unsetError.bind(_this);
    _this.eventHandlers.onSubmit = function (event) {
      event.preventDefault();
      event.stopPropagation();
      _this.notify("submit", { login: _this.elements.input.value });
    };

    // create map of elements
    _this.elements = {};

    // create input field
    var input = document.createElement("input");
    input.setAttribute("name", "login");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "Nickname");
    input.className = "form-control";
    _this.elements.input = input;

    // create button submit
    var button = document.createElement("button");
    button.setAttribute("type", "submit");
    button.className = "btn btn-primary form-control";
    button.innerHTML = "Login";
    _this.elements.button = button;

    // create fieldset
    var fieldSet = document.createElement("fieldset");
    fieldSet.className = "form-group";
    fieldSet.appendChild(input);
    fieldSet.appendChild(button);
    _this.elements.fieldSet = fieldSet;

    // create form
    var form = document.createElement("form");
    form.setAttribute("id", "auth-form");
    form.className = "form-inline text-center";
    form.appendChild(fieldSet);
    form.addEventListener("submit", _this.eventHandlers.onSubmit);
    _this.elements.form = form;

    // create error notice
    var errorNotice = document.createElement("span");
    errorNotice.className = "text-danger";
    errorNotice.innerHTML = "This nickname is used. Choose another nickname";
    _this.elements.errorNotice = errorNotice;
    return _this;
  }

  _createClass(AuthForm, [{
    key: "setError",
    value: function setError() {
      if (!this.state.error) {
        this.state.error = true;
        this.elements.form.appendChild(this.elements.errorNotice);
        this.elements.input.addEventListener("keydown", this.eventHandlers.onChangeInput);
      }
    }
  }, {
    key: "unsetError",
    value: function unsetError() {
      if (this.state.error) {
        this.state.error = false;
        this.elements.form.removeChild(this.elements.errorNotice);
        this.elements.input.removeEventListener("keydown", this.eventHandlers.onChangeInput);
      }
    }
  }, {
    key: "node",
    get: function get() {
      return this.elements.form;
    }
  }]);

  return AuthForm;
}(Observer);

// message form
var MessageForm = function (_Observer2) {
  _inherits(MessageForm, _Observer2);

  function MessageForm() {
    _classCallCheck(this, MessageForm);

    // event handlers

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(MessageForm).call(this));

    _this2.eventHandlers = {};
    _this2.eventHandlers.onSubmit = function (event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      _this2.notify("submit", {
        body: _this2.elements.input.value
      });
      _this2.elements.input.value = "";
    };
    _this2.eventHandlers.onInputKeyPress = function (event) {
      if (event.ctrlKey && event.keyCode === 10) {
        _this2.eventHandlers.onSubmit();
      }
    };

    // elements
    _this2.elements = {};

    // input textarea
    var input = document.createElement("textarea");
    input.className = "form-control";
    input.setAttribute("placeholder", "Input message here");
    input.setAttribute("name", "message");
    input.setAttribute("rows", 4);
    input.addEventListener("keypress", _this2.eventHandlers.onInputKeyPress);
    _this2.elements.input = input;

    // button
    var button = document.createElement("button");
    button.className = "btn btn-primary";
    button.innerHTML = "Send";
    button.setAttribute("type", "submit");
    _this2.elements.button = button;

    // fieldsets
    var fieldSetInput = document.createElement("fieldset");
    fieldSetInput.className = "form-group";
    var fieldSetButton = fieldSetInput.cloneNode();
    fieldSetInput.appendChild(_this2.elements.input);
    fieldSetButton.appendChild(_this2.elements.button);
    _this2.elements.fieldSetInput = fieldSetInput;
    _this2.elements.fieldSetButton = fieldSetButton;

    // form
    var form = document.createElement("form");
    form.className = "text-center";
    form.setAttribute("id", "send-message");
    form.appendChild(_this2.elements.fieldSetInput);
    form.appendChild(_this2.elements.fieldSetButton);
    form.addEventListener("submit", _this2.eventHandlers.onSubmit);
    _this2.elements.form = form;
    return _this2;
  }

  // root node

  _createClass(MessageForm, [{
    key: "node",
    get: function get() {
      return this.elements.form;
    }
  }]);

  return MessageForm;
}(Observer);

// list of messages
var MessagesList = function (_Observer3) {
  _inherits(MessagesList, _Observer3);

  // message must have props: author, time, body

  function MessagesList(messagesData) {
    _classCallCheck(this, MessagesList);

    // history storage

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(MessagesList).call(this));

    _this3.history = [];
    // count of unloaded messages
    _this3.left = 0;

    // create container
    _this3.container = document.createElement("ul");
    _this3.container.className = "list-group";
    _this3.container.style["overflow-y"] = "scroll";
    _this3.container.style["max-height"] = "480px";

    // counter of unloaded messages (history)
    var leftCounter = document.createElement("span");
    leftCounter.className = "badge";
    leftCounter.innerHTML = _this3.left;
    _this3.leftCounter = leftCounter;

    // create button for load more messages
    var buttonLoadMore = document.createElement("button");
    buttonLoadMore.className = "btn btn-link";
    buttonLoadMore.appendChild(document.createTextNode("Load more"));
    buttonLoadMore.appendChild(_this3.leftCounter);
    buttonLoadMore.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      _this3.notify("history.more", { lastId: _this3.history[_this3.history.length - 1].id });
    });
    var wrapperButtonLoadMore = document.createElement("li");
    wrapperButtonLoadMore.className = "list-group-item text-center";
    wrapperButtonLoadMore.appendChild(buttonLoadMore);
    _this3.buttonLoadMore = wrapperButtonLoadMore;

    // add history if passed
    if (messagesData) {
      _this3.addMessages(messagesData);
    }
    return _this3;
  }

  // get root node of component

  _createClass(MessagesList, [{
    key: "addMessages",

    // add chunk of history to storage and DOM
    value: function addMessages(data) {
      var _this4 = this;

      data.messages.forEach(function (message) {
        return _this4.addMessage(message);
      });
      this.setLeft(data.left);
    }

    // add new message to DOM and storage

  }, {
    key: "addMessage",
    value: function addMessage(data) {
      // copy
      var newMessage = Object.assign({}, data);
      // create node
      newMessage.node = this._createMessageNode(newMessage);
      // search next message to insert to right place
      var nextMessage = this.history.find(function (message) {
        return message.id < newMessage.id;
      });
      // add message to storage and add node to container
      if (nextMessage) {
        this.history.splice(this.history.indexOf(nextMessage), 0, newMessage);
        this._addMessageNode(newMessage.node, nextMessage.node);
      } else {
        this.history.push(newMessage);
        this._addMessageNode(newMessage.node);
      }
    }

    // set count of messages that not loaded

  }, {
    key: "setLeft",
    value: function setLeft(newLeft) {
      if (this.left > 0 && newLeft === 0) {
        this.container.removeChild(this.buttonLoadMore);
      } else if (this.left === 0 && newLeft > 0) {
        this.container.appendChild(this.buttonLoadMore);
      }
      this.left = newLeft;
      this.leftCounter.innerHTML = this.left;
    }

    // add message node before passed second node or to beginning

  }, {
    key: "_addMessageNode",
    value: function _addMessageNode(messageNode) {
      var nextNode = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      if (nextNode) {
        this.container.insertBefore(messageNode, nextNode);
      } else if (this.left > 0) {
        this.container.insertBefore(messageNode, this.buttonLoadMore);
      } else {
        this.container.appendChild(messageNode);
      }
    }

    // create node of message

  }, {
    key: "_createMessageNode",
    value: function _createMessageNode(_ref) {
      var author = _ref.author;
      var time = _ref.time;
      var body = _ref.body;

      // header of item
      var header = document.createElement("header");
      header.className = "list-group-item-heading";
      header.innerHTML = "<strong>" + myEscape(author) + "</strong> <i class=\"text-muted\">" + time + "</i>";
      // body of message
      var content = document.createElement("p");
      content.className = "list-group-item-text";
      content.innerHTML = myEscape(body).replace(/\n/g, "<br>");
      // node o message
      var node = document.createElement("li");
      node.className = "list-group-item";
      node.appendChild(header);
      node.appendChild(content);
      return node;
    }
  }, {
    key: "node",
    get: function get() {
      return this.container;
    }
  }]);

  return MessagesList;
}(Observer);

// list of users
var UsersList = function () {
  function UsersList() {
    var users = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, UsersList);

    // counter of users
    this.counter = document.createElement("span");
    this.counter.className = "badge";

    // header of container
    var header = document.createElement("li");
    header.className = "list-group-item list-group-item-info";
    header.appendChild(document.createTextNode("Users online"));
    header.appendChild(this.counter);
    this.header = header;

    // container
    var ul = document.createElement("ul");
    ul.className = "list-group";
    this.container = ul;

    this.set(users);
  }

  _createClass(UsersList, [{
    key: "add",
    value: function add(name) {
      var node = this._createUserNode(name);
      this.users.push({ name: name, node: node });
      this.container.appendChild(node);
      this._updateCounter();
    }
  }, {
    key: "remove",
    value: function remove(name) {
      for (var i = this.users.length; i--;) {
        if (name === this.users[i].name) {
          this.container.removeChild(this.users[i].node);
          this.users.splice(i, 1);
          break;
        }
      }
      this._updateCounter();
    }
  }, {
    key: "set",
    value: function set(users) {
      var _this5 = this;

      this.users = [];
      this.container.innerHTML = "";
      this.container.appendChild(this.header);
      users.forEach(function (name) {
        return _this5.add(name);
      });
      this._updateCounter();
    }
  }, {
    key: "_updateCounter",
    value: function _updateCounter() {
      this.counter.innerHTML = this.users.length;
    }
  }, {
    key: "_createUserNode",
    value: function _createUserNode(name) {
      var node = document.createElement("li");
      node.className = "list-group-item";
      node.innerHTML = myEscape(name);
      return node;
    }
  }, {
    key: "node",
    get: function get() {
      return this.container;
    }
  }]);

  return UsersList;
}();

module.exports = { AuthForm: AuthForm, MessageForm: MessageForm, MessagesList: MessagesList, UsersList: UsersList };

},{"./observer.js":6}],5:[function(require,module,exports){
"use strict";

var config = require("../config.json");
var App = require("./app.js");

var app = new App({
  socketUrl: "ws://" + config["chat-server"].origin + ":" + config["chat-server"].port,
  node: document.getElementById("app")
});

},{"../config.json":1,"./app.js":2}],6:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Observer = function () {
  function Observer() {
    _classCallCheck(this, Observer);

    // create map of subscribers
    //  eventType: [handlers]
    this.subscribers = {};
  }

  // add event handler

  _createClass(Observer, [{
    key: "on",
    value: function on(eventType, handler) {
      if (!this.subscribers[eventType]) {
        this.subscribers[eventType] = [];
      }
      this.subscribers[eventType].push(handler);
    }

    // call all event handlers

  }, {
    key: "notify",
    value: function notify(eventType) {
      var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (this.subscribers[eventType]) {
        this.subscribers[eventType].forEach(function (handler) {
          return handler(data);
        });
      }
    }
  }]);

  return Observer;
}();

module.exports = Observer;

},{}]},{},[5]);
