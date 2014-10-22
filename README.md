This is a node module for accessing data about an Opal card.

## getCards([Callback])

Usage

```
var opal = new Opal('username', 'password123');

// Promise
opal.getCardInfo().then(function (result) {
  console.log(result);
});

// Callback
opal.getCardInfo(function (err, result) {
  console.log(result);
});
```

Result `Array`

```
[{
  cardNumber: String
  displayCardNumber: {Unknown}
  fareCategoryCode: {Unknown}
  fareCategoryTitle: {Unknown}
  cardNickName: String,
  cardState: String,
  cardBalance: Number,
  active: Boolean,
  svPending: Number,
  toBeActivated: Boolean,
  displayName: String,
  currentCardBalance: Number
}]
```

## getAccount([Callback])

Usage

```
var opal = new Opal('username', 'password123');

// Promise
opal.getUserDetails().then(function (result) {
  console.log(result);
});

// Callback
opal.getUserDetails(function (err, result) {
  console.log(result);
});
```

Result `Object`

```
{
  firstName: String,
  lastName: String,
  address: Array,
  birthDate: String,
  phoneNumber: String,
  mobileNumber: String,
  emailAddress: String
}
```

## getTransactions(Options, [Callback])

Options

```
{
  month,
  year,
  cardIndex,
  pageIndex
}
```

Usage

```
var opal = new Opal('username', 'password123');

// Promise
opal.getCardTransactions({
  cardIndex: 0,
  pageIndex: 1
}).then(function (result) {
  console.log(result);
});

// Callback
opal.getCardTransactions({
  cardIndex: 0,
  pageIndex: 1
}, function (err, result) {
  console.log(result);
});
```

Result `Array`

```
[{
  transactionNumber: String,
  timestamp: Number,
  date: Date,
  summary: String,
  mode: String (ferry|bus|train),
  fare: { 
    applied: Number,
    price: Number,
    discount: Number,
    paid: Number
  },
  journey: {
    number: Number,
    start: String,
    end: String
  }
},
...]

```