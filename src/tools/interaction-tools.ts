/**
 * Interaction tools for Browser MCP Server
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const interactionTools: Tool[] = [
  {
    name: 'type_text',
    description: 'Type text into an input element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector for the input element',
        },
        text: {
          type: 'string',
          description: 'Text to type',
        },
        delay: {
          type: 'number',
          description: 'Delay between keystrokes in milliseconds',
          default: 0,
        },
        clear: {
          type: 'boolean',
          description: 'Whether to clear existing text first',
          default: true,
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds',
          default: 30000,
        },
      },
      required: ['selector', 'text'],
    },
  },
  {
    name: 'hover_element',
    description: 'Hover over an element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector for the element to hover',
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds',
          default: 30000,
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'scroll_page',
    description: 'Scroll the page or an element',
    inputSchema: {
      type: 'object',
      properties: {
        direction: {
          type: 'string',
          enum: ['up', 'down', 'left', 'right'],
          description: 'Scroll direction',
          default: 'down',
        },
        amount: {
          type: 'number',
          description: 'Scroll amount in pixels',
          default: 500,
        },
        selector: {
          type: 'string',
          description: 'CSS selector for element to scroll (optional, defaults to page)',
        },
      },
      required: [],
    },
  },
  {
    name: 'press_key',
    description: 'Press a keyboard key or key combination',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'Key to press (e.g., "Enter", "Tab", "Escape", "Control+a")',
        },
        selector: {
          type: 'string',
          description: 'CSS selector for element to focus before pressing key (optional)',
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds',
          default: 30000,
        },
      },
      required: ['key'],
    },
  },
];