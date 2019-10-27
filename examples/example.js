var FitParser = require('./../lib/fit-parser.js').default;
var fs = require('fs');

var file = process.argv[2];

fs.readFile(file, function (err, content) {
  var fitParser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'm',
    temperatureUnit: 'celsius',
    elapsedRecordField: true,
    mode: 'list',
  });

  fitParser.parse(content)
    .then(function (data) {
      console.log(data.records[0]);
      // console.log(data);
    })
    .catch(function (err) {
      console.log(err);
    })
});

