'use strict';

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var port = process.env.PORT || 3000;

//
// Documentation
var index = require('./lib/routes/index');

app.use('/', index);

// 
// Movies
var movies = require('./lib/routes/movies');
var actor = require('./lib/routes/actor');

app.use('/movies', movies);
app.use('/actor', actor);

//
// Music
var lastfm = require('./lib/routes/lastfm');

app.use('/lastfm', lastfm);

//
// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);
