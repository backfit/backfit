import FitParser from './../dist/fit-parser.js';
import * as fs from 'fs';
import * as util from 'util';

const file = process.argv[2];
const readFile = util.promisify(fs.readFile)

async function parseFitFile(file) {
  // Read the file
  const content = await readFile(file)

  // Init the FitParser
  const fitParser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'm',
    temperatureUnit: 'celsius',
    elapsedRecordField: true,
    mode: 'list',
  });

  // Get the results
  try {
    const data = await fitParser.parse(content)
    console.log(data.records[0])
  } catch (e) {
    console.log(e)
  }
}

parseFitFile(process.argv[2])
