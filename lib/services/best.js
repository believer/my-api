'use strict';

var Q       = require('q');

// Setup DB
var databaseUrl = process.env.MONGO_URL;
var collection  = process.env.MONGO_COLLECTION;
var collections = ["movies", "movies-org", "imdb"];
var db = require("mongojs").connect(databaseUrl, collections);

exports.get = function (req) {
  var deferred = Q.defer();

  db[collection].find({$where: "this.rating >= 9" }).sort({ year: -1 }, function (error, movies) {
    var moviesOut = {};

    movies.forEach(function (movie) {
      if (!moviesOut[movie.year]) {
        moviesOut[movie.year] = [];
      }

      moviesOut[movie.year].push(movie.title);
    });

    deferred.resolve(moviesOut);
  });

  return deferred.promise;
};