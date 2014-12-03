var fs = require('fs');
var vm = require('vm');
var async = require('async');
var _ = require('underscore');

var logs = [];
var testNumber = 0;
var processDead = false;

var log = function(message) {
  logs.push('test ' + testNumber + ': ' + message);

  if (logs.length > 50) {
    logs = _.last(logs, 50);
  }
};

var global = {
  setTimeout: setTimeout,
  console: { log: log }
};

var getError = function(expected, actual) {
  var formatTypeAndValue = function(value, actual) {
    var getType = function(value) {
      if (_.isArray(value)) return 'array';
      return typeof value;
    };

    var type = getType(value);

    if (type === 'undefined') return 'undefined';
    if (type === 'function') return 'function';
    if (type === 'array') return (actual ? 'different ' : '') + 'array of ' + value.length + ' items';
    if (type === 'string') return (actual ? 'different ' : '') + 'string of ' + value.length + ' chars';

    var digits = value.toString().replace(/[^0-9]/g, '').length;
    return digits + ' digit number';
  };

  var expectedError = formatTypeAndValue(expected, false);
  var actualError = formatTypeAndValue(actual, true);

  return 'expected ' + expectedError + ', got ' + actualError;
};

var loadScript = function(script, callback) {
  try {
    vm.runInNewContext(script, global);
    return callback();
  } catch (err) {
    return callback(err);
  }
};

var timeAndRun = function(entry, data, callback) {
  try {
    var start = new Date().getTime();

    global.run(data.input, function(result) {
      var time = new Date().getTime() - start;

      if (_.isArray(result) && _.isArray(data.output)) {
        if (result.toString() !== data.output.toString()) {
          return callback({ err: getError(data.output, result) });
        }
      } else if (result !== data.output) {
        return callback({ err: getError(data.output, result) });
      }

      return callback({ time: time });
    });
  } catch (err) {
    return callback({ err: err.toString() });
  }
};

var benchmark = function(entry, times, challenge) {
  var getResult = function(index, callback) {
    testNumber = index;

    console.log(entry.team + ': running test ' + index);

    timeAndRun(entry, challenge.load(), function(result) {
      if (result.err) {
        return callback({ valid: false, err: result.err, test: testNumber, logs: logs });
      }

      return callback(null, { test: testNumber, time: result.time });
    });
  };

  var complete = function(err, all) {
    if (err) {
      return process.send(err);
    }

    var best = _.first(_.sortBy(all, function(result) {
      return result.time;
    }), 3);

    var score = _.reduce(_.pluck(best, 'time'), function(total, time) {
      return total + time;
    }) / 3;

    score = Math.round(score);

    console.log(entry.team + ': ' + score + 'ms');

    process.send({ valid: true, results: {
      logs: logs,
      all: all,
      best: best,
      score: score
    }});
  };

  return async.mapSeries(_.range(1, ++times), getResult, complete);
};

process.on('uncaughtException', function(err) {
  if (!processDead) {
    processDead = true;
    process.send({ valid: false, err: err.toString(), test: testNumber, logs: logs });
  }
});

process.on('message', function(entry) {
  var challenge = require(entry.challenge);

  if (challenge.context) {
    var context = challenge.context();
    global[context.name] = context.value;
  }

  var script = entry.script;

  if (entry.disableSort) {
    script = 'Array.prototype.sort = function() { throw "Array.prototype.sort is disabled"; }; ' + script;
  }

  loadScript(script, function(err) {
    if (err) {
      return process.send({ valid: false, err: err.toString(), test: testNumber });
    }

    if (!global.run) {
      return process.send({ valid: false, err: 'No global run function defined', test: testNumber });
    }

    timeAndRun(entry, challenge.load(), function(result) {
      if (result.err) {
        return process.send({ valid: false, err: result.err, test: testNumber, logs: logs });
      }

      return benchmark(entry, 10, challenge);
    });
  });
});