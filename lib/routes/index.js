'use strict';

var express = require('express');
var router = express.Router();

/**
 * Show documentation page
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
router.get('/', function (req, res) {
  res.render('index');
})

module.exports = router;