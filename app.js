'use strict';

var OpalCard = require('./lib/opal.js'),
    config   = require('./config.json'),
    Q        = require('q');

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
.fail(function (err) {
  console.log(err);
})
.done();


// Get Transactions
var fnArray = [
  opal.getCardTransactions({cardIndex: 0, pageIndex: 1}),
  opal.getCardTransactions({cardIndex: 0, pageIndex: 2}),
  opal.getCardTransactions({cardIndex: 0, pageIndex: 3}),
  opal.getCardTransactions({cardIndex: 0, pageIndex: 4}),
  opal.getCardTransactions({cardIndex: 0, pageIndex: 5}),
];

Q.all(fnArray)
.then(function (data) {
  return data.reduce(function(a, b) {
    return a.concat(b);
  });
})
.then(function (data) {
  console.log(data);
  var overall = getOverallFares(data);
  console.log(JSON.stringify(overall, null, '  '));
})
.fail(function (err) {
  console.error(err);
})
.done();
