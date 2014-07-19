'use strict';

var request = require('request');
var cheerio = require('cheerio');

/**
 * Convert currency strings into integers
 * $80.00 will become 8000
 * 
 * @param  {string} dollar
 * @return {number}
 */
function dollarToInt(dollar) {
  if (! dollar) {
    return dollar;
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
 * [parseTransactionDate description]
 * 
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
function parseTransactionDate(string) {
  var array = string.split('<br>');
  var date = array[1].split('/');
  date = date[2] + '-' + date[1] + '-' + date[0];
  var time = array[2];
  return Math.floor(new Date(date + ' ' + time).getTime() / 1000);
}

/**
 * [parseTransactionMode description]
 * 
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
function parseTransactionMode(string) {
  var mode = string.match(/alt="(.*?)"/);
  if (mode) {
    return mode[1];
  }
  return '';
}

/**
 * Parse cardinfo array and convert currency strings to numbers
 * 
 * @param  {array} cardInfo
 * @return {array|bool}       Returns false when cardInfo isn't JSON
 */
function parseCardInfo(cardInfo) {
  try {
    cardInfo = JSON.parse(cardInfo);
  } catch(e) {
    return false;
  }
  cardInfo.forEach(function (element, index, array) {
    var e = element;
    e.cardBalanceInDollars = dollarToInt(e.cardBalanceInDollars);
    e.currentCardBalanceInDollars = dollarToInt(e.currentCardBalanceInDollars);
    e.svPendingInDollars = dollarToInt(e.svPendingInDollars);
  });
  return cardInfo;
}

/**
 * [parseCardTransactions description]
 * 
 * @param  {[type]} html [description]
 * @return {[type]}      [description]
 */
function parseCardTransactions(html) {
  var $    = cheerio.load(html);
  var data = [];
  $('#transaction-data tbody tr').each(function () {
    var cells = [];
    $(this).find('td').each(function () {
      cells.push($(this).html());
    });
    data.push({
      itemNumber: cells[0],
      timestamp: parseTransactionDate(cells[1]),
      mode: parseTransactionMode(cells[2]),
      summary: cells[3],
      unkown: cells[4],
      unkown2: cells[5],
      cost: dollarToInt(cells[6]),
      moneysomething: dollarToInt(cells[7]),
      balance: dollarToInt(cells[8])
    });
  });
  return data;
}

/**
 * Check if pathname starts with /login to determinate if the url request
 * redirected to the login page and thus needs authorization
 * 
 * @param  {string} pathname
 * @return {bool}
 */
function authorizationNeeded(pathname) {
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
  self.baseurl = 'https://www.opal.com.au';
};

/**
 * Turn on developer mode and use fake dev server
 * 
 */
Opal.prototype.turnOnDevMode = function() {
  var self = this;
  self.username = 'username';
  self.password = 'fail';
  self.baseurl = 'http://127.0.0.1:8181';
};

/**
 * Authorize via login post against opal website
 * 
 * @param  {Function} cb callback
 */
Opal.prototype.opalAuthorize = function opalAuthorize (cb) {
  var self, params, url;
  self      = this;
  // Set form values
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
Opal.prototype.opalGetRequest = function opalGetRequest (reqObj, cb) {
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
        console.log(json);
        if (json.errorMessage) {
          return cb(new Error(json.errorMessage));
        } else {
          self.opalGetRequest(reqObj, cb);
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
Opal.prototype.getCardInfo = function(cb) {
  var self = this;
  var ts   = Math.floor(new Date().getTime() / 1000);
  var reqObj = {
    url: self.baseurl + '/registered/getJsonCardDetailsArray?_=' + ts
  };

  self.opalGetRequest(reqObj, function (err, data) {
    if (err) {
      // console.log(err);
      cb(err);
    } else {
      data = parseCardInfo(data);
      if (! data) {
        return cb(new Error('Cardinfo - No valid JSON'));
      }
      cb(null, data);
    }
  });
};

/**
 * [getCardTransaction description]
 * 
 * @param  {Function} cb callback
 */
Opal.prototype.getCardTransactions = function(cb) {
  var self = this;

  var reqObj = {
    url: self.baseurl + '/registered/opal-card-transactions/'
  };

  self.opalGetRequest(reqObj, function (err, data) {
    if (err) {
      // console.log(err);
      cb(err);
    } else {
      data = parseCardTransactions(data);
      cb(null, data);
    }
  });
};
