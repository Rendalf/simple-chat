// component message form

const Observer = require("../observer.js");

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
        body: this.elements.input.value
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
    var input = document.createElement("textarea");
    input.className = "form-control";
    input.setAttribute("placeholder", "Input message here");
    input.setAttribute("name", "message");
    input.setAttribute("rows", 4);
    input.addEventListener("keypress", this.eventHandlers.onInputKeyPress);
    this.elements.input = input;

    // button
    var button = document.createElement("button");
    button.className = "btn btn-primary";
    button.innerHTML = "Send";
    button.setAttribute("type", "submit");
    this.elements.button = button;

    // fieldsets
    var fieldSetInput = document.createElement("fieldset");
    fieldSetInput.className = "form-group";
    var fieldSetButton = fieldSetInput.cloneNode();
    fieldSetInput.appendChild(this.elements.input);
    fieldSetButton.appendChild(this.elements.button);
    this.elements.fieldSetInput = fieldSetInput;
    this.elements.fieldSetButton = fieldSetButton;

    // form
    var form = document.createElement("form");
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
};

module.exports = MessageForm;