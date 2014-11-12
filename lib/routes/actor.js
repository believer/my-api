'use strict';

var actorService = require('../services/actor');

/**
 * Find an actor by name
 * @param  {obj} req
 * @param  {obj} res
 */
var actor = function (req, res, next) {
  var name = req.query.name;

  actorService.get(req)
    .then(function (results) {
      res.send({ movies:results, actor:name });
    })
    .catch(function (error) {
      return next(error);
    });
}

module.exports = actor;