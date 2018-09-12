// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var shortid = require('shortid');

var admin = require("firebase-admin");
let firebaseServiceAccount = {
  "type": "service_account",
  "project_id": process.env.PROJECT_ID,
  "private_key_id": process.env.PRIVATE_KEY_ID,
  "private_key": JSON.parse(process.env.PRIVATE_KEY),
  "client_email": process.env.CLIENT_EMAIL,
  "client_id": process.env.CLIENT_ID,
  "auth_uri": process.env.AUTH_URI,
  "token_uri": process.env.TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER,
  "client_x509_cert_url": process.env.CLIENT_CERT
}

admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  databaseURL: "https://birthday-collector.firebaseio.com"
});

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/browserconfig.xml', function(request, response) {
  response.sendfile('configs/browserconfig.xml');
});

app.get('/', function(request, response) {
  response.render('pages/create.ejs');
});

app.get('/count', function(request, response) {
    getBirthdayCount().then(function(data){
      var bdayCount = 0;
      var listCount = 0;
      listCount = data.numChildren();    
      data.forEach(function(childSnapshot) {      
        childSnapshot.forEach(function(lastNodeSnap) {        
          if(lastNodeSnap.numChildren() > 0) { 
            bdayCount += lastNodeSnap.numChildren();  
            }
          });
        });      
      response.render('pages/count.ejs', {listcount:listCount, birthdaycount: bdayCount});
  });
});

app.get('/view/:quicklink', function(request, response) {
  var quicklink = request.params.quicklink;
  
  var data = getQuicklink(quicklink)
  .then(function(data){    
    var id = data.id
    var recoverId = data.recoverId
    var shareLink = "http://birthbook.me/" + id;
    var recoverLink = "http://birthbook.me/view/" + id + "/" + recoverId;
    
    if(data.quicklink) {
      recoverLink = "http://birthbook.me/view/"+ data.quicklink;
    }
    
      response.render('pages/view.ejs', {data: data, shareLink: shareLink, recoverLink: recoverLink, bdayId:id, recoverId:recoverId});
    })
  .catch(function(error){
        response.render('pages/create.ejs');
  });
});

app.get('/view/:id/:recoverId', function(request, response) {
    var id = request.params.id
    var recoverId = request.params.recoverId
    var shareLink = "http://birthbook.me/" + id;
    var recoverLink = "http://birthbook.me/view/" + id + "/" + recoverId;    
  
    var data = getUserData(id, recoverId)
    .then(function(result){
      if(data.quicklink) {
        recoverLink = "http://birthbook.me/view/"+ data.quicklink;
      }
        response.render('pages/view.ejs', {data: result, shareLink: shareLink, recoverLink: recoverLink, bdayId:id, recoverId:recoverId});
      })
    .catch(function(error){
          response.render('pages/create.ejs');
    });
});

app.get('/:id', function(request, response) {
  var id = request.params.id
  if(id == 'faq') {   
    showFaq(request, response);
  } else {
    response.render('pages/index.ejs', {bdayId: id});
  }
});

function showFaq(request, response) {
    response.render('pages/faq.ejs');
}

app.post('/', function(request, response) {
  var id = request.body.id;
  writeUserData(request.body.id, request.body.name, request.body.date)

  response.render('pages/done.ejs', {bdayId: id});
});

app.post('/create', function(request, response) {
  var recoverId = shortid.generate();
  var id = createList(recoverId);
  var link = "http://birthbook.me/" + id;
  var recoverLink = "http://birthbook.me/view/" + id + "/" + recoverId;

//   response.render('pages/created.ejs', {bdayId: link, recoverLink:recoverLink});
  
    var data = getUserData(id, recoverId)
    .then(function(result){
        response.render('pages/view.ejs', {data: result, shareLink: link, recoverLink: recoverLink});
      })
    .catch(function(error){
          response.render('pages/create.ejs');
    });
});

app.post('/quicklink', function(request, response) {
  var id = request.body.id;
  var quicklink = request.body.quicklink;
  
  makeQuickLink(id, quicklink);
  response.send("OK");
});

var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

function createList(recoverId) {
  var postsRef = admin.database().ref("/");
  var newAppKey = postsRef.push();
  newAppKey.set({
    id: newAppKey.key,
    recoverId: recoverId
  });
  return newAppKey.key;
}

function writeUserData(id, name, date) {
  var playersRef = admin.database().ref(id + '/');
  playersRef.child(name).set ({
     date: date     
  });
}

function makeQuickLink(id, newLink) {
  var bdayRef = admin.database().ref("/" + id).update({ "quicklink": newLink });
}

function getUserData(id, email) {
  var bdayRef = admin.database().ref("/" + id);
  var data = bdayRef.once('value').then(function(snapshot) {
    if(snapshot.val().recoverId == email && snapshot.val().id == id) {  
      return snapshot.val();
    } else {
      throw "List does not exist";  
    }
  });
  return data;
}

function getQuicklink(quicklink) {
  var bdayRef = admin.database().ref("/");
  var data = bdayRef.once('value').then(function(snapshot) {
    var user;
    snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.val().quicklink == quicklink)
        user = childSnapshot.val();
      return;
      });
    return user;
  });
  return data;
}

function getBirthdayCount() {
  var bdayRef = admin.database().ref("/");
  var data = bdayRef.once('value').then(function(snapshot) {      
    return snapshot;
  });
  return data;
}
