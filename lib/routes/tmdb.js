'use strict';

var tmdbService = require('../services/tmdb');
var movee = require('../utils/movee');

// Setup DB
var databaseUrl = process.env.MONGO_URL;
var collection = process.env.MONGO_COLLECTION;
var collections = ["movies", "movies-org", "imdb"]
var db = require("mongojs").connect(databaseUrl, collections);

function getNames (array) {
  var result = [];

  array.forEach(function (person) {
    result.push(person.name);
  });

  return result;
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

  if (req.params.imdbid) {
    id = req.params.imdbid;
  } else if (req.body.imdbid) {
    id = req.body.imdbid;

    // If URL, filter out IMDb ID
    if (id.indexOf('http') > -1) {
      id = id.substr(id.indexOf('/tt') + 1, id.substr(26).lastIndexOf('/'));
    }
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
        imdb: 'http://www.imdb.com/' + result.imdb_id,
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
      myMovie.language = getNames(result.spoken_languages);
      myMovie.production_companies = getNames(result.production_companies);

      // Add crew
      crew.forEach(function (person) {
        var crewType = movee.getCrew(person.job);
        if (crewType) { myMovie[crewType].push(person.name); }
      });

      db[collection].save(myMovie, function (error, saved) {
        if (error || !saved) { console.log(error); return; }
        if (saved) {
          console.log('inserted ', myMovie.title);
          res.redirect('/movies');
        }
      });
    })
    .catch(function (error) {
      return next(error);
    });
}

module.exports = tmdb;