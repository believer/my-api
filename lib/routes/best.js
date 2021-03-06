'use strict';

var bestFromYearService = require('../services/best');

/**
 * Get movies from Db
 *
 * Query params
 * ------------------
 * @param {int} skip - Jump any number of movies from latest (default: 0)
 * @param {int} limit - Limit search to # number of movies (default: 50)
 */
var best = function (req, res, next) {
  bestFromYearService.get(req)
    .then(function (result) {
      res.send(result);
    })
    .catch(function (error) {
      return next(error);
    });
}

module.exports = best;