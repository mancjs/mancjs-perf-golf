var fs = require('fs');
var game = require('../game/game');
var _ = require('underscore');

var routes = function(app) {
  app.get('/', function(req, res) {
    var currentGame = game.get();

    if (!currentGame) {
      return res.render('no-game');
    }

    var session = {
      email: req.param('email'),
      team: req.param('team'),
      key: req.param('key')
    };

    var pendingEntries = _.where(currentGame.entries, { pending: true });
    var validEntries = _.sortBy(_.where(currentGame.entries, { valid: true, pending: false }), 'score');
    var invalidEntries = _.sortBy(_.where(currentGame.entries, { valid: false, pending: false }), 'score');
    var allEntries = pendingEntries.concat(validEntries.concat(invalidEntries));

    return res.render('play', {
      game: currentGame,
      entries: allEntries,
      session: session,
      err: req.param('err'),
      autoreload: req.param('autoreload') === 'true'
    });
  });

  app.get('/stats/:statskey', function(req, res) {
    var getStats = function(game, statsKey) {
      var entry = _.findWhere(game.entries, { statsKey: statsKey });
      return entry && entry.stats;
    };

    var currentGame = game.get();

    if (!currentGame.running) {
      return res.send(403);
    }

    var stats = getStats(currentGame, req.param('statskey'));
    return stats ? res.json(stats) : res.send(404);
  });

  app.get('/solution/:key', function(req, res) {
    var getSolution = function(game, key) {
      var entry = _.findWhere(game.entries, { key: key });

      if (entry) {
        return fs.readFileSync(entry.file, 'utf8');
      }
    };

    var currentGame = game.get();

    if (currentGame.running) {
      return res.send(403);
    }

    var solution = getSolution(currentGame, req.param('key'));

    return res.set('Content-Type', 'text/plain').send(solution || 'No solution found');
  });

  app.post('/submit', function(req, res) {
    var redirect = function(result, err) {
      var url = '/?email=' + (result.email || '')
              + '&team=' + (result.team || '')
              + '&key=' + (result.key || '')
              + '&err=' + (err || '');

      return res.redirect(url);
    };

    var file = req.files['file'];

    var entry = {
      email: req.param('email'),
      team: req.param('team'),
      key: req.param('key'),
      file: file ? file.path : null
    };

    var result = game.addEntry(entry);
    return redirect(result.entry || {}, result.err);
  });
};

module.exports = routes;