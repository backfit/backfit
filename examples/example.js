var BackFIT = require('./../lib/backfit.js').default;
var fs = require('fs');

var file = process.argv[2];

fs.readFile(file, function (err, content) {
  var backfit = new BackFIT({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'm',
    temperatureUnit: 'celsius',
    elapsedRecordField: true,
    mode: 'list',
  });

  // Get the results
  try {
    const data = backfit.parse(content);
    console.log(data.profileVersion);
    console.log(data.protocolVersion);
    console.log(data.records[0]);
  } catch (e) {
    console.log(e);
  }
});
