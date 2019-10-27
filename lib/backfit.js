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

var BackFIT =
/*#__PURE__*/
function () {
  function BackFIT() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, BackFIT);

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

  _createClass(BackFIT, [{
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

  return BackFIT;
}();

exports["default"] = BackFIT;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9iYWNrZml0LnRzIl0sIm5hbWVzIjpbIkJhY2tGSVQiLCJvcHRpb25zIiwiZm9yY2UiLCJzcGVlZFVuaXQiLCJsZW5ndGhVbml0IiwidGVtcGVyYXR1cmVVbml0IiwiZWxhcHNlZFJlY29yZEZpZWxkIiwibW9kZSIsImNvbnRlbnQiLCJibG9iIiwiVWludDhBcnJheSIsImxlbmd0aCIsImVyciIsIkVycm9yIiwiY29uc29sZSIsImxvZyIsImhlYWRlckxlbmd0aCIsImZpbGVUeXBlU3RyaW5nIiwiaSIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImNyY0hlYWRlciIsImNyY0hlYWRlckNhbGMiLCJkYXRhTGVuZ3RoIiwiY3JjU3RhcnQiLCJjcmNGaWxlIiwiY3JjRmlsZUNhbGMiLCJmaXRPYmoiLCJzZXNzaW9ucyIsImxhcHMiLCJyZWNvcmRzIiwiZXZlbnRzIiwiaHJ2IiwiZGV2aWNlcyIsImFwcGxpY2F0aW9ucyIsImZpZWxkRGVzY3JpcHRpb25zIiwiZGl2ZV9nYXNlcyIsImNvdXJzZV9wb2ludHMiLCJ0ZW1wTGFwcyIsInRlbXBSZWNvcmRzIiwibG9vcEluZGV4IiwibWVzc2FnZVR5cGVzIiwiZGV2ZWxvcGVyRmllbGRzIiwiaXNNb2RlQ2FzY2FkZSIsImlzQ2FzY2FkZU5lZWRlZCIsInN0YXJ0RGF0ZSIsInBhdXNlZFRpbWUiLCJuZXh0SW5kZXgiLCJtZXNzYWdlVHlwZSIsIm1lc3NhZ2UiLCJwdXNoIiwiZXZlbnQiLCJldmVudF90eXBlIiwibGFzdFN0b3BUaW1lc3RhbXAiLCJ0aW1lc3RhbXAiLCJlbGFwc2VkX3RpbWUiLCJ0aW1lcl90aW1lIiwiYWN0aXZpdHkiLCJkZXZpY2VfaW5mb3MiLCJkZXZlbG9wZXJfZGF0YV9pZHMiLCJmaWVsZF9kZXNjcmlwdGlvbnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7SUFJcUJBLE87OztBQVduQixxQkFBNEM7QUFBQSxRQUFoQ0MsT0FBZ0MsdUVB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LEVBQW9CO0FBQ2xCaEIsa0JBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxHQUFrQkEsUUFBbEI7QUFDQUQsa0JBQUFBLE1BQU0sQ0FBQ0UsSUFBUCxHQUFjQSxJQUFkO0FBQ0FGLGtCQUFBQSxNQUFNLENBQUNHLE9BQVAsR0FBaUJBLE9BQWpCO0FBQ0FILGtCQUFBQSxNQUFNLENBQUNJLE1BQVAsR0FBZ0JBLE1BQWhCO0FBQ0FKLGtCQUFBQSxNQUFNLENBQUMrQixZQUFQLEdBQXNCekIsT0FBdEI7QUFDQU4sa0JBQUFBLE1BQU0sQ0FBQ2dDLGtCQUFQLEdBQTRCekIsWUFBNUI7QUFDQVAsa0JBQUFBLE1BQU0sQ0FBQ2lDLGtCQUFQLEdBQTRCekIsaUJBQTVCO0FBQ0FSLGtCQUFBQSxNQUFNLENBQUNLLEdBQVAsR0FBYUEsR0FBYjtBQUNBTCxrQkFBQUEsTUFBTSxDQUFDUyxVQUFQLEdBQW9CQSxVQUFwQjtBQUNBVCxrQkFBQUEsTUFBTSxDQUFDVSxhQUFQLEdBQXVCQSxhQUF2QjtBQUNEOzs7dUJBRVlWLE0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJjb3JlLWpzL3N0YWJsZVwiO1xuaW1wb3J0IFwicmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lXCI7XG5pbXBvcnQgeyBnZXRBcnJheUJ1ZmZlciwgY2FsY3VsYXRlQ1JDLCByZWFkUmVjb3JkIH0gZnJvbSAnLi9iaW5hcnknO1xuaW1wb3J0IHsgRGV2ZWxvcGVyRmllbGRzLCBGaXRQYXJzZXJPcHRpb25zLFxuICBGaXRQYXJzZXJSZXN1bHQsIE1lc3NhZ2VUeXBlcyB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYWNrRklUIHtcblxuICBvcHRpb25zOiBGaXRQYXJzZXJPcHRpb25zID0ge1xuICAgIGZvcmNlOiB0cnVlLFxuICAgIHNwZWVkVW5pdDogJ20vcycsXG4gICAgbGVuZ3RoVW5pdDogJ20nLFxuICAgIHRlbXBlcmF0dXJlVW5pdDogJ2NlbHNpdXMnLFxuICAgIGVsYXBzZWRSZWNvcmRGaWVsZDogZmFsc2UsXG4gICAgbW9kZTogJ2xpc3QnLFxuICB9XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogRml0UGFyc2VyT3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgICAgZm9yY2U6IG9wdGlvbnMuZm9yY2UgPyBvcHRpb25zLmZvcmNlIDogdHJ1ZSxcbiAgICAgICAgc3BlZWRVbml0OiBvcHRpb25zLnNwZWVkVW5pdCB8fCAnbS9zJyxcbiAgICAgICAgbGVuZ3RoVW5pdDogb3B0aW9ucy5sZW5ndGhVbml0IHx8ICdtJyxcbiAgICAgICAgdGVtcGVyYXR1cmVVbml0OiBvcHRpb25zLnRlbXBlcmF0dXJlVW5pdCB8fCAnY2Vsc2l1cycsXG4gICAgICAgIGVsYXBzZWRSZWNvcmRGaWVsZDogb3B0aW9ucy5lbGFwc2VkUmVjb3JkRmllbGQgfHwgZmFsc2UsXG4gICAgICAgIG1vZGU6IG9wdGlvbnMubW9kZSB8fCAnbGlzdCcsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHBhcnNlKGNvbnRlbnQ6IEJ1ZmZlcik6IFByb21pc2U8Rml0UGFyc2VyUmVzdWx0PiB7XG4gICAgY29uc3QgYmxvYiA9IG5ldyBVaW50OEFycmF5KGdldEFycmF5QnVmZmVyKGNvbnRlbnQpKTtcblxuICAgIGlmIChibG9iLmxlbmd0aCA8IDEyKSB7XG4gICAgICBjb25zdCBlcnIgPSAnRmlsZSB0byBzbWFsbCB0byBiZSBhIEZJVCBmaWxlJztcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmZvcmNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVyTGVuZ3RoID0gYmxvYlswXTtcbiAgICBpZiAoaGVhZGVyTGVuZ3RoICE9PSAxNCAmJiBoZWFkZXJMZW5ndGggIT09IDEyKSB7XG4gICAgICBjb25zdCBlcnIgPSAnSW5jb3JyZWN0IGhlYWRlciBzaXplJztcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmZvcmNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGZpbGVUeXBlU3RyaW5nID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDg7IGkgPCAxMjsgaSsrKSB7XG4gICAgICBmaWxlVHlwZVN0cmluZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJsb2JbaV0pO1xuICAgIH1cbiAgICBpZiAoZmlsZVR5cGVTdHJpbmcgIT09ICcuRklUJykge1xuICAgICAgY29uc3QgZXJyID0gJ01pc3NpbmcgXFwnLkZJVFxcJyBpbiBoZWFkZXInO1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZm9yY2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaGVhZGVyTGVuZ3RoID09PSAxNCkge1xuICAgICAgY29uc3QgY3JjSGVhZGVyID0gYmxvYlsxMl0gKyAoYmxvYlsxM10gPDwgOCk7XG4gICAgICBjb25zdCBjcmNIZWFkZXJDYWxjID0gY2FsY3VsYXRlQ1JDKGJsb2IsIDAsIDEyKTtcbiAgICAgIGlmIChjcmNIZWFkZXIgIT09IGNyY0hlYWRlckNhbGMpIHtcbiAgICAgICAgLy8gdGhyb3cgRXJyb3IoJ0hlYWRlciBDUkMgbWlzbWF0Y2gnKTtcbiAgICAgICAgLy8gVE9ETzogZml4IEhlYWRlciBDUkMgY2hlY2tcbiAgICAgICAgLy8gaWYgKCF0aGlzLm9wdGlvbnMuZm9yY2UpIHtcbiAgICAgICAgICAvLyByZXR1cm47XG4gICAgICAgIC8vIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZGF0YUxlbmd0aCA9IGJsb2JbNF0gKyAoYmxvYls1XSA8PCA4KSArIChibG9iWzZdIDw8IDE2KSArIChibG9iWzddIDw8IDI0KTtcbiAgICBjb25zdCBjcmNTdGFydCA9IGRhdGFMZW5ndGggKyBoZWFkZXJMZW5ndGg7XG4gICAgY29uc3QgY3JjRmlsZSA9IGJsb2JbY3JjU3RhcnRdICsgKGJsb2JbY3JjU3RhcnQgKyAxXSA8PCA4KTtcbiAgICBjb25zdCBjcmNGaWxlQ2FsYyA9IGNhbGN1bGF0ZUNSQyhibG9iLCBoZWFkZXJMZW5ndGggPT09IDEyID8gMCA6IGhlYWRlckxlbmd0aCwgY3JjU3RhcnQpO1xuXG4gICAgaWYgKGNyY0ZpbGUgIT09IGNyY0ZpbGVDYWxjKSB7XG4gICAgICAvLyBjYWxsYmFjaygnRmlsZSBDUkMgbWlzbWF0Y2gnKTtcbiAgICAgIC8vIFRPRE86IGZpeCBGaWxlIENSQyBjaGVja1xuICAgICAgLy8gaWYgKCF0aGlzLm9wdGlvbnMuZm9yY2UpIHtcbiAgICAgIC8vICAgcmV0dXJuO1xuICAgICAgLy8gfVxuICAgIH1cblxuICAgIGNvbnN0IGZpdE9iajpGaXRQYXJzZXJSZXN1bHQgPSB7fTtcbiAgICBjb25zdCBzZXNzaW9ucyA9IFtdO1xuICAgIGNvbnN0IGxhcHMgPSBbXTtcbiAgICBjb25zdCByZWNvcmRzID0gW107XG4gICAgY29uc3QgZXZlbnRzID0gW107XG4gICAgY29uc3QgaHJ2ID0gW107XG4gICAgY29uc3QgZGV2aWNlcyA9IFtdO1xuICAgIGNvbnN0IGFwcGxpY2F0aW9ucyA9IFtdO1xuICAgIGNvbnN0IGZpZWxkRGVzY3JpcHRpb25zID0gW107XG4gICAgY29uc3QgZGl2ZV9nYXNlcyA9IFtdO1xuICAgIGNvbnN0IGNvdXJzZV9wb2ludHMgPSBbXTtcblxuICAgIGxldCB0ZW1wTGFwcyA9IFtdO1xuICAgIGxldCB0ZW1wUmVjb3JkcyA9IFtdO1xuXG4gICAgbGV0IGxvb3BJbmRleCA9IGhlYWRlckxlbmd0aDtcbiAgICBjb25zdCBtZXNzYWdlVHlwZXM6IE1lc3NhZ2VUeXBlcyA9IHt9O1xuICAgIGNvbnN0IGRldmVsb3BlckZpZWxkczogRGV2ZWxvcGVyRmllbGRzID0gW107XG5cbiAgICBjb25zdCBpc01vZGVDYXNjYWRlID0gdGhpcy5vcHRpb25zLm1vZGUgPT09ICdjYXNjYWRlJztcbiAgICBjb25zdCBpc0Nhc2NhZGVOZWVkZWQgPSBpc01vZGVDYXNjYWRlIHx8IHRoaXMub3B0aW9ucy5tb2RlID09PSAnYm90aCc7XG5cbiAgICBsZXQgc3RhcnREYXRlID0gMCwgbGFzdFN0b3BUaW1lc3RhbXA7XG4gICAgbGV0IHBhdXNlZFRpbWUgPSAwO1xuXG4gICAgd2hpbGUgKGxvb3BJbmRleCA8IGNyY1N0YXJ0KSB7XG4gICAgICBjb25zdCB7IG5leHRJbmRleCxcbiAgICAgICAgbWVzc2FnZVR5cGUsXG4gICAgICAgIG1lc3NhZ2UgfSA9IHJlYWRSZWNvcmQoYmxvYiwgbWVzc2FnZVR5cGVzLCBkZXZlbG9wZXJGaWVsZHMsIGxvb3BJbmRleCwgdGhpcy5vcHRpb25zLCBzdGFydERhdGUsIHBhdXNlZFRpbWUpO1xuICAgICAgbG9vcEluZGV4ID0gbmV4dEluZGV4O1xuICBcbiAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgIHN3aXRjaCAobWVzc2FnZVR5cGUpIHtcbiAgICAgICAgICBjYXNlICdsYXAnOlxuICAgICAgICAgICAgaWYgKGlzQ2FzY2FkZU5lZWRlZCkge1xuICAgICAgICAgICAgICBtZXNzYWdlLnJlY29yZHMgPSB0ZW1wUmVjb3JkcztcbiAgICAgICAgICAgICAgdGVtcFJlY29yZHMgPSBbXTtcbiAgICAgICAgICAgICAgdGVtcExhcHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhcHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3Nlc3Npb24nOlxuICAgICAgICAgICAgaWYgKGlzQ2FzY2FkZU5lZWRlZCkge1xuICAgICAgICAgICAgICBtZXNzYWdlLmxhcHMgPSB0ZW1wTGFwcztcbiAgICAgICAgICAgICAgdGVtcExhcHMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlc3Npb25zLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdldmVudCc6XG4gICAgICAgICAgICBpZiAobWVzc2FnZS5ldmVudCA9PT0gJ3RpbWVyJykge1xuICAgICAgICAgICAgICBpZiAobWVzc2FnZS5ldmVudF90eXBlID09PSAnc3RvcF9hbGwnKSB7XG4gICAgICAgICAgICAgICAgbGFzdFN0b3BUaW1lc3RhbXAgPSBtZXNzYWdlLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLmV2ZW50X3R5cGUgPT09ICdzdGFydCcgJiYgbGFzdFN0b3BUaW1lc3RhbXAgJiYgbWVzc2FnZS50aW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICBwYXVzZWRUaW1lICs9IChtZXNzYWdlLnRpbWVzdGFtcCAtIGxhc3RTdG9wVGltZXN0YW1wKSAvIDEwMDA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV2ZW50cy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnaHJ2JzpcbiAgICAgICAgICAgIGhydi5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAncmVjb3JkJzpcbiAgICAgICAgICAgIGlmICghc3RhcnREYXRlKSB7XG4gICAgICAgICAgICAgIGlmIChtZXNzYWdlLnRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZSA9IG1lc3NhZ2UudGltZXN0YW1wO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG1lc3NhZ2UuZWxhcHNlZF90aW1lID0gMDtcbiAgICAgICAgICAgICAgbWVzc2FnZS50aW1lcl90aW1lID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlY29yZHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGlmIChpc0Nhc2NhZGVOZWVkZWQpIHtcbiAgICAgICAgICAgICAgdGVtcFJlY29yZHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2ZpZWxkX2Rlc2NyaXB0aW9uJzpcbiAgICAgICAgICAgIGZpZWxkRGVzY3JpcHRpb25zLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkZXZpY2VfaW5mbyc6XG4gICAgICAgICAgICBkZXZpY2VzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkZXZlbG9wZXJfZGF0YV9pZCc6XG4gICAgICAgICAgICBhcHBsaWNhdGlvbnMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2RpdmVfZ2FzJzpcbiAgICAgICAgICAgIGRpdmVfZ2FzZXMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2NvdXJzZV9wb2ludCc6XG4gICAgICAgICAgICBjb3Vyc2VfcG9pbnRzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlICE9PSAnJykge1xuICAgICAgICAgICAgICBmaXRPYmpbbWVzc2FnZVR5cGVdID0gbWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlzQ2FzY2FkZU5lZWRlZCkge1xuICAgICAgZml0T2JqLmFjdGl2aXR5ID0geyBzZXNzaW9ucywgZXZlbnRzLCBocnYgfTtcbiAgICB9XG4gICAgaWYgKCFpc01vZGVDYXNjYWRlKSB7XG4gICAgICBmaXRPYmouc2Vzc2lvbnMgPSBzZXNzaW9ucztcbiAgICAgIGZpdE9iai5sYXBzID0gbGFwcztcbiAgICAgIGZpdE9iai5yZWNvcmRzID0gcmVjb3JkcztcbiAgICAgIGZpdE9iai5ldmVudHMgPSBldmVudHM7XG4gICAgICBmaXRPYmouZGV2aWNlX2luZm9zID0gZGV2aWNlcztcbiAgICAgIGZpdE9iai5kZXZlbG9wZXJfZGF0YV9pZHMgPSBhcHBsaWNhdGlvbnM7XG4gICAgICBmaXRPYmouZmllbGRfZGVzY3JpcHRpb25zID0gZmllbGREZXNjcmlwdGlvbnM7XG4gICAgICBmaXRPYmouaHJ2ID0gaHJ2O1xuICAgICAgZml0T2JqLmRpdmVfZ2FzZXMgPSBkaXZlX2dhc2VzO1xuICAgICAgZml0T2JqLmNvdXJzZV9wb2ludHMgPSBjb3Vyc2VfcG9pbnRzO1xuICAgIH1cblxuICAgIHJldHVybiBhd2FpdCBmaXRPYmo7XG4gIH1cbn1cbiJdfQ==