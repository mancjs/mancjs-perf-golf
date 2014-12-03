var input = [];
var output = [];

var load = function() {
  for (var i=0; i<666666; i++) {
    var num = Math.round(Math.random() * 999999);
    input[i] = (num % 2 === 0) ? num : num + 1;
    output[i] = input[i] >> 1;
  }

  return {
    input: input,
    output: output
  };
};

module.exports = {
  load: load
};