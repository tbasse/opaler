var Opaler = require('../lib/index.js').default;

const opalUsername = 'YOUR_USERNAME';
const opalPassword = 'YOUR_PASSWORD';

const opal = new Opaler(opalUsername, opalPassword);

opal
  .getCards()
  .then(cards => {
    cards.forEach(card => {
      console.log(JSON.stringify(card, null, 2));
    });
  })
  .catch(error => {
    console.error(error);
  });

opal
  .getTransactions({
    cardIndex: 0,
    pageIndex: 1,
  })
  .then(data => {
    data.forEach(transaction => {
      console.log(JSON.stringify(transaction, null, 2));
    });
  })
  .catch(error => {
    console.error(error);
  });
