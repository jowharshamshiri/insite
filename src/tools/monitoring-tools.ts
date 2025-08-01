/**
 * Advanced Monitoring & Analytics Tools for Browser MCP Server
 * 
 * Provides comprehensive monitoring capabilities including usage analytics,
 * error tracking, performance monitoring, and session analytics.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Usage Analytics Tool
 * Track and report browser automation usage patterns
 */
export const usageAnalyticsTool: Tool = {
  name: 'usage_analytics',
  description: 'Track and report browser automation usage patterns and statistics',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['start_tracking', 'stop_tracking', 'get_report', 'reset_data', 'configure'],
        description: 'Analytics action to perform',
        default: 'get_report'
      },
      trackingConfig: {
        type: 'object',
        description: 'Configuration for usage tracking',
        properties: {
          trackPageViews: {
            type: 'boolean',
            description: 'Track page navigation events',
            default: true
          },
          trackUserInteractions: {
            type: 'boolean',
            description: 'Track clicks, typing, and other interactions',
            default: true
          },
          trackPerformance: {
            type: 'boolean',
            description: 'Track performance metrics',
            default: true
          },
          trackErrors: {
            type: 'boolean',
            description: 'Track JavaScript errors and exceptions',
            default: true
          },
          sessionTimeout: {
            type: 'number',
            description: 'Session timeout in minutes',
            default: 30
          }
        }
      },
      reportFormat: {
        type: 'string',
        enum: ['summary', 'detailed', 'json', 'csv'],
        description: 'Format for analytics report',
        default: 'summary'
      },
      timeRange: {
        type: 'object',
        description: 'Time range for analytics report',
        properties: {
          start: {
            type: 'string',
            description: 'Start date (ISO string)'
          },
          end: {
            type: 'string',
            description: 'End date (ISO string)'
          },
          preset: {
            type: 'string',
            enum: ['last_hour', 'last_day', 'last_week', 'last_month', 'all_time'],
            description: 'Preset time range'
          }
        }
      }
    },
    required: ['action']
  }
};

/**
 * Error Tracking Tool
 * Advanced error tracking and alerting system
 */
export const errorTrackingTool: Tool = {
  name: 'error_tracking',
  description: 'Advanced error tracking, categorization, and alerting system',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['start_monitoring', 'stop_monitoring', 'get_errors', 'clear_errors', 'configure_alerts'],
        description: 'Error tracking action',
        default: 'get_errors'
      },
      errorTypes: {
        type: 'array',
        description: 'Types of errors to track',
        items: {
          type: 'string',
          enum: [
            'javascript_errors',
            'network_errors',
            'console_errors',
            'playwright_errors',
            'timeout_errors',
            'element_not_found',
            'security_errors'
          ]
        },
        default: [
          'javascript_errors',
          'network_errors',
          'playwright_errors',
          'timeout_errors'
        ]
      },
      alertConfig: {
        type: 'object',
        description: 'Alert configuration',
        properties: {
          enableAlerts: {
            type: 'boolean',
            description: 'Enable error alerting',
            default: false
          },
          threshold: {
            type: 'number',
            description: 'Error count threshold for alerts',
            default: 5
          },
          timeWindow: {
            type: 'number',
            description: 'Time window for threshold (minutes)',
            default: 10
          },
          notificationMethod: {
            type: 'string',
            enum: ['console', 'file', 'webhook'],
            description: 'How to send alerts',
            default: 'console'
          }
        }
      },
      filters: {
        type: 'object',
        description: 'Error filtering options',
        properties: {
          severity: {
            type: 'string',
            enum: ['all', 'critical', 'error', 'warning', 'info'],
            description: 'Filter by error severity',
            default: 'all'
          },
          source: {
            type: 'string',
            description: 'Filter by error source (URL pattern)'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of errors to return',
            default: 100
          }
        }
      }
    },
    required: ['action']
  }
};

/**
 * Performance Monitoring Tool
 * Real-time performance monitoring and profiling
 */
export const performanceMonitoringTool: Tool = {
  name: 'performance_monitoring',
  description: 'Real-time performance monitoring, profiling, and optimization insights',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['start_monitoring', 'stop_monitoring', 'get_metrics', 'analyze_performance', 'set_thresholds'],
        description: 'Performance monitoring action',
        default: 'get_metrics'
      },
      metrics: {
        type: 'array',
        description: 'Performance metrics to monitor',
        items: {
          type: 'string',
          enum: [
            'page_load_time',
            'first_contentful_paint',
            'largest_contentful_paint',
            'cumulative_layout_shift',
            'first_input_delay',
            'memory_usage',
            'cpu_usage',
            'network_timing',
            'resource_sizes',
            'dom_metrics'
          ]
        },
        default: [
          'page_load_time',
          'first_contentful_paint',
          'largest_contentful_paint',
          'cumulative_layout_shift'
        ]
      },
      thresholds: {
        type: 'object',
        description: 'Performance thresholds for alerting',
        properties: {
          pageLoadTime: {
            type: 'number',
            description: 'Page load time threshold (ms)',
            default: 3000
          },
          firstContentfulPaint: {
            type: 'number',
            description: 'FCP threshold (ms)',
            default: 1500
          },
          largestContentfulPaint: {
            type: 'number',
            description: 'LCP threshold (ms)',
            default: 2500
          },
          cumulativeLayoutShift: {
            type: 'number',
            description: 'CLS threshold',
            default: 0.1
          },
          memoryUsage: {
            type: 'number',
            description: 'Memory usage threshold (MB)',
            default: 100
          }
        }
      },
      samplingInterval: {
        type: 'number',
        description: 'Sampling interval in milliseconds',
        default: 1000,
        minimum: 100
      },
      reportFormat: {
        type: 'string',
        enum: ['realtime', 'summary', 'detailed', 'chart_data'],
        description: 'Performance report format',
        default: 'summary'
      }
    },
    required: ['action']
  }
};

/**
 * Session Analytics Tool
 * Session-based analytics and user journey tracking
 */
export const sessionAnalyticsTool: Tool = {
  name: 'session_analytics',
  description: 'Session-based analytics, user journey tracking, and workflow optimization',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['start_session', 'end_session', 'get_session_data', 'analyze_journey', 'export_sessions'],
        description: 'Session analytics action',
        default: 'get_session_data'
      },
      sessionConfig: {
        type: 'object',
        description: 'Session tracking configuration',
        properties: {
          trackPageFlow: {
            type: 'boolean',
            description: 'Track page navigation flow',
            default: true
          },
          trackInteractionSequence: {
            type: 'boolean',
            description: 'Track sequence of user interactions',
            default: true
          },
          trackTimings: {
            type: 'boolean',
            description: 'Track time spent on each action',
            default: true
          },
          trackFormInteractions: {
            type: 'boolean',
            description: 'Track form field interactions',
            default: true
          },
          captureScreenshots: {
            type: 'boolean',
            description: 'Capture screenshots at key points',
            default: false
          }
        }
      },
      analysisType: {
        type: 'string',
        enum: ['funnel_analysis', 'path_analysis', 'interaction_heatmap', 'time_analysis', 'conversion_analysis'],
        description: 'Type of session analysis to perform',
        default: 'path_analysis'
      },
      filters: {
        type: 'object',
        description: 'Session filtering options',
        properties: {
          minDuration: {
            type: 'number',
            description: 'Minimum session duration (seconds)'
          },
          maxDuration: {
            type: 'number',
            description: 'Maximum session duration (seconds)'
          },
          browserEngine: {
            type: 'string',
            enum: ['chromium', 'firefox', 'webkit'],
            description: 'Filter by browser engine'
          },
          dateRange: {
            type: 'object',
            properties: {
              start: { type: 'string' },
              end: { type: 'string' }
            }
          }
        }
      },
      exportFormat: {
        type: 'string',
        enum: ['json', 'csv', 'timeline', 'report'],
        description: 'Export format for session data',
        default: 'json'
      }
    },
    required: ['action']
  }
};

/**
 * All monitoring tools export
 */
export const monitoringTools = [
  usageAnalyticsTool,
  errorTrackingTool,
  performanceMonitoringTool,
  sessionAnalyticsTool
];