/**
 * Visual Testing & Comparison Tools for Browser MCP Server
 * 
 * Provides advanced visual testing capabilities including screenshot comparison,
 * visual regression testing, and cross-browser visual validation.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Screenshot Compare Tool
 * Advanced screenshot comparison with diff generation
 */
export const screenshotCompareTool: Tool = {
  name: 'screenshot_compare',
  description: 'Compare screenshots with diff generation for visual testing',
  inputSchema: {
    type: 'object',
    properties: {
      baselineImage: {
        type: 'string',
        description: 'Path to baseline/reference image file'
      },
      currentImage: {
        type: 'string',
        description: 'Path to current screenshot to compare (optional, will take new screenshot)'
      },
      diffOutputPath: {
        type: 'string',
        description: 'Path to save diff image (optional, uses temp directory)'
      },
      threshold: {
        type: 'number',
        description: 'Difference threshold (0-1, higher = more tolerant)',
        default: 0.1,
        minimum: 0,
        maximum: 1
      },
      includeAntiAliasing: {
        type: 'boolean',
        description: 'Include anti-aliasing differences',
        default: false
      },
      highlightColor: {
        type: 'string',
        description: 'Color for highlighting differences (hex format)',
        default: '#ff0000'
      },
      generateReport: {
        type: 'boolean',
        description: 'Generate detailed comparison report',
        default: true
      }
    },
    required: ['baselineImage']
  }
};

/**
 * Visual Regression Testing Tool
 * Automated visual regression testing framework
 */
export const visualRegressionTestingTool: Tool = {
  name: 'visual_regression_testing',
  description: 'Automated visual regression testing with baseline management',
  inputSchema: {
    type: 'object',
    properties: {
      testSuite: {
        type: 'string',
        description: 'Name of the visual test suite'
      },
      baselineDirectory: {
        type: 'string',
        description: 'Directory containing baseline images'
      },
      testCases: {
        type: 'array',
        description: 'Visual test cases to execute',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Test case name'
            },
            url: {
              type: 'string',
              description: 'URL to test (optional if already on page)'
            },
            selector: {
              type: 'string',
              description: 'Element selector to screenshot (optional, full page if not provided)'
            },
            viewport: {
              type: 'object',
              description: 'Viewport size for this test',
              properties: {
                width: { type: 'number' },
                height: { type: 'number' }
              }
            },
            waitConditions: {
              type: 'array',
              description: 'Conditions to wait for before screenshot',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['element', 'timeout', 'networkidle'] },
                  value: { type: 'string' }
                }
              }
            }
          },
          required: ['name']
        }
      },
      threshold: {
        type: 'number',
        description: 'Global difference threshold',
        default: 0.1
      },
      updateBaselines: {
        type: 'boolean',
        description: 'Update baseline images with current screenshots',
        default: false
      }
    },
    required: ['testSuite', 'testCases']
  }
};

/**
 * Cross-Browser Visual Validation Tool
 * Visual consistency validation across browser engines
 */
export const crossBrowserVisualValidationTool: Tool = {
  name: 'cross_browser_visual_validation',
  description: 'Validate visual consistency across different browser engines',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL to test across browsers'
      },
      browsers: {
        type: 'array',
        description: 'Browser engines to test',
        items: {
          type: 'string',
          enum: ['chromium', 'firefox', 'webkit']
        },
        default: ['chromium', 'firefox', 'webkit']
      },
      viewports: {
        type: 'array',
        description: 'Viewport sizes to test',
        items: {
          type: 'object',
          properties: {
            width: { type: 'number' },
            height: { type: 'number' },
            name: { type: 'string' }
          },
          required: ['width', 'height']
        },
        default: [
          { width: 1920, height: 1080, name: 'desktop' },
          { width: 768, height: 1024, name: 'tablet' },
          { width: 375, height: 667, name: 'mobile' }
        ]
      },
      elements: {
        type: 'array',
        description: 'Specific elements to compare (optional)',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            selector: { type: 'string' }
          },
          required: ['name', 'selector']
        }
      },
      threshold: {
        type: 'number',
        description: 'Difference threshold for comparison',
        default: 0.05
      },
      outputDirectory: {
        type: 'string',
        description: 'Directory to save comparison results'
      }
    },
    required: ['url']
  }
};

/**
 * Element Screenshot Compare Tool
 * Element-specific screenshot comparison
 */
export const elementScreenshotCompareTool: Tool = {
  name: 'element_screenshot_compare',
  description: 'Compare specific elements across different states or versions',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector for the element to compare'
      },
      baselineImage: {
        type: 'string',
        description: 'Path to baseline element image'
      },
      states: {
        type: 'array',
        description: 'Different states to capture and compare',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            actions: {
              type: 'array',
              description: 'Actions to perform before screenshot',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['hover', 'click', 'focus', 'scroll'] },
                  selector: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            }
          },
          required: ['name']
        }
      },
      includeMargin: {
        type: 'number',
        description: 'Include margin around element (pixels)',
        default: 0
      },
      threshold: {
        type: 'number',
        description: 'Comparison threshold',
        default: 0.1
      }
    },
    required: ['selector']
  }
};

/**
 * Visual Test Reporting Tool
 * Comprehensive visual test reporting with galleries
 */
export const visualTestReportingTool: Tool = {
  name: 'visual_test_reporting',
  description: 'Generate comprehensive visual test reports with image galleries',
  inputSchema: {
    type: 'object',
    properties: {
      reportName: {
        type: 'string',
        description: 'Name of the test report'
      },
      testResults: {
        type: 'array',
        description: 'Test results to include in report',
        items: {
          type: 'object',
          properties: {
            testName: { type: 'string' },
            status: { type: 'string', enum: ['pass', 'fail', 'warn'] },
            baselineImage: { type: 'string' },
            currentImage: { type: 'string' },
            diffImage: { type: 'string' },
            difference: { type: 'number' },
            threshold: { type: 'number' },
            metadata: { type: 'object' }
          },
          required: ['testName', 'status']
        }
      },
      outputPath: {
        type: 'string',
        description: 'Path to save the report'
      },
      format: {
        type: 'string',
        enum: ['html', 'json', 'junit'],
        description: 'Report format',
        default: 'html'
      },
      includeMetadata: {
        type: 'boolean',
        description: 'Include test metadata in report',
        default: true
      },
      generateGallery: {
        type: 'boolean',
        description: 'Generate image comparison gallery',
        default: true
      }
    },
    required: ['reportName', 'testResults']
  }
};

/**
 * All visual testing tools export
 */
export const visualTestingTools = [
  screenshotCompareTool,
  visualRegressionTestingTool,
  crossBrowserVisualValidationTool,
  elementScreenshotCompareTool,
  visualTestReportingTool
];