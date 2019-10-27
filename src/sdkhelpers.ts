import { Message } from './types';
import { FITSDK } from './sdk';

export function getMessageName(messageNum: number): string {
  const message = FITSDK.messages[messageNum];
  return message ? message.name : '';
}

export function getFieldObject(fieldNum: number,
  messageNum: number): Message {
  const message = FITSDK.messages[messageNum];
  if (!message) {
    return {
      type: "",
      field: "",
    }
  }
  const fieldObj = <Message>message[fieldNum];
  if (!fieldObj) {
    return {
      type: "",
      field: "",
    }
  }
  return fieldObj;
}

export interface Sdk {
  scConst: number;
  options: SdkOptions;
  messages: { [key: number]: MessageGroup };
  types: { [key: string]: Type };
}

export interface SdkOptions {
  speedUnits: { [unit: string]: UnitFields };
  lengthUnits: { [unit: string]: UnitFields };
  temperatureUnits: { [unit: string]: UnitFields };
  [unitKey: string]: { [unit: string]: UnitFields };
}

export interface UnitFields {
  multiplier: number;
  offset: number;
}

export interface MessageGroup {
  name: string;
  [key: number]: Message
}

export interface Type {
  [key: number]: string|number;
}
