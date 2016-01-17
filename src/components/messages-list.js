// component message list (history of chat)

const Observer = require("../observer.js");
const myEscape = require("../escape.js");
const smilify = require("./smilify.js");

// list of messages
const MessagesList = class extends Observer {
  // message must have props: author, time, body
  constructor(messagesData) {
    super();

    // history storage
    this.history = [];
    // count of unloaded messages
    this.left = 0;

    // create container
    this.container = document.createElement("ul");
    this.container.className = "list-group";
    this.container.style["overflow-y"] = "scroll";
    this.container.style["max-height"] = "480px";

    // counter of unloaded messages (history)
    var leftCounter = document.createElement("span");
    leftCounter.className = "badge";
    leftCounter.innerHTML = this.left;
    this.leftCounter = leftCounter;

    // create button for load more messages
    var buttonLoadMore = document.createElement("button");
    buttonLoadMore.className = "btn btn-link";
    buttonLoadMore.appendChild(document.createTextNode("Load more"));
    buttonLoadMore.appendChild(this.leftCounter);
    buttonLoadMore.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      this.notify("history.more", {lastId: this.history[this.history.length - 1].id});
    });
    var wrapperButtonLoadMore = document.createElement("li");
    wrapperButtonLoadMore.className = "list-group-item text-center";
    wrapperButtonLoadMore.appendChild(buttonLoadMore);
    this.buttonLoadMore = wrapperButtonLoadMore;

    // add history if passed
    if (messagesData) {
      this.addMessages(messagesData);
    }
  }

  // get root node of component
  get node() {
    return this.container;
  }

  // add chunk of history to storage and DOM
  addMessages(data) {
    data.messages.forEach(message => this.addMessage(message));
    this.setLeft(data.left);
  }

  // add new message to DOM and storage
  addMessage(data) {
    // copy
    var newMessage = Object.assign({}, data);
    // create node
    newMessage.node = this._createMessageNode(newMessage);
    // search next message to insert to right place
    var nextMessage = this.history.find(message => message.id < newMessage.id);
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
  setLeft(newLeft) {
    if (this.left > 0 && newLeft === 0) {
      this.container.removeChild(this.buttonLoadMore);
    } else if (this.left === 0 && newLeft > 0) {
      this.container.appendChild(this.buttonLoadMore);
    }
    this.left = newLeft;
    this.leftCounter.innerHTML = this.left;
  }

  // add message node before passed second node or to beginning
  _addMessageNode(messageNode, nextNode = null) {
    if (nextNode) {
      this.container.insertBefore(messageNode, nextNode);
    } else if (this.left > 0) {
      this.container.insertBefore(messageNode, this.buttonLoadMore);
    } else {
      this.container.appendChild(messageNode);
    }
  }

  // create node of message
  _createMessageNode({author, time, body}) {
    // header of item
    var header = document.createElement("header");
    header.className = "list-group-item-heading";
    header.innerHTML = `<strong>${myEscape(author)}</strong> <i class="text-muted">${time}</i>`;
    // body of message
    var content = document.createElement("p");
    content.className = "list-group-item-text";
    content.innerHTML = smilify(myEscape(body).replace(/\n/g, "<br>"));
    // node o message
    var node = document.createElement("li");
    node.className = "list-group-item";
    node.appendChild(header);
    node.appendChild(content);
    return node;
  }
};

module.exports = MessagesList;