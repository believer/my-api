'use strict';

var Q       = require('q');
var request = require('request');

var tmdbKey = process.env.TMDB_KEY;
var tmdbBaseUrl = 'http://api.themoviedb.org/3/movie/';

/**
 * Get basic information about a movie
 * @param  {string} id - IMDb ID of movie
 * @return {promise} - Promise
 */
exports.movieBasic = function (id) {
  var tmdb_url = tmdbBaseUrl + '{query}?api_key={key}';
  var deferred = Q.defer();
  var url      = tmdb_url.replace('{query}', id).replace('{key}',tmdbKey);

  request({ uri: url, headers: {'Accept': 'application/json'} }, function (err, response, body) {
    if (err || !body) { console.log(id); }
    body = JSON.parse(body);
    deferred.resolve(body);
  });

  return deferred.promise;
};

/**
 * Get cast and crew of a movie
 * @param  {string} id - IMDb ID of movie
 * @return {promise} - Promise
 */
exports.movieCast = function (id) {
  var tmdb_url = tmdbBaseUrl + '{query}/casts?api_key={key}';
  var deferred = Q.defer();
  var url      = tmdb_url.replace('{query}', id).replace('{key}',tmdbKey);

  request({ uri: url, headers: {'Accept': 'application/json'} }, function (err, response, body) {
    if (err || !body) { console.log(id); }
    body = JSON.parse(body);
    deferred.resolve(body);
  });

  return deferred.promise;
}

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