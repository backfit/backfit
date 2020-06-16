// vim: ts=4:sw=4:expandtab

import * as fit from './fit.js';

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
    const typedBuf = new fDef.baseType.TypedArray(fDef.size / fDef.baseType.size);
    const view = new DataView(buf.buffer, buf.byteOffset, fDef.size);
    const typeName = typedBuf.constructor.name.split('Array')[0];
    const isLittleEndian = fDef.endianAbility ? fDef.littleEndian : true; // XXX Not sure if we should default to true.
    for (let i = 0; i < typedBuf.length; i++) {
        // if (fDef.baseType.size > 1 && (!fDef.endianAbility || fDef.littleEndian)) { debugger; }
        typedBuf[i] = view[`get${typeName}`](i * typedBuf.BYTES_PER_ELEMENT, isLittleEndian);
    }
    return typedBuf;
}

function writeTypedData(data, fDef) {
    const typeName = fDef.baseType.TypedArray.name.split('Array')[0];
    const view = new DataView(new ArrayBuffer(fDef.size));
    const isLittleEndian = fDef.endianAbility ? fDef.littleEndian : true; // XXX Not sure if we should default to true.
    if (typeof data === 'bigint' || typeof data === 'number') {
        view[`set${typeName}`](0, data, isLittleEndian);
    } else if (ArrayBuffer.isView(data.length) && !(data instanceof DataView)) {
        for (let i = 0; i < data.length; i++) {
            view[`set${typeName}`](i * fDef.baseType.size, data[i], isLittleEndian);
        }
    } else {
        throw new TypeError(`Unsupported data type: ${data}`);
    }
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
}


function encodeTypedData(data, fDef, fields) {
    const type = fDef.attrs.type;
    const isArray = type.endsWith('_array');
    const rootType = isArray ? type.split('_array')[0] : type;
    let customType;
    try {
        getBaseTypeId(rootType);
    } catch(e) {
        if (!(e instanceof ReferenceError)) {
            throw e;
        }
        customType = fit.typesIndex[type];
        if (!customType) {
            throw new TypeError(`Unsupported type: ${type}`);
        }
    }
    function encode(x) {
        if (customType) {
            if (customType.encode) {
                return customType.encode(x, data, fields);
            } else if (customType.mask) {
                let value = x.value;
                for (const flag of x.flags) {
                    value |= customType.values[flag] || 0;
                }
                return value;
            } else {
                if (Object.prototype.hasOwnProperty.call(customType.values, x)) {
                    return customType.values[x];
                } else {
                    return x;
                }
            }
        } else {
            switch (rootType) {
                case 'enum':
                case 'byte':
                case 'sint8':
                case 'sint16':
                case 'sint32':
                case 'sint64':
                case 'uint8':
                case 'uint16':
                case 'uint32':
                case 'uint64':
                case 'uint8z':
                case 'uint16z':
                case 'uint32z':
                case 'uint64z':
                    return fDef.attrs.scale ? (x - fDef.attrs.offset) * fDef.attrs.scale : x;
                case 'string':
                    debugger;
                    return Uint8Array.from(data.split('').map(x => x.charCodeAt(0)));
                default:
                    throw new TypeError(`Unhandled root type: ${rootType}`);
            }
        }
    }
    return isArray ? data.map(encode) : encode(data);
}

function decodeTypedData(data, fDef, fields) {
    const type = fDef.attrs.type;
    const isArray = type.endsWith('_array');
    const rootType = isArray ? type.split('_array')[0] : type;
    let customType;
    try {
        getBaseTypeId(rootType);
    } catch(e) {
        if (!(e instanceof ReferenceError)) {
            throw e;
        }
        customType = fit.types[type];
        if (!customType) {
            throw new TypeError(`Unsupported type: ${type}`);
        }
    }
    function decode(x) {
        if (customType) {
            if (customType.decode) {
                return customType.decode(x, data, fields);
            } else if (customType.mask) {
                const result = {flags:[]};
                for (const [key, label] of Object.entries(customType)) {
                    const flag = Number(key);
                    if (isNaN(flag)) {
                        continue;
                    }
                    if ((x & flag) === flag) {
                        result.flags.push(label);
                    }
                }
                if (customType.mask) {
                    result.value = x & customType.mask;
                }
                return result;
            } else {
                if (Object.prototype.hasOwnProperty.call(customType, x)) {
                    return customType[x];
                } else {
                    return x;
                }
            }
        } else {
            switch (rootType) {
                case 'enum':
                case 'byte':
                case 'sint8':
                case 'sint16':
                case 'sint32':
                case 'sint64':
                case 'uint8':
                case 'uint16':
                case 'uint32':
                case 'uint64':
                case 'uint8z':
                case 'uint16z':
                case 'uint32z':
                case 'uint64z':
                    return fDef.attrs.scale ? x / fDef.attrs.scale + fDef.attrs.offset : x;
                case 'string':
                    return array2str(data);
                default:
                    throw new TypeError(`Unhandled root type: ${rootType}`);
            }
        }
    }
    return isArray ? data.map(decode) : decode(data[0]);
}

function isInvalidValue(data, type) {
    const bt = fit.getBaseType(getBaseTypeId(type));
    if (bt === undefined) {
        throw new TypeError(`Invalid type: ${type}`);
    }
    return bt.invalid === data;
}

export function writeMessageTuple(msg, localMessageType, definitions, devFields) {
    const buffers = [];
    const defView = new DataView(new ArrayBuffer(4096)); // XXX Do better size calcs first.
    const definitionFlag = 0x40;
    defView.setUint8(0, (localMessageType & 0xf) | definitionFlag);
    const littleEndian = msg.mDef.littleEndian;
    defView.setUint8(2, littleEndian ? 0 : 1);
    defView.setUint16(3, msg.mDef.globalMessageNumber, littleEndian);
    defView.setUint8(5, msg.mDef.fieldDefs.length);
    debugger;
    let offt = 6;
    for (const fDef of msg.mDef.fieldDefs) {
        if (fDef.isDevField) {
            throw new Error("XXX dev fields not supported yet");
        }
        defView.setUint8(offt++, fDef.fDefNum);
        defView.setUint8(offt++, fDef.size);
        defView.setUint8(offt++, fDef.baseTypeId);
    }
    buffers.push(new Uint8Array(defView.buffer, 0, offt));
    const dataHeader = new Uint8Array(1);
    dataHeader[0] = localMessageType & 0xf;
    buffers.push(dataHeader);
    for (const fDef of msg.mDef.fieldDefs) {
        const value = msg.fields[fDef.attrs.field];
        if (value == null) {
            throw new Error("Handle writting the invalid byte(s)"); // XXX
            //if (!isInvalidValue(typedDataArray[0], fDef.baseType.name)) {
            //    fields[fDef.attrs.field] = decodeTypedData(typedDataArray, fDef, fields);
            //}
        } else {
            const encodedData = encodeTypedData(value, fDef, msg.fields);
            buffers.push(writeTypedData(encodedData, fDef));
        }
    }
    return joinBuffers(buffers);
}

export function joinBuffers(buffers) {
    const size = buffers.reduce((acc, x) => acc + x.byteLength, 0);
    const fullBuf = new Uint8Array(size);
    let offt = 0;
    for (const x of buffers) {
        fullBuf.set(x, offt);
        offt += x.byteLength;
    }
    return fullBuf;
}

export function readMessage(buf, definitions, devFields) {
    const dataView = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const recordHeader = dataView.getUint8(0);
    const localMessageType = recordHeader & 0xf;
    const definitionFlag = 0x40;
    if ((recordHeader & definitionFlag) === definitionFlag) {
        return readDefinitionMessage(dataView, recordHeader, localMessageType, definitions, devFields);
    } else {
        return readDataMessage(dataView, recordHeader, localMessageType, definitions, devFields);
    }
}

function readDefinitionMessage(dataView, recordHeader, localMessageType, definitions, devFields) {
    const devDataFlag = 0x20;
    const hasDevData = (recordHeader & devDataFlag) === devDataFlag;
    const littleEndian = dataView.getUint8(2) === 0;
    const endianFlag = 0x80;
    const fieldCount = dataView.getUint8(5);
    const devFieldCount = hasDevData ?  dataView.getUint8(5 + (fieldCount * 3) + 1) : 0;
    const mTypeDef = {
        littleEndian,
        globalMessageNumber: dataView.getUint16(3, littleEndian),
        fieldCount: fieldCount + devFieldCount,
        fieldDefs: [],
    };
    const message = fit.messages[mTypeDef.globalMessageNumber];
    for (let i = 0; i < fieldCount; i++) {
        const fDefIndex = 6 + (i * 3);
        const fDefNum = dataView.getUint8(fDefIndex);
        const baseTypeId = dataView.getUint8(fDefIndex + 2);
        const baseType = fit.getBaseType(baseTypeId);
        let attrs = message && message[fDefNum];
        if (!attrs) {
            attrs = {
                field: `UNDOCUMENTED[${fDefNum}]`,
                type: baseType.name
            };
            console.warn(`Undocumented field: (${baseType.name}) ${message && message.name}[${fDefNum}]`); 
        }
        mTypeDef.fieldDefs.push({
            attrs,
            fDefNum,
            size: dataView.getUint8(fDefIndex + 1),
            endianAbility: (baseTypeId & endianFlag) === endianFlag,
            littleEndian,
            baseTypeId,
            baseType,
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
            attrs: {
                field: devDef.field_name,
                scale: devDef.scale,
                offset: devDef.offset,
                type: fit.types.fit_base_type[baseTypeId],
            },
            fDefNum,
            size,
            endianAbility: (baseTypeId & endianFlag) === endianFlag,
            littleEndian,
            baseTypeId,
            baseType: fit.getBaseType(baseTypeId),
            devDataIndex: devDataIndex,
            isDevField: true,
        });
    }
    definitions[localMessageType] = mTypeDef;
    const size = 6 + (mTypeDef.fieldCount * 3) + (hasDevData ? 1 : 0);
    //console.warn(`Read def msg: ${fieldCount} fields, ${devFieldCount} dev fields, ${size} bytes`);
    return {
        type: 'definition',
        message: mTypeDef,
        localMessageType,
        size,
    };
}

function readDataMessage(dataView, recordHeader, localMessageType, definitions, devFields) {
    const mDef = definitions[localMessageType] || definitions[0];
    const compressedFlag = 0x80;
    if ((recordHeader & compressedFlag) === compressedFlag) {
        // TODO: handle compressed header
        throw new TypeError("Compressed header not supported"); 
    }
    let offt = 1;
    let size = 1;
    const fields = {};
    const message = fit.messages[mDef.globalMessageNumber];
    if (!message) {
        console.warn(`Invalid message number: ${mDef.globalMessageNumber}`);
    }
    for (let i = 0; i < mDef.fieldDefs.length; i++) {
        const fDef = mDef.fieldDefs[i];
        const fBuf = new Uint8Array(dataView.buffer, dataView.byteOffset + offt, fDef.size);
        const typedDataArray = readTypedData(fBuf, fDef);
        if (!isInvalidValue(typedDataArray[0], fDef.baseType.name)) {
            fields[fDef.attrs.field] = decodeTypedData(typedDataArray, fDef, fields);
        }
        offt += fDef.size;
        size += fDef.size;
    }
    if (message && message.name === 'field_description') {
        devFields[fields.developer_data_index] = devFields[fields.developer_data_index] || {};
        devFields[fields.developer_data_index][fields.field_definition_number] = fields;
    }
    return {
        type: 'data',
        size,
        message,
        mDef,
        localMessageType,
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
    for (const [id, label] of Object.entries(fit.types.fit_base_type)) {
        if (label === key) {
            return id;
        }
    }
    throw new ReferenceError(`Unknown base type: ${key}`);
}
