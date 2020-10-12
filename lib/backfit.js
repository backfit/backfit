"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("core-js/stable");

require("regenerator-runtime/runtime");

var _binary = require("./binary");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var BackFIT = /*#__PURE__*/function () {
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
    value: function parse(content) {
      var blob = new Uint8Array((0, _binary.getArrayBuffer)(content));

      if (blob.length < 12) {
        var err = 'File to small to be a FIT file';

        if (!this.options.force) {
          throw new Error(err);
        } else {
          console.log(err);
        }
      }

      var headerLength = blob[0];

      if (headerLength !== 14 && headerLength !== 12) {
        var _err = 'Incorrect header size';

        if (!this.options.force) {
          throw new Error(_err);
        } else {
          console.log(_err);
        }
      }

      var fileTypeString = '';

      for (var i = 8; i < 12; i++) {
        fileTypeString += String.fromCharCode(blob[i]);
      }

      if (fileTypeString !== '.FIT') {
        var _err2 = 'Missing \'.FIT\' in header';

        if (!this.options.force) {
          throw new Error(_err2);
        } else {
          console.log(_err2);
        }
      }

      if (headerLength === 14) {
        var crcHeader = blob[12] + (blob[13] << 8);
        var crcHeaderCalc = (0, _binary.calculateCRC)(blob, 0, 12);

        if (crcHeader !== crcHeaderCalc) {// throw Error('Header CRC mismatch');
          // TODO: fix Header CRC check
          // if (!this.options.force) {
          // return;
          // }
        }
      }

      var protocolVersion = blob[1];
      var profileVersion = blob[2] + (blob[3] << 8);
      var dataLength = blob[4] + (blob[5] << 8) + (blob[6] << 16) + (blob[7] << 24);
      var crcStart = dataLength + headerLength;
      var crcFile = blob[crcStart] + (blob[crcStart + 1] << 8);
      var crcFileCalc = (0, _binary.calculateCRC)(blob, headerLength === 12 ? 0 : headerLength, crcStart);

      if (crcFile !== crcFileCalc) {// callback('File CRC mismatch');
        // TODO: fix File CRC check
        // if (!this.options.force) {
        //   return;
        // }
      }

      var fitObj = {};
      fitObj.protocolVersion = protocolVersion;
      fitObj.profileVersion = profileVersion;
      var sessions = [];
      var laps = [];
      var records = [];
      var events = [];
      var hrv = [];
      var devices = [];
      var applications = [];
      var fieldDescriptions = [];
      var dive_gases = [];
      var course_points = [];
      var sports = [];
      var monitors = [];
      var stress = [];
      var definitions = [];
      var file_ids = [];
      var monitor_info = [];
      var lengths = [];
      var tempLaps = [];
      var tempLengths = [];
      var tempRecords = [];
      var loopIndex = headerLength;
      var messageTypes = {};
      var developerFields = [];
      var isModeCascade = this.options.mode === 'cascade';
      var isCascadeNeeded = isModeCascade || this.options.mode === 'both';
      var startDate = 0,
          lastStopTimestamp;
      var pausedTime = 0;

      while (loopIndex < crcStart) {
        var _readRecord = (0, _binary.readRecord)(blob, messageTypes, developerFields, loopIndex, this.options, startDate, pausedTime),
            nextIndex = _readRecord.nextIndex,
            messageType = _readRecord.messageType,
            message = _readRecord.message;

        loopIndex = nextIndex;

        if (message) {
          switch (messageType) {
            case 'lap':
              if (isCascadeNeeded) {
                message.records = tempRecords;
                tempRecords = [];
                tempLaps.push(message);
                message.lengths = tempLengths;
                tempLengths = [];
              }

              laps.push(message);
              break;

            case 'session':
              if (isCascadeNeeded) {
                message.laps = tempLaps;
                tempLaps = [];
              }

              sessions.push(message);
              break;

            case 'event':
              if (message.event === 'timer') {
                if (message.event_type === 'stop_all') {
                  lastStopTimestamp = message.timestamp;
                } else if (message.event_type === 'start' && lastStopTimestamp && message.timestamp) {
                  pausedTime += (message.timestamp - lastStopTimestamp) / 1000;
                }
              }

              events.push(message);
              break;

            case 'length':
              if (isCascadeNeeded) {
                tempLengths.push(message);
              }

              lengths.push(message);
              break;

            case 'hrv':
              hrv.push(message);
              break;

            case 'record':
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

              break;

            case 'field_description':
              fieldDescriptions.push(message);
              break;

            case 'device_info':
              devices.push(message);
              break;

            case 'developer_data_id':
              applications.push(message);
              break;

            case 'dive_gas':
              dive_gases.push(message);
              break;

            case 'course_point':
              course_points.push(message);
              break;

            case 'sport':
              sports.push(message);
              break;

            case 'file_id':
              if (message) {
                file_ids.push(message);
              }

              break;

            case 'definition':
              if (message) {
                definitions.push(message);
              }

              break;

            case 'monitoring':
              monitors.push(message);
              break;

            case 'monitoring_info':
              monitor_info.push(message);
              break;

            case 'stress_level':
              stress.push(message);
              break;

            case 'software':
              fitObj.software = message;
              break;

            default:
              if (messageType !== '') {
                fitObj[messageType] = message;
              }

              break;
          }
        }
      }

      if (isCascadeNeeded) {
        fitObj.activity = {
          sessions: sessions,
          events: events,
          hrv: hrv,
          sports: sports,
          device_infos: devices,
          developer_data_ids: applications,
          field_descriptions: fieldDescriptions
        };
      }

      if (!isModeCascade) {
        fitObj.sessions = sessions;
        fitObj.laps = laps;
        fitObj.lengths = lengths;
        fitObj.records = records;
        fitObj.events = events;
        fitObj.device_infos = devices;
        fitObj.developer_data_ids = applications;
        fitObj.field_descriptions = fieldDescriptions;
        fitObj.hrv = hrv;
        fitObj.dive_gases = dive_gases;
        fitObj.course_points = course_points;
        fitObj.sports = sports;
        fitObj.devices = devices;
        fitObj.monitors = monitors;
        fitObj.stress = stress;
        fitObj.file_ids = file_ids;
        fitObj.monitor_info = monitor_info;
        fitObj.definitions = definitions;
      }

      return fitObj;
    }
  }]);

  return BackFIT;
}();

exports["default"] = BackFIT;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9iYWNrZml0LnRzIl0sIm5hbWVzIjpbIkJhY2tGSVQiLCJvcHRpb25zIiwiZm9yY2UiLCJzcGVlZFVuaXQiLCJsZW5ndGhVbml0IiwidGVtcGVyYXR1cmVVbml0IiwiZWxhcHNlZFJlY29yZEZpZWxkIiwibW9kZSIsImNvbnRlbnQiLCJibG9iIiwiVWludDhBcnJheSIsImxlbmd0aCIsImVyciIsIkVycm9yIiwiY29uc29sZSIsImxvZyIsImhlYWRlckxlbmd0aCIsImZpbGVUeXBlU3RyaW5nIiwiaSIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImNyY0hlYWRlciIsImNyY0hlYWRlckNhbGMiLCJwcm90b2NvbFZlcnNpb24iLCJwcm9maWxlVmVyc2lvbiIsImRhdGFMZW5ndGgiLCJjcmNTdGFydCIsImNyY0ZpbGUiLCJjcmNGaWxlQ2FsYyIsImZpdE9iaiIsInNlc3Npb25zIiwibGFwcyIsInJlY29yZHMiLCJldmVudHMiLCJocnYiLCJkZXZpY2VzIiwiYXBwbGljYXRpb25zIiwiZmllbGREZXNjcmlwdGlvbnMiLCJkaXZlX2dhc2VzIiwiY291cnNlX3BvaW50cyIsInNwb3J0cyIsIm1vbml0b3JzIiwic3RyZXNzIiwiZGVmaW5pdGlvbnMiLCJmaWxlX2lkcyIsIm1vbml0b3JfaW5mbyIsImxlbmd0aHMiLCJ0ZW1wTGFwcyIsInRlbXBMZW5ndGhzIiwidGVtcFJlY29yZHMiLCJsb29wSW5kZXgiLCJtZXNzYWdlVHlwZXMiLCJkZXZlbG9wZXJGaWVsZHMiLCJpc01vZGVDYXNjYWRlIiwiaXNDYXNjYWRlTmVlZGVkIiwic3RhcnREYXRlIiwibGFzdFN0b3BUaW1lc3RhbXAiLCJwYXVzZWRUaW1lIiwibmV4dEluZGV4IiwibWVzc2FnZVR5cGUiLCJtZXNzYWdlIiwicHVzaCIsImV2ZW50IiwiZXZlbnRfdHlwZSIsInRpbWVzdGFtcCIsImVsYXBzZWRfdGltZSIsInRpbWVyX3RpbWUiLCJzb2Z0d2FyZSIsImFjdGl2aXR5IiwiZGV2aWNlX2luZm9z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Q29udGVudCI6WyJpbXBvcnQgXCJjb3JlLWpzL3N0YWJsZVwiO1xuaW1wb3J0IFwicmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lXCI7XG5pbXBvcnQgeyBnZXRBcnJheUJ1ZmZlciwgY2FsY3VsYXRlQ1JDLCByZWFkUmVjb3JkIH0gZnJvbSAnLi9iaW5hcnknO1xuaW1wb3J0IHsgRGV2ZWxvcGVyRmllbGRzLCBGaXRQYXJzZXJPcHRpb25zLFxuICBGaXRQYXJzZXJSZXN1bHQsIE1lc3NhZ2VUeXBlcyB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYWNrRklUIHtcblxuICBvcHRpb25zOiBGaXRQYXJzZXJPcHRpb25zID0ge1xuICAgIGZvcmNlOiB0cnVlLFxuICAgIHNwZWVkVW5pdDogJ20vcycsXG4gICAgbGVuZ3RoVW5pdDogJ20nLFxuICAgIHRlbXBlcmF0dXJlVW5pdDogJ2NlbHNpdXMnLFxuICAgIGVsYXBzZWRSZWNvcmRGaWVsZDogZmFsc2UsXG4gICAgbW9kZTogJ2xpc3QnLFxuICB9XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogRml0UGFyc2VyT3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgICAgZm9yY2U6IG9wdGlvbnMuZm9yY2UgPyBvcHRpb25zLmZvcmNlIDogdHJ1ZSxcbiAgICAgICAgc3BlZWRVbml0OiBvcHRpb25zLnNwZWVkVW5pdCB8fCAnbS9zJyxcbiAgICAgICAgbGVuZ3RoVW5pdDogb3B0aW9ucy5sZW5ndGhVbml0IHx8ICdtJyxcbiAgICAgICAgdGVtcGVyYXR1cmVVbml0OiBvcHRpb25zLnRlbXBlcmF0dXJlVW5pdCB8fCAnY2Vsc2l1cycsXG4gICAgICAgIGVsYXBzZWRSZWNvcmRGaWVsZDogb3B0aW9ucy5lbGFwc2VkUmVjb3JkRmllbGQgfHwgZmFsc2UsXG4gICAgICAgIG1vZGU6IG9wdGlvbnMubW9kZSB8fCAnbGlzdCcsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHBhcnNlKGNvbnRlbnQ6IEJ1ZmZlcik6IEZpdFBhcnNlclJlc3VsdCB7XG4gICAgY29uc3QgYmxvYiA9IG5ldyBVaW50OEFycmF5KGdldEFycmF5QnVmZmVyKGNvbnRlbnQpKTtcblxuICAgIGlmIChibG9iLmxlbmd0aCA8IDEyKSB7XG4gICAgICBjb25zdCBlcnIgPSAnRmlsZSB0byBzbWFsbCB0byBiZSBhIEZJVCBmaWxlJztcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmZvcmNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVyTGVuZ3RoID0gYmxvYlswXTtcbiAgICBpZiAoaGVhZGVyTGVuZ3RoICE9PSAxNCAmJiBoZWFkZXJMZW5ndGggIT09IDEyKSB7XG4gICAgICBjb25zdCBlcnIgPSAnSW5jb3JyZWN0IGhlYWRlciBzaXplJztcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmZvcmNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGZpbGVUeXBlU3RyaW5nID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDg7IGkgPCAxMjsgaSsrKSB7XG4gICAgICBmaWxlVHlwZVN0cmluZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJsb2JbaV0pO1xuICAgIH1cbiAgICBpZiAoZmlsZVR5cGVTdHJpbmcgIT09ICcuRklUJykge1xuICAgICAgY29uc3QgZXJyID0gJ01pc3NpbmcgXFwnLkZJVFxcJyBpbiBoZWFkZXInO1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZm9yY2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaGVhZGVyTGVuZ3RoID09PSAxNCkge1xuICAgICAgY29uc3QgY3JjSGVhZGVyID0gYmxvYlsxMl0gKyAoYmxvYlsxM10gPDwgOCk7XG4gICAgICBjb25zdCBjcmNIZWFkZXJDYWxjID0gY2FsY3VsYXRlQ1JDKGJsb2IsIDAsIDEyKTtcbiAgICAgIGlmIChjcmNIZWFkZXIgIT09IGNyY0hlYWRlckNhbGMpIHtcbiAgICAgICAgLy8gdGhyb3cgRXJyb3IoJ0hlYWRlciBDUkMgbWlzbWF0Y2gnKTtcbiAgICAgICAgLy8gVE9ETzogZml4IEhlYWRlciBDUkMgY2hlY2tcbiAgICAgICAgLy8gaWYgKCF0aGlzLm9wdGlvbnMuZm9yY2UpIHtcbiAgICAgICAgICAvLyByZXR1cm47XG4gICAgICAgIC8vIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwcm90b2NvbFZlcnNpb24gPSBibG9iWzFdO1xuICAgIGNvbnN0IHByb2ZpbGVWZXJzaW9uID0gYmxvYlsyXSArIChibG9iWzNdIDw8IDgpO1xuICAgIGNvbnN0IGRhdGFMZW5ndGggPSBibG9iWzRdICsgKGJsb2JbNV0gPDwgOCkgKyAoYmxvYls2XSA8PCAxNikgKyAoYmxvYls3XSA8PCAyNCk7XG4gICAgY29uc3QgY3JjU3RhcnQgPSBkYXRhTGVuZ3RoICsgaGVhZGVyTGVuZ3RoO1xuICAgIGNvbnN0IGNyY0ZpbGUgPSBibG9iW2NyY1N0YXJ0XSArIChibG9iW2NyY1N0YXJ0ICsgMV0gPDwgOCk7XG4gICAgY29uc3QgY3JjRmlsZUNhbGMgPSBjYWxjdWxhdGVDUkMoYmxvYiwgaGVhZGVyTGVuZ3RoID09PSAxMiA/IDAgOiBoZWFkZXJMZW5ndGgsIGNyY1N0YXJ0KTtcblxuICAgIGlmIChjcmNGaWxlICE9PSBjcmNGaWxlQ2FsYykge1xuICAgICAgLy8gY2FsbGJhY2soJ0ZpbGUgQ1JDIG1pc21hdGNoJyk7XG4gICAgICAvLyBUT0RPOiBmaXggRmlsZSBDUkMgY2hlY2tcbiAgICAgIC8vIGlmICghdGhpcy5vcHRpb25zLmZvcmNlKSB7XG4gICAgICAvLyAgIHJldHVybjtcbiAgICAgIC8vIH1cbiAgICB9XG5cbiAgICBjb25zdCBmaXRPYmo6Rml0UGFyc2VyUmVzdWx0ID0ge307XG4gICAgZml0T2JqLnByb3RvY29sVmVyc2lvbiA9IHByb3RvY29sVmVyc2lvbjtcbiAgICBmaXRPYmoucHJvZmlsZVZlcnNpb24gPSBwcm9maWxlVmVyc2lvbjtcbiAgICBjb25zdCBzZXNzaW9ucyA9IFtdO1xuICAgIGNvbnN0IGxhcHMgPSBbXTtcbiAgICBjb25zdCByZWNvcmRzID0gW107XG4gICAgY29uc3QgZXZlbnRzID0gW107XG4gICAgY29uc3QgaHJ2ID0gW107XG4gICAgY29uc3QgZGV2aWNlcyA9IFtdO1xuICAgIGNvbnN0IGFwcGxpY2F0aW9ucyA9IFtdO1xuICAgIGNvbnN0IGZpZWxkRGVzY3JpcHRpb25zID0gW107XG4gICAgY29uc3QgZGl2ZV9nYXNlcyA9IFtdO1xuICAgIGNvbnN0IGNvdXJzZV9wb2ludHMgPSBbXTtcbiAgICBjb25zdCBzcG9ydHMgPSBbXTtcbiAgICBjb25zdCBtb25pdG9ycyA9IFtdO1xuICAgIGNvbnN0IHN0cmVzcyA9IFtdO1xuICAgIGNvbnN0IGRlZmluaXRpb25zID0gW107XG4gICAgY29uc3QgZmlsZV9pZHMgPSBbXTtcbiAgICBjb25zdCBtb25pdG9yX2luZm8gPSBbXTtcbiAgICBjb25zdCBsZW5ndGhzID0gW107XG5cbiAgICBsZXQgdGVtcExhcHMgPSBbXTtcbiAgICBsZXQgdGVtcExlbmd0aHMgPSBbXTtcbiAgICBsZXQgdGVtcFJlY29yZHMgPSBbXTtcblxuICAgIGxldCBsb29wSW5kZXggPSBoZWFkZXJMZW5ndGg7XG4gICAgY29uc3QgbWVzc2FnZVR5cGVzOiBNZXNzYWdlVHlwZXMgPSB7fTtcbiAgICBjb25zdCBkZXZlbG9wZXJGaWVsZHM6IERldmVsb3BlckZpZWxkcyA9IFtdO1xuXG4gICAgY29uc3QgaXNNb2RlQ2FzY2FkZSA9IHRoaXMub3B0aW9ucy5tb2RlID09PSAnY2FzY2FkZSc7XG4gICAgY29uc3QgaXNDYXNjYWRlTmVlZGVkID0gaXNNb2RlQ2FzY2FkZSB8fCB0aGlzLm9wdGlvbnMubW9kZSA9PT0gJ2JvdGgnO1xuXG4gICAgbGV0IHN0YXJ0RGF0ZSA9IDAsIGxhc3RTdG9wVGltZXN0YW1wO1xuICAgIGxldCBwYXVzZWRUaW1lID0gMDtcblxuICAgIHdoaWxlIChsb29wSW5kZXggPCBjcmNTdGFydCkge1xuICAgICAgY29uc3QgeyBuZXh0SW5kZXgsXG4gICAgICAgIG1lc3NhZ2VUeXBlLFxuICAgICAgICBtZXNzYWdlIH0gPSByZWFkUmVjb3JkKGJsb2IsIG1lc3NhZ2VUeXBlcywgZGV2ZWxvcGVyRmllbGRzLCBsb29wSW5kZXgsIHRoaXMub3B0aW9ucywgc3RhcnREYXRlLCBwYXVzZWRUaW1lKTtcbiAgICAgIGxvb3BJbmRleCA9IG5leHRJbmRleDtcbiAgXG4gICAgICBpZiAobWVzc2FnZSkge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2VUeXBlKSB7XG4gICAgICAgICAgY2FzZSAnbGFwJzpcbiAgICAgICAgICAgIGlmIChpc0Nhc2NhZGVOZWVkZWQpIHtcbiAgICAgICAgICAgICAgbWVzc2FnZS5yZWNvcmRzID0gdGVtcFJlY29yZHM7XG4gICAgICAgICAgICAgIHRlbXBSZWNvcmRzID0gW107XG4gICAgICAgICAgICAgIHRlbXBMYXBzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICAgIG1lc3NhZ2UubGVuZ3RocyA9IHRlbXBMZW5ndGhzO1xuICAgICAgICAgICAgICB0ZW1wTGVuZ3RocyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFwcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnc2Vzc2lvbic6XG4gICAgICAgICAgICBpZiAoaXNDYXNjYWRlTmVlZGVkKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UubGFwcyA9IHRlbXBMYXBzO1xuICAgICAgICAgICAgICB0ZW1wTGFwcyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2Vzc2lvbnMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2V2ZW50JzpcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmV2ZW50ID09PSAndGltZXInKSB7XG4gICAgICAgICAgICAgIGlmIChtZXNzYWdlLmV2ZW50X3R5cGUgPT09ICdzdG9wX2FsbCcpIHtcbiAgICAgICAgICAgICAgICBsYXN0U3RvcFRpbWVzdGFtcCA9IG1lc3NhZ2UudGltZXN0YW1wO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UuZXZlbnRfdHlwZSA9PT0gJ3N0YXJ0JyAmJiBsYXN0U3RvcFRpbWVzdGFtcCAmJiBtZXNzYWdlLnRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgIHBhdXNlZFRpbWUgKz0gKG1lc3NhZ2UudGltZXN0YW1wIC0gbGFzdFN0b3BUaW1lc3RhbXApIC8gMTAwMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXZlbnRzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdsZW5ndGgnOlxuICAgICAgICAgICAgaWYgKGlzQ2FzY2FkZU5lZWRlZCkge1xuICAgICAgICAgICAgICB0ZW1wTGVuZ3Rocy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGVuZ3Rocy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnaHJ2JzpcbiAgICAgICAgICAgIGhydi5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAncmVjb3JkJzpcbiAgICAgICAgICAgIGlmICghc3RhcnREYXRlKSB7XG4gICAgICAgICAgICAgIGlmIChtZXNzYWdlLnRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZSA9IG1lc3NhZ2UudGltZXN0YW1wO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG1lc3NhZ2UuZWxhcHNlZF90aW1lID0gMDtcbiAgICAgICAgICAgICAgbWVzc2FnZS50aW1lcl90aW1lID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlY29yZHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGlmIChpc0Nhc2NhZGVOZWVkZWQpIHtcbiAgICAgICAgICAgICAgdGVtcFJlY29yZHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2ZpZWxkX2Rlc2NyaXB0aW9uJzpcbiAgICAgICAgICAgIGZpZWxkRGVzY3JpcHRpb25zLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkZXZpY2VfaW5mbyc6XG4gICAgICAgICAgICBkZXZpY2VzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkZXZlbG9wZXJfZGF0YV9pZCc6XG4gICAgICAgICAgICBhcHBsaWNhdGlvbnMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2RpdmVfZ2FzJzpcbiAgICAgICAgICAgIGRpdmVfZ2FzZXMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2NvdXJzZV9wb2ludCc6XG4gICAgICAgICAgICBjb3Vyc2VfcG9pbnRzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdzcG9ydCc6XG4gICAgICAgICAgICBzcG9ydHMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2ZpbGVfaWQnOlxuICAgICAgICAgICAgaWYobWVzc2FnZSl7XG4gICAgICAgICAgICAgIGZpbGVfaWRzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkZWZpbml0aW9uJzpcbiAgICAgICAgICAgIGlmKG1lc3NhZ2Upe1xuICAgICAgICAgICAgICBkZWZpbml0aW9ucy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbW9uaXRvcmluZyc6XG4gICAgICAgICAgICBtb25pdG9ycy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbW9uaXRvcmluZ19pbmZvJzpcbiAgICAgICAgICAgIG1vbml0b3JfaW5mby5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnc3RyZXNzX2xldmVsJzpcbiAgICAgICAgICAgIHN0cmVzcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnc29mdHdhcmUnOlxuICAgICAgICAgICAgZml0T2JqLnNvZnR3YXJlID0gbWVzc2FnZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgIT09ICcnKSB7XG4gICAgICAgICAgICAgIGZpdE9ialttZXNzYWdlVHlwZV0gPSBtZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXNDYXNjYWRlTmVlZGVkKSB7XG4gICAgICBmaXRPYmouYWN0aXZpdHkgPSB7XG4gICAgICAgIHNlc3Npb25zLFxuICAgICAgICBldmVudHMsXG4gICAgICAgIGhydixcbiAgICAgICAgc3BvcnRzLFxuICAgICAgICBkZXZpY2VfaW5mb3M6IGRldmljZXMsXG4gICAgICAgIGRldmVsb3Blcl9kYXRhX2lkczogYXBwbGljYXRpb25zLFxuICAgICAgICBmaWVsZF9kZXNjcmlwdGlvbnM6IGZpZWxkRGVzY3JpcHRpb25zLFxuICAgICAgIH07XG4gICAgfVxuICAgIGlmICghaXNNb2RlQ2FzY2FkZSkge1xuICAgICAgZml0T2JqLnNlc3Npb25zID0gc2Vzc2lvbnM7XG4gICAgICBmaXRPYmoubGFwcyA9IGxhcHM7XG4gICAgICBmaXRPYmoubGVuZ3RocyA9IGxlbmd0aHM7XG4gICAgICBmaXRPYmoucmVjb3JkcyA9IHJlY29yZHM7XG4gICAgICBmaXRPYmouZXZlbnRzID0gZXZlbnRzO1xuICAgICAgZml0T2JqLmRldmljZV9pbmZvcyA9IGRldmljZXM7XG4gICAgICBmaXRPYmouZGV2ZWxvcGVyX2RhdGFfaWRzID0gYXBwbGljYXRpb25zO1xuICAgICAgZml0T2JqLmZpZWxkX2Rlc2NyaXB0aW9ucyA9IGZpZWxkRGVzY3JpcHRpb25zO1xuICAgICAgZml0T2JqLmhydiA9IGhydjtcbiAgICAgIGZpdE9iai5kaXZlX2dhc2VzID0gZGl2ZV9nYXNlcztcbiAgICAgIGZpdE9iai5jb3Vyc2VfcG9pbnRzID0gY291cnNlX3BvaW50cztcbiAgICAgIGZpdE9iai5zcG9ydHMgPSBzcG9ydHM7XG4gICAgICBmaXRPYmouZGV2aWNlcyA9IGRldmljZXM7XG4gICAgICBmaXRPYmoubW9uaXRvcnMgPSBtb25pdG9ycztcbiAgICAgIGZpdE9iai5zdHJlc3MgPSBzdHJlc3M7XG4gICAgICBmaXRPYmouZmlsZV9pZHMgPSBmaWxlX2lkcztcbiAgICAgIGZpdE9iai5tb25pdG9yX2luZm8gPSBtb25pdG9yX2luZm87XG4gICAgICBmaXRPYmouZGVmaW5pdGlvbnMgPSBkZWZpbml0aW9ucztcbiAgICB9XG5cbiAgICByZXR1cm4gZml0T2JqO1xuICB9XG59XG4iXX0=