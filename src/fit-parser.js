// vim: ts=2:sw=2:expandtab

import * as bin from './binary.js';

export default class FitParser {
  constructor(options = {}) {
    this.options = {
      speedUnit: options.speedUnit || 'm/s',
      lengthUnit: options.lengthUnit || 'm',
      temperatureUnit: options.temperatureUnit || 'celsius',
      elapsedRecordField: options.elapsedRecordField || false,
      mode: options.mode || 'list',
    };
  }

  decode(content) {
    const blob = new Uint8Array(bin.getArrayBuffer(content));
    if (blob.length < 12) {
      throw new TypeError('File to small to be a FIT file');
    }
    const headerLength = blob[0];
    if (headerLength !== 14 && headerLength !== 12) {
      throw new TypeError('Incorrect header size');
    }
    let fileTypeString = '';
    for (let i = 8; i < 12; i++) {
      fileTypeString += String.fromCharCode(blob[i]);
    }
    if (fileTypeString !== '.FIT') {
      throw new TypeError('Missing \'.FIT\' in header');
    }
    if (headerLength === 14) {
      const crcHeader = blob[12] + (blob[13] << 8);
      const crcHeaderCalc = bin.calculateCRC(blob, 0, 12);
      if (crcHeader !== crcHeaderCalc) {
        throw new Error('Header CRC mismatch');
      }
    }
    const dataLength = blob[4] + (blob[5] << 8) + (blob[6] << 16) + (blob[7] << 24);
    const crcStart = dataLength + headerLength;
    const crcFile = blob[crcStart] + (blob[crcStart + 1] << 8);
    const crcFileCalc = bin.calculateCRC(blob, headerLength === 12 ? 0 : headerLength, crcStart);
    if (crcFile !== crcFileCalc) {
      throw new Error('File CRC mismatch');
    }
    const fitObj = {};
    const sessions = [];
    const laps = [];
    const records = [];
    const events = [];
    const hrv = [];
    const devices = [];
    const applications = [];
    const fieldDescriptions = [];
    const dive_gases = [];
    const course_points = [];

    let tempLaps = [];
    let tempRecords = [];

    let loopIndex = headerLength;
    const messageTypes = [];
    const developerFields = [];

    const isModeCascade = this.options.mode === 'cascade';
    const isCascadeNeeded = isModeCascade || this.options.mode === 'both';

    let startDate, lastStopTimestamp;
    let pausedTime = 0;

    while (loopIndex < crcStart) {
      const {
        nextIndex,
        messageType,
        message
      } = bin.readRecord(blob, messageTypes, developerFields, loopIndex, this.options, startDate, pausedTime);
      loopIndex = nextIndex;
      switch (messageType) {
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
          if (message.event === 'timer') {
            if (message.event_type === 'stop_all') {
              lastStopTimestamp = message.timestamp;
            } else if (message.event_type === 'start' && lastStopTimestamp) {
              pausedTime += (message.timestamp - lastStopTimestamp) / 1000;
            }
          }
          events.push(message);
          break;
        case 'hrv':
          hrv.push(message);
          break;
        case 'record':
          if (!startDate) {
            startDate = message.timestamp;
            message.elapsed_time = 0;
            message.timer_time = 0;
          }
          records.push(message);
          if (isCascadeNeeded) {
            tempRecords.push(message);
          }
          break;
        case 'field_description':
          fieldDescriptions.push(message);
          break;
        case 'device_info':
          devices.push(message);
          break;
        case 'developer_data_id':
          applications.push(message);
          break;
        case 'dive_gas':
          dive_gases.push(message);
          break;
        case 'course_point':
          course_points.push(message);
          break;
        default:
          if (messageType !== '') {
            if (!fitObj[messageType]) {
                fitObj[messageType] = [];
            }
            fitObj[messageType].push(message);
          }
          break;
      }
    }
    if (isCascadeNeeded) {
      fitObj.activity = fitObj.activity || {};
      fitObj.activity.sessions = sessions;
      fitObj.activity.events = events;
      fitObj.activity.hrv = hrv;
    }
    if (!isModeCascade) {
      fitObj.sessions = sessions;
      fitObj.laps = laps;
      fitObj.records = records;
      fitObj.events = events;
      fitObj.device_infos = devices;
      fitObj.developer_data_ids = applications;
      fitObj.field_descriptions = fieldDescriptions;
      fitObj.hrv = hrv;
      fitObj.dive_gases = dive_gases;
      fitObj.course_points = course_points;
    }
    return fitObj;
  }


  encode(messages) {
    const headerBuf = new Uint8Array(14);  // 12 or 14, but 12 is legacy
    headerBuf[0] = 14;  // header size (always 14)
    const version_major = 1;
    const version_minor = 0;
    headerBuf[1] = version_major << 4 | version_minor;
    const profile_version_major = 20;
    const profile_version_minor = 96;
    const profile_version = profile_version_major * 100 + profile_version_minor;
    headerBuf.set(bin.uint16leBytes(profile_version), 2);
    // uint32 LE size minus header and crc
    headerBuf.set('.FIT'.split('').map(x => x.charCodeAt(0)), 8);
    // uint16 LE crc of header

    const msgDef = new MessageDefinition({
      id: 0,
      fields: {
        type: {defNum: 0,  size: 1, baseType: 'uint8'},
        manufacturer: {defNum: 1,  size: 2, baseType: 'uint16'},
        product: {defNum: 2,  size: 2, baseType: 'uint16'},
        serial: {defNum: 3,  size: 4, baseType: 'uint32z'},
        time_created: {defNum: 4,  size: 4, baseType: 'uint32'},
        number: {defNum: 5,  size: 2, baseType: 'uint16'},
        product_name: {defNum: 8,  size: 20, baseType: 'string'},
      }
    });
    const msgDefBuf = msgDef.encode();

    headerBuf.set(bin.uint32leBytes(msgDefBuf.byteLength), 4);
    const headerCrc = bin.calculateCRC(headerBuf, 0, 12);
    headerBuf.set(bin.uint16leBytes(headerCrc), 12);
    const xxx = new Uint8Array(4096);
    const crcBuf = new Uint8Array(2);
    const crc = bin.calculateCRC(msgDefBuf);
    crcBuf.set(bin.uint16leBytes(crc));
    xxx.set(headerBuf, 0);
    xxx.set(msgDefBuf, headerBuf.byteLength);
    xxx.set(crcBuf, headerBuf.byteLength + msgDefBuf.byteLength);
    return xxx.slice(0, headerBuf.byteLength + msgDefBuf.byteLength + crcBuf.byteLength);
  }
}


class MessageDefinition {
  constructor(options) {
    this.id = options.id;
    this.fields = options.fields;
  }

  encode() {
    const buf = new Uint8Array(4096); // precompute size requirements
    const definitionFlag = 0x40;
    buf[0] = this.id | definitionFlag;
    buf[1] = 0;  // reserved;
    buf[2] = 0;  // little endian (1 for big)
    buf[3] = this.id;
    buf[4] = this.fields.length;
    let offt = 5;
    for (const field of Object.values(this.fields)) {
      buf.set([field.defNum, field.size, bin.baseTypeValue(field.baseType)], offt);
      offt += 3;
      if (offt > buf.size) {
        throw new TypeError("mesg def overflow");
      }
    }
    return buf.slice(0, offt);
  }

  encodeValues(dict) {
    const buf = new Uint8Array(4096); // precompute size requirements
    let offt = 0;
    for (const [key, field] of Object.entries(this.fields)) {
      const invalid = bin.invalids[field.baseType];
      if (invalid === undefined) {
        throw new TypeError(`Invalid baseType: ${field.baseType}`);
      }
      const valArr = new invalid.type([invalid.value]);
      for (let i = 0; i < field.size; i += valArr.BYTES_PER_ELEMENT) {
        buf.set(valArr, offt + i);
      }
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        const value = dict[key];
        if (field.baseType === 'string') {
          if (value) {
            if (value.length >= field.size) {
              throw new Error(`String value too large for field: ${field.size}`);
            }
            buf.set(value.split('').map(x => x.charCodeAt(0)), offt);
          }
        } else if (field.baseType === 'string') {
          // XXX
        }
      }
      offt += field.size;
    }
    const size = offt
    for (const field of Object.values(this.fields)) {
      buf.set([field.defNum, field.size, bin.baseTypeValue(field.baseType)], offt);
      offt += 3;
      if (offt > buf.size) {
        throw new TypeError("mesg def overflow");
      }
    }
    return buf.slice(0, offt);
  }
}
