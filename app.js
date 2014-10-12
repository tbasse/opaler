'use strict';

var OpalCard = require('./lib/opal.js'),
    config   = require('./config.json'),
    Promise  = require('bluebird');

var opal = new OpalCard(config.opal.username, config.opal.password);

function getOverallFares(transactions) {
  var overallJourneys = 0,
      overallPrice    = 0,
      overallDiscount = 0,
      overallPaid     = 0;
  transactions.forEach(function (transaction) {
    if (transaction.journey) {
      overallJourneys += 1;
      overallPrice    += transaction.fare.price;
      overallDiscount += transaction.fare.discount;
      overallPaid     += transaction.fare.paid;
    }
  });
  return {
    overallJourneys: overallJourneys,
    overallPrice: overallPrice,
    overallDiscount: overallDiscount,
    overallPaid: overallPaid
  };
}

// Get Card Information
opal.getCardInfo()
.then(function (data) {
  console.log(data);
  console.log('');
  return opal.getUserDetails();
})
.then(function (data) {
  console.log(data);
})
.catch(function (err) {
  console.log(err);
})
.done();

// Get Transactions
var fnArray = [
  opal.getCardTransactions({cardIndex: 0, pageIndex: 1}),
  opal.getCardTransactions({cardIndex: 0, pageIndex: 2})
];

Promise.all(fnArray)
.then(function (data) {
  return data.reduce(function(a, b) {
    return a.concat(b);
  });
})
.then(function (data) {
  console.log(JSON.stringify(data, null, 2));
  var overall = getOverallFares(data);
  console.log(JSON.stringify(overall, null, 2));
})
.catch(function (err) {
  console.error(err);
})
.done();
