'use strict';

var tmdbService = require('../services/tmdb');
var movee = require('../utils/movee');
var request = require('request');

var BASE_URL = process.env.BASE_URL;

function getNames (array) {
  var result = [];

  array.forEach(function (person) {
    result.push(person.name);
  });

  return result;
}


// console.log(db);

/**
 * Get cast and crew from TMDb
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var tmdb = function (req, res, next) {
  request(BASE_URL + '/movies?limit=2000', function (err, data, body) {
    body = JSON.parse(body);

    body.results.forEach(function (movie) {
      var id = movie.imdbid;

      tmdbService.get(id)
        .then(function (result) {
          var cast      = result.cast;
          var crew      = result.crew;
          var wilhelm   = result.wilhelm ? true : false;

          var myMovie = {
            title: result.title,
            date: new Date().toISOString(),
            year: result.release_date.substr(0,4),
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
          myMovie.languages = getNames(result.spoken_languages);
          myMovie.production_companies = getNames(result.production_companies);

          // Add crew
          crew.forEach(function (person) {
            var crewType = movee.getCrew(person.job);
            if (crewType) { myMovie[crewType].push(person.name); }
          });

          db.newmovies.save(myMovie, function (err, saved) {
            if (err || !saved) { console.log('error'); }
            else {
              console.log('saved', myMovie.title);
            }
          });
      });
    });
  });
}

module.exports = tmdb;