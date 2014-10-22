'use strict';

var Opal = require('../index.js'),
    Promise  = require('../node_modules/bluebird');

var opalUsername = '';
var opalPassword = '';

var opal = new Opal(opalUsername, opalPassword);

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
opal.getCards()
.then(function (data) {
  console.log(data);
  console.log('');
  return opal.getAccount();
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
  opal.getTransactions({cardIndex: 0, pageIndex: 1})
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
