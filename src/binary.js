// vim: ts=4:sw=4:expandtab

import { FIT } from './fit.js';
import { getFitMessage, getFitMessageBaseType } from './messages.js';

export function addEndian(littleEndian, bytes) {
    let result = 0;
    if (!littleEndian) bytes.reverse();
    for (let i = 0; i < bytes.length; i++) {
        result += (bytes[i] << (i << 3)) >>> 0;
    }
    return result;
}


function array2str(arr) {
    const out = [];
    for (const x of arr) {
        if (!x) {
            break;  // null terminated
        }
        out.push(String.fromCharCode(x));
    }
    return out.join('');
}


function readTypedData(buf, fDef) {
    //const typedBuf = new fDef.baseType.TypedArray(buf.buffer, buf.byteOffset, fDef.size / fDef.baseType.size);
    const typedBuf = new fDef.baseType.TypedArray(fDef.size / fDef.baseType.size);
    const view = new DataView(buf.buffer, buf.byteOffset, fDef.size);
    const typeName = typedBuf.constructor.name.split('Array')[0];
    const isLittleEndian = fDef.endianAbility ? fDef.littleEndian : true; // XXX Not sure if we should default to true.
    for (let i = 0; i < typedBuf.length; i++) {
        if (fDef.baseType.size > 1 && (!fDef.endianAbility || fDef.littleEndian)) { debugger; }
        typedBuf[i] = view[`get${typeName}`](i * typedBuf.BYTES_PER_ELEMENT, isLittleEndian);
    }
    return typedBuf;

    if (fDef.endianAbility) {
        const dataView = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        switch (fDef.type) {
            case 'sint16':
                return dataView.getInt16(0, fDef.littleEndian);
            case 'uint16':
            case 'uint16z':
                return dataView.getUint16(0, fDef.littleEndian);
            case 'sint32':
                return dataView.getInt32(0, fDef.littleEndian);
            case 'uint32':
            case 'uint32z':
                return dataView.getUint32(0, fDef.littleEndian);
            case 'float32':
                return dataView.getFloat32(0, fDef.littleEndian);
            case 'float64':
                return dataView.getFloat64(0, fDef.littleEndian);
            case 'uint32_array': {
                const array32 = [];
                for (let i = 0; i < fDef.size; i += 4) {
                    array32.push(dataView.getUint32(i, fDef.littleEndian));
                }
                return array32;
            }
            case 'uint16_array': {
                const array = [];
                for (let i = 0; i < fDef.size; i += 2) {
                    array.push(dataView.getUint16(i, fDef.littleEndian));
                }
                return array;
            }
        }
        debugger;
        // Who what now?
        return addEndian(fDef.littleEndian, buf);
    }
    if (fDef.type === 'string') {
        return array2str(buf);
    }
    if (fDef.type === 'byte_array') {
        return buf;
        //debugger;
        //const temp = [];
        //for (let i = 0; i < fDef.size; i++) {
        //    temp.push(buf[startIndex + i]);
        //}
        //return temp;
    }

    // who what now? XXX
    debugger;
    return buf[0];  // XXX no, just no
}

function decodeTypedData(array, type, scale, offset) {
    const isArray = type.endsWith('_array');
    const rootType = isArray ? type.split('_array')[0] : type;
    let customType;
    try {
        getBaseTypeId(rootType);
    } catch(e) {
        if (!(e instanceof ReferenceError)) {
            throw e;
        }
        customType = FIT.types[type];
        if (!customType) {
            throw new TypeError(`Unsupported type: ${type}`);
        }
    }
    function decode(x) {
        if (customType) {
            if (customType.decode) {
                return customType.decode(x, array);
            } else if (customType.mask || customType.type.endsWith('z')) {
                const result = {flags:[]};
                for (const [key, label] of Object.entries(customType)) {
                    const flag = Number(key);
                    if (isNaN(flag)) {
                        continue;
                    }
                    if (x & flag === flag) {
                        result.flags.push(label);
                    }
                }
                if (customType.mask) {
                    result.value = x & customType.mask;
                }
                return result;
            } else {
                if (!Object.prototype.hasOwnProperty.call(customType, x)) {
                    throw new TypeError(`Unexpected custom type key: ${x} for ${type}`);
                }
                return customType[x];
            }
        } else {
            switch (rootType) {
                case 'sint32':
                case 'uint8':
                case 'sint16':
                case 'uint32':
                case 'uint16':
                    return scale ? x / scale + offset : x;
                case 'string':
                    return array2str(array);
                case 'byte_array':
                    return array;
                default:
                    throw new TypeError(`Unhandled root type: ${rootType}`);
            }
        }
    }
    return isArray ? array.map(decode) : decode(array[0]);
}

function isInvalidValue(data, type) {
    const bt = getFitMessageBaseType(getBaseTypeId(type));
    if (bt === undefined) {
        throw new TypeError(`Invalid type: ${type}`);
    }
    return bt.invalid === data;
}

export function readRecord(buf, messageTypes, devFields) {
    const dataView = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const recordHeader = dataView.getUint8(0);
    const localMessageType = recordHeader & 0xf;
    const definitionFlag = 0x40;
    if ((recordHeader & definitionFlag) === definitionFlag) {
        return readDefinitionMessage(dataView, recordHeader, localMessageType, messageTypes, devFields);
    } else {
        return readDataMessage(dataView, recordHeader, localMessageType, messageTypes, devFields);
    }
}

function readDefinitionMessage(dataView, recordHeader, localMessageType, messageTypes, devFields) {
    const devDataFlag = 0x20;
    const hasDevData = (recordHeader & devDataFlag) === devDataFlag;
    const littleEndian = dataView.getUint8(2) === 0;
    const endianFlag = 0x80;
    const fieldCount = dataView.getUint8(5);
    const devFieldCount = hasDevData ?
        dataView.getUint8(5 + (fieldCount * 3) + 1) : 0;
    const mTypeDef = {
        littleEndian,
        globalMessageNumber: dataView.getUint16(3, littleEndian),
        fieldCount: fieldCount + devFieldCount,
        fieldDefs: [],
    };
    const message = getFitMessage(mTypeDef.globalMessageNumber);
    for (let i = 0; i < fieldCount; i++) {
        const fDefIndex = 6 + (i * 3);
        const fDefNum = dataView.getUint8(fDefIndex);
        const {field, type} = message.getAttributes(fDefNum);
        const baseTypeId = dataView.getUint8(fDefIndex + 2);
        mTypeDef.fieldDefs.push({
            name: field,
            type,
            fDefNum,
            size: dataView.getUint8(fDefIndex + 1),
            endianAbility: (baseTypeId & endianFlag) === endianFlag,
            littleEndian,
            baseTypeId,
            baseType: getFitMessageBaseType(baseTypeId),
        });
    }
    for (let i = 0; i < devFieldCount; i++) {
        const fDefIndex = 6 + (fieldCount * 3) + 1 + (i * 3);
        const fDefNum = dataView.getUint8(fDefIndex);
        const size = dataView.getUint8(fDefIndex + 1);
        const devDataIndex = dataView.getUint8(fDefIndex + 2);
        const devDef = devFields[devDataIndex][fDefNum];
        const baseTypeId = devDef.fit_base_type_id;
        mTypeDef.fieldDefs.push({
            name: devDef.field_name,
            type: FIT.types.fit_base_type[baseTypeId],
            fDefNum,
            size,
            endianAbility: (baseTypeId & endianFlag) === endianFlag,
            littleEndian,
            baseTypeId,
            baseType: getFitMessageBaseType(baseTypeId),
            scale: devDef.scale || 1,
            offset: devDef.offset || 0,
            devDataIndex: devDataIndex,
            isDevField: true,
        });
    }
    messageTypes[localMessageType] = mTypeDef;
    const size = 6 + (mTypeDef.fieldCount * 3) + (hasDevData ? 1 : 0);
    console.warn(`Read def msg: ${fieldCount} fields, ${devFieldCount} dev fields, ${size} bytes`);
    return {
        messageType: 'definition',
        size,
    };
}

function readDataMessage(dataView, recordHeader, localMessageType, messageTypes, devFields) {
    const messageType = messageTypes[localMessageType] || messageTypes[0];
    const compressedFlag = 0x80;
    if ((recordHeader & compressedFlag) === compressedFlag) {
        // TODO: handle compressed header
        throw new TypeError("Compressed header not supported"); 
    }
    let offt = 1;
    let size = 1;
    const fields = {};
    const message = getFitMessage(messageType.globalMessageNumber);
    for (let i = 0; i < messageType.fieldDefs.length; i++) {
        const fDef = messageType.fieldDefs[i];
        const fBuf = new Uint8Array(dataView.buffer, dataView.byteOffset + offt, fDef.size);
        const typedDataArray = readTypedData(fBuf, fDef);
        if (!isInvalidValue(typedDataArray[0], fDef.baseType.name)) {
            if (fDef.isDevField) {
                const type =  fDef.type;
                const scale = fDef.scale;
                const offset = fDef.offset;
                fields[fDef.name] = decodeTypedData(typedDataArray, type, scale, offset);
            } else {
                const {field, type, scale, offset} = message.getAttributes(fDef.fDefNum);
                fields[field] = decodeTypedData(typedDataArray, type, scale, offset);
            }
        }
        offt += fDef.size;
        size += fDef.size;
    }
    if (message.name === 'field_description') {
        devFields[fields.developer_data_index] = devFields[fields.developer_data_index] || [];
        devFields[fields.developer_data_index][fields.field_definition_number] = fields;
    }
    console.warn(`Read data msg: ${message.name}, ${messageType.fieldDefs.length} fields, ${size} bytes`, fields);
    return {
        messageType: 'data',
        size,
        name: message.name,
        fields,
    };
}

export function getArrayBuffer(buffer) {
    if (buffer instanceof ArrayBuffer) {
        return buffer;
    }
    const ab = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

export function calculateCRC(buf, start, end) {
    const crcTable = [
        0x0000, 0xCC01, 0xD801, 0x1400, 0xF001, 0x3C00, 0x2800, 0xE401,
        0xA001, 0x6C00, 0x7800, 0xB401, 0x5000, 0x9C01, 0x8801, 0x4400,
    ];

    let crc = 0;
    for (let i = (start || 0); i < (end || buf.length); i++) {
        const byte = buf[i];
        let tmp = crcTable[crc & 0xF];
        crc = (crc >> 4) & 0x0FFF;
        crc = crc ^ tmp ^ crcTable[byte & 0xF];
        tmp = crcTable[crc & 0xF];
        crc = (crc >> 4) & 0x0FFF;
        crc = crc ^ tmp ^ crcTable[(byte >> 4) & 0xF];
    }

    return crc;
}

export function leBytes(value, TypedArray) {
    return new Uint8Array(new TypedArray([value]).buffer);
}

export function uint32leBytes(value) {
    return leBytes(value, Uint32Array);
}

export function uint16leBytes(value) {
    return leBytes(value, Uint16Array);
}

export function getBaseTypeId(key) {
    for (const [id, label] of Object.entries(FIT.types.fit_base_type)) {
        if (label === key) {
            return id;
        }
    }
    throw new ReferenceError(`Unknown base type: ${key}`);
}
