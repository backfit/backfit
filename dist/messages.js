'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getFitMessage = getFitMessage;
exports.getFitMessageBaseType = getFitMessageBaseType;

var _sdk = require('./sdk');

function getFitMessage(messageNum) {
    return {
        name: (0, _sdk.getMessageName)(messageNum),
        getAttributes: function getAttributes(fieldNum) {
            return (0, _sdk.getFieldObject)(fieldNum, messageNum);
        }
    };
}
// TODO
function getFitMessageBaseType(foo) {
    return foo;
}