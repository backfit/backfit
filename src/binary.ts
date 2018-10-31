// tslint:disable:no-bitwise

import DataType, { isInvalidValue } from './dataType';
import { Message, MyRecord } from './message';
import { MessageAttributes } from './messages';
import FIT from './options';
import { UserOptions } from './userOptions';

interface FDef {
    type: string;
    fDefNo: number;
    size: number;
    endianAbility: boolean;
    littleEndian: boolean;
    baseTypeNo: number;
    name: string;
    dataType: number;
}

export function getMessageName(messageNum: number): string {
    const message = FIT.messages[messageNum];
    return message ? message.name : '';
}

export function getFieldObject(fieldNum: number, messageNum: number): MessageAttributes | undefined {
    const message = FIT.messages[messageNum];
    if (message) {
        return message.messages[fieldNum];
    }
    return undefined;
}

export function addEndian(littleEndian: boolean, bytes: number[]) {
    let result = 0;
    if (!littleEndian) {
        bytes.reverse();
    }
    for (let i = 0; i < bytes.length; i++) {
        result += (bytes[i] << (i << 3)) >>> 0;
    }

    return result;
}

function readData(blob: Uint8Array, fDef: FDef, startIndex: number) {
    if (fDef.endianAbility) {
        const temp: number[] = [];
        for (let i = 0; i < fDef.size; i++) {
            temp.push(blob[startIndex + i]);
        }
        const uint32Rep = addEndian(fDef.littleEndian, temp);

        if (fDef.type === 'sint32') {
            return (uint32Rep >> 0);
        }

        return uint32Rep;
    }
    return blob[startIndex];
}

function formatByType(
    data: number, type: string, scale: number | undefined, offset: number | undefined,
): string | number | undefined {
    switch (type) {
        case 'sint32':
        case 'sint16':
            return data * FIT.scConst;
        case 'uint32':
        case 'uint16':
            return scale ? data / scale + (offset || 0) : data;
        default:
            if (FIT.types[type]) {
                const value = FIT.types[type][data];
                if (value) {
                    return value;
                }
            }
            return data;
    }
}

export interface MTypeDef {
    littleEndian: boolean;
    globalMessageNumber: number;
    numberOfFields: number;
    fieldDefs: FDef[];
}

export function readRecord(
    blob: Uint8Array,
    messageTypes: any[],
    startIndex: number,
    options: UserOptions,
    startDate: number | undefined,
): MyRecord {
    const recordHeader = blob[startIndex];
    const localMessageType = (recordHeader & 15);

    if ((recordHeader & 64) === 64) {
        // is definition message
        // startIndex + 1 is reserved

        const lEnd = blob[startIndex + 2] === 0;
        const mTypeDef: MTypeDef = {
            fieldDefs: [],
            globalMessageNumber: addEndian(lEnd, [blob[startIndex + 3], blob[startIndex + 4]]),
            littleEndian: lEnd,
            numberOfFields: blob[startIndex + 5],
        };

        for (let i = 0; i < mTypeDef.numberOfFields; i++) {
            const fDefIndex = startIndex + 6 + (i * 3);
            const baseType = blob[fDefIndex + 2];
            const messageAttributes = getFieldObject(blob[fDefIndex], mTypeDef.globalMessageNumber);

            if (messageAttributes) {
                const fDef: FDef = {
                    baseTypeNo: (baseType & 15),
                    dataType: baseType & 15,
                    endianAbility: (baseType & 128) === 128,
                    fDefNo: blob[fDefIndex],
                    littleEndian: lEnd,
                    name: messageAttributes.field,
                    size: blob[fDefIndex + 1],
                    type: messageAttributes.type,
                };

                mTypeDef.fieldDefs.push(fDef);
            }
        }
        messageTypes[localMessageType] = mTypeDef;

        const stuff: MyRecord = {
            messageType: 'fieldDescription',
            nextIndex: startIndex + 6 + (mTypeDef.numberOfFields * 3),
        };
        return stuff;
    }

    let messageType;

    if (messageTypes[localMessageType]) {
        messageType = messageTypes[localMessageType];
    } else {
        messageType = messageTypes[0];
    }

    // TODO: handle compressed header ((recordHeader & 128) == 128)

    // uncompressed header
    let messageSize = 0;
    let readDataFromIndex = startIndex + 1;
    const fields: Message = {};

    const messageName = getMessageName(messageType.globalMessageNumber);

    for (const fDef of messageType.fieldDefs.length) {
        const data = readData(blob, fDef, readDataFromIndex);

        if (!isInvalidValue(data, fDef.type)) {
            const attributes = getFieldObject(messageType.globalMessageNumber, fDef.fDefNo);
            if (attributes) {
                const { field, type, scale, offset } = attributes;
                if (field !== 'unknown' && field !== '' && field !== undefined) {
                    fields[field] = formatByType(data, type, scale, offset);
                }

                if (messageName === 'record' && options.elapsedRecordField) {
                    fields.elapsed_time = ((fields.timestamp || 0) - (startDate || 0)) / 1000;
                }
            }
        }

        readDataFromIndex += fDef.size;
        messageSize += fDef.size;
    }

    const result: MyRecord = {
        message: fields,
        messageType: messageName,
        nextIndex: startIndex + messageSize + 1,
    };

    return result;

}

export function getArrayBuffer(buffer: Buffer): ArrayBuffer {
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

export function calculateCyclicRedundancyCheck(blob: Uint8Array, start: number, end: number): number {
    const crcTable = [
        0x0000, 0xCC01, 0xD801, 0x1400, 0xF001, 0x3C00, 0x2800, 0xE401,
        0xA001, 0x6C00, 0x7800, 0xB401, 0x5000, 0x9C01, 0x8801, 0x4400,
    ];

    let crc = 0;
    for (let i = start; i < end; i++) {
        const byte = blob[i];
        let tmp = crcTable[crc & 0xF];
        crc = (crc >> 4) & 0x0FFF;
        crc = crc ^ tmp ^ crcTable[byte & 0xF];
        tmp = crcTable[crc & 0xF];
        crc = (crc >> 4) & 0x0FFF;
        crc = crc ^ tmp ^ crcTable[(byte >> 4) & 0xF];
    }

    return crc;
}
