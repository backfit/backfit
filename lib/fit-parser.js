"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("core-js/stable");

require("regenerator-runtime/runtime");

var _binary = require("./binary");

var _types = require("./types");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FitParser =
/*#__PURE__*/
function () {
  function FitParser() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

    _classCallCheck(this, FitParser);

    _defineProperty(this, "options", {
      force: true,
      speedUnit: 'm/s',
      lengthUnit: 'm',
      temperatureUnit: 'celsius',
      elapsedRecordField: false,
      mode: 'list'
    });

    if (options) {
      this.options = {
        force: options.force != null ? options.force : true,
        speedUnit: options.speedUnit || 'm/s',
        lengthUnit: options.lengthUnit || 'm',
        temperatureUnit: options.temperatureUnit || 'celsius',
        elapsedRecordField: options.elapsedRecordField || false,
        mode: options.mode || 'list'
      };
    }
  }

  _createClass(FitParser, [{
    key: "parse",
    value: function () {
      var _parse = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(content) {
        var blob, headerLength, fileTypeString, i, crcHeader, crcHeaderCalc, dataLength, crcStart, crcFile, crcFileCalc, fitObj, sessions, laps, records, events, hrv, devices, applications, fieldDescriptions, dive_gases, course_points, tempLaps, tempRecords, loopIndex, messageTypes, developerFields, isModeCascade, isCascadeNeeded, startDate, lastStopTimestamp, pausedTime, _readRecord, nextIndex, messageType, message;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                blob = new Uint8Array((0, _binary.getArrayBuffer)(content));

                if (!(blob.length < 12)) {
                  _context.next = 5;
                  break;
                }

                throw Error('File to small to be a FIT file');

              case 5:
                headerLength = blob[0];

                if (!(headerLength !== 14 && headerLength !== 12)) {
                  _context.next = 10;
                  break;
                }

                throw Error('Incorrect header size');

              case 10:
                fileTypeString = '';

                for (i = 8; i < 12; i++) {
                  fileTypeString += String.fromCharCode(blob[i]);
                }

                if (!(fileTypeString !== '.FIT')) {
                  _context.next = 16;
                  break;
                }

                throw Error('Missing \'.FIT\' in header');

              case 16:
                if (!(headerLength === 14)) {
                  _context.next = 22;
                  break;
                }

                crcHeader = blob[12] + (blob[13] << 8);
                crcHeaderCalc = (0, _binary.calculateCRC)(blob, 0, 12);

                if (!(crcHeader !== crcHeaderCalc)) {
                  _context.next = 22;
                  break;
                }

                if (this.options.force) {
                  _context.next = 22;
                  break;
                }

                return _context.abrupt("return");

              case 22:
                dataLength = blob[4] + (blob[5] << 8) + (blob[6] << 16) + (blob[7] << 24);
                crcStart = dataLength + headerLength;
                crcFile = blob[crcStart] + (blob[crcStart + 1] << 8);
                crcFileCalc = (0, _binary.calculateCRC)(blob, headerLength === 12 ? 0 : headerLength, crcStart);

                if (!(crcFile !== crcFileCalc)) {
                  _context.next = 29;
                  break;
                }

                if (this.options.force) {
                  _context.next = 29;
                  break;
                }

                return _context.abrupt("return");

              case 29:
                fitObj = {};
                sessions = [];
                laps = [];
                records = [];
                events = [];
                hrv = [];
                devices = [];
                applications = [];
                fieldDescriptions = [];
                dive_gases = [];
                course_points = [];
                tempLaps = [];
                tempRecords = [];
                loopIndex = headerLength;
                messageTypes = _types.MessageTypes;
                developerFields = [];
                isModeCascade = this.options.mode === 'cascade';
                isCascadeNeeded = isModeCascade || this.options.mode === 'both';
                pausedTime = 0;

              case 48:
                if (!(loopIndex < crcStart)) {
                  _context.next = 83;
                  break;
                }

                _readRecord = (0, _binary.readRecord)(blob, messageTypes, developerFields, loopIndex, this.options, startDate, pausedTime), nextIndex = _readRecord.nextIndex, messageType = _readRecord.messageType, message = _readRecord.message;
                loopIndex = nextIndex;
                _context.t0 = messageType;
                _context.next = _context.t0 === 'lap' ? 54 : _context.t0 === 'session' ? 57 : _context.t0 === 'event' ? 60 : _context.t0 === 'hrv' ? 63 : _context.t0 === 'record' ? 65 : _context.t0 === 'field_description' ? 69 : _context.t0 === 'device_info' ? 71 : _context.t0 === 'developer_data_id' ? 73 : _context.t0 === 'dive_gas' ? 75 : _context.t0 === 'course_point' ? 77 : 79;
                break;

              case 54:
                if (isCascadeNeeded) {
                  message.records = tempRecords;
                  tempRecords = [];
                  tempLaps.push(message);
                }

                laps.push(message);
                return _context.abrupt("break", 81);

              case 57:
                if (isCascadeNeeded) {
                  message.laps = tempLaps;
                  tempLaps = [];
                }

                sessions.push(message);
                return _context.abrupt("break", 81);

              case 60:
                if (message.event === 'timer') {
                  if (message.event_type === 'stop_all') {
                    lastStopTimestamp = message.timestamp;
                  } else if (message.event_type === 'start' && lastStopTimestamp) {
                    pausedTime += (message.timestamp - lastStopTimestamp) / 1000;
                  }
                }

                events.push(message);
                return _context.abrupt("break", 81);

              case 63:
                hrv.push(message);
                return _context.abrupt("break", 81);

              case 65:
                if (!startDate) {
                  startDate = message.timestamp;
                  message.elapsed_time = 0;
                  message.timer_time = 0;
                }

                records.push(message);

                if (isCascadeNeeded) {
                  tempRecords.push(message);
                }

                return _context.abrupt("break", 81);

              case 69:
                fieldDescriptions.push(message);
                return _context.abrupt("break", 81);

              case 71:
                devices.push(message);
                return _context.abrupt("break", 81);

              case 73:
                applications.push(message);
                return _context.abrupt("break", 81);

              case 75:
                dive_gases.push(message);
                return _context.abrupt("break", 81);

              case 77:
                course_points.push(message);
                return _context.abrupt("break", 81);

              case 79:
                if (messageType !== '') {
                  fitObj[messageType] = message;
                }

                return _context.abrupt("break", 81);

              case 81:
                _context.next = 48;
                break;

              case 83:
                if (isCascadeNeeded) {
                  fitObj.activity = fitObj.activity || null;
                  fitObj.activity.sessions = sessions;
                  fitObj.activity.events = events;
                  fitObj.activity.hrv = hrv;
                }

                if (!isModeCascade) {
                  fitObj.sessions = sessions;
                  fitObj.laps = laps;
                  fitObj.records = records;
                  fitObj.events = events;
                  fitObj.device_infos = devices;
                  fitObj.developer_data_ids = applications;
                  fitObj.field_descriptions = fieldDescriptions;
                  fitObj.hrv = hrv;
                  fitObj.dive_gases = dive_gases;
                  fitObj.course_points = course_points;
                }

                _context.next = 87;
                return fitObj;

              case 87:
                return _context.abrupt("return", _context.sent);

              case 88:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function parse(_x) {
        return _parse.apply(this, arguments);
      }

      return parse;
    }()
  }]);

  return FitParser;
}();

exports["default"] = FitParser;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9maXQtcGFyc2VyLnRzIl0sIm5hbWVzIjpbIkZpdFBhcnNlciIsIm9wdGlvbnMiLCJ1bmRlZmluZWQiLCJmb3JjZSIsInNwZWVkVW5pdCIsImxlbmd0aFVuaXQiLCJ0ZW1wZXJhdHVyZVVuaXQiLCJlbGFwc2VkUmVjb3JkRmllbGQiLCJtb2RlIiwiY29udGVudCIsImJsb2IiLCJVaW50OEFycmF5IiwibGVuZ3RoIiwiRXJyb3IiLCJoZWFkZXJMZW5ndGgiLCJmaWxlVHlwZVN0cmluZyIsImkiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJjcmNIZWFkZXIiLCJjcmNIZWFkZXJDYWxjIiwiZGF0YUxlbmd0aCIsImNyY1N0YXJ0IiwiY3JjRmlsZSIsImNyY0ZpbGVDYWxjIiwiZml0T2JqIiwic2Vzc2lvbnMiLCJsYXBzIiwicmVjb3JkcyIsImV2ZW50cyIsImhydiIsImRldmljZXMiLCJhcHBsaWNhdGlvbnMiLCJmaWVsZERlc2NyaXB0aW9ucyIsImRpdmVfZ2FzZXMiLCJjb3Vyc2VfcG9pbnRzIiwidGVtcExhcHMiLCJ0ZW1wUmVjb3JkcyIsImxvb3BJbmRleCIsIm1lc3NhZ2VUeXBlcyIsIk1lc3NhZ2VUeXBlcyIsImRldmVsb3BlckZpZWxkcyIsImlzTW9kZUNhc2NhZGUiLCJpc0Nhc2NhZGVOZWVkZWQiLCJwYXVzZWRUaW1lIiwic3RhcnREYXRlIiwibmV4dEluZGV4IiwibWVzc2FnZVR5cGUiLCJtZXNzYWdlIiwicHVzaCIsImV2ZW50IiwiZXZlbnRfdHlwZSIsImxhc3RTdG9wVGltZXN0YW1wIiwidGltZXN0YW1wIiwiZWxhcHNlZF90aW1lIiwidGltZXJfdGltZSIsImFjdGl2aXR5IiwiZGV2aWNlX2luZm9zIiwiZGV2ZWxvcGVyX2RhdGFfaWRzIiwiZmllbGRfZGVzY3JpcHRpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0lBR3FCQSxTOzs7QUFXbkIsdUJBQW1EO0FBQUEs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UixrQkFBQUEsTUFBTSxDQUFDSyxHQUFQLEdBQWFBLEdBQWI7QUFDQUwsa0JBQUFBLE1BQU0sQ0FBQ1MsVUFBUCxHQUFvQkEsVUFBcEI7QUFDQVQsa0JBQUFBLE1BQU0sQ0FBQ1UsYUFBUCxHQUF1QkEsYUFBdkI7QUFDRDs7O3VCQUVZVixNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwiY29yZS1qcy9zdGFibGVcIjtcbmltcG9ydCBcInJlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZVwiO1xuaW1wb3J0IHsgZ2V0QXJyYXlCdWZmZXIsIGNhbGN1bGF0ZUNSQywgcmVhZFJlY29yZCB9IGZyb20gJy4vYmluYXJ5JztcbmltcG9ydCB7IERldmVsb3BlckZpZWxkcywgRml0UGFyc2VyT3B0aW9ucyxcbiAgRml0UGFyc2VyUmVzdWx0LCBNZXNzYWdlVHlwZXMgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRml0UGFyc2VyIHtcblxuICBvcHRpb25zOiBGaXRQYXJzZXJPcHRpb25zID0ge1xuICAgIGZvcmNlOiB0cnVlLFxuICAgIHNwZWVkVW5pdDogJ20vcycsXG4gICAgbGVuZ3RoVW5pdDogJ20nLFxuICAgIHRlbXBlcmF0dXJlVW5pdDogJ2NlbHNpdXMnLFxuICAgIGVsYXBzZWRSZWNvcmRGaWVsZDogZmFsc2UsXG4gICAgbW9kZTogJ2xpc3QnLFxuICB9XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogRml0UGFyc2VyT3B0aW9ucyA9IHVuZGVmaW5lZCkge1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgIGZvcmNlOiBvcHRpb25zLmZvcmNlICE9IG51bGwgPyBvcHRpb25zLmZvcmNlIDogdHJ1ZSxcbiAgICAgICAgc3BlZWRVbml0OiBvcHRpb25zLnNwZWVkVW5pdCB8fCAnbS9zJyxcbiAgICAgICAgbGVuZ3RoVW5pdDogb3B0aW9ucy5sZW5ndGhVbml0IHx8ICdtJyxcbiAgICAgICAgdGVtcGVyYXR1cmVVbml0OiBvcHRpb25zLnRlbXBlcmF0dXJlVW5pdCB8fCAnY2Vsc2l1cycsXG4gICAgICAgIGVsYXBzZWRSZWNvcmRGaWVsZDogb3B0aW9ucy5lbGFwc2VkUmVjb3JkRmllbGQgfHwgZmFsc2UsXG4gICAgICAgIG1vZGU6IG9wdGlvbnMubW9kZSB8fCAnbGlzdCcsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHBhcnNlKGNvbnRlbnQ6IEJ1ZmZlcik6IFByb21pc2U8Rml0UGFyc2VyUmVzdWx0PiB7XG4gICAgY29uc3QgYmxvYiA9IG5ldyBVaW50OEFycmF5KGdldEFycmF5QnVmZmVyKGNvbnRlbnQpKTtcblxuICAgIGlmIChibG9iLmxlbmd0aCA8IDEyKSB7XG4gICAgICB0aHJvdyBFcnJvcignRmlsZSB0byBzbWFsbCB0byBiZSBhIEZJVCBmaWxlJyk7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5mb3JjZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVyTGVuZ3RoID0gYmxvYlswXTtcbiAgICBpZiAoaGVhZGVyTGVuZ3RoICE9PSAxNCAmJiBoZWFkZXJMZW5ndGggIT09IDEyKSB7XG4gICAgICB0aHJvdyBFcnJvcignSW5jb3JyZWN0IGhlYWRlciBzaXplJyk7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5mb3JjZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGZpbGVUeXBlU3RyaW5nID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDg7IGkgPCAxMjsgaSsrKSB7XG4gICAgICBmaWxlVHlwZVN0cmluZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJsb2JbaV0pO1xuICAgIH1cbiAgICBpZiAoZmlsZVR5cGVTdHJpbmcgIT09ICcuRklUJykge1xuICAgICAgdGhyb3cgRXJyb3IoJ01pc3NpbmcgXFwnLkZJVFxcJyBpbiBoZWFkZXInKTtcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmZvcmNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaGVhZGVyTGVuZ3RoID09PSAxNCkge1xuICAgICAgY29uc3QgY3JjSGVhZGVyID0gYmxvYlsxMl0gKyAoYmxvYlsxM10gPDwgOCk7XG4gICAgICBjb25zdCBjcmNIZWFkZXJDYWxjID0gY2FsY3VsYXRlQ1JDKGJsb2IsIDAsIDEyKTtcbiAgICAgIGlmIChjcmNIZWFkZXIgIT09IGNyY0hlYWRlckNhbGMpIHtcbiAgICAgICAgLy8gdGhyb3cgRXJyb3IoJ0hlYWRlciBDUkMgbWlzbWF0Y2gnKTtcbiAgICAgICAgLy8gVE9ETzogZml4IEhlYWRlciBDUkMgY2hlY2tcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZm9yY2UpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZGF0YUxlbmd0aCA9IGJsb2JbNF0gKyAoYmxvYls1XSA8PCA4KSArIChibG9iWzZdIDw8IDE2KSArIChibG9iWzddIDw8IDI0KTtcbiAgICBjb25zdCBjcmNTdGFydCA9IGRhdGFMZW5ndGggKyBoZWFkZXJMZW5ndGg7XG4gICAgY29uc3QgY3JjRmlsZSA9IGJsb2JbY3JjU3RhcnRdICsgKGJsb2JbY3JjU3RhcnQgKyAxXSA8PCA4KTtcbiAgICBjb25zdCBjcmNGaWxlQ2FsYyA9IGNhbGN1bGF0ZUNSQyhibG9iLCBoZWFkZXJMZW5ndGggPT09IDEyID8gMCA6IGhlYWRlckxlbmd0aCwgY3JjU3RhcnQpO1xuXG4gICAgaWYgKGNyY0ZpbGUgIT09IGNyY0ZpbGVDYWxjKSB7XG4gICAgICAvLyBjYWxsYmFjaygnRmlsZSBDUkMgbWlzbWF0Y2gnKTtcbiAgICAgIC8vIFRPRE86IGZpeCBGaWxlIENSQyBjaGVja1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZm9yY2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGZpdE9iajpGaXRQYXJzZXJSZXN1bHQgPSB7fTtcbiAgICBjb25zdCBzZXNzaW9ucyA9IFtdO1xuICAgIGNvbnN0IGxhcHMgPSBbXTtcbiAgICBjb25zdCByZWNvcmRzID0gW107XG4gICAgY29uc3QgZXZlbnRzID0gW107XG4gICAgY29uc3QgaHJ2ID0gW107XG4gICAgY29uc3QgZGV2aWNlcyA9IFtdO1xuICAgIGNvbnN0IGFwcGxpY2F0aW9ucyA9IFtdO1xuICAgIGNvbnN0IGZpZWxkRGVzY3JpcHRpb25zID0gW107XG4gICAgY29uc3QgZGl2ZV9nYXNlcyA9IFtdO1xuICAgIGNvbnN0IGNvdXJzZV9wb2ludHMgPSBbXTtcblxuICAgIGxldCB0ZW1wTGFwcyA9IFtdO1xuICAgIGxldCB0ZW1wUmVjb3JkcyA9IFtdO1xuXG4gICAgbGV0IGxvb3BJbmRleCA9IGhlYWRlckxlbmd0aDtcbiAgICBjb25zdCBtZXNzYWdlVHlwZXMgPSBNZXNzYWdlVHlwZXM7XG4gICAgY29uc3QgZGV2ZWxvcGVyRmllbGRzOiBEZXZlbG9wZXJGaWVsZHMgPSBbXTtcblxuICAgIGNvbnN0IGlzTW9kZUNhc2NhZGUgPSB0aGlzLm9wdGlvbnMubW9kZSA9PT0gJ2Nhc2NhZGUnO1xuICAgIGNvbnN0IGlzQ2FzY2FkZU5lZWRlZCA9IGlzTW9kZUNhc2NhZGUgfHwgdGhpcy5vcHRpb25zLm1vZGUgPT09ICdib3RoJztcblxuICAgIGxldCBzdGFydERhdGUsIGxhc3RTdG9wVGltZXN0YW1wO1xuICAgIGxldCBwYXVzZWRUaW1lID0gMDtcblxuICAgIHdoaWxlIChsb29wSW5kZXggPCBjcmNTdGFydCkge1xuICAgICAgY29uc3QgeyBuZXh0SW5kZXgsXG4gICAgICAgIG1lc3NhZ2VUeXBlLFxuICAgICAgICBtZXNzYWdlIH0gPSByZWFkUmVjb3JkKGJsb2IsIG1lc3NhZ2VUeXBlcywgZGV2ZWxvcGVyRmllbGRzLCBsb29wSW5kZXgsIHRoaXMub3B0aW9ucywgc3RhcnREYXRlLCBwYXVzZWRUaW1lKTtcbiAgICAgIGxvb3BJbmRleCA9IG5leHRJbmRleDtcblxuICAgICAgc3dpdGNoIChtZXNzYWdlVHlwZSkge1xuICAgICAgICBjYXNlICdsYXAnOlxuICAgICAgICAgIGlmIChpc0Nhc2NhZGVOZWVkZWQpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UucmVjb3JkcyA9IHRlbXBSZWNvcmRzO1xuICAgICAgICAgICAgdGVtcFJlY29yZHMgPSBbXTtcbiAgICAgICAgICAgIHRlbXBMYXBzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxhcHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2Vzc2lvbic6XG4gICAgICAgICAgaWYgKGlzQ2FzY2FkZU5lZWRlZCkge1xuICAgICAgICAgICAgbWVzc2FnZS5sYXBzID0gdGVtcExhcHM7XG4gICAgICAgICAgICB0ZW1wTGFwcyA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZXNzaW9ucy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdldmVudCc6XG4gICAgICAgICAgaWYgKG1lc3NhZ2UuZXZlbnQgPT09ICd0aW1lcicpIHtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmV2ZW50X3R5cGUgPT09ICdzdG9wX2FsbCcpIHtcbiAgICAgICAgICAgICAgbGFzdFN0b3BUaW1lc3RhbXAgPSBtZXNzYWdlLnRpbWVzdGFtcDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS5ldmVudF90eXBlID09PSAnc3RhcnQnICYmIGxhc3RTdG9wVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgIHBhdXNlZFRpbWUgKz0gKG1lc3NhZ2UudGltZXN0YW1wIC0gbGFzdFN0b3BUaW1lc3RhbXApIC8gMTAwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnRzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2hydic6XG4gICAgICAgICAgaHJ2LnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3JlY29yZCc6XG4gICAgICAgICAgaWYgKCFzdGFydERhdGUpIHtcbiAgICAgICAgICAgIHN0YXJ0RGF0ZSA9IG1lc3NhZ2UudGltZXN0YW1wO1xuICAgICAgICAgICAgbWVzc2FnZS5lbGFwc2VkX3RpbWUgPSAwO1xuICAgICAgICAgICAgbWVzc2FnZS50aW1lcl90aW1lID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVjb3Jkcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgIGlmIChpc0Nhc2NhZGVOZWVkZWQpIHtcbiAgICAgICAgICAgIHRlbXBSZWNvcmRzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmaWVsZF9kZXNjcmlwdGlvbic6XG4gICAgICAgICAgZmllbGREZXNjcmlwdGlvbnMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGV2aWNlX2luZm8nOlxuICAgICAgICAgIGRldmljZXMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGV2ZWxvcGVyX2RhdGFfaWQnOlxuICAgICAgICAgIGFwcGxpY2F0aW9ucy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkaXZlX2dhcyc6XG4gICAgICAgICAgZGl2ZV9nYXNlcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjb3Vyc2VfcG9pbnQnOlxuICAgICAgICAgIGNvdXJzZV9wb2ludHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgIT09ICcnKSB7XG4gICAgICAgICAgICBmaXRPYmpbbWVzc2FnZVR5cGVdID0gbWVzc2FnZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlzQ2FzY2FkZU5lZWRlZCkge1xuICAgICAgZml0T2JqLmFjdGl2aXR5ID0gZml0T2JqLmFjdGl2aXR5IHx8IG51bGw7XG4gICAgICBmaXRPYmouYWN0aXZpdHkuc2Vzc2lvbnMgPSBzZXNzaW9ucztcbiAgICAgIGZpdE9iai5hY3Rpdml0eS5ldmVudHMgPSBldmVudHM7XG4gICAgICBmaXRPYmouYWN0aXZpdHkuaHJ2ID0gaHJ2O1xuICAgIH1cbiAgICBpZiAoIWlzTW9kZUNhc2NhZGUpIHtcbiAgICAgIGZpdE9iai5zZXNzaW9ucyA9IHNlc3Npb25zO1xuICAgICAgZml0T2JqLmxhcHMgPSBsYXBzO1xuICAgICAgZml0T2JqLnJlY29yZHMgPSByZWNvcmRzO1xuICAgICAgZml0T2JqLmV2ZW50cyA9IGV2ZW50cztcbiAgICAgIGZpdE9iai5kZXZpY2VfaW5mb3MgPSBkZXZpY2VzO1xuICAgICAgZml0T2JqLmRldmVsb3Blcl9kYXRhX2lkcyA9IGFwcGxpY2F0aW9ucztcbiAgICAgIGZpdE9iai5maWVsZF9kZXNjcmlwdGlvbnMgPSBmaWVsZERlc2NyaXB0aW9ucztcbiAgICAgIGZpdE9iai5ocnYgPSBocnY7XG4gICAgICBmaXRPYmouZGl2ZV9nYXNlcyA9IGRpdmVfZ2FzZXM7XG4gICAgICBmaXRPYmouY291cnNlX3BvaW50cyA9IGNvdXJzZV9wb2ludHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF3YWl0IGZpdE9iajtcbiAgfVxufVxuXG4iXX0=