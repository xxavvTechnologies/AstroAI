// Sample canvas examples for testing the canvas feature
export const canvasExamples = {
  codeExample: `&& 
# JavaScript Code Sample

\`\`\`javascript
// This is a sample code that you can edit
function calculateTotal(items) {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

// Example usage
const cart = [
  { name: 'Product 1', price: 10, quantity: 2 },
  { name: 'Product 2', price: 15, quantity: 1 },
];

const total = calculateTotal(cart);
console.log('Total:', total);
\`\`\`
&&`,
  
  markdownExample: `&&
# Interactive Markdown Example

## Features
- Edit this content directly
- Request improvements from Astro
- Copy or download for later use

## How to use
1. Click "Edit & Interact" to modify this content
2. Use the input field below to ask for specific changes
3. Save your changes or request Astro to improve it

![Example Diagram](https://via.placeholder.com/300x200?text=Diagram+Placeholder)
&&`,

  dataExample: `&&
{
  "name": "AstroAI",
  "version": "3.1.0",
  "features": [
    "Interactive Canvas",
    "Message Animations",
    "Visual Improvements",
    "Feedback System"
  ],
  "configuration": {
    "theme": "dark",
    "animationsEnabled": true,
    "canvasFeatureEnabled": true
  }
}
&&`
};

// A helper function to add a sample canvas to a conversation
export const addCanvasExample = (messageText: string, exampleType: keyof typeof canvasExamples) => {
  const example = canvasExamples[exampleType] || canvasExamples.codeExample;
  return `${messageText}\n\n${example}`;
};
