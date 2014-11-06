'use strict';

var express = require('express');
var router = express.Router();
var actor = require('../services/actor');

/**
 * Find an actor by name
 * @param  {obj} req
 * @param  {obj} res
 */
router.get('/', function (req, res, next) {
  var name = req.query.name;

  actor.get(req)
    .then(function (results) {
      res.send({ movies:results, actor:name });
    })
    .catch(function (error) {
      return next(error);
    });
});

module.exports = router;