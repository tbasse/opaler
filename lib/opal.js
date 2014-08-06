'use strict';

var Q       = require('q'),
    request = require('request'),
    cheerio = require('cheerio');

/**
 * Convert currency strings into integers
 * $80.00 will become 8000
 * 
 * @param  {String} dollar
 * @return {Number}
 */
function dollarToInt (dollar) {
  if (! dollar) {
    return 0;
  }
  var array = dollar.match(/^(-|\+)?[^\d]?(\d{1,2}\.\d{1,2})/);
  if (! array) {
    return '';
  }
  var sign = array[1] || '';
  var value = array[2];
  return parseFloat(sign + value) * 100;
}

/**
 * Parse transaction date to unix timestamp
 * 
 * @param  {String} string Date string
 * @return {Number}        Unix timestamp
 */
function parseTransactionDate (string) {
  var array = string.split('<br>');
  var date = array[1].split('/');
  date = date[2] + '-' + date[1] + '-' + date[0];
  var time = array[2];
  return Math.floor(new Date(date + ' ' + time).getTime() / 1000);
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
  } catch(e) {
    return false;
  }
  cardInfo.forEach(function (element, index, array) {
    var e = element;
    e.cardBalanceInDollars        = dollarToInt(e.cardBalanceInDollars);
    e.currentCardBalanceInDollars = dollarToInt(e.currentCardBalanceInDollars);
    e.svPendingInDollars          = dollarToInt(e.svPendingInDollars);
  });
  return cardInfo;
}

/**
 * Parse card transaction HTML table to return an data object
 * 
 * @param  {String} html HTML of transaction info table
 * @return {Object}      Result object
 */
function parseCardTransactions (html) {
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
          number: cells[4] || null,
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
 * [parseUserDetails description]
 * 
 * @param  {[type]} html [description]
 * @return {[type]}      [description]
 */
function parseUserDetails (html) {
  var $    = cheerio.load(html);
  var data = [];
  $('#content #tab-5 .column tbody tr').each(function () {
    var cells = [];
    $(this).find('td').each(function () {
      cells.push($(this).html());
    });
    data.push(cells[1]);
  });
  return {
    firstName: data[0],
    lastName: data[1],
    address: data[2].split('<br>').slice(0, -1),
    birthDate: data[3],
    phoneNumber: data[4],
    mobileNumber: data[5],
    emailAddress: data[6]
  };
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

var Opal = module.exports = function Opal (username, password) {
  var self = this;
  self.username = username;
  self.password = password;
  self.cookie   = request.jar();
  self.baseurl  = 'https://www.opal.com.au';
};

/**
 * Authorize via login post against opal website
 * 
 * @param  {Function} cb callback
 */
Opal.prototype.opalAuthorize = function opalAuthorize (cb) {
  var self, params, url;

  self   = this;
  params = {
    form: {
      h_username: self.username,
      h_password: self.password,
      submit: 'Log in',
      attempt: ''
    },
    jar: self.cookie
  };
  url = self.baseurl + '/login/registeredUserUsernameAndPasswordLogin';
  request.post(url, params, function (err, httpResponse, body) {
    if (err) {
      return cb({err: err});
    }
    return cb(null, body);
  });
};

/**
 * Get request wrapper for requests against opal website
 * 
 * @param  {object}   reqObj {url: '', param: {}}
 * @param  {Function} cb     callback
 */
Opal.prototype.getRequest = function getRequest (reqObj, cb) {
  var self, url, param;
  
  self      = this;
  url       = reqObj.url;
  param     = reqObj.param || {};
  param.jar = self.cookie;

  request.get(url, param, function (err, res) {
    if (err) {
      return cb(err);
    } else if (authorizationNeeded(res.request.uri.pathname)) {
      self.opalAuthorize(function (err, res) {
        var json = JSON.parse(res);
        if (json.errorMessage) {
          return cb(new Error(json.errorMessage));
        } else {
          self.getRequest(reqObj, cb);
        }
      });
    } else {
      return cb(null, res.body);
    }
  });
};

/**
 * Get opal card information as JSON
 * 
 * @param  {Function} cb callback
 */
Opal.prototype.getCardInfo = function (cb) {
  var self,
      deferred,
      ts,
      reqObj;

  self     = this;
  deferred = Q.defer();
  ts       = Math.floor(new Date().getTime() / 1000);
  reqObj   = {
    url: self.baseurl + '/registered/getJsonCardDetailsArray?_=' + ts
  };

  self.getRequest(reqObj, function (err, data) {
    if (err) {
      if (cb) {
        return cb(err);
      } else {
        return deferred.reject(err);
      }
    } else {
      data = parseCardInfo(data);
      if (! data) {
        if (cb) {
          return cb(new Error('Cardinfo - No valid JSON'));
        } else {
          return deferred.reject(new Error('Cardinfo - No valid JSON'));
        }
      }
      if (cb) {
        return cb(null, data);
      } else {
        return deferred.resolve(data);
      }
    }
  });
  if (! cb) {
    return deferred.promise;
  }
};

/**
 * [getUserDetails description]
 * 
 * @param  {Function} cb [description]
 * @return {[type]}      [description]
 */
Opal.prototype.getUserDetails = function (cb) {
  var self,
      deferred,
      cardIndex,
      reqObj;

  self      = this;
  deferred  = Q.defer();
  cardIndex = 0;
  reqObj    = {
    url: self.baseurl + '/registered/my-details/?cardIndex=' + cardIndex
  };

  self.getRequest(reqObj, function (err, data) {
    if (err) {
      if (cb) {
        return cb(err);
      } else {
        return deferred.reject(err);
      }
    } else {
      data = parseUserDetails(data);
      if (cb) {
        return cb(null, data);
      } else {
        return deferred.resolve(data);
      }
    }
  });
  if (! cb) {
    return deferred.promise;
  }
};

/**
 * [getCardTransaction description]
 *
 * @param  {Object}   options {
 *                              month: Number,
 *                              year: Number,
 *                              cardIndex: Number,
 *                              pageIndex: Number
 *                             }
 * @param  {Function} cb       callback
 */
Opal.prototype.getCardTransactions = function (options, cb) {
  var self,
      deferred,
      month,
      year,
      cardIndex,
      pageIndex,
      ts,
      reqObj;
  
  self     = this;
  deferred = Q.defer();

  options = options || {};
  if (typeof options === 'function') {
    cb      = options;
    options = {};
  }

  month     = options.month || -1;
  year      = options.year || -1;
  cardIndex = options.cardIndex || 0;
  pageIndex = options.pageIndex || 1;
  ts        = Math.floor(new Date().getTime() / 1000);

  reqObj = {
    url: [
      self.baseurl,
      '/registered/opal-card-activities-list?',
      [
        'AMonth=' + (month - 1), // 0 = January
        'AYear=' + year,
        'cardIndex=' + cardIndex,
        'pageIndex=' + pageIndex,
        '_=' + ts,
      ].join('&')
    ].join('')
  };

  self.getRequest(reqObj, function (err, data) {
    if (err) {
      if (cb) {
        return cb(err);
      } else {
        return deferred.reject(err);
      }
    } else {
      data = parseCardTransactions(data);
      if (cb) {
        if (typeof data === 'string') {
          return cb(new Error(data));
        }
        return cb(null, data);
      } else {
        if (typeof data === 'string') {
          return deferred.reject(new Error(data));
        }
        return deferred.resolve(data);
      }
    }
  });
  if (! cb) {
    return deferred.promise;
  }
};
