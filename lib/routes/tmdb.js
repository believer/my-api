'use strict';

var tmdbService = require('../services/tmdb');
var movee = require('../utils/movee');
var Twit = require('twit')

// Setup DB
var databaseUrl = process.env.MONGO_URL;
var collection = process.env.MONGO_COLLECTION;
var collections = ["movies", "movies-org", "imdb"]
var db = require("mongojs").connect(databaseUrl, collections);

/**
 * Get names for cast and crew and make a new array of them
 * @param  {array} array - Persons
 * @return {array}       - Array of names
 */
function getNames (array) {
  var result = [];

  array.forEach(function (person) {
    result.push(person.name);
  });

  return result;
}

/**
 * Initiate Twitter
 * @return {obj} - Twit
 */
function initTwitter (req) {
  return new Twit({
    consumer_key: process.env.T_CONSKEY,
    consumer_secret: process.env.T_SECRET,
    access_token: req.session.oauth.access_token,
    access_token_secret: req.session.oauth.access_token_secret
  });
}

/**
 * Send tweet
 * @param  {obj} T     - Twit
 * @param  {obj} movie - Movie object
 */
function tweet (T, movie) {
  var tweet = {
    status: 'I just watched ' + movie.title + ' (' + movie.year + '). I gave it ' + movie.rating + '/10. http://movies.rickardlaurin.se'
  };

  T.post('statuses/update', tweet, function (err, data, response) {
    console.log(data)
  });
}

/**
 * Get cast and crew from TMDb
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var tmdb = function (req, res, next) {
  var id;
  var T;

  if (!req.params.imdbid && !req.body.imdbid) {
    throw Error('No IMDb ID provided');
  }

  if (req.session && req.session.oauth && req.session.oauth.access_token) {
    T = initTwitter(req);
  }

  if (req.params.imdbid) {
    id = req.params.imdbid;
  } else if (req.body.imdbid) {
    id = req.body.imdbid;
  }

  // If URL, filter out IMDb ID
  if (id.indexOf('http') > -1) {
    id = id.substr(id.indexOf('/tt') + 1, id.substr(26).lastIndexOf('/'));
  }

  tmdbService.get(id)
    .then(function (result) {
      var cast      = result.cast;
      var crew      = result.crew;
      var wilhelm   = result.wilhelm ? true : false;

      var myMovie = {
        title: result.title,
        date: new Date().toISOString(),
        year: result.release_date.substr(0,4) || '',
        desc: result.overview,
        imdb: 'http://www.imdb.com/title/' + result.imdb_id,
        runtime: result.runtime,
        imdbid: result.imdb_id,
        music: [],
        writer: [],
        rating: parseInt(req.body.rating, 10) || 0,
        poster: result.poster_path || '',
        tagline: result.tagline,
        wilhelm: wilhelm,
        director: [],
        release_date: result.release_date
      };

      myMovie.genres = getNames(result.genres);
      myMovie.cast = getNames(cast);
      myMovie.languages = getNames(result.spoken_languages);
      myMovie.production_companies = getNames(result.production_companies);

      // Add crew
      crew.forEach(function (person) {
        var crewType = movee.getCrew(person.job);
        if (crewType) { myMovie[crewType].push(person.name); }
      });

      db[collection].find({ imdbid: myMovie.imdbid }, function (error, response) {
        if (error) { throw Error('Error in find'); }

        if (response.length) {
          var views;

          if (!response[0].views) {
            views = [
              {
                date: new Date().toISOString()
              }
            ];
          } else {
            views = response[0].views;
            views.push({
              date: new Date().toISOString()
            });
          }

          var newRating = response[0].rating !== req.body.rating ? req.body.rating : response[0].rating;

          db[collection].update({ imdbid: myMovie.imdbid }, { $set: { views: views, rating: newRating } }, function () {
            console.log('updated views of ', myMovie.title);
            res.redirect('/movies');
          });
        } else {
          db[collection].save(myMovie, function (error, saved) {
            if (error || !saved) { console.log(error); return; }
            if (saved) {
              console.log('inserted ', myMovie.title);
              
              // Tweet it
              if (T) {
                tweet(T, myMovie);
              }

              res.redirect('/movies');
            }
          });          
        }
      });
    })
    .catch(function (error) {
      return next(error);
    });
}

module.exports = tmdb;