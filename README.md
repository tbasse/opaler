[![Build Status](https://travis-ci.org/tbasse/opaler.svg?branch=master)](https://travis-ci.org/tbasse/opaler) [![npm version](https://badge.fury.io/js/opaler.svg)](https://www.npmjs.com/package/opaler) [![License](https://img.shields.io/npm/l/opaler.svg)](https://tldrlegal.com/license/mit-license)

# Opaler

Retrieve and parse information from your opal card account.  
[https://www.opal.com.au/](https://www.opal.com.au/)

Opal cards are smartcard tickets that you keep, reload and reuse to pay for travel on public transport in the greater Sydney area of New South Wales, Australia.

## Getting Started

### Installing

```bash
npm install opaler
```

### Usage

```typescript
import Opaler from 'opaler';

const opaler = new Opaler('YOUR_USERNAME', 'YOUR_PASSWORD');

opaler.getCards().then(cards => {
  cards.forEach(card => {
    console.log(JSON.stringify(card, null, 2));
  })
});
```

## API

### `#getCards(): Promise<Card[]>`

**`Card`**
```typescript
{
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
}
```

### `#getAccount(): Promise<Account>`

**`Account`**
```typescript
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

### `#getOrders(): Promise<Order[]>`

**`Order`**
```typescript
{
  orderId: string,
  orderDate: string,
  orderDateTimestamp: number,
  cardType: string,
  orderStatus: string,
}
```

### `#getTransactions(options: TransactionRequestOptions): Promise<Transaction[]>`

**`TransactionRequestOptions`**
```typescript
{
  month?: number,
  year?: number,
  pageIndex?: number,
  cardIndex: number,
}
```

- `month` and `year` can be used to request transactions for a specific time
- `pageIndex` requests a certain page inside the result set
if no `pageIndex` is set all pages will be fetched continously. Depending on your result size this can take quite a while and is not recommended.
- `cardIndex` refers to the cards index number within the Card[] array returned from #getCards()


**`Transaction`**
```typescript
{
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

```

## Versioning

Opaler uses [Semantic Versioning](http://semver.org/) for versioning.  
For the versions available, see the [the published versions on npmjs.com](https://www.npmjs.com/package/opaler). 

## License

[MIT License](https://tldrlegal.com/license/mit-license)

Copyright (c) 2014 Thorsten Basse

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

