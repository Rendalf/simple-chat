// component list of users

const myEscape = require("../escape.js");

// list of users
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

  // get root node
  get node() {
    return this.container;
  }

  // add user
  add(name) {
    let node = this._createUserNode(name)
    this.users.push({name, node});
    this.container.appendChild(node);
    this._updateCounter();
  }

  // add user by name
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

  // set users
  set(users) {
    this.users = [];
    this.container.innerHTML = "";
    this.container.appendChild(this.header);
    users.forEach(name => this.add(name));
    this._updateCounter();
  }

  // update counter of users
  _updateCounter() {
    this.counter.innerHTML = this.users.length;
  }

  // create item of list node
  _createUserNode(name) {
    let node = document.createElement("li");
    node.className = "list-group-item";
    node.innerHTML = myEscape(name);
    return node;
  }
};

module.exports = UsersList;