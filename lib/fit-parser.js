"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("core-js/stable");

require("regenerator-runtime/runtime");

var _binary = require("./binary");

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
                messageTypes = [];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9maXQtcGFyc2VyLnRzIl0sIm5hbWVzIjpbIkZpdFBhcnNlciIsIm9wdGlvbnMiLCJ1bmRlZmluZWQiLCJmb3JjZSIsInNwZWVkVW5pdCIsImxlbmd0aFVuaXQiLCJ0ZW1wZXJhdHVyZVVuaXQiLCJlbGFwc2VkUmVjb3JkRmllbGQiLCJtb2RlIiwiY29udGVudCIsImJsb2IiLCJVaW50OEFycmF5IiwibGVuZ3RoIiwiRXJyb3IiLCJoZWFkZXJMZW5ndGgiLCJmaWxlVHlwZVN0cmluZyIsImkiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJjcmNIZWFkZXIiLCJjcmNIZWFkZXJDYWxjIiwiZGF0YUxlbmd0aCIsImNyY1N0YXJ0IiwiY3JjRmlsZSIsImNyY0ZpbGVDYWxjIiwiZml0T2JqIiwic2Vzc2lvbnMiLCJsYXBzIiwicmVjb3JkcyIsImV2ZW50cyIsImhydiIsImRldmljZXMiLCJhcHBsaWNhdGlvbnMiLCJmaWVsZERlc2NyaXB0aW9ucyIsImRpdmVfZ2FzZXMiLCJjb3Vyc2VfcG9pbnRzIiwidGVtcExhcHMiLCJ0ZW1wUmVjb3JkcyIsImxvb3BJbmRleCIsIm1lc3NhZ2VUeXBlcyIsImRldmVsb3BlckZpZWxkcyIsImlzTW9kZUNhc2NhZGUiLCJpc0Nhc2NhZGVOZWVkZWQiLCJwYXVzZWRUaW1lIiwic3RhcnREYXRlIiwibmV4dEluZGV4IiwibWVzc2FnZVR5cGUiLCJtZXNzYWdlIiwicHVzaCIsImV2ZW50IiwiZXZlbnRfdHlwZSIsImxhc3RTdG9wVGltZXN0YW1wIiwidGltZXN0YW1wIiwiZWxhcHNlZF90aW1lIiwidGltZXJfdGltZSIsImFjdGl2aXR5IiwiZGV2aWNlX2luZm9zIiwiZGV2ZWxvcGVyX2RhdGFfaWRzIiwiZmllbGRfZGVzY3JpcHRpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0lBSXFCQSxTOzs7QUFXbkIsdUJBQW1EO0FBQUEsUUFBdkNDLE9BQXVDLHVFQUFYQyxT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R0FBYUEsR0FBYjtBQUNBTCxrQkFBQUEsTUFBTSxDQUFDUyxVQUFQLEdBQW9CQSxVQUFwQjtBQUNBVCxrQkFBQUEsTUFBTSxDQUFDVSxhQUFQLEdBQXVCQSxhQUF2QjtBQUNEOzs7dUJBRVlWLE0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJjb3JlLWpzL3N0YWJsZVwiO1xuaW1wb3J0IFwicmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lXCI7XG5pbXBvcnQgeyBnZXRBcnJheUJ1ZmZlciwgY2FsY3VsYXRlQ1JDLCByZWFkUmVjb3JkIH0gZnJvbSAnLi9iaW5hcnknO1xuaW1wb3J0IHsgRGV2ZWxvcGVyRmllbGRzLCBGaXRQYXJzZXJPcHRpb25zLFxuICBGaXRQYXJzZXJSZXN1bHQgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRml0UGFyc2VyIHtcblxuICBvcHRpb25zOiBGaXRQYXJzZXJPcHRpb25zID0ge1xuICAgIGZvcmNlOiB0cnVlLFxuICAgIHNwZWVkVW5pdDogJ20vcycsXG4gICAgbGVuZ3RoVW5pdDogJ20nLFxuICAgIHRlbXBlcmF0dXJlVW5pdDogJ2NlbHNpdXMnLFxuICAgIGVsYXBzZWRSZWNvcmRGaWVsZDogZmFsc2UsXG4gICAgbW9kZTogJ2xpc3QnLFxuICB9XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogRml0UGFyc2VyT3B0aW9ucyA9IHVuZGVmaW5lZCkge1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgIGZvcmNlOiBvcHRpb25zLmZvcmNlICE9IG51bGwgPyBvcHRpb25zLmZvcmNlIDogdHJ1ZSxcbiAgICAgICAgc3BlZWRVbml0OiBvcHRpb25zLnNwZWVkVW5pdCB8fCAnbS9zJyxcbiAgICAgICAgbGVuZ3RoVW5pdDogb3B0aW9ucy5sZW5ndGhVbml0IHx8ICdtJyxcbiAgICAgICAgdGVtcGVyYXR1cmVVbml0OiBvcHRpb25zLnRlbXBlcmF0dXJlVW5pdCB8fCAnY2Vsc2l1cycsXG4gICAgICAgIGVsYXBzZWRSZWNvcmRGaWVsZDogb3B0aW9ucy5lbGFwc2VkUmVjb3JkRmllbGQgfHwgZmFsc2UsXG4gICAgICAgIG1vZGU6IG9wdGlvbnMubW9kZSB8fCAnbGlzdCcsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHBhcnNlKGNvbnRlbnQ6IEJ1ZmZlcik6IFByb21pc2U8Rml0UGFyc2VyUmVzdWx0PiB7XG4gICAgY29uc3QgYmxvYiA9IG5ldyBVaW50OEFycmF5KGdldEFycmF5QnVmZmVyKGNvbnRlbnQpKTtcblxuICAgIGlmIChibG9iLmxlbmd0aCA8IDEyKSB7XG4gICAgICB0aHJvdyBFcnJvcignRmlsZSB0byBzbWFsbCB0byBiZSBhIEZJVCBmaWxlJyk7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5mb3JjZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVyTGVuZ3RoID0gYmxvYlswXTtcbiAgICBpZiAoaGVhZGVyTGVuZ3RoICE9PSAxNCAmJiBoZWFkZXJMZW5ndGggIT09IDEyKSB7XG4gICAgICB0aHJvdyBFcnJvcignSW5jb3JyZWN0IGhlYWRlciBzaXplJyk7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5mb3JjZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGZpbGVUeXBlU3RyaW5nID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDg7IGkgPCAxMjsgaSsrKSB7XG4gICAgICBmaWxlVHlwZVN0cmluZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJsb2JbaV0pO1xuICAgIH1cbiAgICBpZiAoZmlsZVR5cGVTdHJpbmcgIT09ICcuRklUJykge1xuICAgICAgdGhyb3cgRXJyb3IoJ01pc3NpbmcgXFwnLkZJVFxcJyBpbiBoZWFkZXInKTtcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmZvcmNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaGVhZGVyTGVuZ3RoID09PSAxNCkge1xuICAgICAgY29uc3QgY3JjSGVhZGVyID0gYmxvYlsxMl0gKyAoYmxvYlsxM10gPDwgOCk7XG4gICAgICBjb25zdCBjcmNIZWFkZXJDYWxjID0gY2FsY3VsYXRlQ1JDKGJsb2IsIDAsIDEyKTtcbiAgICAgIGlmIChjcmNIZWFkZXIgIT09IGNyY0hlYWRlckNhbGMpIHtcbiAgICAgICAgLy8gdGhyb3cgRXJyb3IoJ0hlYWRlciBDUkMgbWlzbWF0Y2gnKTtcbiAgICAgICAgLy8gVE9ETzogZml4IEhlYWRlciBDUkMgY2hlY2tcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZm9yY2UpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZGF0YUxlbmd0aCA9IGJsb2JbNF0gKyAoYmxvYls1XSA8PCA4KSArIChibG9iWzZdIDw8IDE2KSArIChibG9iWzddIDw8IDI0KTtcbiAgICBjb25zdCBjcmNTdGFydCA9IGRhdGFMZW5ndGggKyBoZWFkZXJMZW5ndGg7XG4gICAgY29uc3QgY3JjRmlsZSA9IGJsb2JbY3JjU3RhcnRdICsgKGJsb2JbY3JjU3RhcnQgKyAxXSA8PCA4KTtcbiAgICBjb25zdCBjcmNGaWxlQ2FsYyA9IGNhbGN1bGF0ZUNSQyhibG9iLCBoZWFkZXJMZW5ndGggPT09IDEyID8gMCA6IGhlYWRlckxlbmd0aCwgY3JjU3RhcnQpO1xuXG4gICAgaWYgKGNyY0ZpbGUgIT09IGNyY0ZpbGVDYWxjKSB7XG4gICAgICAvLyBjYWxsYmFjaygnRmlsZSBDUkMgbWlzbWF0Y2gnKTtcbiAgICAgIC8vIFRPRE86IGZpeCBGaWxlIENSQyBjaGVja1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZm9yY2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGZpdE9iajpGaXRQYXJzZXJSZXN1bHQgPSB7fTtcbiAgICBjb25zdCBzZXNzaW9ucyA9IFtdO1xuICAgIGNvbnN0IGxhcHMgPSBbXTtcbiAgICBjb25zdCByZWNvcmRzID0gW107XG4gICAgY29uc3QgZXZlbnRzID0gW107XG4gICAgY29uc3QgaHJ2ID0gW107XG4gICAgY29uc3QgZGV2aWNlcyA9IFtdO1xuICAgIGNvbnN0IGFwcGxpY2F0aW9ucyA9IFtdO1xuICAgIGNvbnN0IGZpZWxkRGVzY3JpcHRpb25zID0gW107XG4gICAgY29uc3QgZGl2ZV9nYXNlcyA9IFtdO1xuICAgIGNvbnN0IGNvdXJzZV9wb2ludHMgPSBbXTtcblxuICAgIGxldCB0ZW1wTGFwcyA9IFtdO1xuICAgIGxldCB0ZW1wUmVjb3JkcyA9IFtdO1xuXG4gICAgbGV0IGxvb3BJbmRleCA9IGhlYWRlckxlbmd0aDtcbiAgICBjb25zdCBtZXNzYWdlVHlwZXMgPSBbXTtcbiAgICBjb25zdCBkZXZlbG9wZXJGaWVsZHM6IERldmVsb3BlckZpZWxkcyA9IFtdO1xuXG4gICAgY29uc3QgaXNNb2RlQ2FzY2FkZSA9IHRoaXMub3B0aW9ucy5tb2RlID09PSAnY2FzY2FkZSc7XG4gICAgY29uc3QgaXNDYXNjYWRlTmVlZGVkID0gaXNNb2RlQ2FzY2FkZSB8fCB0aGlzLm9wdGlvbnMubW9kZSA9PT0gJ2JvdGgnO1xuXG4gICAgbGV0IHN0YXJ0RGF0ZSwgbGFzdFN0b3BUaW1lc3RhbXA7XG4gICAgbGV0IHBhdXNlZFRpbWUgPSAwO1xuXG4gICAgd2hpbGUgKGxvb3BJbmRleCA8IGNyY1N0YXJ0KSB7XG4gICAgICBjb25zdCB7IG5leHRJbmRleCxcbiAgICAgICAgbWVzc2FnZVR5cGUsXG4gICAgICAgIG1lc3NhZ2UgfSA9IHJlYWRSZWNvcmQoYmxvYiwgbWVzc2FnZVR5cGVzLCBkZXZlbG9wZXJGaWVsZHMsIGxvb3BJbmRleCwgdGhpcy5vcHRpb25zLCBzdGFydERhdGUsIHBhdXNlZFRpbWUpO1xuICAgICAgbG9vcEluZGV4ID0gbmV4dEluZGV4O1xuXG4gICAgICBzd2l0Y2ggKG1lc3NhZ2VUeXBlKSB7XG4gICAgICAgIGNhc2UgJ2xhcCc6XG4gICAgICAgICAgaWYgKGlzQ2FzY2FkZU5lZWRlZCkge1xuICAgICAgICAgICAgbWVzc2FnZS5yZWNvcmRzID0gdGVtcFJlY29yZHM7XG4gICAgICAgICAgICB0ZW1wUmVjb3JkcyA9IFtdO1xuICAgICAgICAgICAgdGVtcExhcHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGFwcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzZXNzaW9uJzpcbiAgICAgICAgICBpZiAoaXNDYXNjYWRlTmVlZGVkKSB7XG4gICAgICAgICAgICBtZXNzYWdlLmxhcHMgPSB0ZW1wTGFwcztcbiAgICAgICAgICAgIHRlbXBMYXBzID0gW107XG4gICAgICAgICAgfVxuICAgICAgICAgIHNlc3Npb25zLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2V2ZW50JzpcbiAgICAgICAgICBpZiAobWVzc2FnZS5ldmVudCA9PT0gJ3RpbWVyJykge1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UuZXZlbnRfdHlwZSA9PT0gJ3N0b3BfYWxsJykge1xuICAgICAgICAgICAgICBsYXN0U3RvcFRpbWVzdGFtcCA9IG1lc3NhZ2UudGltZXN0YW1wO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLmV2ZW50X3R5cGUgPT09ICdzdGFydCcgJiYgbGFzdFN0b3BUaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgcGF1c2VkVGltZSArPSAobWVzc2FnZS50aW1lc3RhbXAgLSBsYXN0U3RvcFRpbWVzdGFtcCkgLyAxMDAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaHJ2JzpcbiAgICAgICAgICBocnYucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmVjb3JkJzpcbiAgICAgICAgICBpZiAoIXN0YXJ0RGF0ZSkge1xuICAgICAgICAgICAgc3RhcnREYXRlID0gbWVzc2FnZS50aW1lc3RhbXA7XG4gICAgICAgICAgICBtZXNzYWdlLmVsYXBzZWRfdGltZSA9IDA7XG4gICAgICAgICAgICBtZXNzYWdlLnRpbWVyX3RpbWUgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWNvcmRzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgaWYgKGlzQ2FzY2FkZU5lZWRlZCkge1xuICAgICAgICAgICAgdGVtcFJlY29yZHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ZpZWxkX2Rlc2NyaXB0aW9uJzpcbiAgICAgICAgICBmaWVsZERlc2NyaXB0aW9ucy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZXZpY2VfaW5mbyc6XG4gICAgICAgICAgZGV2aWNlcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZXZlbG9wZXJfZGF0YV9pZCc6XG4gICAgICAgICAgYXBwbGljYXRpb25zLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RpdmVfZ2FzJzpcbiAgICAgICAgICBkaXZlX2dhc2VzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NvdXJzZV9wb2ludCc6XG4gICAgICAgICAgY291cnNlX3BvaW50cy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSAhPT0gJycpIHtcbiAgICAgICAgICAgIGZpdE9ialttZXNzYWdlVHlwZV0gPSBtZXNzYWdlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXNDYXNjYWRlTmVlZGVkKSB7XG4gICAgICBmaXRPYmouYWN0aXZpdHkgPSBmaXRPYmouYWN0aXZpdHkgfHwgbnVsbDtcbiAgICAgIGZpdE9iai5hY3Rpdml0eS5zZXNzaW9ucyA9IHNlc3Npb25zO1xuICAgICAgZml0T2JqLmFjdGl2aXR5LmV2ZW50cyA9IGV2ZW50cztcbiAgICAgIGZpdE9iai5hY3Rpdml0eS5ocnYgPSBocnY7XG4gICAgfVxuICAgIGlmICghaXNNb2RlQ2FzY2FkZSkge1xuICAgICAgZml0T2JqLnNlc3Npb25zID0gc2Vzc2lvbnM7XG4gICAgICBmaXRPYmoubGFwcyA9IGxhcHM7XG4gICAgICBmaXRPYmoucmVjb3JkcyA9IHJlY29yZHM7XG4gICAgICBmaXRPYmouZXZlbnRzID0gZXZlbnRzO1xuICAgICAgZml0T2JqLmRldmljZV9pbmZvcyA9IGRldmljZXM7XG4gICAgICBmaXRPYmouZGV2ZWxvcGVyX2RhdGFfaWRzID0gYXBwbGljYXRpb25zO1xuICAgICAgZml0T2JqLmZpZWxkX2Rlc2NyaXB0aW9ucyA9IGZpZWxkRGVzY3JpcHRpb25zO1xuICAgICAgZml0T2JqLmhydiA9IGhydjtcbiAgICAgIGZpdE9iai5kaXZlX2dhc2VzID0gZGl2ZV9nYXNlcztcbiAgICAgIGZpdE9iai5jb3Vyc2VfcG9pbnRzID0gY291cnNlX3BvaW50cztcbiAgICB9XG5cbiAgICByZXR1cm4gYXdhaXQgZml0T2JqO1xuICB9XG59XG5cbiJdfQ==