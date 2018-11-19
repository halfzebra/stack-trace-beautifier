const { locationToStackFrame, stackFrameToLocation, stackTraceToString } = require('./util');

describe('utils', () => {
  describe('stackFrameToLocation', () => {
    it('should convert a stack-frame to a position', () => {
      expect(stackFrameToLocation({ columnNumber: 1, lineNumber: 10 })).toEqual({ line: 10, column: 1 });
    })
  });

  describe('locationToStackFrame', () => {
    it('should', () => {
      expect(locationToStackFrame({ line: 10, column: 1 })).toEqual({ columnNumber: 1, lineNumber: 10 });
    })
  });

  describe('stackTraceToString', () => {
    expect(stackTraceToString(
      'TypeError',
      'everything is broken',
      [{
        columnNumber: 1,
        lineNumber: 2,
        fileName: 'someFile.js',
        functionName: 'badFunction',
        source: '/app/someFile.js'
      }])).toEqual(`Uncaught everything is broken: TypeError\n    at badFunction someFile.js:1:2`);
  });
});
