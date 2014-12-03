var run = function(keys, callback) {
  var done = 0;
  var results = [];

  keys.forEach(function(key, index) {
    lookup.get(key, function(value) {
      results[index] = value;
      done += 1;

      if (done === keys.length) {
        return callback(results);
      }
    });
  });
};