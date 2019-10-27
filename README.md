# BackFIT

> Parse your .FIT files easily, directly from JS.
> Written in TypeScript.


## Install

```
$ npm install backfit --save
```

## How to use

See in [examples](./examples) folder:

```javascript
var BackFIT = require('./../lib/backfit.js').default;
var fs = require('fs');

var file = process.argv[2];

fs.readFile(file, function (err, content) {
  var backfit = new BackFIT({
    speedUnit: 'km/h',
    lengthUnit: 'm',
    temperatureUnit: 'celsius',
    elapsedRecordField: true,
    mode: 'list',
  });

  backfit.parse(content)
    .then(function (data) {
      console.log(data.records[0]);
    })
    .catch(function (err) {
      console.log(err);
    })
});
```

## API Documentation
### BackFIT(FitParserOptions _options_)
Needed to create a new instance. _options_ is optional, and is used to customize the returned object.

Allowed properties :
- `mode`: String
  - `cascade`: Returned object is organized as a tree, eg. each lap contains a `records` fields, that is an array of its records (**default**)
  - `list`: Returned object is organized as lists of sessions, laps, records, etc..., without parent-child relation
  - `both`: A mix of the two other modes, eg. `records` are available inside the root field as well as inside each laps
- `lengthUnit`: String
  - `m`: Lengths are in meters (**default**)
  - `km`: Lengths are in kilometers
  - `mi`: Lengths are in miles
- `temperatureUnit`: String
  - `celsius`:Temperatures are in °C (**default**)
  - `kelvin`: Temperatures are in °K
  - `fahrenheit`: Temperatures are in °F
- `speedUnit`: String
  - `m/s`: Speeds are in meters per seconds (**default**)
  - `km/h`: Speeds are in kilometers per hour
  - `mph`: Speeds are in miles per hour
- `force`: Boolean
  - `true`: Continues even if they are errors (**default for now**)
  - `false`: Stops if an error occurs
- `elapsedRecordField`: Boolean
  - `true`: Includes `elapsed_time`, containing the elapsed time in seconds since the first record, and `timer_time`, containing the time shown on the device, inside each `record` field
  - `false` (**default**)

### BackFIT.parse(Buffer _file_)
Returns a Promise of FitParserResult, or throws Error.

## Contributors
All started thanks to [Pierre Jacquier](https://github.com/pierremtb)

Big thanks to [Mikael Lofjärd](https://github.com/mlofjard) for [his early prototype](https://github.com/mlofjard/jsonfit).
See [CONTRIBUTORS](./CONTRIBUTORS.md).

## License

MIT license; see [LICENSE](./LICENSE).

(c) 2019 Dimitrios Kanellopoulos
