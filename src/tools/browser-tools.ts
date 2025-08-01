/**
 * Browser engine management tools for Browser MCP Server
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const browserTools: Tool[] = [
  {
    name: 'switch_browser',
    description: 'Switch to a different browser engine (chromium, firefox, webkit)',
    inputSchema: {
      type: 'object',
      properties: {
        engine: {
          type: 'string',
          enum: ['chromium', 'firefox', 'webkit'],
          description: 'Browser engine to switch to',
        },
      },
      required: ['engine'],
    },
  },
  {
    name: 'get_browser_info',
    description: 'Get information about the current browser engine',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'list_available_browsers',
    description: 'Get list of all available browser engines',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];