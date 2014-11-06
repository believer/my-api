'use strict';

var Q     = require('q')
,   movee = require('../utils/movee');

exports.get = function (req) {
  var deferred = Q.defer();
  var name = req.query.name;

  movee.mongoConnect(function (er, collection) {
    collection.find({ cast: { $regex:name, $options:'i' } }).sort({date:-1}).toArray(function(error, movies) {
      deferred.resolve(movies);
    });
  });

  return deferred.promise;
};