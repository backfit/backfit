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
        var blob, err, headerLength, _err, fileTypeString, i, _err2, crcHeader, crcHeaderCalc, dataLength, crcStart, crcFile, crcFileCalc, fitObj, sessions, laps, records, events, hrv, devices, applications, fieldDescriptions, dive_gases, course_points, tempLaps, tempRecords, loopIndex, messageTypes, developerFields, isModeCascade, isCascadeNeeded, startDate, lastStopTimestamp, pausedTime, _readRecord, nextIndex, messageType, message;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                blob = new Uint8Array((0, _binary.getArrayBuffer)(content));

                if (!(blob.length < 12)) {
                  _context.next = 8;
                  break;
                }

                err = 'File to small to be a FIT file';

                if (this.options.force) {
                  _context.next = 7;
                  break;
                }

                throw new Error(err);

              case 7:
                console.log(err);

              case 8:
                headerLength = blob[0];

                if (!(headerLength !== 14 && headerLength !== 12)) {
                  _context.next = 16;
                  break;
                }

                _err = 'Incorrect header size';

                if (this.options.force) {
                  _context.next = 15;
                  break;
                }

                throw new Error(_err);

              case 15:
                console.log(_err);

              case 16:
                fileTypeString = '';

                for (i = 8; i < 12; i++) {
                  fileTypeString += String.fromCharCode(blob[i]);
                }

                if (!(fileTypeString !== '.FIT')) {
                  _context.next = 25;
                  break;
                }

                _err2 = 'Missing \'.FIT\' in header';

                if (this.options.force) {
                  _context.next = 24;
                  break;
                }

                throw new Error(_err2);

              case 24:
                console.log(_err2);

              case 25:
                if (headerLength === 14) {
                  crcHeader = blob[12] + (blob[13] << 8);
                  crcHeaderCalc = (0, _binary.calculateCRC)(blob, 0, 12);

                  if (crcHeader !== crcHeaderCalc) {// throw Error('Header CRC mismatch');
                    // TODO: fix Header CRC check
                    // if (!this.options.force) {
                    // return;
                    // }
                  }
                }

                dataLength = blob[4] + (blob[5] << 8) + (blob[6] << 16) + (blob[7] << 24);
                crcStart = dataLength + headerLength;
                crcFile = blob[crcStart] + (blob[crcStart + 1] << 8);
                crcFileCalc = (0, _binary.calculateCRC)(blob, headerLength === 12 ? 0 : headerLength, crcStart);

                if (crcFile !== crcFileCalc) {// callback('File CRC mismatch');
                  // TODO: fix File CRC check
                  // if (!this.options.force) {
                  //   return;
                  // }
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

              case 51:
                if (!(loopIndex < crcStart)) {
                  _context.next = 87;
                  break;
                }

                _readRecord = (0, _binary.readRecord)(blob, messageTypes, developerFields, loopIndex, this.options, startDate, pausedTime), nextIndex = _readRecord.nextIndex, messageType = _readRecord.messageType, message = _readRecord.message;
                loopIndex = nextIndex;

                if (!message) {
                  _context.next = 85;
                  break;
                }

                _context.t0 = messageType;
                _context.next = _context.t0 === 'lap' ? 58 : _context.t0 === 'session' ? 61 : _context.t0 === 'event' ? 64 : _context.t0 === 'hrv' ? 67 : _context.t0 === 'record' ? 69 : _context.t0 === 'field_description' ? 73 : _context.t0 === 'device_info' ? 75 : _context.t0 === 'developer_data_id' ? 77 : _context.t0 === 'dive_gas' ? 79 : _context.t0 === 'course_point' ? 81 : 83;
                break;

              case 58:
                if (isCascadeNeeded) {
                  message.records = tempRecords;
                  tempRecords = [];
                  tempLaps.push(message);
                }

                laps.push(message);
                return _context.abrupt("break", 85);

              case 61:
                if (isCascadeNeeded) {
                  message.laps = tempLaps;
                  tempLaps = [];
                }

                sessions.push(message);
                return _context.abrupt("break", 85);

              case 64:
                if (message.event === 'timer') {
                  if (message.event_type === 'stop_all') {
                    lastStopTimestamp = message.timestamp;
                  } else if (message.event_type === 'start' && lastStopTimestamp && message.timestamp) {
                    pausedTime += (message.timestamp - lastStopTimestamp) / 1000;
                  }
                }

                events.push(message);
                return _context.abrupt("break", 85);

              case 67:
                hrv.push(message);
                return _context.abrupt("break", 85);

              case 69:
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

                return _context.abrupt("break", 85);

              case 73:
                fieldDescriptions.push(message);
                return _context.abrupt("break", 85);

              case 75:
                devices.push(message);
                return _context.abrupt("break", 85);

              case 77:
                applications.push(message);
                return _context.abrupt("break", 85);

              case 79:
                dive_gases.push(message);
                return _context.abrupt("break", 85);

              case 81:
                course_points.push(message);
                return _context.abrupt("break", 85);

              case 83:
                if (messageType !== '') {
                  fitObj[messageType] = message;
                }

                return _context.abrupt("break", 85);

              case 85:
                _context.next = 51;
                break;

              case 87:
                if (isCascadeNeeded) {
                  fitObj.activity = {
                    sessions: sessions,
                    events: events,
                    hrv: hrv
                  };
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

                _context.next = 91;
                return fitObj;

              case 91:
                return _context.abrupt("return", _context.sent);

              case 92:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9maXQtcGFyc2VyLnRzIl0sIm5hbWVzIjpbIkZpdFBhcnNlciIsIm9wdGlvbnMiLCJmb3JjZSIsInNwZWVkVW5pdCIsImxlbmd0aFVuaXQiLCJ0ZW1wZXJhdHVyZVVuaXQiLCJlbGFwc2VkUmVjb3JkRmllbGQiLCJtb2RlIiwiY29udGVudCIsImJsb2IiLCJVaW50OEFycmF5IiwibGVuZ3RoIiwiZXJyIiwiRXJyb3IiLCJjb25zb2xlIiwibG9nIiwiaGVhZGVyTGVuZ3RoIiwiZmlsZVR5cGVTdHJpbmciLCJpIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiY3JjSGVhZGVyIiwiY3JjSGVhZGVyQ2FsYyIsImRhdGFMZW5ndGgiLCJjcmNTdGFydCIsImNyY0ZpbGUiLCJjcmNGaWxlQ2FsYyIsImZpdE9iaiIsInNlc3Npb25zIiwibGFwcyIsInJlY29yZHMiLCJldmVudHMiLCJocnYiLCJkZXZpY2VzIiwiYXBwbGljYXRpb25zIiwiZmllbGREZXNjcmlwdGlvbnMiLCJkaXZlX2dhc2VzIiwiY291cnNlX3BvaW50cyIsInRlbXBMYXBzIiwidGVtcFJlY29yZHMiLCJsb29wSW5kZXgiLCJtZXNzYWdlVHlwZXMiLCJkZXZlbG9wZXJGaWVsZHMiLCJpc01vZGVDYXNjYWRlIiwiaXNDYXNjYWRlTmVlZGVkIiwic3RhcnREYXRlIiwicGF1c2VkVGltZSIsIm5leHRJbmRleCIsIm1lc3NhZ2VUeXBlIiwibWVzc2FnZSIsInB1c2giLCJldmVudCIsImV2ZW50X3R5cGUiLCJsYXN0U3RvcFRpbWVzdGFtcCIsInRpbWVzdGFtcCIsImVsYXBzZWRfdGltZSIsInRpbWVyX3RpbWUiLCJhY3Rpdml0eSIsImRldmljZV9pbmZvcyIsImRldmVsb3Blcl9kYXRhX2lkcyIsImZpZWxkX2Rlc2NyaXB0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7OztJQUlxQkEsUzs7O0FBV25CLHVCQUE0QztBQUFBLFFBQWhDQyxPQUFn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LGFBQUwsRUFBb0I7QUFDbEJoQixrQkFBQUEsTUFBTSxDQUFDQyxRQUFQLEdBQWtCQSxRQUFsQjtBQUNBRCxrQkFBQUEsTUFBTSxDQUFDRSxJQUFQLEdBQWNBLElBQWQ7QUFDQUYsa0JBQUFBLE1BQU0sQ0FBQ0csT0FBUCxHQUFpQkEsT0FBakI7QUFDQUgsa0JBQUFBLE1BQU0sQ0FBQ0ksTUFBUCxHQUFnQkEsTUFBaEI7QUFDQUosa0JBQUFBLE1BQU0sQ0FBQytCLFlBQVAsR0FBc0J6QixPQUF0QjtBQUNBTixrQkFBQUEsTUFBTSxDQUFDZ0Msa0JBQVAsR0FBNEJ6QixZQUE1QjtBQUNBUCxrQkFBQUEsTUFBTSxDQUFDaUMsa0JBQVAsR0FBNEJ6QixpQkFBNUI7QUFDQVIsa0JBQUFBLE1BQU0sQ0FBQ0ssR0FBUCxHQUFhQSxHQUFiO0FBQ0FMLGtCQUFBQSxNQUFNLENBQUNTLFVBQVAsR0FBb0JBLFVBQXBCO0FBQ0FULGtCQUFBQSxNQUFNLENBQUNVLGFBQVAsR0FBdUJBLGFBQXZCO0FBQ0Q7Ozt1QkFFWVYsTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcImNvcmUtanMvc3RhYmxlXCI7XG5pbXBvcnQgXCJyZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWVcIjtcbmltcG9ydCB7IGdldEFycmF5QnVmZmVyLCBjYWxjdWxhdGVDUkMsIHJlYWRSZWNvcmQgfSBmcm9tICcuL2JpbmFyeSc7XG5pbXBvcnQgeyBEZXZlbG9wZXJGaWVsZHMsIEZpdFBhcnNlck9wdGlvbnMsXG4gIEZpdFBhcnNlclJlc3VsdCwgTWVzc2FnZVR5cGVzIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpdFBhcnNlciB7XG5cbiAgb3B0aW9uczogRml0UGFyc2VyT3B0aW9ucyA9IHtcbiAgICBmb3JjZTogdHJ1ZSxcbiAgICBzcGVlZFVuaXQ6ICdtL3MnLFxuICAgIGxlbmd0aFVuaXQ6ICdtJyxcbiAgICB0ZW1wZXJhdHVyZVVuaXQ6ICdjZWxzaXVzJyxcbiAgICBlbGFwc2VkUmVjb3JkRmllbGQ6IGZhbHNlLFxuICAgIG1vZGU6ICdsaXN0JyxcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEZpdFBhcnNlck9wdGlvbnMgPSB7fSkge1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgIGZvcmNlOiBvcHRpb25zLmZvcmNlID8gb3B0aW9ucy5mb3JjZSA6IHRydWUsXG4gICAgICAgIHNwZWVkVW5pdDogb3B0aW9ucy5zcGVlZFVuaXQgfHwgJ20vcycsXG4gICAgICAgIGxlbmd0aFVuaXQ6IG9wdGlvbnMubGVuZ3RoVW5pdCB8fCAnbScsXG4gICAgICAgIHRlbXBlcmF0dXJlVW5pdDogb3B0aW9ucy50ZW1wZXJhdHVyZVVuaXQgfHwgJ2NlbHNpdXMnLFxuICAgICAgICBlbGFwc2VkUmVjb3JkRmllbGQ6IG9wdGlvbnMuZWxhcHNlZFJlY29yZEZpZWxkIHx8IGZhbHNlLFxuICAgICAgICBtb2RlOiBvcHRpb25zLm1vZGUgfHwgJ2xpc3QnLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBwYXJzZShjb250ZW50OiBCdWZmZXIpOiBQcm9taXNlPEZpdFBhcnNlclJlc3VsdD4ge1xuICAgIGNvbnN0IGJsb2IgPSBuZXcgVWludDhBcnJheShnZXRBcnJheUJ1ZmZlcihjb250ZW50KSk7XG5cbiAgICBpZiAoYmxvYi5sZW5ndGggPCAxMikge1xuICAgICAgY29uc3QgZXJyID0gJ0ZpbGUgdG8gc21hbGwgdG8gYmUgYSBGSVQgZmlsZSc7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5mb3JjZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGhlYWRlckxlbmd0aCA9IGJsb2JbMF07XG4gICAgaWYgKGhlYWRlckxlbmd0aCAhPT0gMTQgJiYgaGVhZGVyTGVuZ3RoICE9PSAxMikge1xuICAgICAgY29uc3QgZXJyID0gJ0luY29ycmVjdCBoZWFkZXIgc2l6ZSc7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5mb3JjZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBmaWxlVHlwZVN0cmluZyA9ICcnO1xuICAgIGZvciAobGV0IGkgPSA4OyBpIDwgMTI7IGkrKykge1xuICAgICAgZmlsZVR5cGVTdHJpbmcgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShibG9iW2ldKTtcbiAgICB9XG4gICAgaWYgKGZpbGVUeXBlU3RyaW5nICE9PSAnLkZJVCcpIHtcbiAgICAgIGNvbnN0IGVyciA9ICdNaXNzaW5nIFxcJy5GSVRcXCcgaW4gaGVhZGVyJztcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmZvcmNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhlYWRlckxlbmd0aCA9PT0gMTQpIHtcbiAgICAgIGNvbnN0IGNyY0hlYWRlciA9IGJsb2JbMTJdICsgKGJsb2JbMTNdIDw8IDgpO1xuICAgICAgY29uc3QgY3JjSGVhZGVyQ2FsYyA9IGNhbGN1bGF0ZUNSQyhibG9iLCAwLCAxMik7XG4gICAgICBpZiAoY3JjSGVhZGVyICE9PSBjcmNIZWFkZXJDYWxjKSB7XG4gICAgICAgIC8vIHRocm93IEVycm9yKCdIZWFkZXIgQ1JDIG1pc21hdGNoJyk7XG4gICAgICAgIC8vIFRPRE86IGZpeCBIZWFkZXIgQ1JDIGNoZWNrXG4gICAgICAgIC8vIGlmICghdGhpcy5vcHRpb25zLmZvcmNlKSB7XG4gICAgICAgICAgLy8gcmV0dXJuO1xuICAgICAgICAvLyB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGRhdGFMZW5ndGggPSBibG9iWzRdICsgKGJsb2JbNV0gPDwgOCkgKyAoYmxvYls2XSA8PCAxNikgKyAoYmxvYls3XSA8PCAyNCk7XG4gICAgY29uc3QgY3JjU3RhcnQgPSBkYXRhTGVuZ3RoICsgaGVhZGVyTGVuZ3RoO1xuICAgIGNvbnN0IGNyY0ZpbGUgPSBibG9iW2NyY1N0YXJ0XSArIChibG9iW2NyY1N0YXJ0ICsgMV0gPDwgOCk7XG4gICAgY29uc3QgY3JjRmlsZUNhbGMgPSBjYWxjdWxhdGVDUkMoYmxvYiwgaGVhZGVyTGVuZ3RoID09PSAxMiA/IDAgOiBoZWFkZXJMZW5ndGgsIGNyY1N0YXJ0KTtcblxuICAgIGlmIChjcmNGaWxlICE9PSBjcmNGaWxlQ2FsYykge1xuICAgICAgLy8gY2FsbGJhY2soJ0ZpbGUgQ1JDIG1pc21hdGNoJyk7XG4gICAgICAvLyBUT0RPOiBmaXggRmlsZSBDUkMgY2hlY2tcbiAgICAgIC8vIGlmICghdGhpcy5vcHRpb25zLmZvcmNlKSB7XG4gICAgICAvLyAgIHJldHVybjtcbiAgICAgIC8vIH1cbiAgICB9XG5cbiAgICBjb25zdCBmaXRPYmo6Rml0UGFyc2VyUmVzdWx0ID0ge307XG4gICAgY29uc3Qgc2Vzc2lvbnMgPSBbXTtcbiAgICBjb25zdCBsYXBzID0gW107XG4gICAgY29uc3QgcmVjb3JkcyA9IFtdO1xuICAgIGNvbnN0IGV2ZW50cyA9IFtdO1xuICAgIGNvbnN0IGhydiA9IFtdO1xuICAgIGNvbnN0IGRldmljZXMgPSBbXTtcbiAgICBjb25zdCBhcHBsaWNhdGlvbnMgPSBbXTtcbiAgICBjb25zdCBmaWVsZERlc2NyaXB0aW9ucyA9IFtdO1xuICAgIGNvbnN0IGRpdmVfZ2FzZXMgPSBbXTtcbiAgICBjb25zdCBjb3Vyc2VfcG9pbnRzID0gW107XG5cbiAgICBsZXQgdGVtcExhcHMgPSBbXTtcbiAgICBsZXQgdGVtcFJlY29yZHMgPSBbXTtcblxuICAgIGxldCBsb29wSW5kZXggPSBoZWFkZXJMZW5ndGg7XG4gICAgY29uc3QgbWVzc2FnZVR5cGVzOiBNZXNzYWdlVHlwZXMgPSB7fTtcbiAgICBjb25zdCBkZXZlbG9wZXJGaWVsZHM6IERldmVsb3BlckZpZWxkcyA9IFtdO1xuXG4gICAgY29uc3QgaXNNb2RlQ2FzY2FkZSA9IHRoaXMub3B0aW9ucy5tb2RlID09PSAnY2FzY2FkZSc7XG4gICAgY29uc3QgaXNDYXNjYWRlTmVlZGVkID0gaXNNb2RlQ2FzY2FkZSB8fCB0aGlzLm9wdGlvbnMubW9kZSA9PT0gJ2JvdGgnO1xuXG4gICAgbGV0IHN0YXJ0RGF0ZSA9IDAsIGxhc3RTdG9wVGltZXN0YW1wO1xuICAgIGxldCBwYXVzZWRUaW1lID0gMDtcblxuICAgIHdoaWxlIChsb29wSW5kZXggPCBjcmNTdGFydCkge1xuICAgICAgY29uc3QgeyBuZXh0SW5kZXgsXG4gICAgICAgIG1lc3NhZ2VUeXBlLFxuICAgICAgICBtZXNzYWdlIH0gPSByZWFkUmVjb3JkKGJsb2IsIG1lc3NhZ2VUeXBlcywgZGV2ZWxvcGVyRmllbGRzLCBsb29wSW5kZXgsIHRoaXMub3B0aW9ucywgc3RhcnREYXRlLCBwYXVzZWRUaW1lKTtcbiAgICAgIGxvb3BJbmRleCA9IG5leHRJbmRleDtcbiAgXG4gICAgICBpZiAobWVzc2FnZSkge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2VUeXBlKSB7XG4gICAgICAgICAgY2FzZSAnbGFwJzpcbiAgICAgICAgICAgIGlmIChpc0Nhc2NhZGVOZWVkZWQpIHtcbiAgICAgICAgICAgICAgbWVzc2FnZS5yZWNvcmRzID0gdGVtcFJlY29yZHM7XG4gICAgICAgICAgICAgIHRlbXBSZWNvcmRzID0gW107XG4gICAgICAgICAgICAgIHRlbXBMYXBzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXBzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdzZXNzaW9uJzpcbiAgICAgICAgICAgIGlmIChpc0Nhc2NhZGVOZWVkZWQpIHtcbiAgICAgICAgICAgICAgbWVzc2FnZS5sYXBzID0gdGVtcExhcHM7XG4gICAgICAgICAgICAgIHRlbXBMYXBzID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXNzaW9ucy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZXZlbnQnOlxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UuZXZlbnQgPT09ICd0aW1lcicpIHtcbiAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UuZXZlbnRfdHlwZSA9PT0gJ3N0b3BfYWxsJykge1xuICAgICAgICAgICAgICAgIGxhc3RTdG9wVGltZXN0YW1wID0gbWVzc2FnZS50aW1lc3RhbXA7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS5ldmVudF90eXBlID09PSAnc3RhcnQnICYmIGxhc3RTdG9wVGltZXN0YW1wICYmIG1lc3NhZ2UudGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgcGF1c2VkVGltZSArPSAobWVzc2FnZS50aW1lc3RhbXAgLSBsYXN0U3RvcFRpbWVzdGFtcCkgLyAxMDAwO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBldmVudHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2hydic6XG4gICAgICAgICAgICBocnYucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3JlY29yZCc6XG4gICAgICAgICAgICBpZiAoIXN0YXJ0RGF0ZSkge1xuICAgICAgICAgICAgICBpZiAobWVzc2FnZS50aW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICBzdGFydERhdGUgPSBtZXNzYWdlLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBtZXNzYWdlLmVsYXBzZWRfdGltZSA9IDA7XG4gICAgICAgICAgICAgIG1lc3NhZ2UudGltZXJfdGltZSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWNvcmRzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBpZiAoaXNDYXNjYWRlTmVlZGVkKSB7XG4gICAgICAgICAgICAgIHRlbXBSZWNvcmRzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdmaWVsZF9kZXNjcmlwdGlvbic6XG4gICAgICAgICAgICBmaWVsZERlc2NyaXB0aW9ucy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZGV2aWNlX2luZm8nOlxuICAgICAgICAgICAgZGV2aWNlcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZGV2ZWxvcGVyX2RhdGFfaWQnOlxuICAgICAgICAgICAgYXBwbGljYXRpb25zLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkaXZlX2dhcyc6XG4gICAgICAgICAgICBkaXZlX2dhc2VzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdjb3Vyc2VfcG9pbnQnOlxuICAgICAgICAgICAgY291cnNlX3BvaW50cy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgZml0T2JqW21lc3NhZ2VUeXBlXSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpc0Nhc2NhZGVOZWVkZWQpIHtcbiAgICAgIGZpdE9iai5hY3Rpdml0eSA9IHsgc2Vzc2lvbnMsIGV2ZW50cywgaHJ2IH07XG4gICAgfVxuICAgIGlmICghaXNNb2RlQ2FzY2FkZSkge1xuICAgICAgZml0T2JqLnNlc3Npb25zID0gc2Vzc2lvbnM7XG4gICAgICBmaXRPYmoubGFwcyA9IGxhcHM7XG4gICAgICBmaXRPYmoucmVjb3JkcyA9IHJlY29yZHM7XG4gICAgICBmaXRPYmouZXZlbnRzID0gZXZlbnRzO1xuICAgICAgZml0T2JqLmRldmljZV9pbmZvcyA9IGRldmljZXM7XG4gICAgICBmaXRPYmouZGV2ZWxvcGVyX2RhdGFfaWRzID0gYXBwbGljYXRpb25zO1xuICAgICAgZml0T2JqLmZpZWxkX2Rlc2NyaXB0aW9ucyA9IGZpZWxkRGVzY3JpcHRpb25zO1xuICAgICAgZml0T2JqLmhydiA9IGhydjtcbiAgICAgIGZpdE9iai5kaXZlX2dhc2VzID0gZGl2ZV9nYXNlcztcbiAgICAgIGZpdE9iai5jb3Vyc2VfcG9pbnRzID0gY291cnNlX3BvaW50cztcbiAgICB9XG5cbiAgICByZXR1cm4gYXdhaXQgZml0T2JqO1xuICB9XG59XG5cbiJdfQ==