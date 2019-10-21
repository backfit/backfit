/// <reference types="node" />
import { MessageTypes, DeveloperFields, FitParserOptions, ReadResult } from './types';
export declare function addEndian(littleEndian: boolean, bytes: number[]): number;
export declare function readRecord(blob: Uint8Array, messageTypes: MessageTypes, developerFields: DeveloperFields, startIndex: number, options: FitParserOptions, startDate: number, pausedTime: number): ReadResult;
export declare function getArrayBuffer(buffer: ArrayBuffer | Buffer): ArrayBuffer;
export declare function calculateCRC(blob: Uint8Array, start: number, end: number): number;
