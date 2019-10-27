import { Message } from './types';
export declare function getMessageName(messageNum: number): string;
export declare function getFieldObject(fieldNum: number, messageNum: number): Message;
export interface Sdk {
    scConst: number;
    options: SdkOptions;
    messages: {
        [key: number]: MessageGroup;
    };
    types: {
        [key: string]: Type;
    };
}
export interface SdkOptions {
    speedUnits: {
        [unit: string]: UnitFields;
    };
    lengthUnits: {
        [unit: string]: UnitFields;
    };
    temperatureUnits: {
        [unit: string]: UnitFields;
    };
    [unitKey: string]: {
        [unit: string]: UnitFields;
    };
}
export interface UnitFields {
    multiplier: number;
    offset: number;
}
export interface MessageGroup {
    name: string;
    [key: number]: Message;
}
export interface Type {
    [key: number]: string | number;
}
