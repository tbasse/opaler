'use strict';

var request = require('request');

/**
 * Convert currency strings into integers
 * $80.00 will become 8000
 * 
 * @param  {string} dollar
 * @return {number}
 */
function dollarToInt(dollar) {
  return dollar.match(/\d+\.\d+/)[0] * 100;
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
