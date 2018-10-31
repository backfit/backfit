// tslint:disable:no-bitwise
// tslint:disable:no-console

import { calculateCyclicRedundancyCheck, getArrayBuffer, readRecord } from './binary';
import { UserOptions } from './userOptions';

export interface FitObj {
  activity: {
    events: {};
    sessions: {};
  };
  sessions: {};
  laps: {};
  records: {};
  events: {};

  [key: string]: any;
}

function EasyFit(
  content: Buffer,
  inoptions?: Partial<UserOptions>,
) {
  inoptions = inoptions || {};
  const options = {
    elapsedRecordField: inoptions.elapsedRecordField || false,
    force: inoptions.force || true,
    mode: inoptions.mode || 'list',
  };
  const blob = new Uint8Array(getArrayBuffer(content));

  console.debug('blob created');
  if (blob.length < 12) {
    console.warn('File to small to be a FIT file');
    if (!options.force) {
      return;
    }
  }

  const headerLength = blob[0];
  if (headerLength !== 14 && headerLength !== 12) {
    console.warn('Incorrect header size');
    if (!options.force) {
      return;
    }
  }

  let fileTypeString = '';
  for (let i = 8; i < 12; i++) {
    fileTypeString += String.fromCharCode(blob[i]);
  }
  if (fileTypeString !== '.FIT') {
    console.warn('Missing \'.FIT\' in header');
    if (!options.force) {
      return;
    }
  }

  if (headerLength === 14) {
    const crcHeader = blob[12] + (blob[13] << 8);

    console.debug('Start calculateCyclicRedundancyCheck');

    const crcHeaderCalc = calculateCyclicRedundancyCheck(blob, 0, 12);

    console.debug('calculateCyclicRedundancyCheck success');
    if (crcHeader !== crcHeaderCalc) {
      console.warn('Header CRC mismatch');
      // TODO: fix Header CRC check
      if (!options.force) {
        return;
      }
    }
  }
  const dataLength = blob[4] + (blob[5] << 8) + (blob[6] << 16) + (blob[7] << 24);
  const crcStart = dataLength + headerLength;
  const crcFile = blob[crcStart] + (blob[crcStart + 1] << 8);

  console.debug('calculateCyclicRedundancyCheck success');

  const crcFileCalc = calculateCyclicRedundancyCheck(blob, headerLength === 12 ? 0 : headerLength, crcStart);

  if (crcFile !== crcFileCalc) {
    // callback('File CRC mismatch', {});
    // TODO: fix File CRC check
    if (!options.force) {
      return;
    }
  }

  const fitObj: FitObj = {
    activity: {
      events: {},
      sessions: {},
    },
    events: {},
    laps: {},
    records: {},
    sessions: {},
  };
  const sessions = [];
  const laps = [];
  const records = [];
  const events = [];

  let tempLaps = [];
  let tempRecords = [];

  let loopIndex = headerLength;
  const messageTypes: any[] = [];

  const isModeCascade = options.mode === 'cascade';
  const isCascadeNeeded = isModeCascade || options.mode === 'both';

  let startDate: number | undefined;

  while (loopIndex < crcStart) {
    const record = readRecord(blob, messageTypes, loopIndex, options, startDate);
    const message = record.message;
    if (message) {
      loopIndex = record.nextIndex;
      switch (record.messageType) {
        case 'lap':
          if (isCascadeNeeded) {
            message.records = tempRecords;
            tempRecords = [];
            tempLaps.push(message);
          }
          laps.push(message);
          break;
        case 'session':
          if (isCascadeNeeded) {
            message.laps = tempLaps;
            tempLaps = [];
          }
          sessions.push(message);
          break;
        case 'event':
          events.push(message);
          break;
        case 'record':
          if (!startDate) {
            startDate = message.timestamp;
            message.elapsed_time = 0;
          }
          records.push(message);
          if (isCascadeNeeded) {
            tempRecords.push(message);
          }
          break;
        default:
          if (record.messageType !== '') {
            fitObj[record.messageType] = message;
          }
          break;
      }
    }
  }

  if (isCascadeNeeded) {
    fitObj.activity.sessions = sessions;
    fitObj.activity.events = events;
  }
  if (!isModeCascade) {
    fitObj.sessions = sessions;
    fitObj.laps = laps;
    fitObj.records = records;
    fitObj.events = events;
  }

  return fitObj;
}

export { EasyFit };
