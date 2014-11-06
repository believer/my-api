'use strict';

var express = require('express');
var router = express.Router();
var movies = require('../services/movies');

/**
 * Index route
 * @param  {obj}   req
 * @param  {obj}   res  [description]
 * @param  {Function} next
 */
router.get('/', function (req, res, next) {
  movies.get(req)
    .then(function (result) {
      res.send(result);
    })
    .catch(function (error) {
      return next(error);
    });
});

module.exports = router;