'use strict';

var Promise = require('bluebird');
var request = require('request');
var cheerio = require('cheerio');

/**
 * Convert scraped HTML to text and break up into an array if it contains <br>
 * 
 * @param  {String}       string
 * @return {Array|String}        
 */
function parseScrapedText (string) {
  var result = string.split('<br>');
  result.forEach(function (value, index) {
    var $ = cheerio.load('<p>' + value + '</p>');
    result[index] = $('p').text();
  });
  return result.length === 1 ? result.join('') : result.filter(Boolean);
}

/**
 * Camelcaseify a given string and remove all non alphabetical characters
 * 
 * @param  {String} string
 * @return {String}        Camelcasified string
 */
function camelCaseify (string) {
  return string
         .toLowerCase()
         .replace(/[^a-z ]/g, '')
         .replace(/( [a-z])/g, function (a) {
           return a.toUpperCase().substr(1);
         });
}

/**
 * Convert currency strings into integers
 * $80.00 will become 8000
 *
 * @param  {String} dollar
 * @return {Number}
 */
function dollarToInt (dollar) {
  if (!dollar) {
    return 0;
  }
  var array = dollar.match(/^(-|\+)?[^\d]?(\d{1,2}\.\d{1,2})/);
  if (!array) {
    return '';
  }
  var sign = array[1] || '';
  var value = array[2];
  return Math.round(parseFloat(sign + value) * 100);
}

/**
 * Parse transaction date to unix timestamp
 *
 * @param  {String} string Date string
 * @return {Number}        Unix timestamp
 */
function parseTransactionDate (string) {
  var regex       = /^.*?(\d{2})\/(\d{2})\/(\d{4}).*?(\d{2}):(\d{2}).*?$/,
      replacement = '$3-$2-$1 $4:$5',
      date        = new Date(string.replace(regex, replacement));
  return Math.floor(date.getTime() / 1000);
}

/**
 * Parse orders date to unix timestamp
 *
 * @param  {String} string Date string
 * @return {Number}        Unix timestamp
 */
function parseOrdersDate (string) {
  var regex       = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      replacement = '$3-$2-$1',
      date        = new Date(string.replace(regex, replacement));
  return Math.floor(date.getTime() / 1000);
}

/**
 * Parse transaction mode (ferry, bus, train) from the info tables image tag
 *
 * @param  {String} string HTML img tag
 * @return {String}        Transaction mode
 */
function parseTransactionMode (string) {
  var mode = string.match(/alt="(.*?)"/);
  if (mode) {
    return mode[1];
  }
  return '';
}

/**
 * Parse cardinfo array and convert currency strings to numbers
 *
 * @param  {array}      cardInfo
 * @return {array|bool}           Returns false when cardInfo isn't JSON
 */
function parseCardInfo (cardInfo) {
  try {
    cardInfo = JSON.parse(cardInfo);
  } catch (e) {
    return false;
  }
  cardInfo.forEach(function (element, index, array) {
    var e = element;
    e.cardIndex          = index;
    e.cardBalance        = dollarToInt(e.cardBalanceInDollars);
    e.currentCardBalance = dollarToInt(e.currentCardBalanceInDollars);
    e.svPending          = dollarToInt(e.svPendingInDollars);
    delete e.cardBalanceInDollars;
    delete e.currentCardBalanceInDollars;
    delete e.svPendingInDollars;
  });
  return cardInfo;
}

/**
 * Parse card transaction HTML table to return an data object
 *
 * @param  {String} html HTML of transaction info table
 * @return {Object}      Result object
 */
function parseTransactions (html) {
  var $    = cheerio.load(html);
  var data = [];

  var noData = $('.no-activity-list').text();
  if (noData !== '') {
    return noData;
  }

  $('#transaction-data tbody tr').each(function () {
    var cells = [], journeyData;
    $(this).find('td').each(function () {
      cells.push($(this).html());
    });
    var dataJson = {
      transactionNumber: cells[0],
      timestamp: parseTransactionDate(cells[1]),
      date: new Date(parseTransactionDate(cells[1]) * 1000),
      summary: cells[3] || null,
      mode: parseTransactionMode(cells[2]) || null,
      fare: {
        applied: cells[5] || null,
        price: Math.abs(dollarToInt(cells[6])) || 0,
        discount: Math.abs(dollarToInt(cells[7])) || 0,
        paid: Math.abs(dollarToInt(cells[8])) || 0
      },
      journey: null
    };
    if (/^(ferry|bus|train)$/.test(dataJson.mode)) {
      journeyData = dataJson.summary.split(' to ');
      if (journeyData.length === 2) {
        dataJson.journey = {
          number: parseInt(cells[4], 10) || null,
          start: journeyData[0],
          end: journeyData[1]
        };
      }
    }
    data.push(dataJson);
  });
  return data;
}

/**
 * ParseAccountDetails description
 *
 * @param  {string} html
 * @return {object}
 */
function parseAccountDetails (html) {
  var $    = cheerio.load(html);
  var result = {};
  $('#content #tab-5 .column tbody tr').each(function () {
    var cells = [];
    $(this).find('td').each(function () {
      cells.push($(this).html());
    });
    result[camelCaseify(cells[0])] = parseScrapedText(cells[1]);
  });
  return result;
}

/**
 * ParseOrdersDetails description
 *
 * @param  {string} html
 * @return {object}
 */
function parseOrdersDetails (html) {
  var $    = cheerio.load(html);
  var data = [];
  $('#content #tab-5 #transaction-data tbody tr').each(function () {
    var cells = [];
    $(this).find('td').each(function () {
      cells.push($(this).html());
    });
    data.push({
      orderId: cells[0],
      orderDate: new Date(parseOrdersDate(cells[1]) * 1000),
      orderDateTimestamp: parseOrdersDate(cells[1]),
      cardType: cells[2],
      orderStatus: cells[3]
    });
  });
  return data;
}

/**
 * Fetch transaction data from opal.com.au for a specific pagination index
 * 
 * @param  {Opaler}   opaler
 * @param  {Object}   options
 * @param  {Function} cb
 */
function getTransactionPageSingle (opaler, options, cb) {
  var reqObj = {
    url: [
      opaler.baseurl,
      '/registered/opal-card-activities-list?',
      [
        'AMonth=' + (options.month - 1), // 0 = January
        'AYear=' + options.year,
        'cardIndex=' + options.cardIndex,
        'pageIndex=' + options.pageIndex,
        '_=' + options.ts,
      ].join('&')
    ].join('')
  };

  opaler.getRequest(reqObj, function (err, data) {
    if (err) {
      return cb(err);
    } else {
      data = parseTransactions(data);
      if (typeof data === 'string') {
        return cb(new Error(data));
      }
      return cb(null, data);
    }
  });
}

/**
 * Walk through all transaction pages on opal.com.au and call 
 * `getTransactionPageSingle` to fetch the data for every pagination index
 * 
 * @param  {Opaler}   opaler
 * @param  {Object}   options
 * @param  {Function} cb
 */
function getTransactionPageAll (opaler, options, cb) {
  var transactions = [];
  options.pageIndex = 1;
  function loop() {
    getTransactionPageSingle(opaler, options, function (err, result) {
      if (err) {
        return cb(err, transactions);
      }
      transactions = transactions.concat(result);
      options.pageIndex += 1;
      loop();
    });
  }
  loop();
}

/**
 * Check if pathname starts with /login to determinate if the url request
 * redirected to the login page and thus needs authorization
 *
 * @param  {string} pathname
 * @return {bool}
 */
function authorizationNeeded (pathname) {
  if (/^\/login/.test(pathname)) {
    return true;
  }
  return false;
}

var Opaler = module.exports = function Opaler (username, password) {
  this.username = username;
  this.password = password;
  this.cookie   = request.jar();
  this.baseurl  = 'https://www.opal.com.au';
};

/**
 * Authorize via login post against opal website
 *
 * @param  {function} cb callback
 */
Opaler.prototype.authorize = function authorize (cb) {
  var params, url;

  params = {
    form: {
      h_username: this.username,
      h_password: this.password,
      submit: 'Log in',
      attempt: ''
    },
    jar: this.cookie
  };
  url = this.baseurl + '/login/registeredUserUsernameAndPasswordLogin';
  request.post(url, params, function (err, httpResponse, body) {
    if (err) {
      return cb({err: err});
    }
    return cb(null, body);
  }.bind(this));
};

/**
 * Get request wrapper for requests against opal website
 *
 * @param  {object}   reqObj {url: '', param: {}}
 * @param  {function} cb     callback
 */
Opaler.prototype.getRequest = function getRequest (reqObj, cb) {
  var url, param;

  url       = reqObj.url;
  param     = reqObj.param || {};
  param.jar = this.cookie;

  request.get(url, param, function (err, res) {
    if (err) {
      return cb(err);
    } else if (authorizationNeeded(res.request.uri.pathname)) {
      this.authorize(function (err, res) {
        var json = JSON.parse(res);
        if (json.errorMessage) {
          return cb(new Error(json.errorMessage));
        } else {
          this.getRequest(reqObj, cb);
        }
      }.bind(this));
    } else {
      return cb(null, res.body);
    }
  }.bind(this));
};

/**
 * Get opal card information as JSON
 *
 * @param  {function} cb callback
 */
Opaler.prototype.getCards = function (cb) {
  return new Promise(function (resolve, reject) {
    var ts, reqObj;
    ts = Math.floor(new Date().getTime() / 1000);

    reqObj   = {
      url: this.baseurl + '/registered/getJsonCardDetailsArray?_=' + ts
    };

    this.getRequest(reqObj, function (err, data) {
      if (err) {
        return reject(err);
      } else {
        data = parseCardInfo(data);
        if (!data) {
          return reject(new Error('Cardinfo - No valid JSON'));
        }
        return resolve(data);
      }
    });
  }.bind(this)).nodeify(cb);
};

/**
 * Fetch user details from website
 *
 * @param  {function} cb callback
 */
Opaler.prototype.getAccount = function (cb) {
  return new Promise(function (resolve, reject) {
    var cardIndex, reqObj;

    cardIndex = 0;
    reqObj    = {
      url: this.baseurl + '/registered/my-details/?cardIndex=' + cardIndex
    };

    this.getRequest(reqObj, function (err, data) {
      if (err) {
        return reject(err);
      } else {
        data = parseAccountDetails(data);
        return resolve(data);
      }
    });
  }.bind(this)).nodeify(cb);
};

/**
 * Fetch orders details from website
 *
 * @param  {function} cb callback
 */
Opaler.prototype.getOrders = function (cb) {
  return new Promise(function (resolve, reject) {
    var cardIndex, reqObj;

    cardIndex = 0;
    reqObj    = {
      url: this.baseurl + '/registered/index/?cardIndex=' + cardIndex
    };

    this.getRequest(reqObj, function (err, data) {
      if (err) {
        return reject(err);
      } else {
        data = parseOrdersDetails(data);
        return resolve(data);
      }
    });
  }.bind(this)).nodeify(cb);
};

/**
 * Fetch transaction data from website
 *
 * @param  {Object}   options {
 *                              month: Number,
 *                              year: Number,
 *                              cardIndex: Number,
 *                              pageIndex: Number
 *                             }
 * @param  {function} cb       callback
 */
Opaler.prototype.getTransactions = function (options, cb) {
  options = options || {};

  options.month     = options.month || -1;
  options.year      = options.year || -1;
  options.cardIndex = options.cardIndex || 0;
  options.pageIndex = options.pageIndex || null;
  options.ts        = Math.floor(new Date().getTime() / 1000);

  if (!options.pageIndex) {
    return new Promise(function (resolve, reject) {
      getTransactionPageAll(this, options, function (err, data) {
        // Not rejecting on error because we expect the function
        // to end with an error at some point when it arrives at a non-existing
        // pageIndex
        return resolve(data);
      });
    }.bind(this));
  } else {
    return new Promise(function (resolve, reject) {
      getTransactionPageSingle(this, options, function (err, data) {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    }.bind(this));
  }
};
