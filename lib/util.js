const LINE_BREAK = '\n';

// Convert the original location from `source-map` to `error-stack-parser` StackFrame.
function locationToStackFrame({ line, column, name, source }) {
  return {
    columnNumber: column,
    lineNumber: line,
    fileName: source,
    functionName: name
  };
}

// A function for printing an error message(similar to the original JavaScript error) from a StackFrame.
function stackTraceToString(message, name, stackTrace) {
  return [
    `Uncaught ${name ? `${name}: ` : ''}${message}`,
    stackTrace
      .map(stack => {
        const { columnNumber, lineNumber, fileName, functionName, source } = stack;
        return `${' '.repeat(4)}${functionName ? `at ${functionName} ${fileName}:${columnNumber}:${lineNumber}` : source}`;
      })
      .join(LINE_BREAK)
  ].join(LINE_BREAK);
}

// Converts the stack-frame position from `error-stack-parser` format to `source-map` format.
function stackFrameToLocation({ columnNumber: column, lineNumber: line }) {
  return { column, line };
}

module.exports = {
  locationToStackFrame,
  stackFrameToLocation,
  stackTraceToString
};
