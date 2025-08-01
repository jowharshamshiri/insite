/**
 * Navigation tools for Browser MCP Server
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const navigationTools: Tool[] = [
  {
    name: 'go_back',
    description: 'Navigate back in browser history',
    inputSchema: {
      type: 'object',
      properties: {
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds',
          default: 30000,
        },
      },
      required: [],
    },
  },
  {
    name: 'go_forward',
    description: 'Navigate forward in browser history',
    inputSchema: {
      type: 'object',
      properties: {
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds',
          default: 30000,
        },
      },
      required: [],
    },
  },
  {
    name: 'reload_page',
    description: 'Reload the current page',
    inputSchema: {
      type: 'object',
      properties: {
        ignoreCache: {
          type: 'boolean',
          description: 'Whether to ignore cache during reload',
          default: false,
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds',
          default: 30000,
        },
      },
      required: [],
    },
  },
];