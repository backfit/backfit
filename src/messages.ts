import { getMessageName, getFieldObject } from './sdkhelpers';
import { FitMessage } from './types';

export function getFitMessage(messageNum: number): FitMessage {
  return {
    name: getMessageName(messageNum),
    getAttributes: (fieldNum) => getFieldObject(fieldNum, messageNum),
  };
}

// TODO
export function getFitMessageBaseType(foo: any) {
  return foo;
}
