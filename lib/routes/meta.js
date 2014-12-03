'use strict';

var tmdbService = require('../services/tmdb');
var movee = require('../utils/movee');
var request = require('request');

var BASE_URL = process.env.BASE_URL;

var databaseUrl = process.env.MONGO_URL;
var collections = ["movies", "newmovies"]
var db = require("mongojs").connect(databaseUrl, collections);

/**
 * Get cast and crew from TMDb
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var tmdb = function (req, res, next) {
  request(BASE_URL + '/movies?limit=2000', function (err, data, body) {
    body = JSON.parse(body);

    body.results.forEach(function (movie) {
      var id = movie.imdbid;

      tmdbService.get(id)
        .then(function (result) {
          db.movies.update({ title: movie.title }, { $set: {
            rating: movie.rating,
            num: movie.num,
            id: movie.id,
            wilhelm: movie.wilhelm
          } }, function () {
            console.log('updated', movie.title);
          });
      });
    });
  });
}

module.exports = tmdb;