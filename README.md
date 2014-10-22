Get information for your opal card account.  
https://www.opal.com.au/

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

# License

(MIT License)

Copyright (c) 2014 Thorsten Basse thorsten@tgdb.io

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.