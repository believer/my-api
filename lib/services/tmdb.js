'use strict';

var request = require('request');
var mdb     = require('moviedb')(process.env.TMDB_KEY);

/**
 * Get basic information about a movie
 * @param  {string} id - IMDb ID of movie
 * @return {promise} - Promise
 */
exports.movieBasic = function (id) {
  return new Promise(function (resolve, reject) {
    mdb.movieInfo({id: id}, function (error, response) {
      resolve(response);
    });
  });
};

/**
 * Get cast and crew of a movie
 * @param  {string} id - IMDb ID of movie
 * @return {promise} - Promise
 */
exports.movieCast = function (id) {
  return new Promise(function (resolve, reject) {
    mdb.movieCredits({id: id}, function (error, response) {
      resolve(response);
    });
  });
};

/**
 * Combine basic information with cast/crew information and return to route
 * @param  {string} id - IMDb ID of movie
 * @return {promise} - Promise
 */
exports.get = function (id) {
  return new Promise(function (resolve, reject) {
    exports.movieBasic(id)
      .then(function (movie) {
        if (!movie) { console.log(id); }

        exports.movieCast(id)
          .then(function (result) {
            if (!result) { console.log(id); }

            movie.cast = result.cast;
            movie.crew = result.crew;

            resolve(movie);
          })
          .catch(function (error) {
            return reject(error);
          });
      })
      .catch(function (error) {
        return reject(error);
      });
  });
};