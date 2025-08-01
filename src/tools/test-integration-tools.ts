/**
 * Testing Framework Integration Tools for Browser MCP Server
 * Advanced testing framework integration capabilities
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Testing Framework Integration Tools - Phase 5B Final
 * Provides seamless integration with popular testing frameworks
 */
export const testIntegrationTools: Tool[] = [
  {
    name: 'playwright_test_adapter',
    description: 'Integration adapter for Playwright Test runner with advanced configuration and reporting',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['initialize', 'configure', 'run_test', 'get_results', 'cleanup'],
          description: 'Playwright Test adapter action to perform',
        },
        config: {
          type: 'object',
          properties: {
            testDir: {
              type: 'string',
              description: 'Directory containing test files',
              default: './tests',
            },
            projects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  browser: { type: 'string', enum: ['chromium', 'firefox', 'webkit'] },
                  viewport: {
                    type: 'object',
                    properties: {
                      width: { type: 'number' },
                      height: { type: 'number' },
                    },
                  },
                },
              },
              description: 'Browser projects configuration',
            },
            workers: {
              type: 'number',
              description: 'Number of parallel workers',
              default: 1,
            },
            retries: {
              type: 'number',
              description: 'Number of retries for failed tests',
              default: 0,
            },
            timeout: {
              type: 'number',
              description: 'Test timeout in milliseconds',
              default: 30000,
            },
          },
          description: 'Playwright Test configuration',
        },
        testPath: {
          type: 'string',
          description: 'Specific test file or pattern to run',
        },
        reportFormat: {
          type: 'string',
          enum: ['html', 'json', 'junit', 'list', 'dot'],
          description: 'Test report format',
          default: 'html',
        },
        outputDir: {
          type: 'string',
          description: 'Output directory for reports',
          default: './test-results',
        },
      },
      required: ['action'],
    },
  },
  {
    name: 'jest_adapter',
    description: 'Integration adapter for Jest testing framework with browser automation capabilities',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['initialize', 'configure', 'run_test', 'get_results', 'watch'],
          description: 'Jest adapter action to perform',
        },
        config: {
          type: 'object',
          properties: {
            testMatch: {
              type: 'array',
              items: { type: 'string' },
              description: 'Test file patterns to match',
              default: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
            },
            testEnvironment: {
              type: 'string',
              enum: ['node', 'jsdom', 'playwright'],
              description: 'Test environment',
              default: 'playwright',
            },
            setupFilesAfterEnv: {
              type: 'array',
              items: { type: 'string' },
              description: 'Setup files to run after environment setup',
            },
            collectCoverage: {
              type: 'boolean',
              description: 'Whether to collect code coverage',
              default: false,
            },
            coverageDirectory: {
              type: 'string',
              description: 'Coverage output directory',
              default: './coverage',
            },
            maxWorkers: {
              type: 'number',
              description: 'Maximum number of worker processes',
              default: 1,
            },
            timeout: {
              type: 'number',
              description: 'Test timeout in milliseconds',
              default: 30000,
            },
          },
          description: 'Jest configuration options',
        },
        testPath: {
          type: 'string',
          description: 'Specific test file or pattern to run',
        },
        watchMode: {
          type: 'boolean',
          description: 'Enable watch mode for continuous testing',
          default: false,
        },
        bail: {
          type: 'number',
          description: 'Stop running tests after n failures',
          default: 0,
        },
        verbose: {
          type: 'boolean',
          description: 'Display individual test results',
          default: true,
        },
      },
      required: ['action'],
    },
  },
  {
    name: 'mocha_adapter',
    description: 'Integration adapter for Mocha testing framework with browser automation hooks',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['initialize', 'configure', 'run_test', 'get_results', 'watch'],
          description: 'Mocha adapter action to perform',
        },
        config: {
          type: 'object',
          properties: {
            spec: {
              type: 'array',
              items: { type: 'string' },
              description: 'Test file patterns',
              default: ['test/**/*.js'],
            },
            reporter: {
              type: 'string',
              enum: ['spec', 'json', 'html', 'tap', 'junit', 'progress', 'min'],
              description: 'Test reporter',
              default: 'spec',
            },
            timeout: {
              type: 'number',
              description: 'Test timeout in milliseconds',
              default: 30000,
            },
            slow: {
              type: 'number',
              description: 'Threshold for slow tests in milliseconds',
              default: 75,
            },
            grep: {
              type: 'string',
              description: 'Filter tests by pattern',
            },
            invert: {
              type: 'boolean',
              description: 'Invert grep filter',
              default: false,
            },
            recursive: {
              type: 'boolean',
              description: 'Look for tests in subdirectories',
              default: true,
            },
            parallel: {
              type: 'boolean',
              description: 'Run tests in parallel',
              default: false,
            },
            jobs: {
              type: 'number',
              description: 'Number of parallel jobs',
              default: 1,
            },
          },
          description: 'Mocha configuration options',
        },
        testPath: {
          type: 'string',
          description: 'Specific test file or pattern to run',
        },
        bail: {
          type: 'boolean',
          description: 'Bail after first test failure',
          default: false,
        },
        watch: {
          type: 'boolean',
          description: 'Watch files for changes',
          default: false,
        },
        require: {
          type: 'array',
          items: { type: 'string' },
          description: 'Modules to require before running tests',
        },
      },
      required: ['action'],
    },
  },
  {
    name: 'test_reporter',
    description: 'Advanced test reporting and result aggregation with multi-format output and analytics',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['generate_report', 'aggregate_results', 'export_data', 'get_analytics', 'compare_runs'],
          description: 'Test reporter action to perform',
        },
        sources: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              framework: {
                type: 'string',
                enum: ['playwright', 'jest', 'mocha', 'custom'],
                description: 'Testing framework source',
              },
              resultsPath: {
                type: 'string',
                description: 'Path to test results file or directory',
              },
              format: {
                type: 'string',
                enum: ['json', 'xml', 'junit', 'tap'],
                description: 'Results file format',
              },
            },
            required: ['framework', 'resultsPath'],
          },
          description: 'Test result sources to aggregate',
        },
        outputFormat: {
          type: 'string',
          enum: ['html', 'json', 'pdf', 'xml', 'csv', 'junit'],
          description: 'Output report format',
          default: 'html',
        },
        outputPath: {
          type: 'string',
          description: 'Output path for generated report',
          default: './test-reports',
        },
        includeScreenshots: {
          type: 'boolean',
          description: 'Include screenshots in report',
          default: true,
        },
        includeVideos: {
          type: 'boolean',
          description: 'Include videos in report',
          default: false,
        },
        analytics: {
          type: 'object',
          properties: {
            trends: {
              type: 'boolean',
              description: 'Generate trend analysis',
              default: true,
            },
            performance: {
              type: 'boolean',
              description: 'Include performance metrics',
              default: true,
            },
            flakiness: {
              type: 'boolean',
              description: 'Analyze test flakiness',
              default: true,
            },
            coverage: {
              type: 'boolean',
              description: 'Include coverage analysis',
              default: false,
            },
          },
          description: 'Analytics configuration',
        },
        filters: {
          type: 'object',
          properties: {
            status: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['passed', 'failed', 'skipped', 'pending'],
              },
              description: 'Filter by test status',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by test tags',
            },
            browser: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['chromium', 'firefox', 'webkit'],
              },
              description: 'Filter by browser engine',
            },
            timeRange: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date-time' },
                end: { type: 'string', format: 'date-time' },
              },
              description: 'Filter by time range',
            },
          },
          description: 'Report filtering options',
        },
        compareWith: {
          type: 'string',
          description: 'Path to previous test results for comparison',
        },
        threshold: {
          type: 'object',
          properties: {
            passRate: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Minimum pass rate threshold',
              default: 95,
            },
            performance: {
              type: 'number',
              description: 'Maximum acceptable test duration in milliseconds',
              default: 30000,
            },
          },
          description: 'Quality gate thresholds',
        },
      },
      required: ['action'],
    },
  },
];