'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var app  = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.json({
    "status": "dev server is running"
  });
});

app.post('/login/registeredUserUsernameAndPasswordLogin', function (req, res) {
  if (req.body.h_password === 'fail') {
    res.sendfile('assets/loginFail.json');
  } else {
    res.sendfile('assets/loginOK.json');
  }
});

app.get('/registered/opal-card-transactions/', function (req, res) {
  res.sendfile('assets/opal-card-activities-list.html');
});

app.get('/registered/getJsonCardDetailsArray', function (req, res) {
  res.sendfile('assets/cardinfo.json');
});

console.log('resize server listening on 8181');
app.listen(8181);
