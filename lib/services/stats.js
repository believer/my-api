'use strict';

var Q = require('q');
var movee = require('../utils/movee');

// Setup DB
var databaseUrl = process.env.MONGO_URL;
var collection  = process.env.MONGO_COLLECTION;
var collections = ["movies", "movies-org", "imdb"];
var db = require("mongojs").connect(databaseUrl, collections);

exports.get = function (req, res) {
  var deferred = Q.defer();

  var stats = {
    time: {
      minutes: 0
    },
    numbers: {},
    actors: [],
    directors: [],
    composers: [],
    languages: [],
    production_companies: [],
    ratings: [0,0,0,0,0,0,0,0,0,0],
    ratingPlaytime: [0,0,0,0,0,0,0,0,0,0],
    genres: [],
    years: {},
    certifications: {},
    wilhelms: 0
  };

  db[collection].find(function (err, movies) {
    stats.total = movies.length;

    movies.forEach(function (movie) {
      var cert = stats.certifications[movie.certification];

      // Certifications
      if (movie.certification && !cert) {
        stats.certifications[movie.certification] = {
          movies: 1
        };
      } else if (cert) {
        cert.movies++;
      }

      // Add years
      var year = stats.years[movie.year];

      // Distribution over the years
      if (movie.year && !year) {
        stats.years[movie.year] = {
          movies: 1
        };
      } else if (year) {
        year.movies++;
      }

      // Rating distribution
      stats.ratings[movie.rating - 1]++;

      // Actors
      movie.cast.map(function (actor) {
        stats.actors.push(actor);
      });

      // Directors
      movie.director.map(function (director) {
        stats.directors.push(director);
      });

      // Composers
      movie.music.map(function (composer) {
        stats.composers.push(composer);
      });

      movie.genres.map(function (genre) {
        stats.genres.push(genre);
      });

      if (movie.languages) {
        movie.languages.map(function (language) {
          stats.languages.push(language);
        });        
      }

      if (movie.production_companies) {
        movie.production_companies.map(function (company) {
          stats.production_companies.push(company);
        });
      }

      // Total minutes
      if (movie.runtime) {
        var runtime = parseInt(movie.runtime, 10);
        stats.time.minutes += runtime;
        stats.ratingPlaytime[movie.rating - 1] += runtime;
      }

      // Wilhelm screams
      stats.wilhelms += movie.wilhelm ? 1 : 0;

    });
    
    // Get ten most occuring persons in each category
    // and the total amount of person
    var unsorted = [
      {
        type:'actors',
        array: stats.actors
      },
      {
        type:'directors',
        array: stats.directors
      },
      {
        type:'composers',
        array: stats.composers
      },
      {
        type:'genres',
        array: stats.genres,
        amount: 20
      },
      {
        type: 'production_companies',
        array: stats.production_companies
      },
      {
        type: 'languages',
        array: stats.languages
      }
    ];

    unsorted.forEach(function (obj) {
      var max = obj.amount ? obj.amount : 10;
      var sorted = movee.sortNames(obj.array, max);

      stats[obj.type]         = sorted.array;
      stats.numbers[obj.type] = sorted.total;
    });


    // Calculate some more times from the total minutes
    stats.time.hours = Math.floor(stats.time.minutes / 60);
    stats.time.days  = Math.floor(stats.time.hours / 24);
    stats.time.years = (stats.time.days / 365).toFixed(2) / 1;

    deferred.resolve(stats);
  });

  return deferred.promise;
};