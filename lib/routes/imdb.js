'use strict';

var tmdbService = require('../services/tmdb');
var movee = require('../utils/movee');

var databaseUrl = process.env.MONGO_URL;
var collections = ["imdb"]
var db = require("mongojs").connect(databaseUrl, collections);

function getNames (array) {
  var result = [];

  array.forEach(function (person) {
    result.push(person.name);
  });

  return result;
}

/**
 * Last.fm now playing
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var lastfm = function (req, res, next) {
  //Converter Class
  var Converter=require("csvtojson").core.Converter;
  var fs=require("fs");

  var csvFileName="./movies_no.csv";
  var fileStream=fs.createReadStream(csvFileName);
  //new converter instance
  var csvConverter=new Converter({constructResult:true});

  //end_parsed will be emitted once parsing finished
  csvConverter.on("end_parsed",function (jsonObj){
    var send = {
      length: jsonObj.length,
      results: jsonObj
    };

    var movies = [];

    jsonObj.forEach(function (movie, i) {
      if (!movie.id) { console.log(movie.title); }

      var id = movie.id;

      tmdbService.get(id)
        .then(function (result) {
          var cast      = result.cast;
          var crew      = result.crew;
          var wilhelm   = result.wilhelm ? true : false;

          var myMovie = {
            title: result.title,
            date: new Date(movie.created) || '',
            year: result.release_date.substr(0,4),
            desc: result.overview,
            imdb: 'http://www.imdb.com/' + result.imdb_id,
            runtime: result.runtime,
            imdbid: result.imdb_id,
            music: [],
            writer: [],
            rating: movie.rate_my || 0,
            poster: result.poster_path || '',
            tagline: result.tagline,
            wilhelm: wilhelm,
            director: [],
            num: i,
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

          db.imdb.save(myMovie, function (err, saved) {
            if (err || !saved) { console.log('error'); }
            else {
              console.log('saved', myMovie.title);
            }
          });
      });
    });

    res.send(send);
    // console.log(jsonObj); //here is your result json object
  });

  //read from file
  fileStream.pipe(csvConverter);
}

module.exports = lastfm;