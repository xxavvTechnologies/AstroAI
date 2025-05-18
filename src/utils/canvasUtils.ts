export interface CanvasMatch {
  id: string;
  fullMatch: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Finds all canvas content within a message using the && syntax
 * @param text The message text to search for canvas content
 * @returns Array of canvas matches with ids and content
 */
export const extractCanvasContent = (text: string): CanvasMatch[] => {
  // Match content between && patterns
  const canvasRegex = /&&\s*([\s\S]*?)\s*&&/g;
  const matches: CanvasMatch[] = [];
  let match;
  
  while ((match = canvasRegex.exec(text)) !== null) {
    const fullMatch = match[0]; // The entire match including &&
    const content = match[1].trim(); // Just the content between &&
    const id = `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    matches.push({
      id,
      fullMatch,
      content,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length
    });
  }
  
  return matches;
};

/**
 * Replace canvas markers with a placeholder or identifier
 */
export const replaceCanvasMarkers = (text: string, canvasMatches: CanvasMatch[]): string => {
  let newText = text;
  
  // Process matches from end to start to avoid index issues
  for (let i = canvasMatches.length - 1; i >= 0; i--) {
    const match = canvasMatches[i];
    const before = newText.substring(0, match.startIndex);
    const after = newText.substring(match.endIndex);
    
    // Replace the match with a special marker
    newText = before + `{%canvas:${match.id}%}` + after;
  }
  
  return newText;
};

/**
 * Checks if a string contains the canvas marker pattern
 */
export const hasCanvasContent = (text: string): boolean => {
  const canvasRegex = /&&\s*[\s\S]*?\s*&&/g;
  return canvasRegex.test(text);
};

/**
 * Formats content to be displayed in a canvas
 * @param content The content to format
 * @returns The content wrapped in canvas markers
 */
export const formatAsCanvas = (content: string): string => {
  // Ensure the content doesn't already have canvas markers
  if (hasCanvasContent(content)) {
    return content;
  }
  
  // Trim the content and add canvas markers
  const trimmed = content.trim();
  return `&& \n${trimmed}\n &&`;
};
