// disconnected message component

const Disconnected = class {

  constructor() {
    this.element = document.createElement("section");
    this.element.className = "jumbotron text-center";
    this.element.innerHTML = "<big>Disconnected<br>Reload page or try later</big>";
  }

  // get toou node
  get node() {
    return this.element;
  }
};

module.exports = Disconnected;