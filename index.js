'use strict';
const line = require('@line/bot-sdk');
const express = require('express');
const WebSocket = require('ws');
var request = require("request");

/* wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });
    
    ws.send('something');
    //console.log(ws);
}); */

// create LINE SDK config from env variables
const config = {
   channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
   channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express: https://expressjs.com/

const app = express()
    .post('/webhook', line.middleware(config), (req, res) => {
        //console.log(req);
        Promise
           .all(req.body.events.map(handleEvent))
           .then((result) => res.json(result))
           .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
    })
    .listen(port, () => {
        console.log(`listening on ${port}`);
    });

const SocketServer = WebSocket.Server;
const wss = new SocketServer({
    app
});

// register a webhook handler with middleware
/* app.post('/webhook', line.middleware(config), (req, res) => {
    //console.log(req);
    Promise
       .all(req.body.events.map(handleEvent))
       .then((result) => res.json(result))
       .catch((err) => {
        console.error(err);
        res.status(500).end();
    });
}); */

// event handler
function handleEvent(event) {
    if (event.type == 'message' || event.message.type == 'text') {
        console.log(event);

        wss.on('connection', function connection(ws) {
            console.log(ws);
        });

        // ignore non-text-message event
        //return Promise.resolve(true);
        return client.replyMessage(event.replyToken, event.message);
    }

   return Promise.resolve(null);
   /* var options = {
       method: 'GET',
       url: 'https://api.susi.ai/susi/chat.json',
       qs: {
           timezoneOffset: '-330',
           q: event.message.text
       }
   }; */

   /* request(options, function(error, response, body) {
       if (error) throw new Error(error);
       // answer fetched from susi
       var ans = (JSON.parse(body)).answers[0].actions[0].expression;
       // create a echoing text message
       const answer = {
           type: 'text',
           text: ans
       };
       // use reply API
       return client.replyMessage(event.replyToken, answer);
   }) */
}

// listen on port

const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`listening on ${port}`);
});