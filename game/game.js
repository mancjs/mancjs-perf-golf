var fs = require('fs');
var crypto = require('crypto');
var perfer = require('../perfer/perfer');
var _ = require('underscore');

var games = [
  { id: 1, title: 'Halves', description: '...', file: 'halves' },
  { id: 2, title: 'Number Sort', description: '...', file: 'sort', disableSort: true },
  { id: 3, title: 'Slow Lookup', description: '...', file: 'lookup' },
  { id: 4, title: 'Array Search', description: '...', file: 'search' }
];

var currentGame;
var savePath = __dirname + '/data/game.json';

var start = function(id) {
  currentGame = _.clone(_.findWhere(games, { id: id }));
  currentGame.entries = [];
  currentGame.running = true;

  return save();
};

var stop = function() {
  if (currentGame) {
    currentGame.running = false;
  }

  return save();
};

var get = function() {
  return currentGame;
};

var getAllGames = function() {
  return games;
};

var addEntry = function(data) {
  var createKey = function() {
    return (Math.round(Math.random() * 100000000000)).toString(36);
  };

  var getGravatarUrl = function(email) {
    var hash = crypto.createHash('md5').update(email).digest('hex');
    return 'http://www.gravatar.com/avatar/' + hash + '?s=130&d=wavatar';
  };

  if (!currentGame.running) {
    return { err: 'Game is not running' };
  }

  var entry = _.findWhere(currentGame.entries, { email: data.email });

  if (entry && entry.key !== data.key) {
    return { err: 'This email address is taken' };
  }

  if (!entry) {
    if (!data.email) return { err: 'Enter an email address' };
    if (!data.team)  return { err: 'Enter a team name' };
    if (!data.file)  return { err: 'No file was selected' };

    entry = {
      valid: false,
      pending: true,
      email: data.email,
      gravatar: getGravatarUrl(data.email),
      team: data.team,
      file: data.file,
      key: createKey(),
      statsKey: createKey(),
      updated: new Date
    };

    currentGame.entries.push(entry);
    save();

    return { entry: entry };
  }

  if (entry && entry.key === data.key) {
    entry.updated = new Date;
    entry.file = data.file;
    entry.pending = true;
    save();

    return { entry: entry };
  }
};

var save = _.debounce(function() {
  return fs.writeFileSync(savePath, JSON.stringify(currentGame));
}, 1000);

var load = function() {
  if (fs.existsSync(savePath)) {
    currentGame = JSON.parse(fs.readFileSync(savePath, 'utf8'));
  }
};

var processEntry = function(entry, callback) {
  var args = {
    team: entry.team,
    script: fs.readFileSync(entry.file, 'utf8'),
    challenge: __dirname + '/../challenges/' + currentGame.file,
    disableSort: currentGame.disableSort,
    maxTime: 30
  };

  perfer.run(args, function(result) {
    entry.valid = result.valid;
    entry.pending = false;
    entry.stats = result;

    if (result.valid) {
      entry.score = result.results.score;
    }

    save();
    return callback();
  });
};

var startProcessingEntries = function() {
  var scheduleNextCheck = function() {
    setTimeout(startProcessingEntries, 5000);
  };

  if (currentGame && currentGame.running) {
    var entry = _.findWhere(currentGame.entries, { pending: true });

    if (entry) {
      return processEntry(entry, scheduleNextCheck);
    }
  }

  return scheduleNextCheck();
};

load();
startProcessingEntries();

module.exports = {
  getAllGames: getAllGames,
  addEntry: addEntry,
  start: start,
  stop: stop,
  get: get
};