'use strict';

var Q       = require('q');

// Setup DB
var databaseUrl = process.env.MONGO_URL;
var collection  = process.env.MONGO_COLLECTION;
var collections = ["movies", "movies-org", "imdb"];
var db = require("mongojs").connect(databaseUrl, collections);

exports.get = function (req) {
  var find     = req.query.title ? { title: { $regex: req.query.title, $options: 'i' } } : {};

  if (!find.title) {
    find = req.params.rating ? { rating: parseInt(req.params.rating, 10) } : {};
  }

  var skip     = parseInt(req.query.skip, 10) || 0;
  var limit    = parseInt(req.query.limit, 10) || 50;
  var deferred = Q.defer();

  db[collection].find(find).sort({ date: -1 }).skip(skip).limit(limit, function (error, movies) {
    var send = {
      resultCount: movies.length,
      skip: skip,
      limit: limit,
      results: movies
    };

    if (req.query.title) {
      send.query = req.query.title;
    }

    deferred.resolve(send);
  });

  return deferred.promise;
};