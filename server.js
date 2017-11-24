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



var shortUrl = function (url, urls, dest){
  var result = {};
  
  var regex = /^http(s*):\/\/(\w[\w-\.@]*)\.([a-zA-Z]{2,}($|\/|\?))/;
  if( regex.test(url)){
    var id = shortid.generate();  
    dbPutUrl(dbUrl, mongo, {_id: id, url: url});
    result.original_url = url;
    result.short_url = dest + id;
  } else{
    result.error = 'Wrong url format, make sure you have a valid protocol and real site.';
  }
  return result;
}

var dbPutUrl = function (dbUrl, mongo, doc){
  mongo.connect(dbUrl , function(err, db) {
    if (err) {
      console.log(err);
    }
    var colle = db.collection('short_urls');
    colle.insertOne(doc, (err) => {
      if (err) console.log(err);
      db.close();
    });    
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
    return arr[0].url;
  }, console.log );
}



app.get('/get/*', function (req, res){
  var url = req.originalUrl.slice(5, req.originalUrl.length);
  var dest = req.protocol + '://' + req.get('host') + '/';
  res.json( shortUrl(url, urls, dest));
});

app.post("/", function (req, res) {
  var url = req.query.href;
  var dest = req.protocol + '://' + req.get('host') + '/';
  res.json( shortUrl(url, urls, dest));
  //res.sendStatus(200);
});

app.get("/*", function (req, res) {
  var param = req.originalUrl.slice(1, req.originalUrl.length);
  if( shortid.isValid(param)){
      dbGetUrl(dbUrl, mongo, param).then( (data) => {
        console.log(data)
        res.redirect(data);
      });
  } else{
    res.json({
      error: "This url is not on the database."
    });
  }
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body

// Simple in-memory store for now
var urls = ['https://www.google.ru'];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});



//remade putUrl with promises, made script react to database errors