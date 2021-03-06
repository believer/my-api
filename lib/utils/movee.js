'use strict';

/**
 * sortNames
 * Takes an array of names and sorts it into two different arrays
 * one with name and one with the number of movies the person appears in
 * 
 * @param  {array} names A long unsorted list of cast members with duplicates
 * @return {array}       An array with two arrays, [0] Names [1] Number of movies
 */
exports.sort = function (names, max) {
  max = max || 10;
  var sortedNames = [];

  names.forEach(function (movies, name) {
    sortedNames.push({ name: name, movies: movies });
  });

  var sortedNames = sortedNames
    .sort(function (a,b) {
      return b.movies - a.movies 
    })
    .slice(0, max);

  return sortedNames;
};

/**
 * getTen
 * Takes the array from sortNames and make it one array with objects
 * and lastly sorts it with the actor with the most seen movies first
 * 
 * @param  {array} arr Array from sortNames
 * @return {array}     Sorted array of the ten most common persons
 */
exports.getTen = function (arr, max) {
  var sorted = []
  ,   i      = 0;

  for (; i < arr[0].length; i++) {
    var name   = arr[0][i]
    ,   movies = arr[1][i];

    if (name && name !== '-') {
      sorted[i] = {
        name: name,
        movies: movies
      };
    }
  }

  return sorted.sort(function (a,b) {
    return b.movies - a.movies;
  }).slice(0, max);
};

var crews = {
  Director: function () { return 'director'; },
  Writing: function () {  return 'writer'; },
  Screenplay: function () { return 'writer'; },
  Writer: function () { return 'writer'; },
  Music: function () {  return 'music'; },
  'Original Music Composer': function () {  return 'music'; }
};

/**
 * Collect the crew members of a movie
 * @param  {string} job - Type of job
 * @return {[type]}     [description]
 */
exports.getCrew = function (job) {
  var crew = crews[job];
  return crew ? crew() : null;
};

/**
 * Returns a random number inside a given interval
 * @param  {int} min - Min value
 * @param  {int} max - Max value
 * @return {int}     - Random number within interval
 */
exports.randomIntFromInterval = function (min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
};

/**
 * Truncate a string and add ellipsis to the end
 * @param  {string} text   - Text to truncate
 * @param  {int} length    - Length to truncate at
 * @return {string}        - Truncated string
 */
exports.truncate = function (text, length) {
  if (text && text.length > length) {
    return text.substr(0, length) + '...';
  }

  return text;
};

/**
 * Take an array and return a shuffled version of it
 * @param  {array} array - Array to shuffle
 * @return {array}       - Shuffled array
 */
exports.shuffleArray = function (array) {
  var currentIndex = array.length
  ,   temporaryValue
  ,   randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};
