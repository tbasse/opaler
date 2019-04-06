import * as cheerio from 'cheerio';
import { Order, Account, CardReponse, Card, Transaction } from './types';

const dateParseRegex = {
  order: {
    regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    replacement: '$3-$2-$1',
  },
  transaction: {
    regex: /^.*?(\d{2})\/(\d{2})\/(\d{4}).*?(\d{2}):(\d{2}).*?$/,
    replacement: '$3-$2-$1 $4:$5',
  },
};

/**
 * Internal generalized parseDate function
 *
 * @internal
 */
export const parseDate = (
  dateString: string,
  mode: 'order' | 'transaction',
): number => {
  if (!dateParseRegex[mode]) {
    throw new Error(`Unknown mode '${mode}' in parseDate.`);
  }

  const { regex, replacement } = dateParseRegex[mode];
  const date = new Date(dateString.replace(regex, replacement));

  return Math.floor(date.getTime() / 1000);
};

/**
 * Map month numbers from 1-12 to 0-11 and return -1 for everything else
 *
 * @internal
 */
export const mapMonthsToZeroBased = (month?: number): number => {
  if (typeof month === 'number' && month >= 1 && month <= 12) {
    return month - 1;
  }

  return -1;
};

/**
 * Convert scraped HTML to text and break up into an array if it contains <br>
 *
 * @internal
 */
export const parseScrapedText = (html: string): string => {
  const result = html.split('<br>');
  result.forEach((value, index) => {
    const $ = cheerio.load('<p>' + value + '</p>');
    result[index] = $('p').text();
  });

  return result.filter(Boolean).join('\n');
};

/**
 * Camelcaseify a given string and remove all non a-z characters
 * @internal
 */
export const camelCaseify = (
  inputString: string,
  delimiter: string,
): string => {
  delimiter = delimiter || '_';

  return inputString
    .toLowerCase()
    .replace(new RegExp('[^a-z' + delimiter + ']', 'g'), '')
    .replace(new RegExp('(' + delimiter + '[a-z])', 'g'), a =>
      a.toUpperCase().substr(1),
    );
};

/**
 * Convert currency strings into integers
 * $80.00 will become 8000
 *
 * @internal
 */
export const dollarToInt = (dollarString: string | null): number =>
  !dollarString
    ? 0
    : Math.trunc(parseFloat(dollarString.replace('$', '')) * 100);

/**
 * Parse orders date to unix timestamp
 *
 * @internal
 */
export const parseOrdersDate = (orderDateString: string): number =>
  parseDate(orderDateString, 'order');

/**
 * Parse transaction mode (ferry, bus, train) from the info tables image tag
 *
 * @internal
 */
export const parseTransactionMode = (
  transactionMode: string,
): string | null => {
  const mode = transactionMode.match(/alt="(.*?)"/);

  return mode ? mode[1] : null;
};

/**
 * Parse transaction date to unix timestamp
 *
 * @internal
 */
export const parseTransactionDate = (transactionDate: string): number =>
  parseDate(transactionDate, 'transaction');

/**
 * Parse cardinfo array and convert currency strings to numbers
 *
 * @internal
 */
export const parseCardInfo = (cardDetailsString: string): Card[] => {
  let cards: CardReponse[];

  try {
    cards = JSON.parse(cardDetailsString);
  } catch (e) {
    throw e;
  }

  return cards.map(
    (element: CardReponse, index: number): Card => {
      const intermediateCard: Partial<CardReponse & Card> = {
        ...element,
      };

      intermediateCard.cardIndex = index;
      intermediateCard.cardBalance = dollarToInt(element.cardBalanceInDollars);
      intermediateCard.currentCardBalance = dollarToInt(
        element.currentCardBalanceInDollars,
      );
      intermediateCard.svPending = dollarToInt(element.svPendingInDollars);
      delete intermediateCard.cardBalanceInDollars;
      delete intermediateCard.currentCardBalanceInDollars;
      delete intermediateCard.svPendingInDollars;

      return intermediateCard as Card;
    },
  );
};

/**
 * Remove hyphens from summary string
 *
 * @internal
 */
export const sanitizeSummaryString = (summary: string): string =>
  summary.replace(/&#xAD;/g, '');

/**
 * Parse card transaction HTML table to return an data object
 *
 * @internal
 */
export const parseTransactions = (html: string): Transaction[] => {
  const $ = cheerio.load(html);
  const data: Transaction[] = [];

  const noData = $('.no-activity-list').text();
  if (noData !== '') {
    return [];
  }

  $('#transaction-data tbody tr').each((rowIndex, tableRow) => {
    const cells: string[] = [];

    $(tableRow)
      .find('td')
      .each((cellIndex, tableCell) => {
        cells.push($(tableCell).html() || '');
      });

    const [
      transaction,
      date,
      mode,
      details,
      journey,
      fareApplied,
      fare,
      discount,
      amount,
    ] = cells;

    const dataJson: Transaction = {
      transactionNumber: parseInt(transaction, 10),
      timestamp: parseTransactionDate(date),
      summary: sanitizeSummaryString(details) || null,
      mode: parseTransactionMode(mode) || null,
      fare: {
        applied: fareApplied || null,
        price: Math.abs(dollarToInt(fare)) || 0,
        discount: Math.abs(dollarToInt(discount)) || 0,
        paid: Math.abs(dollarToInt(amount)) || 0,
      },
      journey: null,
    };

    if (dataJson.mode && /^(ferry|bus|train)$/.test(dataJson.mode)) {
      const journeyData = dataJson.summary!.split(' to ');
      if (journeyData.length === 2) {
        dataJson.journey! = {
          number: parseInt(journey, 10),
          start: journeyData[0],
          end: journeyData[1],
        };
      }
    }

    data.push(dataJson);
  });

  return data;
};

/**
 * ParseAccount description
 *
 * @internal
 */
export const parseAccount = (html: string): Account => {
  const $ = cheerio.load(html);
  const result: { [key: string]: string } = {};

  $('#content #tab-5 .column tbody tr').each((rowIndex, tableRow) => {
    const cells: string[] = [];

    $(tableRow)
      .find('td')
      .each((cellIndex, tableCell) => {
        cells.push($(tableCell).html() || '');
      });

    result[camelCaseify(cells[0], ' ')] = parseScrapedText(cells[1]);
  });

  return {
    firstName: result.firstName,
    lastName: result.lastName,
    address: result.address,
    dateOfBirth: result.dateOfBirth,
    phoneNumber: result.phoneNumber,
    mobileNumber: result.mobileNumber,
    emailAddress: result.emailAddress,
    nameOnCard: result.nameOnCard,
    cardType: result.cardType,
    cardNumber: result.cardNumber,
    cardExpires: result.cardExpires,
    password: result.password,
    opalPin: result.opalPin,
    securityQuestion: result.securityQuestion,
    securityAnswer: result.securityAnswer,
  };
};

/**
 * ParseOrders description
 *
 * @internal
 */
export const parseOrders = (html: string): Order[] => {
  const $ = cheerio.load(html);
  const data: Order[] = [];

  $('#content #tab-5 #transaction-data tbody tr').each((rowIndex, tableRow) => {
    const cells: string[] = [];

    $(tableRow)
      .find('td')
      .each((cellIndex, tableCell) => {
        cells.push($(tableCell).html() || '');
      });

    data.push({
      orderId: cells[0],
      orderDate: new Date(parseOrdersDate(cells[1]) * 1000).toISOString(),
      orderDateTimestamp: parseOrdersDate(cells[1]),
      cardType: cells[2],
      orderStatus: cells[3],
    });
  });

  return data;
};

/**
 * Check if pathname starts with /login to determinate if the url request
 * redirected to the login page and thus needs authorization
 *
 * @internal
 */
export const authorizationNeeded = (pathname: string): boolean => {
  if (/^\/login/.test(pathname)) {
    return true;
  }

  return false;
};
