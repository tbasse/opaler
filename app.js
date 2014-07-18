'use strict';

var OpalCard = require('./opal.js'),
    config   = require('./config.json');

var opal = new OpalCard(config.opal.username, config.opal.password);


opal.getCardTransactions(function (err, data) {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
    console.log('');
  }
});

opal.getCardInfo(function (err, data) {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
    console.log('');
  }
});
