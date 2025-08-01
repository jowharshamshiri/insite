/**
 * Wait and synchronization tools for Browser MCP Server
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const waitTools: Tool[] = [
  {
    name: 'wait_for_element',
    description: 'Wait for an element to become visible on the page',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector for the element to wait for',
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds',
          default: 30000,
        },
        state: {
          type: 'string',
          enum: ['visible', 'hidden', 'attached', 'detached'],
          description: 'Element state to wait for',
          default: 'visible',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'wait_for_navigation',
    description: 'Wait for page navigation to complete',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL pattern to wait for (optional)',
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds',
          default: 30000,
        },
        waitUntil: {
          type: 'string',
          enum: ['load', 'domcontentloaded', 'networkidle', 'commit'],
          description: 'Wait condition for navigation completion',
          default: 'load',
        },
      },
      required: [],
    },
  },
];