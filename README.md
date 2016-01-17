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



## Features

### Smiles

There is availaible four smiles:

* :)

* :(

* ;)

* :P

More info you can find in `src/components/smilify.js`


### Dynamic loading history

By default after login to the chat user receive chunk of history.
But user can load more history by chunks of fixed size.
Size of that chunk you can set into `config.json`.


### Messages sending

You can push `ctrl + enter` to send message instead of click to button `send`.
Messages can be multilined.
All messages will be escaped for prevent XSS.


## TODO

* Who typing? Up messages list insert region with info who is typing right now.

* Rooms. For each room use separate tab (e.g. bootstrap-tabs)