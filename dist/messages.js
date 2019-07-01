"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fit_1 = require("./fit");
function getFitMessage(messageNum) {
    return {
        name: fit_1.getMessageName(messageNum),
        getAttributes: function (fieldNum) { return fit_1.getFieldObject(fieldNum, messageNum); },
    };
}
exports.getFitMessage = getFitMessage;
// TODO
function getFitMessageBaseType(foo) {
    return foo;
}
exports.getFitMessageBaseType = getFitMessageBaseType;
//# sourceMappingURL=messages.js.map