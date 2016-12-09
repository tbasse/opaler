import * as request from 'request';
import * as util from './util';
import {
  Card,
  Order,
  TransactionRequestOptions,
  Account,
  Transaction,
} from './types';

type Callback = (error: Error | null, body?: request.Response['body']) => void;

interface PrivateTransactionReqOpts {
  month: number;
  year: number;
  pageIndex: number | null;
  cardIndex: number;
  ts: number;
}

class Opaler {
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
    this.cookie = request.jar();
    this.baseurl = 'https://www.opal.com.au';
  }

  /**
   * @internal
   */
  private username: string;
  /**
   * @internal
   */
  private password: string;
  /**
   * @internal
   */
  private cookie: request.CookieJar;
  /**
   * @internal
   */
  private baseurl: string;

  /**
   * Authorize via login post against opal website
   *
   * @internal
   */
  private authorize(cb: Callback) {
    const params: request.CoreOptions = {
      form: {
        h_username: this.username,
        h_password: this.password,
        submit: 'Log in',
        attempt: '',
      },
      jar: this.cookie,
    };
    const url = `${this.baseurl}/login/registeredUserUsernameAndPasswordLogin`;

    request.post(
      url,
      params,
      (error: Error, response: request.RequestResponse) => {
        if (error) {
          return cb(error);
        }

        return cb(null, response.body);
      },
    );
  }

  /**
   * Get request wrapper for requests against opal website
   *
   * @internal
   */
  private getRequest(url: string, cb: Callback) {
    const params: request.CoreOptions = {
      jar: this.cookie,
    };

    request.get(url, params, (error, res) => {
      if (error) {
        return cb(error);
      } else if (util.authorizationNeeded(res.request.uri.pathname)) {
        this.authorize((authError, response) => {
          let json;

          try {
            json = JSON.parse(response as string);
          } catch (parseError) {
            return cb(parseError);
          }

          if (json && json.errorMessage) {
            return cb(new Error(json.errorMessage));
          }

          this.getRequest(url, cb);
        });
      } else {
        return cb(null, res.body);
      }
    });
  }

  /**
   * Fetch transaction data from opal.com.au for a specific pagination index
   *
   * @internal
   */
  private getTransactionsSinglePage(
    options: PrivateTransactionReqOpts,
    cb: Callback,
  ) {
    const url = [
      this.baseurl,
      '/registered/opal-card-activities-list?',
      [
        'AMonth=' + options.month,
        'AYear=' + options.year,
        'cardIndex=' + options.cardIndex,
        'pageIndex=' + options.pageIndex,
        '_=' + options.ts,
      ].join('&'),
    ].join('');

    this.getRequest(url, (error, body) => {
      if (error) {
        return cb(error);
      }

      if (typeof body !== 'string') {
        return cb(new Error('Response must be of type string'));
      }

      const data = util.parseTransactions(body as string);

      return cb(null, data);
    });
  }

  /**
   * Walk through all transaction pages on opal.com.au and call
   * `getTransactionPageSingle` to fetch the data for every pagination index
   *
   * @internal
   */
  private getTransactionsAll(options: PrivateTransactionReqOpts, cb: Callback) {
    let transactions: Transaction[] = [];
    options.pageIndex = 1;

    const loop = (pageIndex: number) => {
      this.getTransactionsSinglePage(options, (error, result) => {
        if (error) {
          return cb(error, transactions);
        }
        transactions = transactions.concat(result);
        pageIndex += 1;

        loop(pageIndex);
      });
    };

    loop(options.pageIndex);
  }

  /**
   * Get details of all Opal cards linked to the account
   */
  getCards(): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      const ts = Math.floor(new Date().getTime() / 1000);
      const url = this.baseurl + '/registered/getJsonCardDetailsArray?_=' + ts;

      this.getRequest(url, (error, data) => {
        if (error) {
          return reject(error);
        } else {
          data = util.parseCardInfo(data);
          if (!data) {
            return reject(new Error('Cardinfo - No valid JSON'));
          }

          return resolve(data);
        }
      });
    });
  }

  /**
   * Get account details
   */
  getAccount(): Promise<Account> {
    return new Promise((resolve, reject) => {
      const url = `${this.baseurl}/registered/my-details/`;

      this.getRequest(url, (error, body) => {
        if (error) {
          return reject(error);
        }

        return resolve(util.parseAccount(body));
      });
    });
  }

  /**
   * Get Opal card orders and requests
   */
  getOrders(): Promise<Order[]> {
    return new Promise((resolve, reject) => {
      const cardIndex = 0;
      const url = this.baseurl + '/registered/index/?cardIndex=' + cardIndex;

      this.getRequest(url, (error, data) => {
        if (error) {
          return reject(error);
        }

        return resolve(util.parseOrders(data));
      });
    });
  }

  /**
   * Get an Opal cards transactions
   */
  getTransactions(options: TransactionRequestOptions): Promise<Transaction[]> {
    const getOptions: PrivateTransactionReqOpts = {
      month: util.mapMonthsToZeroBased(options.month),
      year: options.year || -1,
      cardIndex: options.cardIndex,
      pageIndex: options.pageIndex || null,
      ts: Math.floor(new Date().getTime() / 1000),
    };

    if (!options.pageIndex) {
      return new Promise(resolve => {
        this.getTransactionsAll(getOptions, (error, data) => {
          // Not rejecting on error because we expect the function
          // to end with an error at some point when it arrives at
          // a non-existing pageIndex
          return resolve(data);
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        this.getTransactionsSinglePage(getOptions, (error, data) => {
          if (error) {
            return reject(error);
          }

          return resolve(data);
        });
      });
    }
  }
}

export default Opaler;
