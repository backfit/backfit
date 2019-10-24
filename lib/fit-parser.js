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
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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
        force: options.force ? options.force : true,
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
                  _context.next = 3;
                  break;
                }

                throw Error('File to small to be a FIT file');

              case 3:
                headerLength = blob[0];

                if (!(headerLength !== 14 && headerLength !== 12)) {
                  _context.next = 6;
                  break;
                }

                throw Error('Incorrect header size');

              case 6:
                fileTypeString = '';

                for (i = 8; i < 12; i++) {
                  fileTypeString += String.fromCharCode(blob[i]);
                }

                if (!(fileTypeString !== '.FIT')) {
                  _context.next = 10;
                  break;
                }

                throw Error('Missing \'.FIT\' in header');

              case 10:
                if (headerLength === 14) {
                  crcHeader = blob[12] + (blob[13] << 8);
                  crcHeaderCalc = (0, _binary.calculateCRC)(blob, 0, 12);

                  if (crcHeader !== crcHeaderCalc) {// throw Error('Header CRC mismatch');
                    // TODO: fix Header CRC check
                  }
                }

                dataLength = blob[4] + (blob[5] << 8) + (blob[6] << 16) + (blob[7] << 24);
                crcStart = dataLength + headerLength;
                crcFile = blob[crcStart] + (blob[crcStart + 1] << 8);
                crcFileCalc = (0, _binary.calculateCRC)(blob, headerLength === 12 ? 0 : headerLength, crcStart);

                if (crcFile !== crcFileCalc) {// callback('File CRC mismatch');
                  // TODO: fix File CRC check
                }

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
                startDate = 0;
                pausedTime = 0;

              case 36:
                if (!(loopIndex < crcStart)) {
                  _context.next = 72;
                  break;
                }

                _readRecord = (0, _binary.readRecord)(blob, messageTypes, developerFields, loopIndex, this.options, startDate, pausedTime), nextIndex = _readRecord.nextIndex, messageType = _readRecord.messageType, message = _readRecord.message;
                loopIndex = nextIndex;

                if (!message) {
                  _context.next = 70;
                  break;
                }

                _context.t0 = messageType;
                _context.next = _context.t0 === 'lap' ? 43 : _context.t0 === 'session' ? 46 : _context.t0 === 'event' ? 49 : _context.t0 === 'hrv' ? 52 : _context.t0 === 'record' ? 54 : _context.t0 === 'field_description' ? 58 : _context.t0 === 'device_info' ? 60 : _context.t0 === 'developer_data_id' ? 62 : _context.t0 === 'dive_gas' ? 64 : _context.t0 === 'course_point' ? 66 : 68;
                break;

              case 43:
                if (isCascadeNeeded) {
                  message.records = tempRecords;
                  tempRecords = [];
                  tempLaps.push(message);
                }

                laps.push(message);
                return _context.abrupt("break", 70);

              case 46:
                if (isCascadeNeeded) {
                  message.laps = tempLaps;
                  tempLaps = [];
                }

                sessions.push(message);
                return _context.abrupt("break", 70);

              case 49:
                if (message.event === 'timer') {
                  if (message.event_type === 'stop_all') {
                    lastStopTimestamp = message.timestamp;
                  } else if (message.event_type === 'start' && lastStopTimestamp && message.timestamp) {
                    pausedTime += (message.timestamp - lastStopTimestamp) / 1000;
                  }
                }

                events.push(message);
                return _context.abrupt("break", 70);

              case 52:
                hrv.push(message);
                return _context.abrupt("break", 70);

              case 54:
                if (!startDate) {
                  if (message.timestamp) {
                    startDate = message.timestamp;
                  }

                  message.elapsed_time = 0;
                  message.timer_time = 0;
                }

                records.push(message);

                if (isCascadeNeeded) {
                  tempRecords.push(message);
                }

                return _context.abrupt("break", 70);

              case 58:
                fieldDescriptions.push(message);
                return _context.abrupt("break", 70);

              case 60:
                devices.push(message);
                return _context.abrupt("break", 70);

              case 62:
                applications.push(message);
                return _context.abrupt("break", 70);

              case 64:
                dive_gases.push(message);
                return _context.abrupt("break", 70);

              case 66:
                course_points.push(message);
                return _context.abrupt("break", 70);

              case 68:
                if (messageType !== '') {
                  fitObj[messageType] = message;
                }

                return _context.abrupt("break", 70);

              case 70:
                _context.next = 36;
                break;

              case 72:
                if (isCascadeNeeded) {
                  fitObj.activity = {};
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

                _context.next = 76;
                return fitObj;

              case 76:
                return _context.abrupt("return", _context.sent);

              case 77:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9maXQtcGFyc2VyLnRzIl0sIm5hbWVzIjpbIkZpdFBhcnNlciIsIm9wdGlvbnMiLCJmb3JjZSIsInNwZWVkVW5pdCIsImxlbmd0aFVuaXQiLCJ0ZW1wZXJhdHVyZVVuaXQiLCJlbGFwc2VkUmVjb3JkRmllbGQiLCJtb2RlIiwiY29udGVudCIsImJsb2IiLCJVaW50OEFycmF5IiwibGVuZ3RoIiwiRXJyb3IiLCJoZWFkZXJMZW5ndGgiLCJmaWxlVHlwZVN0cmluZyIsImkiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJjcmNIZWFkZXIiLCJjcmNIZWFkZXJDYWxjIiwiZGF0YUxlbmd0aCIsImNyY1N0YXJ0IiwiY3JjRmlsZSIsImNyY0ZpbGVDYWxjIiwiZml0T2JqIiwic2Vzc2lvbnMiLCJsYXBzIiwicmVjb3JkcyIsImV2ZW50cyIsImhydiIsImRldmljZXMiLCJhcHBsaWNhdGlvbnMiLCJmaWVsZERlc2NyaXB0aW9ucyIsImRpdmVfZ2FzZXMiLCJjb3Vyc2VfcG9pbnRzIiwidGVtcExhcHMiLCJ0ZW1wUmVjb3JkcyIsImxvb3BJbmRleCIsIm1lc3NhZ2VUeXBlcyIsImRldmVsb3BlckZpZWxkcyIsImlzTW9kZUNhc2NhZGUiLCJpc0Nhc2NhZGVOZWVkZWQiLCJzdGFydERhdGUiLCJwYXVzZWRUaW1lIiwibmV4dEluZGV4IiwibWVzc2FnZVR5cGUiLCJtZXNzYWdlIiwicHVzaCIsImV2ZW50IiwiZXZlbnRfdHlwZSIsImxhc3RTdG9wVGltZXN0YW1wIiwidGltZXN0YW1wIiwiZWxhcHNlZF90aW1lIiwidGltZXJfdGltZSIsImFjdGl2aXR5IiwiZGV2aWNlX2luZm9zIiwiZGV2ZWxvcGVyX2RhdGFfaWRzIiwiZmllbGRfZGVzY3JpcHRpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0lBSXFCQSxTOzs7QUFXbkIsdUJBQTRDO0FBQUEsUUFBaENDLE9BQWdDLHVFQUFKLEVBQUk7O0FBQUE7O0FB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QVAsR0FBc0J6QixPQUF0QjtBQUNBTixrQkFBQUEsTUFBTSxDQUFDZ0Msa0JBQVAsR0FBNEJ6QixZQUE1QjtBQUNBUCxrQkFBQUEsTUFBTSxDQUFDaUMsa0JBQVAsR0FBNEJ6QixpQkFBNUI7QUFDQVIsa0JBQUFBLE1BQU0sQ0FBQ0ssR0FBUCxHQUFhQSxHQUFiO0FBQ0FMLGtCQUFBQSxNQUFNLENBQUNTLFVBQVAsR0FBb0JBLFVBQXBCO0FBQ0FULGtCQUFBQSxNQUFNLENBQUNVLGFBQVAsR0FBdUJBLGFBQXZCO0FBQ0Q7Ozt1QkFFWVYsTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcImNvcmUtanMvc3RhYmxlXCI7XG5pbXBvcnQgXCJyZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWVcIjtcbmltcG9ydCB7IGdldEFycmF5QnVmZmVyLCBjYWxjdWxhdGVDUkMsIHJlYWRSZWNvcmQgfSBmcm9tICcuL2JpbmFyeSc7XG5pbXBvcnQgeyBEZXZlbG9wZXJGaWVsZHMsIEZpdFBhcnNlck9wdGlvbnMsXG4gIEZpdFBhcnNlclJlc3VsdCwgTWVzc2FnZVR5cGVzIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpdFBhcnNlciB7XG5cbiAgb3B0aW9uczogRml0UGFyc2VyT3B0aW9ucyA9IHtcbiAgICBmb3JjZTogdHJ1ZSxcbiAgICBzcGVlZFVuaXQ6ICdtL3MnLFxuICAgIGxlbmd0aFVuaXQ6ICdtJyxcbiAgICB0ZW1wZXJhdHVyZVVuaXQ6ICdjZWxzaXVzJyxcbiAgICBlbGFwc2VkUmVjb3JkRmllbGQ6IGZhbHNlLFxuICAgIG1vZGU6ICdsaXN0JyxcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEZpdFBhcnNlck9wdGlvbnMgPSB7fSkge1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgIGZvcmNlOiBvcHRpb25zLmZvcmNlID8gb3B0aW9ucy5mb3JjZSA6IHRydWUsXG4gICAgICAgIHNwZWVkVW5pdDogb3B0aW9ucy5zcGVlZFVuaXQgfHwgJ20vcycsXG4gICAgICAgIGxlbmd0aFVuaXQ6IG9wdGlvbnMubGVuZ3RoVW5pdCB8fCAnbScsXG4gICAgICAgIHRlbXBlcmF0dXJlVW5pdDogb3B0aW9ucy50ZW1wZXJhdHVyZVVuaXQgfHwgJ2NlbHNpdXMnLFxuICAgICAgICBlbGFwc2VkUmVjb3JkRmllbGQ6IG9wdGlvbnMuZWxhcHNlZFJlY29yZEZpZWxkIHx8IGZhbHNlLFxuICAgICAgICBtb2RlOiBvcHRpb25zLm1vZGUgfHwgJ2xpc3QnLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBwYXJzZShjb250ZW50OiBCdWZmZXIpOiBQcm9taXNlPEZpdFBhcnNlclJlc3VsdD4ge1xuICAgIGNvbnN0IGJsb2IgPSBuZXcgVWludDhBcnJheShnZXRBcnJheUJ1ZmZlcihjb250ZW50KSk7XG5cbiAgICBpZiAoYmxvYi5sZW5ndGggPCAxMikge1xuICAgICAgdGhyb3cgRXJyb3IoJ0ZpbGUgdG8gc21hbGwgdG8gYmUgYSBGSVQgZmlsZScpO1xuICAgIH1cblxuICAgIGNvbnN0IGhlYWRlckxlbmd0aCA9IGJsb2JbMF07XG4gICAgaWYgKGhlYWRlckxlbmd0aCAhPT0gMTQgJiYgaGVhZGVyTGVuZ3RoICE9PSAxMikge1xuICAgICAgdGhyb3cgRXJyb3IoJ0luY29ycmVjdCBoZWFkZXIgc2l6ZScpO1xuICAgIH1cblxuICAgIGxldCBmaWxlVHlwZVN0cmluZyA9ICcnO1xuICAgIGZvciAobGV0IGkgPSA4OyBpIDwgMTI7IGkrKykge1xuICAgICAgZmlsZVR5cGVTdHJpbmcgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShibG9iW2ldKTtcbiAgICB9XG4gICAgaWYgKGZpbGVUeXBlU3RyaW5nICE9PSAnLkZJVCcpIHtcbiAgICAgIHRocm93IEVycm9yKCdNaXNzaW5nIFxcJy5GSVRcXCcgaW4gaGVhZGVyJyk7XG4gICAgfVxuXG4gICAgaWYgKGhlYWRlckxlbmd0aCA9PT0gMTQpIHtcbiAgICAgIGNvbnN0IGNyY0hlYWRlciA9IGJsb2JbMTJdICsgKGJsb2JbMTNdIDw8IDgpO1xuICAgICAgY29uc3QgY3JjSGVhZGVyQ2FsYyA9IGNhbGN1bGF0ZUNSQyhibG9iLCAwLCAxMik7XG4gICAgICBpZiAoY3JjSGVhZGVyICE9PSBjcmNIZWFkZXJDYWxjKSB7XG4gICAgICAgIC8vIHRocm93IEVycm9yKCdIZWFkZXIgQ1JDIG1pc21hdGNoJyk7XG4gICAgICAgIC8vIFRPRE86IGZpeCBIZWFkZXIgQ1JDIGNoZWNrXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGRhdGFMZW5ndGggPSBibG9iWzRdICsgKGJsb2JbNV0gPDwgOCkgKyAoYmxvYls2XSA8PCAxNikgKyAoYmxvYls3XSA8PCAyNCk7XG4gICAgY29uc3QgY3JjU3RhcnQgPSBkYXRhTGVuZ3RoICsgaGVhZGVyTGVuZ3RoO1xuICAgIGNvbnN0IGNyY0ZpbGUgPSBibG9iW2NyY1N0YXJ0XSArIChibG9iW2NyY1N0YXJ0ICsgMV0gPDwgOCk7XG4gICAgY29uc3QgY3JjRmlsZUNhbGMgPSBjYWxjdWxhdGVDUkMoYmxvYiwgaGVhZGVyTGVuZ3RoID09PSAxMiA/IDAgOiBoZWFkZXJMZW5ndGgsIGNyY1N0YXJ0KTtcblxuICAgIGlmIChjcmNGaWxlICE9PSBjcmNGaWxlQ2FsYykge1xuICAgICAgLy8gY2FsbGJhY2soJ0ZpbGUgQ1JDIG1pc21hdGNoJyk7XG4gICAgICAvLyBUT0RPOiBmaXggRmlsZSBDUkMgY2hlY2tcbiAgICB9XG5cbiAgICBjb25zdCBmaXRPYmo6Rml0UGFyc2VyUmVzdWx0ID0ge307XG4gICAgY29uc3Qgc2Vzc2lvbnMgPSBbXTtcbiAgICBjb25zdCBsYXBzID0gW107XG4gICAgY29uc3QgcmVjb3JkcyA9IFtdO1xuICAgIGNvbnN0IGV2ZW50cyA9IFtdO1xuICAgIGNvbnN0IGhydiA9IFtdO1xuICAgIGNvbnN0IGRldmljZXMgPSBbXTtcbiAgICBjb25zdCBhcHBsaWNhdGlvbnMgPSBbXTtcbiAgICBjb25zdCBmaWVsZERlc2NyaXB0aW9ucyA9IFtdO1xuICAgIGNvbnN0IGRpdmVfZ2FzZXMgPSBbXTtcbiAgICBjb25zdCBjb3Vyc2VfcG9pbnRzID0gW107XG5cbiAgICBsZXQgdGVtcExhcHMgPSBbXTtcbiAgICBsZXQgdGVtcFJlY29yZHMgPSBbXTtcblxuICAgIGxldCBsb29wSW5kZXggPSBoZWFkZXJMZW5ndGg7XG4gICAgY29uc3QgbWVzc2FnZVR5cGVzOiBNZXNzYWdlVHlwZXMgPSB7fTtcbiAgICBjb25zdCBkZXZlbG9wZXJGaWVsZHM6IERldmVsb3BlckZpZWxkcyA9IFtdO1xuXG4gICAgY29uc3QgaXNNb2RlQ2FzY2FkZSA9IHRoaXMub3B0aW9ucy5tb2RlID09PSAnY2FzY2FkZSc7XG4gICAgY29uc3QgaXNDYXNjYWRlTmVlZGVkID0gaXNNb2RlQ2FzY2FkZSB8fCB0aGlzLm9wdGlvbnMubW9kZSA9PT0gJ2JvdGgnO1xuXG4gICAgbGV0IHN0YXJ0RGF0ZSA9IDAsIGxhc3RTdG9wVGltZXN0YW1wO1xuICAgIGxldCBwYXVzZWRUaW1lID0gMDtcblxuICAgIHdoaWxlIChsb29wSW5kZXggPCBjcmNTdGFydCkge1xuICAgICAgY29uc3QgeyBuZXh0SW5kZXgsXG4gICAgICAgIG1lc3NhZ2VUeXBlLFxuICAgICAgICBtZXNzYWdlIH0gPSByZWFkUmVjb3JkKGJsb2IsIG1lc3NhZ2VUeXBlcywgZGV2ZWxvcGVyRmllbGRzLCBsb29wSW5kZXgsIHRoaXMub3B0aW9ucywgc3RhcnREYXRlLCBwYXVzZWRUaW1lKTtcbiAgICAgIGxvb3BJbmRleCA9IG5leHRJbmRleDtcblxuICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgc3dpdGNoIChtZXNzYWdlVHlwZSkge1xuICAgICAgICAgIGNhc2UgJ2xhcCc6XG4gICAgICAgICAgICBpZiAoaXNDYXNjYWRlTmVlZGVkKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UucmVjb3JkcyA9IHRlbXBSZWNvcmRzO1xuICAgICAgICAgICAgICB0ZW1wUmVjb3JkcyA9IFtdO1xuICAgICAgICAgICAgICB0ZW1wTGFwcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFwcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnc2Vzc2lvbic6XG4gICAgICAgICAgICBpZiAoaXNDYXNjYWRlTmVlZGVkKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UubGFwcyA9IHRlbXBMYXBzO1xuICAgICAgICAgICAgICB0ZW1wTGFwcyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2Vzc2lvbnMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2V2ZW50JzpcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmV2ZW50ID09PSAndGltZXInKSB7XG4gICAgICAgICAgICAgIGlmIChtZXNzYWdlLmV2ZW50X3R5cGUgPT09ICdzdG9wX2FsbCcpIHtcbiAgICAgICAgICAgICAgICBsYXN0U3RvcFRpbWVzdGFtcCA9IG1lc3NhZ2UudGltZXN0YW1wO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UuZXZlbnRfdHlwZSA9PT0gJ3N0YXJ0JyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTdG9wVGltZXN0YW1wICYmIG1lc3NhZ2UudGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgcGF1c2VkVGltZSArPSAobWVzc2FnZS50aW1lc3RhbXAgLSBsYXN0U3RvcFRpbWVzdGFtcCkgLyAxMDAwO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBldmVudHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2hydic6XG4gICAgICAgICAgICBocnYucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3JlY29yZCc6XG4gICAgICAgICAgICBpZiAoIXN0YXJ0RGF0ZSkge1xuICAgICAgICAgICAgICBpZiAobWVzc2FnZS50aW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICBzdGFydERhdGUgPSBtZXNzYWdlLnRpbWVzdGFtcFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG1lc3NhZ2UuZWxhcHNlZF90aW1lID0gMDtcbiAgICAgICAgICAgICAgbWVzc2FnZS50aW1lcl90aW1lID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlY29yZHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGlmIChpc0Nhc2NhZGVOZWVkZWQpIHtcbiAgICAgICAgICAgICAgdGVtcFJlY29yZHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2ZpZWxkX2Rlc2NyaXB0aW9uJzpcbiAgICAgICAgICAgIGZpZWxkRGVzY3JpcHRpb25zLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkZXZpY2VfaW5mbyc6XG4gICAgICAgICAgICBkZXZpY2VzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkZXZlbG9wZXJfZGF0YV9pZCc6XG4gICAgICAgICAgICBhcHBsaWNhdGlvbnMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2RpdmVfZ2FzJzpcbiAgICAgICAgICAgIGRpdmVfZ2FzZXMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2NvdXJzZV9wb2ludCc6XG4gICAgICAgICAgICBjb3Vyc2VfcG9pbnRzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlICE9PSAnJykge1xuICAgICAgICAgICAgICBmaXRPYmpbbWVzc2FnZVR5cGVdID0gbWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgIH1cblxuICAgIGlmIChpc0Nhc2NhZGVOZWVkZWQpIHtcbiAgICAgIGZpdE9iai5hY3Rpdml0eSA9IHt9XG4gICAgICBmaXRPYmouYWN0aXZpdHkgPSBmaXRPYmouYWN0aXZpdHkgfHwgbnVsbDtcbiAgICAgIGZpdE9iai5hY3Rpdml0eS5zZXNzaW9ucyA9IHNlc3Npb25zO1xuICAgICAgZml0T2JqLmFjdGl2aXR5LmV2ZW50cyA9IGV2ZW50cztcbiAgICAgIGZpdE9iai5hY3Rpdml0eS5ocnYgPSBocnY7XG4gICAgfVxuICAgIGlmICghaXNNb2RlQ2FzY2FkZSkge1xuICAgICAgZml0T2JqLnNlc3Npb25zID0gc2Vzc2lvbnM7XG4gICAgICBmaXRPYmoubGFwcyA9IGxhcHM7XG4gICAgICBmaXRPYmoucmVjb3JkcyA9IHJlY29yZHM7XG4gICAgICBmaXRPYmouZXZlbnRzID0gZXZlbnRzO1xuICAgICAgZml0T2JqLmRldmljZV9pbmZvcyA9IGRldmljZXM7XG4gICAgICBmaXRPYmouZGV2ZWxvcGVyX2RhdGFfaWRzID0gYXBwbGljYXRpb25zO1xuICAgICAgZml0T2JqLmZpZWxkX2Rlc2NyaXB0aW9ucyA9IGZpZWxkRGVzY3JpcHRpb25zO1xuICAgICAgZml0T2JqLmhydiA9IGhydjtcbiAgICAgIGZpdE9iai5kaXZlX2dhc2VzID0gZGl2ZV9nYXNlcztcbiAgICAgIGZpdE9iai5jb3Vyc2VfcG9pbnRzID0gY291cnNlX3BvaW50cztcbiAgICB9XG5cbiAgICByZXR1cm4gYXdhaXQgZml0T2JqO1xuICB9XG59XG5cbiJdfQ==