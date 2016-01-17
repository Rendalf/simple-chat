# Simple Chat

Test task for 2GIS


## Versions

Node.js: 5.4.0

NPM: 3.3.12


## Installation

`npm install`

## Run

You can use:

`node server.js`

or:

`npm start`


## Build

If you did not change `config.json`, building is not necessary

But you can run:

`npm run build`


## Config

In file `config.json` you can change next fields:

* `name` Nickname of server that will be used in the chat

* `historyChunkSize` Size of chunk of history that will be sent to client

* `chat-server` You can set port and origin of websocket-server

* `static-server` You can set port of static server


If you change `config.json` then you need rebuild appliation and restart server