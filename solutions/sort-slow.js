var bubbleSort = function(arr) {
  var swapped;

  do {
    swapped = false;

    for (var i=0; i < arr.length-1; i++) {
      if (arr[i] > arr[i+1]) {
        var temp = arr[i];
        arr[i] = arr[i+1];
        arr[i+1] = temp;
        swapped = true;
      }
    }
  } while (swapped);
};

var run = function(numbers, callback) {
  bubbleSort(numbers);
  return callback(numbers);
};