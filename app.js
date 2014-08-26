'use strict';

var OpalCard = require('./lib/opal.js'),
    config   = require('./config.json'),
    Q        = require('q');

var opal = new OpalCard(config.opal.username, config.opal.password);

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

// opal.getCardInfo()
// .then(function (data) {
//   console.log(data);
//   console.log('');
//   return opal.getUserDetails();
// })
// .then(function (data) {
//   console.log(data);
//   console.log('');
//   return opal.getCardTransactions({
//     pageIndex: 1
//   });
// })
// .then(function (data) {
//   console.log(JSON.stringify(data, null, '  '));
//   console.log('');
//   console.log(JSON.stringify(getOverallFares(data), null, '  '));
// })
// .fail(function (err) {
//   console.log(err);
// });

var fnArray = [
  opal.getCardTransactions({pageIndex: 1}),
  opal.getCardTransactions({pageIndex: 2}),
  opal.getCardTransactions({pageIndex: 3}),
  opal.getCardTransactions({pageIndex: 4})
];

return Q.all(fnArray)
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
