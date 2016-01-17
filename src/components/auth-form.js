// component form for login into chat

const Observer = require("../observer.js");

const AuthForm = class extends Observer {

  constructor() {
    super();

    // hide error by default
    this.error = false;

    // create event handlers
    this.eventHandlers = {};
    this.eventHandlers.onChangeInput = this.hideError.bind(this);
    this.eventHandlers.onSubmit = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.notify("submit", {login: this.elements.input.value});
    }

    // create map of elements
    this.elements = {};

    // create input field
    var input = document.createElement("input");
    input.setAttribute("name", "login");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "Nickname");
    input.className = "form-control";
    this.elements.input = input;

    // create button submit
    var button = document.createElement("button");
    button.setAttribute("type", "submit");
    button.className = "btn btn-primary form-control";
    button.innerHTML = "Login";
    this.elements.button = button;

    // create fieldset
    var fieldSet = document.createElement("fieldset");
    fieldSet.className = "form-group";
    fieldSet.appendChild(input);
    fieldSet.appendChild(button);
    this.elements.fieldSet = fieldSet;

    // create form
    var form = document.createElement("form");
    form.setAttribute("id", "auth-form");
    form.className = "form-inline text-center";
    form.appendChild(fieldSet);
    form.addEventListener("submit", this.eventHandlers.onSubmit);
    this.elements.form = form;

    // create error notice
    var errorNotice = document.createElement("span");
    errorNotice.className = "text-danger";
    errorNotice.innerHTML = "This nickname is used. Choose another nickname";
    this.elements.errorNotice = errorNotice;
  }

  // show error (nickname must be unique)
  showError() {
    if (!this.error) {
      this.error = true;
      this.elements.form.appendChild(this.elements.errorNotice);
      this.elements.input.addEventListener("keydown", this.eventHandlers.onChangeInput);
    }
  }

  // hide error (nickname must be unique)
  hideError() {
    if (this.error) {
      this.error = false;
      this.elements.form.removeChild(this.elements.errorNotice);
      this.elements.input.removeEventListener("keydown", this.eventHandlers.onChangeInput);
    }
  }

  // get root node
  get node() {
    return this.elements.form;
  }
};

module.exports = AuthForm;