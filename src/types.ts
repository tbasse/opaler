import * as request from 'request';

/**
 * @internal
 */
export interface PrivateTransactionReqOpts {
  month: number;
  year: number;
  pageIndex: number | null;
  cardIndex: number;
  ts: number;
}

/**
 * @internal
 */
export type Callback = (error: Error | null, body?: request.Response['body']) => void;

interface BaseCard {
  cardNumber: string;
  displayCardNumber: null;
  fareCategoryCode: null;
  fareCategoryTitle: null;
  cardNickName: string;
  cardState: string;
  cardBalance: number;
  active: boolean;
  svPending: number;
  toBeActivated: boolean;
  displayName: string;
}

/**
 * @internal
 */
export interface CardReponse extends BaseCard {
  cardBalanceInDollars: string;
  currentCardBalanceInDollars: string;
  svPendingInDollars: string;
}

export interface Card extends BaseCard {
  cardIndex: number;
  currentCardBalance: number;
}

export interface TransactionJourney {
  number: number;
  start: string;
  end: string;
}

export interface Transaction {
  transactionNumber: number;
  timestamp: number;
  summary: string | null;
  mode: string | null;
  fare: {
    applied: string | null;
    price: number;
    discount: number;
    paid: number;
  };
  journey: TransactionJourney | null;
}

export interface TransactionRequestOptions {
  cardIndex: number;
  month?: number;
  year?: number;
  pageIndex?: number;
}

export interface Account {
  firstName: string;
  lastName: string;
  address: string;
  dateOfBirth: string;
  phoneNumber: string;
  mobileNumber: string;
  emailAddress: string;
  nameOnCard: string;
  cardType: string;
  cardNumber: string;
  cardExpires: string;
  password: string;
  opalPin: string;
  securityQuestion: string;
  securityAnswer: string;
}

export interface Order {
  orderId: string;
  orderDate: string;
  orderDateTimestamp: number;
  cardType: string;
  orderStatus: string;
}
