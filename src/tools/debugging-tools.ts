/**
 * Advanced Debugging Tools for Browser MCP Server
 * 
 * Provides sophisticated debugging capabilities including element highlighting,
 * execution tracing, performance timeline capture, and debug mode management.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Highlight Element Tool
 * Visually highlights elements on the page for debugging workflows
 */
export const highlightElementTool: Tool = {
  name: 'highlight_element',
  description: 'Visually highlight elements on the page for debugging purposes',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector for the element(s) to highlight'
      },
      style: {
        type: 'object',
        description: 'Highlight style configuration',
        properties: {
          border: {
            type: 'string',
            description: 'Border style (e.g., "3px solid red")',
            default: '3px solid #ff0000'
          },
          backgroundColor: {
            type: 'string',
            description: 'Background color (e.g., "rgba(255,0,0,0.1)")',
            default: 'rgba(255, 0, 0, 0.1)'
          },
          outline: {
            type: 'string',
            description: 'Outline style (e.g., "2px dashed blue")',
            default: 'none'
          }
        }
      },
      duration: {
        type: 'number',
        description: 'Highlight duration in milliseconds (0 for permanent)',
        default: 3000,
        minimum: 0
      },
      showInfo: {
        type: 'boolean',
        description: 'Show element information tooltip',
        default: true
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds',
        default: 30000
      }
    },
    required: ['selector']
  }
};

/**
 * Trace Execution Tool
 * Enable step-by-step execution tracing for debugging
 */
export const traceExecutionTool: Tool = {
  name: 'trace_execution',
  description: 'Enable detailed execution tracing for debugging browser operations',
  inputSchema: {
    type: 'object',
    properties: {
      enabled: {
        type: 'boolean',
        description: 'Enable or disable execution tracing',
        default: true
      },
      options: {
        type: 'object',
        description: 'Tracing configuration options',
        properties: {
          screenshots: {
            type: 'boolean',
            description: 'Capture screenshots during tracing',
            default: true
          },
          snapshots: {
            type: 'boolean',
            description: 'Capture DOM snapshots',
            default: true
          },
          sources: {
            type: 'boolean',
            description: 'Capture source code',
            default: false
          },
          network: {
            type: 'boolean',
            description: 'Trace network activity',
            default: true
          },
          console: {
            type: 'boolean',
            description: 'Trace console messages',
            default: true
          }
        }
      },
      path: {
        type: 'string',
        description: 'Path to save trace files (optional, uses temp directory if not specified)'
      }
    },
    required: []
  }
};

/**
 * Capture Performance Timeline Tool
 * Capture browser performance timeline data for optimization analysis
 */
export const capturePerformanceTimelineTool: Tool = {
  name: 'capture_performance_timeline',
  description: 'Capture detailed browser performance timeline data for analysis',
  inputSchema: {
    type: 'object',
    properties: {
      categories: {
        type: 'array',
        description: 'Performance categories to capture',
        items: {
          type: 'string',
          enum: [
            'navigation',
            'resource',
            'measure',
            'mark',
            'paint',
            'layout',
            'longtask',
            'element'
          ]
        },
        default: ['navigation', 'resource', 'paint', 'layout']
      },
      duration: {
        type: 'number',
        description: 'Capture duration in milliseconds (0 for current state)',
        default: 0,
        minimum: 0
      },
      includeMetrics: {
        type: 'boolean',
        description: 'Include Web Vitals and other performance metrics',
        default: true
      },
      format: {
        type: 'string',
        description: 'Output format for performance data',
        enum: ['json', 'timeline', 'summary'],
        default: 'json'
      }
    },
    required: []
  }
};

/**
 * Debug Mode Tool
 * Enable/disable comprehensive debugging mode with enhanced logging
 */
export const debugModeTool: Tool = {
  name: 'debug_mode',
  description: 'Enable or disable comprehensive debugging mode with enhanced logging',
  inputSchema: {
    type: 'object',
    properties: {
      enabled: {
        type: 'boolean',
        description: 'Enable or disable debug mode',
        default: true
      },
      level: {
        type: 'string',
        description: 'Debug logging level',
        enum: ['verbose', 'info', 'warn', 'error'],
        default: 'info'
      },
      features: {
        type: 'object',
        description: 'Debug features to enable',
        properties: {
          consoleLogging: {
            type: 'boolean',
            description: 'Enhanced console logging',
            default: true
          },
          networkLogging: {
            type: 'boolean',
            description: 'Detailed network request logging',
            default: true
          },
          performanceMonitoring: {
            type: 'boolean',
            description: 'Performance monitoring and metrics',
            default: true
          },
          elementInspection: {
            type: 'boolean',
            description: 'Enhanced element inspection',
            default: true
          },
          errorTracking: {
            type: 'boolean',
            description: 'Advanced error tracking and reporting',
            default: true
          }
        }
      },
      outputPath: {
        type: 'string',
        description: 'Path for debug output files (optional)'
      }
    },
    required: ['enabled']
  }
};

/**
 * All debugging tools export
 */
export const debuggingTools = [
  highlightElementTool,
  traceExecutionTool,
  capturePerformanceTimelineTool,
  debugModeTool
];