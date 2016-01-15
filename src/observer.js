"use strict";

const Observer = class {
  constructor() {
    // create map of subscribers
    //  eventType: [handlers]
    this.subscribers = {};
  }

  // add event handler
  on(eventType, handler) {
    if (!this.subscribers[eventType]) {
      this.subscribers[eventType] = [];
    }
    this.subscribers[eventType].push(handler);
  }

  // call all event handlers
  notify(eventType, data = {}) {
    if (this.subscribers[eventType]) {
      this.subscribers[eventType].forEach(handler => handler(data));
    }
  }
}

module.exports = Observer;