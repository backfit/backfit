const FitParser = require('./../dist/fit-parser.js').default;
const fs = require('fs');

const file = process.argv[2];

fs.readFile(file, function (err, content) {
  const fitParser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'm',
    temperatureUnit: 'celsius',
    elapsedRecordField: true,
    mode: 'list',
  });
  const data = fitParser.parse(content);
  console.log(JSON.stringify(data));
});
