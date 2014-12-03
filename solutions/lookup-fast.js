var cache = {};

var run = function(keys, callback) {
  var done = 0;
  var results = [];

  keys.forEach(function(key, index) {
    if (cache[key]) {
      done += 1;
      results[index] = cache[key];

      if (done === keys.length) {
        return callback(results);
      }

      return;
    }

    lookup.get(key, function(value) {
      cache[key] = results[index] = value;
      done += 1;

      if (done === keys.length) {
        return callback(results);
      }
    });
  });
};