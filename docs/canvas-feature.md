# Astro v3.1.0 - Canvas Feature

## Overview
The Canvas feature in Astro v3.1.0 allows for interactive content editing directly within chat messages. This is similar to Claude's canvas feature and provides a way for users to edit code, text, or other content provided by Astro.

## How It Works
When Astro includes content between double ampersands (`&& content &&`), this content will be rendered as an interactive canvas that users can edit, update, or download.

## Using the Canvas Feature

### Identifying Canvas Content
Canvas content appears with an "Edit & Interact" button. Click this button to open the full interactive canvas.

### Canvas Actions
Once a canvas is open, you can:
- Edit the content directly
- Save your changes
- Copy the content to clipboard
- Download the content as a text file
- Ask Astro to modify the content through the prompt box
- Restore to the original content
- Close the canvas

### Requesting Canvas Content
You can ask Astro to provide content in a canvas format:

Example prompts:
- "Can you create a sample React component in a canvas?"
- "Please provide a configuration file example in a canvas"
- "Show me pseudocode for a sorting algorithm in a canvas"

### Testing the Canvas Feature
To quickly test the canvas feature, you can click the "Try Canvas Feature" button in the welcome modal, which will add a sample canvas message to your conversation.

## Technical Implementation
The Canvas feature utilizes the following components:
- Canvas.tsx - The main component for rendering and interacting with canvas content
- canvasUtils.ts - Utility functions for extracting and processing canvas content
- MessageContent.tsx - Integration of canvas functionality into the message rendering system

Canvas content is detected using a regex pattern that identifies content between double ampersands (`&& content &&`).

## Troubleshooting
If a canvas is not rendering correctly, try:
1. Refreshing the page
2. Checking that the content is properly formatted with `&&` at the beginning and end
3. Ensuring the content between the ampersands is valid and not too large

For any persistent issues with the Canvas feature, please report them to our support team.
