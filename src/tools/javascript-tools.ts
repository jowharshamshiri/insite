/**
 * JavaScript execution tools for Browser MCP Server
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const javascriptTools: Tool[] = [
  {
    name: 'evaluate_js',
    description: 'Execute JavaScript code in the page context',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'JavaScript code to execute',
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds',
          default: 30000,
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'evaluate_js_on_element',
    description: 'Execute JavaScript code on a specific element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector for the target element',
        },
        code: {
          type: 'string',
          description: 'JavaScript code to execute (element available as "element" variable)',
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds',
          default: 30000,
        },
      },
      required: ['selector', 'code'],
    },
  },
];