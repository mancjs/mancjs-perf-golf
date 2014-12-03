var bsearch = function(array, key) {
  var lo = 0, hi = array.length - 1, mid, element;

  while (lo <= hi) {
      mid = ((lo + hi) >> 1);
      element = array[mid];
      if (element < key) {
          lo = mid + 1;
      } else if (element > key) {
          hi = mid - 1;
      } else {
          return mid;
      }
  }

  return -1;
};

var run = function(input, callback) {
  var indexes = input.numbersToFind.map(function(number) {
    return bsearch(input.numbers, number);
  });

  return callback(indexes);
};