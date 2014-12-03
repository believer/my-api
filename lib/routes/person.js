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
      var send = {
        movies: results,
        results: results.length,
        name: name
      };

      // Calculate average rating for person with two decimal precision
      var average = 0;
      var length = results.length;

      results.forEach(function (movie) {
        if (!movie.rating) { length--; }
        average += parseInt(movie.rating, 10) || 0;
      });

      send.averageRating = (average / length).toFixed(2) / 1;

      // Send results
      res.send(send);
    })
    .catch(function (error) {
      return next(error);
    });
}

module.exports = person;