'use strict';

var personService = require('../services/person');

/**
 * Find an actor by name
 * @param  {obj} req
 * @param  {obj} res
 */
var person = function (req, res, next) {
  var name = req.query.name;

  personService.get(req)
    .then(function (results) {
      res.send({ movies: results, name: name });
    })
    .catch(function (error) {
      return next(error);
    });
}

module.exports = person;