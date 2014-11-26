'use strict';

/**
 * Get movies from Db
 *
 * Query params
 * ------------------
 * @param {int} skip - Jump any number of movies from latest (default: 0)
 * @param {int} limit - Limit search to # number of movies (default: 50)
 */
var np = function (req, res, next) {
  res.render('nowplaying');
}

module.exports = np;