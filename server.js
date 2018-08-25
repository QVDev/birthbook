// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var firebase = require('firebase');

var config = {
    apiKey: process.env.API,
    authDomain: process.env.DOMAIN,
    databaseURL: process.env.URL,
    projectId: process.env.ID,
    storageBucket: process.env.BUCKET,
    messagingSenderId: process.env.SENDER_ID
  };
  firebase.initializeApp(config);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/browserconfig.xml', function(request, response) {
  response.sendfile('configs/browserconfig.xml');
});

app.get('/', function(request, response) {
  //Deprecated remove in production
  var id = request.query.id
  if(id != null) {
    response.locals.id = id;
    response.render('pages/index.ejs', {bdayId: id});
  } else {
    response.render('pages/create.ejs');
  }
});

app.get('/:id', function(request, response) {
  var id = request.params.id
  response.locals.id = id;
  response.render('pages/index.ejs', {bdayId: id});
});

app.get('/faq', function(request, response) {
    response.render('pages/faq.ejs');
});

app.post('/', function(request, response) {
  var id = request.body.id;
  writeUserData(request.body.id, request.body.name, request.body.date)
  
  response.render('pages/done.ejs', {bdayId: id});
});

app.post('/create', function(request, response) {
  var email = request.body.email;
  var id = createList(email);
  var link = "http://www.birthbook.me" + id;
  
  response.render('pages/created.ejs', {bdayId: link});
});

var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

function createList(email) {
  var postsRef = firebase.database().ref("/");
  var newAppKey = postsRef.push();
  newAppKey.set({
    id: newAppKey.key,
    email: email
  });
  return newAppKey.key;
}

function writeUserData(id, name, date) {
  var playersRef = firebase.database().ref(id + '/');
  playersRef.child(name).set ({
     date: date     
  });
}
