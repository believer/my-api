'use strict';

var Q       = require('q');
var request = require('request');
var mdb     = require('moviedb')(process.env.TMDB_KEY);

/**
 * Get basic information about a movie
 * @param  {string} id - IMDb ID of movie
 * @return {promise} - Promise
 */
exports.movieBasic = function (id) {
  var deferred = Q.defer();

  mdb.movieInfo({id: id}, function (error, response) {
    deferred.resolve(response);
  });

  return deferred.promise;
};

/**
 * Get cast and crew of a movie
 * @param  {string} id - IMDb ID of movie
 * @return {promise} - Promise
 */
exports.movieCast = function (id) {
  var deferred = Q.defer();
 
  mdb.movieCredits({id: id}, function (error, response) {
    deferred.resolve(response);
  });

  return deferred.promise;
};

/**
 * Combine basic information with cast/crew information and return to route
 * @param  {string} id - IMDb ID of movie
 * @return {promise} - Promise
 */
exports.get = function (id) {
  var deferred = Q.defer();

  exports.movieBasic(id)
    .then(function (movie) {
      if (!movie) { console.log(id); }

      exports.movieCast(id)
        .then(function (result) {
          if (!result) { console.log(id); }

          movie.cast = result.cast;
          movie.crew = result.crew;

          deferred.resolve(movie);
        })
        .catch(function (error) {
          return next(error);
        });
    })
    .catch(function (error) {
      return next(error);
    });

  return deferred.promise;
};