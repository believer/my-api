'use strict';

var Q     = require('q');
var movee = require('../utils/movee');

exports.get = function (req) {
  var deferred = Q.defer();
  var name = req.query.name;
  var type = req.query.type;
  var find;
  var query = {
    $regex: name,
    $options: 'i'
  };

  switch (type) {
    case 'cast':
      find = {
        cast: query
      };
      break;
    case 'director':
      find = {
        director: query
      };
      break;
    case 'music':
      find = {
        music: query
      };
      break;
    default:
      find = {
        cast: query
      };
      break;  
  }

  var sort = { date: -1 };

  movee.mongoConnect(function (er, collection) {
    collection.find(find).sort(sort).toArray(function (error, movies) {
      deferred.resolve(movies);
    });
  });

  return deferred.promise;
};