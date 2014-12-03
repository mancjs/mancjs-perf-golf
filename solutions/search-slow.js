var run = function(input, callback) {
  var indexes = input.numbersToFind.map(function(number) {
    return input.numbers.indexOf(number);
  });

  return callback(indexes);
};