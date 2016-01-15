(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
      messagesList: new Components.MessagesList()
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
        // TODO: add to users list
        _this2.components.messagesList.addMessage(message);
      });
      this.client.on("leave", function (message) {
        // TODO: remove from users list
        _this2.components.messagesList.addMessage(message);
      });
      this.client.on("history", function (history) {
        return _this2.components.messagesList.addMessages(history);
      });
      this.components.messageForm.on("submit", function (_ref2) {
        var message = _ref2.message;

        _this2.client.send({
          type: "message",
          body: message
        });
      });
    }
  }, {
    key: "setAuthorizedState",
    value: function setAuthorizedState() {
      this.node.innerHTML = "";
      this.node.appendChild(this.components.messagesList.node);
      this.node.appendChild(this.components.messageForm.node);
    }
  }]);

  return App;
}(Observer);

module.exports = App;

},{"./client.js":2,"./components.js":3,"./observer.js":5}],2:[function(require,module,exports){
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
          this.notify("history", data.messages);
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

},{"./observer.js":5}],3:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Observer = require("./observer.js");

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
        message: _this2.elements.input.value
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

  function MessagesList(messages) {
    _classCallCheck(this, MessagesList);

    // create container

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(MessagesList).call(this));

    _this3.container = document.createElement("ul");
    _this3.container.className = "list-group";

    if (messages) {
      _this3.addMessages(messages);
    }
    return _this3;
  }

  _createClass(MessagesList, [{
    key: "addMessage",
    value: function addMessage(message) {
      this._addMessageNode(this._createMessageNode(message));
    }
  }, {
    key: "addMessages",
    value: function addMessages(messages) {
      messages.reverse();
      messages.forEach(this.addMessage.bind(this));
    }
  }, {
    key: "_addMessageNode",
    value: function _addMessageNode(messageNode) {
      if (this.container.childNodes.length > 0) {
        this.container.insertBefore(messageNode, this.container.childNodes[0]);
      } else {
        this.container.appendChild(messageNode);
      }
    }
  }, {
    key: "_createMessageNode",
    value: function _createMessageNode(_ref) {
      var author = _ref.author;
      var time = _ref.time;
      var body = _ref.body;

      var header = document.createElement("header");
      header.className = "list-group-item-heading";
      header.innerHTML = "<strong>" + author + "</strong> <i class=\"text-muted\">" + time + "</i>";

      var content = document.createElement("p");
      content.className = "list-group-item-text";
      content.innerHTML = body.replace(/\n/g, "<br>");

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

module.exports = { AuthForm: AuthForm, MessageForm: MessageForm, MessagesList: MessagesList };

},{"./observer.js":5}],4:[function(require,module,exports){
"use strict";

var socketUrl = "ws://localhost:9000";

var App = require("./app.js");

var app = new App({
  socketUrl: socketUrl,
  node: document.getElementById("app")
});

},{"./app.js":1}],5:[function(require,module,exports){
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

},{}]},{},[4]);
