'use strict';

var express = require('express');
var router = express.Router();
var lastfm = require('../services/lastfm');

router.post('/', function (req, res, next) {
  lastfm.get(req)
    .then(function (result) {
      res.send(result);
    })
    .catch(function (error) {
      return next(error);
    });
});

module.exports = router;