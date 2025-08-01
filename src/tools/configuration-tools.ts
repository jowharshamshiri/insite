/**
 * Configuration tools for Browser MCP Server
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const configurationTools: Tool[] = [
  {
    name: 'set_viewport_size',
    description: 'Set the browser viewport size',
    inputSchema: {
      type: 'object',
      properties: {
        width: {
          type: 'number',
          description: 'Viewport width in pixels',
          minimum: 100,
          maximum: 4096,
        },
        height: {
          type: 'number',
          description: 'Viewport height in pixels',
          minimum: 100,
          maximum: 4096,
        },
      },
      required: ['width', 'height'],
    },
  },
  {
    name: 'set_user_agent',
    description: 'Set the browser user agent string',
    inputSchema: {
      type: 'object',
      properties: {
        userAgent: {
          type: 'string',
          description: 'User agent string to set',
        },
      },
      required: ['userAgent'],
    },
  },
  {
    name: 'set_geolocation',
    description: 'Set the browser geolocation',
    inputSchema: {
      type: 'object',
      properties: {
        latitude: {
          type: 'number',
          description: 'Latitude coordinate',
          minimum: -90,
          maximum: 90,
        },
        longitude: {
          type: 'number',
          description: 'Longitude coordinate',
          minimum: -180,
          maximum: 180,
        },
        accuracy: {
          type: 'number',
          description: 'Accuracy in meters',
          default: 100,
        },
      },
      required: ['latitude', 'longitude'],
    },
  },
];