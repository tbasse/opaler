import * as util from '../util';
import * as cards from './mocks/card-details';
import * as activity from './mocks/card-activity';

test('#parseDate()', () => {
  expect(util.parseDate('18/02/1977', 'order')).toBe(225072000);
  expect(util.parseDate('18/02/1977', 'order')).toBe(
    util.parseOrdersDate('18/02/1977'),
  );
  expect(util.parseDate('18/02/1977 13:37', 'transaction')).toBe(225081420);
  expect(util.parseDate('18/02/1977 13:37', 'transaction')).toBe(
    util.parseTransactionDate('18/02/1977 13:37'),
  );
  // @ts-ignore
  expect(() => util.parseDate('18/02/1977 13:37', 'unknown')).toThrow();
});

test('#mapMonthsToZeroBased()', () => {
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => {
    expect(util.mapMonthsToZeroBased(month)).toBe(month - 1);
  });
  [0, -2, NaN, 13, 271, Infinity].map(month => {
    expect(util.mapMonthsToZeroBased(month)).toBe(-1);
  });
});

test('#parseScrapedText()', () => {
  expect(util.parseScrapedText('string')).toBe('string');
  expect(util.parseScrapedText('string<br>string')).toBe('string\nstring');
  expect(util.parseScrapedText('')).toBe('');
});

test('#camelCaseify()', () => {
  expect(util.camelCaseify('nodelimiter', '')).toBe('nodelimiter');
  expect(util.camelCaseify('camel case', ' ')).toBe('camelCase');
  expect(util.camelCaseify('camel_case', '_')).toBe('camelCase');
  expect(util.camelCaseify('CAMEL_CASE', '_')).toBe('camelCase');
  expect(util.camelCaseify('some\nthing', '\n')).toBe('someThing');
});

test('#dollarToInt()', () => {
  // without dollar sign
  expect(util.dollarToInt('-1.00')).toBe(-100);
  expect(util.dollarToInt('1.00')).toBe(100);
  // with dollar sign
  expect(util.dollarToInt('-$1.00')).toBe(-100);
  expect(util.dollarToInt('$12.34')).toBe(1234);
  expect(util.dollarToInt('$12.3456')).toBe(1234);
  expect(util.dollarToInt('$12')).toBe(NaN);
  expect(util.dollarToInt('NotADollarAmount')).toBe(NaN);
});

test('#parseOrdersDate()', () => {
  expect(util.parseOrdersDate('18/02/1977')).toBe(225072000);
});

test('#parseTransactionMode()', () => {
  expect(
    util.parseTransactionMode(
      '<img class="fancyPicture" alt="ferry" src="/test.jpg" />',
    ),
  ).toBe('ferry');

  expect(
    util.parseTransactionMode(
      '<img class="fancyPicture" alt="foobar" src="/test.jpg" />',
    ),
  ).toBe('foobar');

  expect(
    util.parseTransactionMode('<img class="fancyPicture" src="/test.jpg" />'),
  ).toBe(null);
});

test('#parseTransactionDate()', () => {
  expect(util.parseTransactionDate('18/02/1977 13:37')).toBe(225081420);
});

test('#authorizationNeeded()', () => {
  expect(util.authorizationNeeded('/registered/login_details')).toBe(false);
  expect(util.authorizationNeeded('/login')).toBe(true);
  expect(util.authorizationNeeded('/login/foo')).toBe(true);
  expect(util.authorizationNeeded('/login?redirect=true')).toBe(true);
});

describe('#parseCardInfo()', () => {
  test('svPending null', () => {
    expect(util.parseCardInfo(cards.card1.string)).toEqual(cards.card1.json);
  });

  test('balance negative', () => {
    expect(util.parseCardInfo(cards.card2.string)).toEqual(cards.card2.json);
  });

  test('invalid json', () => {
    expect(() => util.parseCardInfo('nope')).toThrow();
  });
});

describe('#parseTransactions()', () => {
  test('no activity', () => {
    expect(
      util.parseTransactions(activity.getTableHtml(activity.htmlNoActivity)),
    ).toEqual([]);
  });

  test('fare standard', () => {
    expect(
      util.parseTransactions(activity.getTableHtml(activity.htmlFareDefault)),
    ).toEqual(activity.jsonFareDefault);
  });

  test('fare off-peak', () => {
    expect(
      util.parseTransactions(activity.getTableHtml(activity.htmlFareOffPeak)),
    ).toEqual(activity.jsonFareOffPeak);
  });

  test('fare travel reward', () => {
    expect(
      util.parseTransactions(activity.getTableHtml(activity.htmlFareReward)),
    ).toEqual(activity.jsonFareReward);
  });

  test('fare day-cap', () => {
    expect(
      util.parseTransactions(activity.getTableHtml(activity.htmlFareDayCap)),
    ).toEqual(activity.jsonFareDayCap);
  });

  test('no tap-off', () => {
    expect(
      util.parseTransactions(activity.getTableHtml(activity.htmlNoTapOff)),
    ).toEqual(activity.jsonNoTapOff);
  });

  test('mode bus', () => {
    expect(
      util.parseTransactions(activity.getTableHtml(activity.htmlModeBus)),
    ).toEqual(activity.jsonModeBus);
  });

  test('mode ferry', () => {
    expect(
      util.parseTransactions(activity.getTableHtml(activity.htmlModeFerry)),
    ).toEqual(activity.jsonModeFerry);
  });

  test('mode train', () => {
    expect(
      util.parseTransactions(activity.getTableHtml(activity.htmlModeTrain)),
    ).toEqual(activity.jsonModeTrain);
  });

  test('mode opal-pay', () => {
    expect(
      util.parseTransactions(activity.getTableHtml(activity.htmlModeOpalPay)),
    ).toEqual(activity.jsonModeOpalPay);
  });
});
