'use strict';

var Q       = require('q')
,   movee   = require('../utils/movee');

exports.get = function (req) {
  var skip     = parseInt(req.query.skip, 10) || 0
  ,   limit    = parseInt(req.query.limit, 10) || 50
  ,   deferred = Q.defer();

  movee.mongoConnect(function (err, collection) {
    collection.find().sort({date:-1}).skip(skip).limit(limit).toArray(function(error, movies) {
      var send = {
        resultCount: movies.length,
        skip: skip,
        limit: limit,
        results: movies
      };

      deferred.resolve(send);
    });
  });

  return deferred.promise;
};