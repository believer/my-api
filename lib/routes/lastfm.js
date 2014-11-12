'use strict';

var lastfmService = require('../services/lastfm');

/**
 * Last.fm now playing
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var lastfm = function (req, res, next) {
  lastfmService.get(req)
    .then(function (result) {
      res.send(result);
    })
    .catch(function (error) {
      return next(error);
    });
}

module.exports = lastfm;