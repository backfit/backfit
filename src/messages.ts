import { getMessageName, getFieldObject } from './sdk';
import { FitMessage } from './types';

export function getFitMessage(messageNum: number): FitMessage {
  return {
    name: getMessageName(messageNum),
    getAttributes: (fieldNum) => getFieldObject(fieldNum, messageNum),
  };
}

// TODO
export function getFitMessageBaseType(foo) {
  return foo;
}
