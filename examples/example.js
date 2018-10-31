let EasyFit = require('./../dist/main.bundle.js');
let fs = require('fs');

fs.readFile('./examples/example.fit', function (err, content) {
  if (err) {
    console.error(err);
  }
  else {
    console.log('success reading file');

    const options = {
      force: true,
      speedUnit: 'km/h',
      lengthUnit: 'm',
      temperatureUnit: 'celsius',
      elapsedRecordField: true,
      mode: 'list',
    };

    const value = EasyFit.EasyFit(content, options);
    console.log(value);
  }
});
