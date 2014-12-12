'use strict';

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var path       = require('path');
var dotenv     = require('dotenv');
var session = require('express-session');

// Load environment variables
dotenv._getKeysAndValuesFromEnvFilePath('./env/.env');
dotenv._setEnvs();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({secret:'shhh'}));

app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


var port = process.env.PORT || 3000;
var router;

// Setup DB
var databaseUrl = process.env.MONGO_URL;
var collections = ["movies", "newmovies"]
var db = require("mongojs").connect(databaseUrl, collections);

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

router = express.Router();
var rating = require('./lib/routes/rating');
app.use('/movies/rating', router.get('/:rating', rating));

router = express.Router();
var np = require('./lib/routes/np');
app.use('/np', router.get('/', np));

//
// Resources
// --------------------------------------------------
router = express.Router();
var tmdb = require('./lib/routes/tmdb');
app.use('/tmdb', router.post('/', tmdb));

router = express.Router();
var meta = require('./lib/routes/meta');
app.use('/meta', router.get('/', meta));

router = express.Router();
var imdb = require('./lib/routes/imdb');
app.use('/imdb', router.get('/', imdb));

router = express.Router();
var stats = require('./lib/routes/stats');
app.use('/stats', router.get('/', stats));

//
// Twitter
// --------------------------------------------------
router = express.Router();
var twitter = require('./lib/routes/twitter');
app.use('/auth/twitter', router.get('/', twitter));

router = express.Router();
var twitterCb = require('./lib/routes/twitterCb');
app.use('/auth/twitter/callback', router.get('/', twitterCb));

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
