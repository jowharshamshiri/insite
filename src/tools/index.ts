/**
 * Tool definitions for Browser MCP Server
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { consoleTools } from './console-tools.js';
import { configurationTools } from './configuration-tools.js';
import { browserTools } from './browser-tools.js';
import { debuggingTools } from './debugging-tools.js';
import { securityTools } from './security-tools.js';
import { monitoringTools } from './monitoring-tools.js';
import { visualTestingTools } from './visual-testing-tools.js';
import { testIntegrationTools } from './test-integration-tools.js';

/**
 * Core MVP tools - essential browser automation functionality
 */
const coreTools: Tool[] = [
    {
      name: 'load_page',
      description: 'Navigate to a URL and wait for the page to load',
      inputSchema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to navigate to',
          },
          waitUntil: {
            type: 'string',
            enum: ['load', 'domcontentloaded', 'networkidle', 'commit'],
            description: 'Wait condition for navigation completion',
            default: 'domcontentloaded',
          },
        },
        required: ['url'],
      },
    },
    {
      name: 'screenshot',
      description: 'Take a screenshot of the current page',
      inputSchema: {
        type: 'object',
        properties: {
          fullPage: {
            type: 'boolean',
            description: 'Whether to capture the full scrollable page',
            default: true,
          },
          quality: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Image quality (0-100, only for JPEG)',
          },
        },
        required: [],
      },
    },
    {
      name: 'get_current_url',
      description: 'Get the current page URL',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'close_browser',
      description: 'Close the browser and cleanup resources',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'get_viewport_info',
      description: 'Get current viewport dimensions and device pixel ratio',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'get_dom',
      description: 'Get DOM content as HTML string, optionally filtered by CSS selector',
      inputSchema: {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            description: 'CSS selector to filter DOM content (optional)',
          },
        },
        required: [],
      },
    },
    {
      name: 'get_page_title',
      description: 'Get the current page title',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'click_element',
      description: 'Click an element identified by CSS selector',
      inputSchema: {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            description: 'CSS selector for the element to click',
          },
          timeout: {
            type: 'number',
            description: 'Timeout in milliseconds for the click operation',
            default: 30000,
          },
        },
        required: ['selector'],
      },
    },
];

/**
 * Advanced interaction tools - Phase 3A
 */
const advancedInteractionTools: Tool[] = [
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
    description: 'Hover over an element to trigger hover effects',
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
        force: {
          type: 'boolean',
          description: 'Whether to bypass actionability checks',
          default: false,
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'scroll_page',
    description: 'Scroll the page or a specific element',
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
  {
    name: 'wait_for_element',
    description: 'Wait for an element to be in a specific state',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector for the element to wait for',
        },
        state: {
          type: 'string',
          enum: ['visible', 'hidden', 'attached', 'detached'],
          description: 'Element state to wait for',
          default: 'visible',
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

/**
 * Navigation tools - Phase 3B
 */
const navigationTools: Tool[] = [
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
  {
    name: 'reload_page',
    description: 'Reload the current page',
    inputSchema: {
      type: 'object',
      properties: {
        ignoreCache: {
          type: 'boolean',
          description: 'Whether to ignore cache during reload (hard refresh)',
          default: false,
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

/**
 * JavaScript execution tools - Phase 3C
 */
const javascriptTools: Tool[] = [
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
  {
    name: 'get_element_info',
    description: 'Get comprehensive information about an element using JavaScript',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector for the target element',
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
];

/**
 * Register all available tools with their schemas
 */
export function registerTools(): Tool[] {
  return [
    ...coreTools,
    ...advancedInteractionTools,
    ...navigationTools,
    ...javascriptTools,
    ...consoleTools,
    ...configurationTools,
    ...browserTools,
    ...debuggingTools,
    ...securityTools,
    ...monitoringTools,
    ...visualTestingTools,
    ...testIntegrationTools,
  ];
}