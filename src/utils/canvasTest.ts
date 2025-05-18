// A simple test utility for the canvas feature
import { extractCanvasContent, replaceCanvasMarkers } from './canvasUtils';

/**
 * Runs a quick test of the canvas extraction and replacement functionality
 * This can be run in the console or imported into a test suite
 */
export const testCanvasFeature = () => {
  const testMessages = [
    "This is a regular message with no canvas content.",
    "This is a message with canvas content: && Here is some code for you to edit:\n```javascript\nfunction add(a, b) {\n  return a + b;\n}\n``` &&",
    "This message has && multiple && canvas && sections &&.",
    "Message with &&\nmulti-line\ncanvas content\n&&"
  ];
  
  const results = testMessages.map(message => {
    const matches = extractCanvasContent(message);
    const processed = replaceCanvasMarkers(message, matches);
    
    return {
      original: message,
      matchesFound: matches.length,
      processed: processed
    };
  });
  
  console.log('Canvas Test Results:', results);
  return results;
};

// Log a message to help developers test the canvas feature
console.log(
  'Canvas feature test available. You can test the canvas feature by adding a message with the syntax "&& content &&" in Astro\'s messages.'
);
