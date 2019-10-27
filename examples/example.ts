import BackFIT from './../dist/backfit.js';
import * as fs from 'fs';
import * as util from 'util';

const file = process.argv[2];
const readFile = util.promisify(fs.readFile)

async function parseFitFile(file) {
  // Read the file
  const content = await readFile(file)

  // Init the FitParser
const backfit = new BackFIT({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'm',
    temperatureUnit: 'celsius',
    elapsedRecordField: true,
    mode: 'list',
  });

  // Get the results
  try {
    const data = await backfit.parse(content)
    console.log(data.records[0])
  } catch (e) {
    console.log(e)
  }
}

parseFitFile(process.argv[2])
