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
                messageTypes = {};
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9maXQtcGFyc2VyLnRzIl0sIm5hbWVzIjpbIkZpdFBhcnNlciIsIm9wdGlvbnMiLCJ1bmRlZmluZWQiLCJmb3JjZSIsInNwZWVkVW5pdCIsImxlbmd0aFVuaXQiLCJ0ZW1wZXJhdHVyZVVuaXQiLCJlbGFwc2VkUmVjb3JkRmllbGQiLCJtb2RlIiwiY29udGVudCIsImJsb2IiLCJVaW50OEFycmF5IiwibGVuZ3RoIiwiRXJyb3IiLCJoZWFkZXJMZW5ndGgiLCJmaWxlVHlwZVN0cmluZyIsImkiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJjcmNIZWFkZXIiLCJjcmNIZWFkZXJDYWxjIiwiZGF0YUxlbmd0aCIsImNyY1N0YXJ0IiwiY3JjRmlsZSIsImNyY0ZpbGVDYWxjIiwiZml0T2JqIiwic2Vzc2lvbnMiLCJsYXBzIiwicmVjb3JkcyIsImV2ZW50cyIsImhydiIsImRldmljZXMiLCJhcHBsaWNhdGlvbnMiLCJmaWVsZERlc2NyaXB0aW9ucyIsImRpdmVfZ2FzZXMiLCJjb3Vyc2VfcG9pbnRzIiwidGVtcExhcHMiLCJ0ZW1wUmVjb3JkcyIsImxvb3BJbmRleCIsIm1lc3NhZ2VUeXBlcyIsImRldmVsb3BlckZpZWxkcyIsImlzTW9kZUNhc2NhZGUiLCJpc0Nhc2NhZGVOZWVkZWQiLCJwYXVzZWRUaW1lIiwic3RhcnREYXRlIiwibmV4dEluZGV4IiwibWVzc2FnZVR5cGUiLCJtZXNzYWdlIiwicHVzaCIsImV2ZW50IiwiZXZlbnRfdHlwZSIsImxhc3RTdG9wVGltZXN0YW1wIiwidGltZXN0YW1wIiwiZWxhcHNlZF90aW1lIiwidGltZXJfdGltZSIsImFjdGl2aXR5IiwiZGV2aWNlX2luZm9zIiwiZGV2ZWxvcGVyX2RhdGFfaWRzIiwiZmllbGRfZGVzY3JpcHRpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0lBSXFCQSxTOzs7QUFXbkIsdUJBQW1EO0FBQUEsUUFBdkNDLE9BQXVDLHVFQUFYQyxT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UCxHQUFhQSxHQUFiO0FBQ0FMLGtCQUFBQSxNQUFNLENBQUNTLFVBQVAsR0FBb0JBLFVBQXBCO0FBQ0FULGtCQUFBQSxNQUFNLENBQUNVLGFBQVAsR0FBdUJBLGFBQXZCO0FBQ0Q7Ozt1QkFFWVYsTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcImNvcmUtanMvc3RhYmxlXCI7XG5pbXBvcnQgXCJyZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWVcIjtcbmltcG9ydCB7IGdldEFycmF5QnVmZmVyLCBjYWxjdWxhdGVDUkMsIHJlYWRSZWNvcmQgfSBmcm9tICcuL2JpbmFyeSc7XG5pbXBvcnQgeyBEZXZlbG9wZXJGaWVsZHMsIEZpdFBhcnNlck9wdGlvbnMsXG4gIEZpdFBhcnNlclJlc3VsdCwgTWVzc2FnZVR5cGVzIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpdFBhcnNlciB7XG5cbiAgb3B0aW9uczogRml0UGFyc2VyT3B0aW9ucyA9IHtcbiAgICBmb3JjZTogdHJ1ZSxcbiAgICBzcGVlZFVuaXQ6ICdtL3MnLFxuICAgIGxlbmd0aFVuaXQ6ICdtJyxcbiAgICB0ZW1wZXJhdHVyZVVuaXQ6ICdjZWxzaXVzJyxcbiAgICBlbGFwc2VkUmVjb3JkRmllbGQ6IGZhbHNlLFxuICAgIG1vZGU6ICdsaXN0JyxcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEZpdFBhcnNlck9wdGlvbnMgPSB1bmRlZmluZWQpIHtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgICBmb3JjZTogb3B0aW9ucy5mb3JjZSAhPSBudWxsID8gb3B0aW9ucy5mb3JjZSA6IHRydWUsXG4gICAgICAgIHNwZWVkVW5pdDogb3B0aW9ucy5zcGVlZFVuaXQgfHwgJ20vcycsXG4gICAgICAgIGxlbmd0aFVuaXQ6IG9wdGlvbnMubGVuZ3RoVW5pdCB8fCAnbScsXG4gICAgICAgIHRlbXBlcmF0dXJlVW5pdDogb3B0aW9ucy50ZW1wZXJhdHVyZVVuaXQgfHwgJ2NlbHNpdXMnLFxuICAgICAgICBlbGFwc2VkUmVjb3JkRmllbGQ6IG9wdGlvbnMuZWxhcHNlZFJlY29yZEZpZWxkIHx8IGZhbHNlLFxuICAgICAgICBtb2RlOiBvcHRpb25zLm1vZGUgfHwgJ2xpc3QnLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBwYXJzZShjb250ZW50OiBCdWZmZXIpOiBQcm9taXNlPEZpdFBhcnNlclJlc3VsdD4ge1xuICAgIGNvbnN0IGJsb2IgPSBuZXcgVWludDhBcnJheShnZXRBcnJheUJ1ZmZlcihjb250ZW50KSk7XG5cbiAgICBpZiAoYmxvYi5sZW5ndGggPCAxMikge1xuICAgICAgdGhyb3cgRXJyb3IoJ0ZpbGUgdG8gc21hbGwgdG8gYmUgYSBGSVQgZmlsZScpO1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZm9yY2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGhlYWRlckxlbmd0aCA9IGJsb2JbMF07XG4gICAgaWYgKGhlYWRlckxlbmd0aCAhPT0gMTQgJiYgaGVhZGVyTGVuZ3RoICE9PSAxMikge1xuICAgICAgdGhyb3cgRXJyb3IoJ0luY29ycmVjdCBoZWFkZXIgc2l6ZScpO1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZm9yY2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBmaWxlVHlwZVN0cmluZyA9ICcnO1xuICAgIGZvciAobGV0IGkgPSA4OyBpIDwgMTI7IGkrKykge1xuICAgICAgZmlsZVR5cGVTdHJpbmcgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShibG9iW2ldKTtcbiAgICB9XG4gICAgaWYgKGZpbGVUeXBlU3RyaW5nICE9PSAnLkZJVCcpIHtcbiAgICAgIHRocm93IEVycm9yKCdNaXNzaW5nIFxcJy5GSVRcXCcgaW4gaGVhZGVyJyk7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5mb3JjZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhlYWRlckxlbmd0aCA9PT0gMTQpIHtcbiAgICAgIGNvbnN0IGNyY0hlYWRlciA9IGJsb2JbMTJdICsgKGJsb2JbMTNdIDw8IDgpO1xuICAgICAgY29uc3QgY3JjSGVhZGVyQ2FsYyA9IGNhbGN1bGF0ZUNSQyhibG9iLCAwLCAxMik7XG4gICAgICBpZiAoY3JjSGVhZGVyICE9PSBjcmNIZWFkZXJDYWxjKSB7XG4gICAgICAgIC8vIHRocm93IEVycm9yKCdIZWFkZXIgQ1JDIG1pc21hdGNoJyk7XG4gICAgICAgIC8vIFRPRE86IGZpeCBIZWFkZXIgQ1JDIGNoZWNrXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmZvcmNlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGRhdGFMZW5ndGggPSBibG9iWzRdICsgKGJsb2JbNV0gPDwgOCkgKyAoYmxvYls2XSA8PCAxNikgKyAoYmxvYls3XSA8PCAyNCk7XG4gICAgY29uc3QgY3JjU3RhcnQgPSBkYXRhTGVuZ3RoICsgaGVhZGVyTGVuZ3RoO1xuICAgIGNvbnN0IGNyY0ZpbGUgPSBibG9iW2NyY1N0YXJ0XSArIChibG9iW2NyY1N0YXJ0ICsgMV0gPDwgOCk7XG4gICAgY29uc3QgY3JjRmlsZUNhbGMgPSBjYWxjdWxhdGVDUkMoYmxvYiwgaGVhZGVyTGVuZ3RoID09PSAxMiA/IDAgOiBoZWFkZXJMZW5ndGgsIGNyY1N0YXJ0KTtcblxuICAgIGlmIChjcmNGaWxlICE9PSBjcmNGaWxlQ2FsYykge1xuICAgICAgLy8gY2FsbGJhY2soJ0ZpbGUgQ1JDIG1pc21hdGNoJyk7XG4gICAgICAvLyBUT0RPOiBmaXggRmlsZSBDUkMgY2hlY2tcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmZvcmNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBmaXRPYmo6Rml0UGFyc2VyUmVzdWx0ID0ge307XG4gICAgY29uc3Qgc2Vzc2lvbnMgPSBbXTtcbiAgICBjb25zdCBsYXBzID0gW107XG4gICAgY29uc3QgcmVjb3JkcyA9IFtdO1xuICAgIGNvbnN0IGV2ZW50cyA9IFtdO1xuICAgIGNvbnN0IGhydiA9IFtdO1xuICAgIGNvbnN0IGRldmljZXMgPSBbXTtcbiAgICBjb25zdCBhcHBsaWNhdGlvbnMgPSBbXTtcbiAgICBjb25zdCBmaWVsZERlc2NyaXB0aW9ucyA9IFtdO1xuICAgIGNvbnN0IGRpdmVfZ2FzZXMgPSBbXTtcbiAgICBjb25zdCBjb3Vyc2VfcG9pbnRzID0gW107XG5cbiAgICBsZXQgdGVtcExhcHMgPSBbXTtcbiAgICBsZXQgdGVtcFJlY29yZHMgPSBbXTtcblxuICAgIGxldCBsb29wSW5kZXggPSBoZWFkZXJMZW5ndGg7XG4gICAgY29uc3QgbWVzc2FnZVR5cGVzOiBNZXNzYWdlVHlwZXMgPSB7fTtcbiAgICBjb25zdCBkZXZlbG9wZXJGaWVsZHM6IERldmVsb3BlckZpZWxkcyA9IFtdO1xuXG4gICAgY29uc3QgaXNNb2RlQ2FzY2FkZSA9IHRoaXMub3B0aW9ucy5tb2RlID09PSAnY2FzY2FkZSc7XG4gICAgY29uc3QgaXNDYXNjYWRlTmVlZGVkID0gaXNNb2RlQ2FzY2FkZSB8fCB0aGlzLm9wdGlvbnMubW9kZSA9PT0gJ2JvdGgnO1xuXG4gICAgbGV0IHN0YXJ0RGF0ZSwgbGFzdFN0b3BUaW1lc3RhbXA7XG4gICAgbGV0IHBhdXNlZFRpbWUgPSAwO1xuXG4gICAgd2hpbGUgKGxvb3BJbmRleCA8IGNyY1N0YXJ0KSB7XG4gICAgICBjb25zdCB7IG5leHRJbmRleCxcbiAgICAgICAgbWVzc2FnZVR5cGUsXG4gICAgICAgIG1lc3NhZ2UgfSA9IHJlYWRSZWNvcmQoYmxvYiwgbWVzc2FnZVR5cGVzLCBkZXZlbG9wZXJGaWVsZHMsIGxvb3BJbmRleCwgdGhpcy5vcHRpb25zLCBzdGFydERhdGUsIHBhdXNlZFRpbWUpO1xuICAgICAgbG9vcEluZGV4ID0gbmV4dEluZGV4O1xuXG4gICAgICBzd2l0Y2ggKG1lc3NhZ2VUeXBlKSB7XG4gICAgICAgIGNhc2UgJ2xhcCc6XG4gICAgICAgICAgaWYgKGlzQ2FzY2FkZU5lZWRlZCkge1xuICAgICAgICAgICAgbWVzc2FnZS5yZWNvcmRzID0gdGVtcFJlY29yZHM7XG4gICAgICAgICAgICB0ZW1wUmVjb3JkcyA9IFtdO1xuICAgICAgICAgICAgdGVtcExhcHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGFwcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzZXNzaW9uJzpcbiAgICAgICAgICBpZiAoaXNDYXNjYWRlTmVlZGVkKSB7XG4gICAgICAgICAgICBtZXNzYWdlLmxhcHMgPSB0ZW1wTGFwcztcbiAgICAgICAgICAgIHRlbXBMYXBzID0gW107XG4gICAgICAgICAgfVxuICAgICAgICAgIHNlc3Npb25zLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2V2ZW50JzpcbiAgICAgICAgICBpZiAobWVzc2FnZS5ldmVudCA9PT0gJ3RpbWVyJykge1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UuZXZlbnRfdHlwZSA9PT0gJ3N0b3BfYWxsJykge1xuICAgICAgICAgICAgICBsYXN0U3RvcFRpbWVzdGFtcCA9IG1lc3NhZ2UudGltZXN0YW1wO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLmV2ZW50X3R5cGUgPT09ICdzdGFydCcgJiYgbGFzdFN0b3BUaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgcGF1c2VkVGltZSArPSAobWVzc2FnZS50aW1lc3RhbXAgLSBsYXN0U3RvcFRpbWVzdGFtcCkgLyAxMDAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaHJ2JzpcbiAgICAgICAgICBocnYucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmVjb3JkJzpcbiAgICAgICAgICBpZiAoIXN0YXJ0RGF0ZSkge1xuICAgICAgICAgICAgc3RhcnREYXRlID0gbWVzc2FnZS50aW1lc3RhbXA7XG4gICAgICAgICAgICBtZXNzYWdlLmVsYXBzZWRfdGltZSA9IDA7XG4gICAgICAgICAgICBtZXNzYWdlLnRpbWVyX3RpbWUgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWNvcmRzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgaWYgKGlzQ2FzY2FkZU5lZWRlZCkge1xuICAgICAgICAgICAgdGVtcFJlY29yZHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ZpZWxkX2Rlc2NyaXB0aW9uJzpcbiAgICAgICAgICBmaWVsZERlc2NyaXB0aW9ucy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZXZpY2VfaW5mbyc6XG4gICAgICAgICAgZGV2aWNlcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZXZlbG9wZXJfZGF0YV9pZCc6XG4gICAgICAgICAgYXBwbGljYXRpb25zLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RpdmVfZ2FzJzpcbiAgICAgICAgICBkaXZlX2dhc2VzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NvdXJzZV9wb2ludCc6XG4gICAgICAgICAgY291cnNlX3BvaW50cy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSAhPT0gJycpIHtcbiAgICAgICAgICAgIGZpdE9ialttZXNzYWdlVHlwZV0gPSBtZXNzYWdlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXNDYXNjYWRlTmVlZGVkKSB7XG4gICAgICBmaXRPYmouYWN0aXZpdHkgPSBmaXRPYmouYWN0aXZpdHkgfHwgbnVsbDtcbiAgICAgIGZpdE9iai5hY3Rpdml0eS5zZXNzaW9ucyA9IHNlc3Npb25zO1xuICAgICAgZml0T2JqLmFjdGl2aXR5LmV2ZW50cyA9IGV2ZW50cztcbiAgICAgIGZpdE9iai5hY3Rpdml0eS5ocnYgPSBocnY7XG4gICAgfVxuICAgIGlmICghaXNNb2RlQ2FzY2FkZSkge1xuICAgICAgZml0T2JqLnNlc3Npb25zID0gc2Vzc2lvbnM7XG4gICAgICBmaXRPYmoubGFwcyA9IGxhcHM7XG4gICAgICBmaXRPYmoucmVjb3JkcyA9IHJlY29yZHM7XG4gICAgICBmaXRPYmouZXZlbnRzID0gZXZlbnRzO1xuICAgICAgZml0T2JqLmRldmljZV9pbmZvcyA9IGRldmljZXM7XG4gICAgICBmaXRPYmouZGV2ZWxvcGVyX2RhdGFfaWRzID0gYXBwbGljYXRpb25zO1xuICAgICAgZml0T2JqLmZpZWxkX2Rlc2NyaXB0aW9ucyA9IGZpZWxkRGVzY3JpcHRpb25zO1xuICAgICAgZml0T2JqLmhydiA9IGhydjtcbiAgICAgIGZpdE9iai5kaXZlX2dhc2VzID0gZGl2ZV9nYXNlcztcbiAgICAgIGZpdE9iai5jb3Vyc2VfcG9pbnRzID0gY291cnNlX3BvaW50cztcbiAgICB9XG5cbiAgICByZXR1cm4gYXdhaXQgZml0T2JqO1xuICB9XG59XG5cbiJdfQ==