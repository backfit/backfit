import { getMessageName, getFieldObject, FIT } from './fit.js';

export function getFitMessage(messageNum) {
    return {
        name: getMessageName(messageNum),
        getAttributes: fieldNum => getFieldObject(fieldNum, messageNum),
    };
}

export function getFitMessageBaseType(baseType) {
    return FIT.baseTypes[baseType & 0x1f];
}
