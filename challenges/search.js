var input = [];

var load = function() {
  var numbersToFind = [];

  for (var i=0; i<10; i++) {
    numbersToFind.push(Math.round(Math.random() * 999999));
  }

  var getNumber = function() {
    var number = Math.round(Math.random() * 999999);
    return numbersToFind.indexOf(number) === -1 ? number : getNumber();
  };

  for (var i=0; i<999999; i++) {
    input[i] = getNumber();
  }

  for (var j=0; j<numbersToFind.length; j++) {
    input[999999 + j] = numbersToFind[j];
  }

  input.sort(function(num1, num2) {
    return num1 - num2;
  });

  var output = numbersToFind.map(function(number) {
    return input.indexOf(number);
  });

  return {
    input: {
      numbers: input,
      numbersToFind: numbersToFind
    },
    output: output
  };
};

module.exports = {
  load: load
};