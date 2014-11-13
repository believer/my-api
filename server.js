'use strict';

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var path = require('path');
var dotenv = require('dotenv');

// Load environment variables
dotenv._getKeysAndValuesFromEnvFilePath('./env/.env');
dotenv._setEnvs();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var port = process.env.PORT || 3000;
var router;

//
// Documentation
// --------------------------------------------------
var index = require('./lib/routes/index');

app.use('/', index);

//
// Movies
// --------------------------------------------------
router = express.Router();
var movies = require('./lib/routes/movies');
app.use('/movies', router.get('/', movies));

router = express.Router();
var person = require('./lib/routes/person');
app.use('/person', router.get('/:type', person));

//
// Music
// --------------------------------------------------
router = express.Router();
var lastfm = require('./lib/routes/lastfm');
app.use('/lastfm', router.post('/', lastfm));

//
// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);
