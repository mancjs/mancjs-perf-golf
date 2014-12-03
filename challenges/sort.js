var _ = require('underscore');

var getInput = function() {
  return _.map(_.range(0, 5000), function() {
    return Math.round(Math.random() * 10000);
  });
};

var getOutput = function(input) {
  return _.sortBy(input, function(number) {
    return number;
  });
};

var load = function() {
  var input = getInput();
  var output = getOutput(input);

  input.sort = function() { throw 'Array.prototype.sort is disabled'; };

  return {
    input: input,
    output: output
  };
};

module.exports = {
  load: load
};