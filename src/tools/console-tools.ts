/**
 * Console and network monitoring tools for Browser MCP Server
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const consoleTools: Tool[] = [
  {
    name: 'get_console_logs',
    description: 'Get console logs from the browser',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['log', 'info', 'warn', 'error', 'debug'],
          description: 'Filter logs by level (optional)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of logs to return',
          default: 100,
        },
      },
      required: [],
    },
  },
  {
    name: 'clear_console_logs',
    description: 'Clear stored console logs',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_network_logs',
    description: 'Get network request logs from the browser',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
          description: 'Filter requests by HTTP method (optional)',
        },
        status: {
          type: 'number',
          description: 'Filter requests by status code (optional)',
        },
        url_pattern: {
          type: 'string',
          description: 'Filter requests by URL pattern (regex) (optional)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of requests to return',
          default: 100,
        },
      },
      required: [],
    },
  },
  {
    name: 'clear_network_logs',
    description: 'Clear stored network request logs',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];