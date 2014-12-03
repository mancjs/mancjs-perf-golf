var express = require('express');
var game = require('../game/game');

var auth = express.basicAuth(function(user, pass) {
  return user === 'admin' && pass === 'admin';
});

var routes = function(app) {
  app.get('/admin', auth, function(req, res) {
    var allGames = game.getAllGames();
    var currentGame = game.get();

    var gameData = JSON.stringify(currentGame, undefined, 2);
    return res.render('admin', { game: currentGame, allGames: allGames, gameData: gameData });
  });

  app.get('/stop', auth, function(req, res) {
    game.stop();
    return res.redirect('/admin');
  });

  app.post('/start/:id', auth, function(req, res) {
    var id = req.param('id');
    game.start(parseInt(id));
    return res.redirect('/admin');
  });
};

module.exports = routes;