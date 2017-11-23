// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();


app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/", function (req, res) {
  urls.push(req.query.href);
  var regex = /^http(s*):\/\/(\w[\w-\.@]*)\.([a-zA-Z]{2,}($|\/|\?))/;
  console.log(urls);
  res.sendStatus(200);
});

// Simple in-memory store for now
var urls = [];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
