// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var shortid = require('shortid');
var dbUrl = 'mongodb://' 
            + process.env.USER + ':' 
            + process.env.PASS + '@'
            + process.env.HOST + ':' 
            + process.env.DB_PORT + '/' 
            + process.env.DB;

app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

var handleShortUrlReq = function (req, res, url, mongo) {
  var dest = req.protocol + '://' + req.get('host') + '/';
  shortUrl(url, mongo, dest).then( (result) => {
    res.json(result);
    res.end();
  });
}

var shortUrl = function (url, mongo, dest){
  var result = {};
  var regex = /^http(s*):\/\/(\w[\w-\.@]*)\.([a-zA-Z]{2,}($|\/|\?|:))/;
  if( regex.test(url)){
    var id = shortid.generate();  
    var prom = dbPutUrl(dbUrl, mongo, {_id: id, url: url}).then( (ok) => {
      if (ok){
        result.original_url = url;
        result.short_url = dest + id;
      }
      return result;
    }, (err) => {
      console.log(err);
      return result.error = 'database error';
    });
  } else{
    result.error = 'Wrong url format, make sure you have a valid protocol and real site.';
    var prom = Promise.resolve( result);
  }
  return prom;
}


var dbPutUrl = function (dbUrl, mongo, doc){
  return  mongo.connect(dbUrl)
    .then( (db) => {
    var ok = db.collection('short_urls')
    .insertOne(doc)
    .then( (data) => {
      db.close();
      return data.result.ok;
    });
    return ok;  
  });
}

var dbGetUrl = function (dbUrl, mongo, id){
  return mongo.connect(dbUrl)
  .then( (db) => {
    var colle = db.collection('short_urls');
    var arr = colle.find({_id: id}).toArray();
    db.close();
    return arr;
  }).then( (arr) =>{
    if (arr.length === 0){
      return 0;
    }
    return arr[0].url;
  }, console.log );
}

app.get('/get/*', function (req, res){
  var url = req.originalUrl.slice(5, req.originalUrl.length);
  handleShortUrlReq (req, res, url, mongo);
});

app.post("/", function (req, res) {
  var url = req.query.href;
  handleShortUrlReq (req, res, url, mongo);
});

app.get("/*", function (req, res) {
  var param = req.originalUrl.slice(1, req.originalUrl.length);
  if( shortid.isValid(param)){
      dbGetUrl(dbUrl, mongo, param).then( (data) => {
        if (data === 0){
          res.json( { error: "This url is not on the database."});
          res.end();
        } else {
          res.redirect(data);                 
        }
      }, (err) => {
          console.log(err);
          res.json( { error: "database error"});
          res.end();
      });
  } else{
    res.json({ error: "Invalid URL id" });
    res.end();
  }
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

