Get information for your opal card account.  
https://www.opal.com.au/

[![Build Status](https://travis-ci.org/tbasse/opaler.svg?branch=master)](https://travis-ci.org/tbasse/opaler)

### Install

```
npm install opaler
```

### `getCards(): Promise<Card[]>`

Usage

```javascript
var opaler = new Opaler('username', 'password123');

opaler.getCards().then(result => {
  console.log(result);
});
```

Result `Card[]`

```javascript
[{
  cardNumber: string,
  displayCardNumber: null,
  fareCategoryCode: null,
  fareCategoryTitle: null,
  cardNickName: string,
  cardState: string,
  cardBalance: number,
  active: boolean,
  svPending: number,
  toBeActivated: boolean,
  displayName: string,
  cardIndex: number,
  currentCardBalance: number,
},
...]
```

### `getAccount(): Promise<Account>`

Usage

```javascript
var opaler = new Opaler('username', 'password123');

opaler.getAccount().then(result => {
  console.log(result);
});
```

Result `Account`

```javascript
{
  firstName: string,
  lastName: string,
  address: string,
  dateOfBirth: string,
  phoneNumber: string,
  mobileNumber: string,
  emailAddress: string,
  nameOnCard: string,
  cardType: string,
  cardNumber: string,
  cardExpires: string,
  password: string,
  opalPin: string,
  securityQuestion: string,
  securityAnswer: string,
}
```

### `getOrders(): Promise<Order[]>`

Usage

```javascript
var opaler = new Opaler('username', 'password123');

opaler.getOrders().then(function(result) {
  console.log(result);
});
```

Result `Order[]`

```
[{
  orderId: string,
  orderDate: string,
  orderDateTimestamp: number,
  cardType: string,
  orderStatus: string,
},
...]
```

### `getTransactions(options: TransactionRequestOptions): Promise<Transaction[]>`

Options

```javascript
{
  month?: number,
  year?: number,
  pageIndex?: number,
  cardIndex: number,
}
```

`pageIndex`, `month` and `year` are optional.  
If no `pageIndex` is set all available pages will be fetched.

Usage

```javascript
var opaler = new Opaler('username', 'password123');

opaler
  .getTransactions({
    cardIndex: 0,
    pageIndex: 1,
  })
  .then(function(result) {
    console.log(result);
  });
```

Result `Transaction[]`

```javascript
[{
  transactionNumber: number,
  timestamp: number,
  summary: string | null,
  mode: string | null,
  fare: {
    applied: string | null,
    price: number,
    discount: number,
    paid: number,
  },
  journey: {
    number: number,
    start: string,
    end: string,
  } | null,
},
...]
```

### License

(MIT License)

Copyright (c) 2014 Thorsten Basse thorsten@tgdb.io

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
