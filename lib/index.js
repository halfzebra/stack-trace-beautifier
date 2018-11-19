const url = require('url');
const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);
const glob = promisify(require('glob'));
const { SourceMapConsumer } = require('source-map');
const path = require('path');
const findFunctionName = require('./findFunctionName');
const { stackTraceToString, locationToStackFrame, stackFrameToLocation } = require('./util');

function getAssetSourceMapFilePath(filePath) {
  return `${filePath}.map`;
}

// Extract the relative path to the asset from a StackFrame from `error-stack-parser`
function getSourceMapRelativePath(publicPath, { fileName }) {
  const { pathname } = url.parse(fileName);
  const relativeAssetPath = path.relative(publicPath, pathname);
  return getAssetSourceMapFilePath(relativeAssetPath);
}

// Key-value pairs of relative paths to the chunks and their source-maps.
function createSourceMapFileMap(sourceMapsPath, files) {
  return files
    .reduce((acc, currFilePath) => {
      acc[path.relative(sourceMapsPath, currFilePath)] = currFilePath;
      return acc;
    }, {});
}

// Cteate a SourceMapConsumer for a path, cached.
function createSourceMapConsumerByPath(cache, sourceMapPath) {
  if (cache.has(sourceMapPath)) {
    return cache.get(sourceMapPath);
  }

  const consumerPromise = readFile(sourceMapPath, 'utf8')
    .then(rawSourceMapJsonData => new SourceMapConsumer(rawSourceMapJsonData));

  cache.set(sourceMapPath, consumerPromise);

  return consumerPromise;
}

// Async function for beautifying a single StackFrame using source-maps.
// Will return the original StackFrame, if the source-map file was not found.
// Will try to deduce the function name.
function beautifyStackFrame(cache, publicPath, fileMap, stackFrame) {
  const sourceMapRelativePath = getSourceMapRelativePath(publicPath, stackFrame);

  // Return the original StackFrame, if no source-map found for it.
  if (!fileMap[sourceMapRelativePath]) {
    return stackFrame;
  }

  return createSourceMapConsumerByPath(cache, fileMap[sourceMapRelativePath])
    .then(consumer => {
      const loc = consumer.originalPositionFor(stackFrameToLocation(stackFrame));
      const sourceContent = consumer.sourceContentFor(loc.source);

      // Return function name if found.
      if (loc.name) {
        return locationToStackFrame(loc);
      }

      // Attempt to find function name by crawling the source.
      return { ...locationToStackFrame(loc), functionName: findFunctionName(sourceContent, loc.line) };
    });
}

function createStackTraceBeautifier({ sourceMapsPath, publicPath, cache }) {
  // Promisified glob of all source-map files.
  const sourceMapFiles = glob(`${sourceMapsPath}/**/*.map`);

  // Promisified key-value map of relative paths to the chunks and their source-maps.
  const sourceMapFileMap = sourceMapFiles
    .then(files => createSourceMapFileMap(sourceMapsPath, files));

  return {
    stackTraceToString,
    beautifyStackTrace: function beautifyStackTrace(stackTrace) {
      return sourceMapFileMap
        .then(fileMap => Promise.all(stackTrace.map(stackFrame => beautifyStackFrame(cache, publicPath, fileMap, stackFrame))));
    }
  };
}

module.exports = {
  createStackTraceBeautifier,
  stackTraceToString
};
