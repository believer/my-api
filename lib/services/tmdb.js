'use strict';

var Q       = require('q');
var request = require('request');

var tmdbKey = process.env.TMDB_KEY;
var tmdbBaseUrl = 'http://api.themoviedb.org/3/movie/';

exports.movieBasic = function (id) {
  var tmdb_url = tmdbBaseUrl + '{query}?api_key={key}';
  var deferred = Q.defer();
  var url      = tmdb_url.replace('{query}', id).replace('{key}',tmdbKey);

  request({ uri: url, headers: {'Accept': 'application/json'} }, function (err, response, body) {
    body = JSON.parse(body);
    deferred.resolve(body);
  });

  return deferred.promise;
};

exports.movieCast = function (id) {
  var tmdb_url = tmdbBaseUrl + '{query}/casts?api_key={key}';
  var deferred = Q.defer();
  var url      = tmdb_url.replace('{query}', id).replace('{key}',tmdbKey);

  request({ uri: url, headers: {'Accept': 'application/json'} }, function (err, response, body) {
    body = JSON.parse(body);
    deferred.resolve(body);
  });

  return deferred.promise;
}

exports.get = function (id) {
  var deferred = Q.defer();

  exports.movieBasic(id)
    .then(function (movie) {
      exports.movieCast(id)
        .then(function (result) {
          movie.cast = result.cast;
          movie.crew = result.crew;

          deferred.resolve(movie);
        });
    })
    .catch(function (error) {
      return next(error);
    });

  return deferred.promise;
};