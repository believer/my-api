'use strict';

var statsService = require('../services/stats');

/**
 * Get stats from Db
 *
 * Query params
 * ------------------
 * @param {int} skip - Jump any number of movies from latest (default: 0)
 * @param {int} limit - Limit search to # number of movies (default: 50)
 */
var stats = function (req, res, next) {
  statsService.get(req)
    .then(function (result) {
      res.send(result);
    })
    .catch(function (error) {
      return next(error);
    });
}

module.exports = stats;