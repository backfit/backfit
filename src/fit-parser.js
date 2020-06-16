// vim: ts=4:sw=4:expandtab

import * as bin from './binary.js';


export default class FitParser {
    constructor() {
        this.messages = [];
    }

    static decode(content) {
        const ab = bin.getArrayBuffer(content);
        const buf = new Uint8Array(ab);
        const dataView = new DataView(ab);
        if (buf.byteLength < 12) {
            throw new TypeError('File to small to be a FIT file');
        }
        const headerLength = dataView.getUint8(0);
        if (headerLength !== 14 && headerLength !== 12) {
            throw new TypeError('Incorrect header size');
        }
        let fileTypeString = '';
        for (let i = 8; i < 12; i++) {
            fileTypeString += String.fromCharCode(dataView.getUint8(i));
        }
        if (fileTypeString !== '.FIT') {
            throw new TypeError('Missing \'.FIT\' in header');
        }
        let hasCrcHeader;
        if (headerLength === 14) {
            const crcHeader = dataView.getUint16(12, /*LE*/ true);
            if (crcHeader) {
                hasCrcHeader = true;
                const crcHeaderCalc = bin.calculateCRC(buf, 0, 12);
                if (crcHeader !== crcHeaderCalc) {
                    throw new Error('Header CRC mismatch');
                }
            }
        }
        const dataLength = dataView.getUint32(4, /*LE*/ true);
        const dataEnd = dataLength + headerLength;
        const crcFile = dataView.getUint16(dataEnd, /*LE*/ true);
        const crcFileCalc = bin.calculateCRC(buf, hasCrcHeader ? headerLength : 0, dataEnd);
        if (crcFile !== crcFileCalc) {
            throw new Error('File CRC mismatch');
        }
        const instance = new this();
        instance._definitions = {};
        instance._devFields = {};
        let offt = headerLength;
        while (offt < dataEnd) {
            const rBuf = new Uint8Array(buf.buffer, buf.byteOffset + offt);
            const msg = bin.readMessage(rBuf, instance._definitions, instance._devFields);
            if (msg.type === 'data') {
                instance.messages.push(msg);
            }
            offt += msg.size;
        }
        return instance;
    }

    encode() {
        const headerBuf = new Uint8Array(14);
        headerBuf[0] = 14;  // header size;
        const version_major = 1;
        const version_minor = 0;
        headerBuf[1] = version_major << 4 | version_minor;
        const profile_version_major = 20;
        const profile_version_minor = 96;
        const profile_version = profile_version_major * 100 + profile_version_minor;
        headerBuf.set(bin.uint16leBytes(profile_version), 2);
        headerBuf.set('.FIT'.split('').map(x => x.charCodeAt(0)), 8);
        const dataBuf = bin.joinBuffers(this.messages.map((x, i) =>
            bin.writeMessageTuple(x, i, this._definitions, this._devFields)));
        headerBuf.set(bin.uint32leBytes(dataBuf.byteLength), 4);
        const headerCrc = bin.calculateCRC(headerBuf, 0, 12);
        headerBuf.set(bin.uint16leBytes(headerCrc), 12);
        const crcBuf = new Uint8Array(2);
        const crc = bin.calculateCRC(dataBuf);
        crcBuf.set(bin.uint16leBytes(crc));
        return bin.joinBuffers([headerBuf, dataBuf, crcBuf]);
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
