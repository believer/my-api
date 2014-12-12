'use strict';

var Q       = require('q');
var request = require('request');

/**
 * Prepare request URL
 * Should call with iteam1337 if no user name is provided
 * 
 * @param  {obj} body - Request body from POST
 * @return {string} - URL for Last.fm request
 */
exports.prepareUrl = function (body) {
  var user = body.text.split(':')[1] ? body.text.split(':')[1].trim().split(' ')[0] : 'iteam1337';
  var key = process.env.LASTFM_KEY;
  var url = 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user={user}&api_key={key}&format=json&limit=1';
  
  return url.replace('{user}',user).replace('{key}',key);
};

/**
 * Prepare response object
 * @param  {string} body - Last.fm API data
 * @return {obj} - Response object prepared for Slack
 */
exports.prepareResponse = function (body) {
  var lastfm = JSON.parse(body);

  if (lastfm.error) {
    return {
      'text': lastfm.message
    }
  }

  if (!lastfm.recenttracks.track) {
    return {
      'text': 'Nothing playing (_' + lastfm.recenttracks.user + '_)'
    }
  }

  var track  = lastfm.recenttracks.track[0] || lastfm.recenttracks.track;
  var user   = lastfm.recenttracks["@attr"].user;

  var sendUser = (user !== 'iteam1337') ? ' (_' + user + '_)' : '';

  return {
    'text': track.artist['#text'] + ' - ' + track.name + sendUser,
  };
};

/**
 * Send a request to the Last.fm API with the user name given
 * in the Slack POST
 * @param  {[type]} req [description]
 * @return {promise} - A promise
 */
exports.get = function (req) {
  // Respond with empty if np contains a URL
  if (req.body.text.indexOf('http://') > -1) {
    return { text: '' };    
  }

  var url = exports.prepareUrl(req.body);
  var deferred = Q.defer();

  request(url, function (err, response, body) {
    var obj = exports.prepareResponse(body);
    deferred.resolve(obj);
  });

  return deferred.promise;
};
