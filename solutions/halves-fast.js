var run = function(numbers, callback) {
  for (var i=0; i<numbers.length; i++) {
    numbers[i] = numbers[i] >> 1;
  }

  return callback(numbers);
};