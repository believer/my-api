'use strict';

var Q       = require('q');
var movee   = require('../utils/movee');

// Setup DB
var databaseUrl = process.env.MONGO_URL;
var collection = process.env.MONGO_COLLECTION;
var collections = ["movies", "movies-org"]
var db = require("mongojs").connect(databaseUrl, collections);

exports.get = function (req) {
  var skip     = parseInt(req.query.skip, 10) || 0
  ,   limit    = parseInt(req.query.limit, 10) || 50
  ,   deferred = Q.defer();

  db[collection].find().sort({ date: -1 }).skip(skip).limit(limit, function (error, movies) {
    var send = {
      resultCount: movies.length,
      skip: skip,
      limit: limit,
      results: movies
    };

    deferred.resolve(send);
  });

  return deferred.promise;
};