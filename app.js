'use strict';

var OpalCard = require('./opal.js'),
    config   = require('./config.json');

var opal = new OpalCard(config.opal.username, config.opal.password);

// opal.turnOnDevMode();

// opal.getCardTransactions(function (err, data) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(data);
//     console.log('');
//     opal.getCardInfo(function (err, data) {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log(data);
//         console.log('');
//       }
//     });
//   }
// });

function getOverallFares(transactions) {
  var overallPrice    = 0,
      overallDiscount = 0,
      overallPaid     = 0;
  transactions.forEach(function (transaction) {
    if (transaction.journey) {
      overallPrice    += transaction.fare.price;
      overallDiscount += transaction.fare.discount;
      overallPaid     += transaction.fare.paid;
    }
  });
  return {
    overallPrice: overallPrice,
    overallDiscount: overallDiscount,
    overallPaid: overallPaid
  };
}

opal.getCardInfo()
.then(function (data) {
  console.log(data);
  console.log('');
  return opal.getUserDetails();
})
.then(function (data) {
  console.log(data);
  console.log('');
  return opal.getCardTransactions({
    month: 7,
    year: 2014
  });
})
.then(function (data) {
  console.log(JSON.stringify(data, null, '  '));
  console.log('');
  console.log(JSON.stringify(getOverallFares(data), null, '  '));
})
.fail(function (err) {
  console.log(err);
});
