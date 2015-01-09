'use strict';

var Q       = require('q');
var request = require('request');

// Setup DB
var databaseUrl = process.env.MONGO_NP_URL;
var collection  = process.env.MONGO_COLLECTION;
var collections = ['nowplaying'];
var db = require('mongojs').connect(databaseUrl, collections);

/**
 * Prepare request URL
 * Should call with iteam1337 if no user name is provided
 * 
 * @param  {obj} body - Request body from POST
 * @return {string} - URL for Last.fm request
 */
exports.prepareUrl = function (body) {
  if (body.user) {
    var user = body.user;
  } else if (body.text) {
    var user = body.text.split(':')[1] ? body.text.split(':')[1].trim().split(' ')[0] : 'iteam1337';
  }

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
 * [saveUserConfig description]
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
exports.saveUserConfig = function (body) {
  var user = {
    id: body.user_id,
    name: body.text.substr(body.text.indexOf(':') + 5)
  };

  return user;
};

exports.spotifyUrl = function (body) {
  var deferred = Q.defer();
  var lastfm = JSON.parse(body);

  var track  = lastfm.recenttracks.track[0] || lastfm.recenttracks.track;
  var url = 'https://ws.spotify.com/search/1/track.json?q={artist}+{track}';
  url = url.replace('{artist}', track.artist['#text']).replace('{track}', track.name);

  request(url, function (err, lastfm, body) {
    body = JSON.parse(body);

    var firstTrack = body.tracks[0];

    if (firstTrack) {
      var uri = firstTrack.href.substr(firstTrack.href.lastIndexOf(':') + 1);

      deferred.resolve({
        url: 'http://open.spotify.com/track/' + uri
      });
    } else {
      deferred.resolve({
        url: ''
      });
    }
  });

  return deferred.promise;
};

// http://open.spotify.com/track/0KKzqjqQrqSdbdmBFSRtI0

/**
 * Send a request to the Last.fm API with the user name given
 * in the Slack POST
 * @param  {[type]} req [description]¥
 * @return {promise} - A promise
 */
exports.get = function (req) {
  var deferred = Q.defer();

  var text = req.body.text;
  var id = req.body.user_id;

  // Respond with empty if np contains a URL
  if (text.indexOf('http://') > -1) {
    return { text: '' };    
  }

  // Save username
  if (text.indexOf('config') > -1) {
    var command = text.match(/:\D*\s/)[0].substr(1).trim();

    if (command === 'set') {
      var user = exports.saveUserConfig(req.body);

      db.nowplaying.save(user, function (err, response) {
        if (!err) {
          deferred.resolve({
            text: 'User ' + user.name + ' added'
          });
        }
      });

    } else if (command === 'spotify') {
      var spotifyCommand = text.substr(text.indexOf(':') + 9);

      var hasSpotify = spotifyCommand === 'true' || spotifyCommand === 1 ? true : false;

      db.nowplaying.update({ id:id }, {$set: { spotify: hasSpotify} }, function (err, response) {
        if (!err) {
          var spotifyText = hasSpotify ? 'activated' : 'disabled';
          deferred.resolve({
            text: 'User spotify ' + spotifyText
          });
        }
      });      
    } else {
      deferred.resolve({
        text: 'Unknown command'
      });
    }
  
    return deferred.promise;
  } else {
    db.nowplaying.find({id: req.body.user_id}, function (err, response) {
      if (err) { throw Error('Error'); }

      if (response.length) {
        var url = exports.prepareUrl({
          text: req.body.text,
          user: response[0].name
        });
      } else {
        var url = exports.prepareUrl(req.body);   
      }

      request(url, function (err, lastfm, body) {
        var obj = exports.prepareResponse(body);

        if (response[0] && response[0].spotify) {
          exports
            .spotifyUrl(body)
            .then(function (data) {
              if (data) {
                obj.text = obj.text + '\n' + data.url  + '';
              }

              deferred.resolve(obj);
            })
            .catch(function (error) {
              return next(error);
            });
        } else {
          deferred.resolve(obj);
        }
      });     
    });

    return deferred.promise;
  }
};
