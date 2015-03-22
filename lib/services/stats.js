'use strict';

var Q = require('q');
var movee = require('../utils/movee');

// Setup DB
var databaseUrl = process.env.MONGO_URL;
var collection  = process.env.MONGO_COLLECTION;
var collections = ["movies", "movies-org", "imdb"];
var db = require("mongojs").connect(databaseUrl, collections);

function addToMap (values, map) {
  values.forEach(function (value) {
    var amount = map.has(value) ? map.get(value) + 1 : 1;
    map.set(value, amount);
  });

  return map;
}

exports.get = function (req, res) {
  var deferred = Q.defer();

  var stats = {
    time: {
      minutes: 0,
      adjustedMinutes: 0
    },
    ratings: [0,0,0,0,0,0,0,0,0,0],
    ratingPlaytime: [0,0,0,0,0,0,0,0,0,0],
    perYear: {},
    years: {},
    wilhelms: 0
  };

  var actors = new Map();
  var directors = new Map();
  var composers = new Map();
  var genres = new Map();
  var languages = new Map();
  var productionCompanies = new Map();
  var years = new Map();
  var perYear = new Map();
  var rewatches = new Map();

  db[collection].find(function (err, movies) {
    stats.total = movies.length;

    movies.forEach(function (movie) {
      if (!years.has(movie.year)) {
        years.set(movie.year, 1);
      } else {
        years.set(movie.year, years.get(movie.year) + 1);
      }

      var yearFromDate = new Date(movie.date).getFullYear();
      if (isNaN(yearFromDate)) { yearFromDate = 0; }

      if (!perYear.has(yearFromDate)) {
        perYear.set(yearFromDate, 1);
      } else {
        perYear.set(yearFromDate, perYear.get(yearFromDate) + 1);
      }

      // Rating distribution
      stats.ratings[movie.rating - 1]++;

      // Crew
      actors = addToMap(movie.cast, actors);
      directors = addToMap(movie.director, directors);
      composers = addToMap(movie.music, composers);
      genres = addToMap(movie.genres, genres);

      if (movie.languages) {
        languages = addToMap(movie.languages, languages);
      }

      if (movie.production_companies) {
        productionCompanies = addToMap(movie.production_companies, productionCompanies);
      }

      // Total minutes
      if (movie.runtime) {
        var runtime = parseInt(movie.runtime, 10);
        stats.time.minutes += runtime;
        stats.ratingPlaytime[movie.rating - 1] += runtime;
      }

      // Adjusted runtime including multiple views
      if (movie.views) {
        var adjustedMinutes = runtime * movie.views.length;
        stats.time.adjustedMinutes += adjustedMinutes;

        rewatches.set(movie.title, movie.views.length + 1);
      }

      // Wilhelm screams
      stats.wilhelms += movie.wilhelm ? 1 : 0;

    });
    
    // Calculate some more times from the total minutes
    stats.time.adjustedMinutes = stats.time.adjustedMinutes + stats.time.minutes;
    stats.time.hours = Math.floor(stats.time.minutes / 60);
    stats.time.days  = Math.floor(stats.time.hours / 24);
    stats.time.years = (stats.time.days / 365).toFixed(2) / 1;

    // Totals
    stats.numbers = {
      actors: actors.size,
      directors: directors.size,
      composers: composers.stats,
      genres: genres.size,
      productionCompanies: productionCompanies.size,
      languages: languages.size
    };

    // Prettify values for browser
    years.forEach(function (movies, year) {
      stats.years[year] = movies;
    });

    perYear.forEach(function (movies, year) {
      stats.perYear[year] = movies;
    });

    stats.actors = movee.sort(actors);
    stats.directors = movee.sort(directors);
    stats.composers = movee.sort(composers);
    stats.genres = movee.sort(genres);
    stats.productionCompanies = movee.sort(productionCompanies);
    stats.languages = movee.sort(languages);
    stats.rewatches = movee.sort(rewatches);

    deferred.resolve(stats);
  });

  return deferred.promise;
};