'use strict';

var Q     = require('q');
var movee = require('../utils/movee');

exports.get = function (req) {
  var deferred = Q.defer();
  var name = req.query.name;
  var find = {
    cast: {
      $regex:name,
      $options:'i'
    }
  };
  var sort = { date: -1 };

  movee.mongoConnect(function (er, collection) {
    collection.find(find).sort(sort).toArray(function (error, movies) {
      deferred.resolve(movies);
    });
  });

  return deferred.promise;
};