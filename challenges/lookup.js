var _ = require('underscore');

var delay = 1000;

var map = {
  key1: 'unu',
  key2: 'du',
  key3: 'tri',
  key4: 'kvar',
  key5: 'kvin',
  key6: 'ses',
  key7: 'sep',
  key8: 'ok',
  key9: 'nau',
  key10: 'dek'
};

var get = function(key, callback) {
  setTimeout(function() {
    return callback(map[key]);
  }, delay);

  delay += 10;
};

var getInput = function() {
  return _.map(_.range(0, 100), function() {
    return 'key' + (Math.floor(Math.random() * 10) + 1);
  });
};

var getOutput = function(input) {
  return _.map(input, function(key) {
    return map[key];
  });
};

var load = function() {
  delay = 250;

  var input = getInput();
  var output = getOutput(input);

  return {
    input: input,
    output: output
  };
};

var context = function() {
  return {
    name: 'lookup',
    value: { get: get }
  };
};

module.exports = {
  load: load,
  context: context
};