'use strict';

var Q     = require('q');
var movee = require('../utils/movee');

// Setup DB
var databaseUrl = process.env.MONGO_URL;
var collections = ["movies", "newmovies"]
var db = require("mongojs").connect(databaseUrl, collections);

exports.get = function (req) {
  var deferred = Q.defer();
  var name = req.query.name;
  var type = req.params.type;

  var find = {};
  find[type] = {
    $regex: name,
    $options: 'i'
  };

  var sort = { date: -1 };

  db.movies.find(find).sort(sort, function (error, movies) {
    deferred.resolve(movies);
  });

  return deferred.promise;
};