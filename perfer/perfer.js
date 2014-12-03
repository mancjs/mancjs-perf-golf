var usage = require('usage');
var child = require('child_process');
var _ = require('underscore');

var maxMemoryUsageMB = 400;

var run = function(args, callback) {
  callback = _.once(callback);

  var runner = child.fork(__dirname + '/runner');

  runner.send({
    team: args.team,
    script: args.script,
    challenge: args.challenge,
    disableSort: args.disableSort
  });

  var memoryWatcher = setInterval(function() {
    usage.lookup(runner.pid, function(err, result) {
      if (err) {
        clearInterval(memoryWatcher);
      }

      if (result) {
        console.log('mem = ' + result.memory / 1024 / 1024);

        if ((result.memory / 1024 / 1024) > maxMemoryUsageMB) {
          clearInterval(memoryWatcher);
          runner.kill();
          return callback({ valid: false, err: 'memory usage too high (' + maxMemoryUsageMB + 'MB)' });
        }
      }
    });
  }, 500);

  var timer = setTimeout(function() {
    runner.kill();
    return callback({ valid: false, err: 'script took too long (' + args.maxTime + 's)' });
  }, args.maxTime * 1000);

  runner.on('message', function(result) {
    clearTimeout(timer);
    clearInterval(memoryWatcher);
    runner.kill();
    return callback(result);
  });
};

module.exports = {
  run: run
};