// This function was borrowed directly from a library `stacktrace-gps`
// https://github.com/stacktracejs/stacktrace-gps/blob/9494075d552ed3a0801061c710942fe1b9b77c16/stacktrace-gps.js#L65
//
// The library itself was intended to be used on the front-end and it never exposes this function publicly,
// so I have decided to copy it instead of rewire-ing it.
//
// The source code is preserved in it's original state, so:

/* eslint-disable */

function _findFunctionName(source, lineNumber/*, columnNumber*/) {
  var syntaxes = [
    // {name} = function ({args}) TODO args capture
    /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/,
    // function {name}({args}) m[1]=name m[2]=args
    /function\s+([^('"`]*?)\s*\(([^)]*)\)/,
    // {name} = eval()
    /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/,
    // fn_name() {
    /\b(?!(?:if|for|switch|while|with|catch)\b)(?:(?:static)\s+)?(\S+)\s*\(.*?\)\s*\{/,
    // {name} = () => {
    /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*\(.*?\)\s*=>/
  ];
  var lines = source.split('\n');

  // Walk backwards in the source lines until we find the line which matches one of the patterns above
  var code = '';
  var maxLines = Math.min(lineNumber, 20);
  for (var i = 0; i < maxLines; ++i) {
    // lineNo is 1-based, source[] is 0-based
    var line = lines[lineNumber - i - 1];
    var commentPos = line.indexOf('//');
    if (commentPos >= 0) {
      line = line.substr(0, commentPos);
    }

    if (line) {
      code = line + code;
      var len = syntaxes.length;
      for (var index = 0; index < len; index++) {
        var m = syntaxes[index].exec(code);
        if (m && m[1]) {
          return m[1];
        }
      }
    }
  }
  return undefined;
}

module.exports = _findFunctionName;
