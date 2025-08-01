#!/usr/bin/env node

/**
 * InSite Server - Main entry point
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

import { BrowserManager, type BrowserEngine } from './browser-manager.js';
import { registerTools } from './tools/index.js';
import { BrowserAutomationError, type ToolResult } from './types.js';
import path from 'path';
import os from 'os';

/**
 * InSite Server class
 */
class InSiteServer {
  private server: Server;
  private browserManager: BrowserManager;
  private tempDir: string;

  constructor() {
    this.server = new Server(
      {
        name: 'insite-server',
        version: '0.2.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.browserManager = BrowserManager.getInstance({
      headless: process.env['HEADLESS'] !== 'false',
      viewport: {
        width: parseInt(process.env['VIEWPORT_WIDTH'] ?? '1280'),
        height: parseInt(process.env['VIEWPORT_HEIGHT'] ?? '720'),
      },
      timeout: parseInt(process.env['TIMEOUT'] ?? '30000'),
    });

    this.tempDir = path.join(os.tmpdir(), 'insite-screenshots');

    this.setupHandlers();
  }

  /**
   * Set up MCP request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: registerTools(),
      };
    });

    // Handle tool calls with comprehensive error handling
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      try {
        // Validate request structure
        if (!request.params || !request.params.name) {
          return this.createSafeErrorResponse('INVALID_REQUEST', 'Missing tool name in request');
        }

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Tool call timeout')), 60000); // 60 second timeout
        });

        const toolCallPromise = this.handleToolCall(request);
        const result = await Promise.race([toolCallPromise, timeoutPromise]);
        
        // Ensure result is properly formatted
        if (!result || typeof result !== 'object') {
          return this.createSafeErrorResponse('INVALID_RESPONSE', 'Tool returned invalid response format');
        }

        return result;
      } catch (error) {
        console.error('Tool call error:', error);
        
        // Always return a safe, well-formed response
        if (error instanceof BrowserAutomationError) {
          return this.createSafeErrorResponse(error.type, error.message, error.details);
        }

        // Handle timeout specifically
        if (error && (error as Error).message === 'Tool call timeout') {
          return this.createSafeErrorResponse('TIMEOUT_ERROR', 'Tool call exceeded maximum execution time');
        }

        // Catch-all for unexpected errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return this.createSafeErrorResponse('JAVASCRIPT_ERROR', errorMessage);
      }
    });
  }

  /**
   * Create a safe, well-formed error response that won't break Claude
   */
  private createSafeErrorResponse(
    errorType: string, 
    message: string, 
    details?: Record<string, unknown>
  ): { content: Array<{ type: 'text'; text: string }> } {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: {
              type: errorType,
              message: message,
              ...(details ? { details } : {}),
              timestamp: new Date().toISOString(),
            },
          }),
        },
      ],
    };
  }

  /**
   * Handle individual tool calls
   */
  private async handleToolCall(request: CallToolRequest): Promise<{
    content: Array<{ type: 'text'; text: string }>;
  }> {
    const { name, arguments: args } = request.params;

    // Ensure browser is initialized for all operations except close_browser
    if (name !== 'close_browser' && !this.browserManager.isInitialized()) {
      try {
        await this.browserManager.initialize();
      } catch (initError) {
        console.error('Browser initialization failed:', initError);
        return this.createSafeErrorResponse(
          'BROWSER_INIT_ERROR',
          'Failed to initialize browser',
          { originalError: initError instanceof Error ? initError.message : 'Unknown error' }
        );
      }
    }

    // Add browser health check for critical operations
    if (['load_page', 'screenshot', 'click_element', 'type_text'].includes(name)) {
      if (!this.browserManager.getCurrentUrl() && name !== 'load_page') {
        return this.createSafeErrorResponse(
          'BROWSER_STATE_ERROR',
          'No page loaded. Use load_page first.',
          { suggestions: ['Call load_page with a URL before performing page interactions'] }
        );
      }
    }

    let result: ToolResult;

    switch (name) {
      case 'load_page':
        result = await this.loadPage(args as { url: string; waitUntil?: string });
        break;

      case 'screenshot':
        result = await this.takeScreenshot(args as { fullPage?: boolean; quality?: number });
        break;

      case 'scroll_to_element_and_screenshot':
        result = await this.scrollToElementAndScreenshot(args as { 
          selector: string; 
          quality?: number; 
          format?: 'png' | 'jpeg';
          timeout?: number; 
        });
        break;

      case 'capture_full_scrollable_page':
        result = await this.captureFullScrollablePage(args as { 
          quality?: number; 
          format?: 'png' | 'jpeg';
          timeout?: number; 
        });
        break;

      case 'get_current_url':
        result = await this.getCurrentUrl();
        break;

      case 'close_browser':
        result = await this.closeBrowser();
        break;

      case 'get_viewport_info':
        result = await this.getViewportInfo();
        break;

      case 'get_dom':
        result = await this.getDOMContent(args as { selector?: string });
        break;

      case 'get_page_title':
        result = await this.getPageTitle();
        break;

      case 'click_element':
        result = await this.clickElement(args as { selector: string; timeout?: number });
        break;

      case 'type_text':
        result = await this.typeText(args as { selector: string; text: string; delay?: number; clear?: boolean; timeout?: number });
        break;

      case 'hover_element':
        result = await this.hoverElement(args as { selector: string; timeout?: number; force?: boolean });
        break;

      case 'scroll_page':
        result = await this.scrollPage(args as { direction?: string; amount?: number; selector?: string });
        break;

      case 'press_key':
        result = await this.pressKey(args as { key: string; selector?: string; timeout?: number });
        break;

      case 'wait_for_element':
        result = await this.waitForElement(args as { selector: string; state?: string; timeout?: number });
        break;

      case 'wait_for_navigation':
        result = await this.waitForNavigation(args as { url?: string; timeout?: number; waitUntil?: string });
        break;

      case 'go_back':
        result = await this.goBack(args as { timeout?: number; waitUntil?: string });
        break;

      case 'go_forward':
        result = await this.goForward(args as { timeout?: number; waitUntil?: string });
        break;

      case 'reload_page':
        result = await this.reloadPage(args as { ignoreCache?: boolean; timeout?: number; waitUntil?: string });
        break;

      case 'evaluate_js':
        result = await this.evaluateJS(args as { code: string; timeout?: number });
        break;

      case 'evaluate_js_on_element':
        result = await this.evaluateJSOnElement(args as { selector: string; code: string; timeout?: number });
        break;

      case 'get_element_info':
        result = await this.getElementInfo(args as { selector: string; timeout?: number });
        break;

      case 'get_console_logs':
        result = await this.getConsoleLogs(args as { level?: string; limit?: number });
        break;

      case 'clear_console_logs':
        result = await this.clearConsoleLogs();
        break;

      case 'get_network_logs':
        result = await this.getNetworkLogs(args as { method?: string; status?: number; url_pattern?: string; limit?: number });
        break;

      case 'clear_network_logs':
        result = await this.clearNetworkLogs();
        break;

      case 'set_viewport_size':
        result = await this.setViewportSize(args as { width: number; height: number });
        break;

      case 'set_user_agent':
        result = await this.setUserAgent(args as { userAgent: string });
        break;

      case 'set_geolocation':
        result = await this.setGeolocation(args as { latitude: number; longitude: number; accuracy?: number });
        break;

      case 'switch_browser':
        result = await this.switchBrowser(args as { engine: string });
        break;

      case 'get_browser_info':
        result = await this.getBrowserInfo();
        break;

      case 'list_available_browsers':
        result = await this.listAvailableBrowsers();
        break;

      // Advanced Debugging Tools
      case 'highlight_element':
        result = await this.highlightElement(args as { 
          selector: string; 
          style?: { border?: string; backgroundColor?: string; outline?: string }; 
          duration?: number; 
          showInfo?: boolean; 
          timeout?: number; 
        });
        break;

      case 'trace_execution':
        result = await this.traceExecution(args as { 
          enabled?: boolean; 
          options?: { 
            screenshots?: boolean; 
            snapshots?: boolean; 
            sources?: boolean; 
            network?: boolean; 
            console?: boolean; 
          }; 
          path?: string; 
        });
        break;

      case 'capture_performance_timeline':
        result = await this.capturePerformanceTimeline(args as { 
          categories?: string[]; 
          duration?: number; 
          includeMetrics?: boolean; 
          format?: 'json' | 'timeline' | 'summary'; 
        });
        break;

      case 'debug_mode':
        result = await this.enableDebugMode(args as { 
          enabled: boolean; 
          level?: 'verbose' | 'info' | 'warn' | 'error'; 
          features?: { 
            consoleLogging?: boolean; 
            networkLogging?: boolean; 
            performanceMonitoring?: boolean; 
            elementInspection?: boolean; 
            errorTracking?: boolean; 
          }; 
          outputPath?: string; 
        });
        break;

      // Security & Validation Tools
      case 'handle_csp':
        result = await this.handleCSP(args as {
          action: 'bypass' | 'enforce' | 'report' | 'check';
          policies?: string[];
          bypassUnsafe?: boolean;
          reportOnly?: boolean;
          violationCallback?: string;
        });
        break;

      case 'manage_certificates':
        result = await this.manageCertificates(args as {
          action: 'validate' | 'ignore' | 'add_trusted' | 'check_chain' | 'get_info';
          url?: string;
          certificatePath?: string;
          ignoreHTTPSErrors?: boolean;
          checkExpiry?: boolean;
          validateChain?: boolean;
        });
        break;

      case 'validate_security':
        result = await this.validateSecurity(args as {
          checks?: string[];
          level?: 'basic' | 'intermediate' | 'advanced';
          includeHeaders?: boolean;
          scanContent?: boolean;
          reportFormat?: 'summary' | 'detailed' | 'json';
        });
        break;

      // Advanced Monitoring & Analytics Tools
      case 'usage_analytics':
        result = await this.manageUsageAnalytics(args as {
          action: 'start_tracking' | 'stop_tracking' | 'get_report' | 'reset_data' | 'configure';
          trackingConfig?: {
            trackPageViews?: boolean;
            trackUserInteractions?: boolean;
            trackPerformance?: boolean;
            trackErrors?: boolean;
            sessionTimeout?: number;
          };
          reportFormat?: 'summary' | 'detailed' | 'json' | 'csv';
          timeRange?: {
            start?: string;
            end?: string;
            preset?: 'last_hour' | 'last_day' | 'last_week' | 'last_month' | 'all_time';
          };
        });
        break;

      case 'error_tracking':
        result = await this.manageErrorTracking(args as {
          action: 'start_monitoring' | 'stop_monitoring' | 'get_errors' | 'clear_errors' | 'configure_alerts';
          errorTypes?: string[];
          alertConfig?: {
            enableAlerts?: boolean;
            threshold?: number;
            timeWindow?: number;
            notificationMethod?: 'console' | 'file' | 'webhook';
          };
          filters?: {
            severity?: 'all' | 'critical' | 'error' | 'warning' | 'info';
            source?: string;
            limit?: number;
          };
        });
        break;

      case 'performance_monitoring':
        result = await this.managePerformanceMonitoring(args as {
          action: 'start_monitoring' | 'stop_monitoring' | 'get_metrics' | 'analyze_performance' | 'set_thresholds';
          metrics?: string[];
          thresholds?: {
            pageLoadTime?: number;
            firstContentfulPaint?: number;
            largestContentfulPaint?: number;
            cumulativeLayoutShift?: number;
            memoryUsage?: number;
          };
          samplingInterval?: number;
          reportFormat?: 'realtime' | 'summary' | 'detailed' | 'chart_data';
        });
        break;

      case 'session_analytics':
        result = await this.manageSessionAnalytics(args as {
          action: 'start_session' | 'end_session' | 'get_session_data' | 'analyze_journey' | 'export_sessions';
          sessionConfig?: {
            trackPageFlow?: boolean;
            trackInteractionSequence?: boolean;
            trackTimings?: boolean;
            trackFormInteractions?: boolean;
            captureScreenshots?: boolean;
          };
          analysisType?: 'funnel_analysis' | 'path_analysis' | 'interaction_heatmap' | 'time_analysis' | 'conversion_analysis';
          filters?: {
            minDuration?: number;
            maxDuration?: number;
            browserEngine?: string;
            dateRange?: { start: string; end: string };
          };
          exportFormat?: 'json' | 'csv' | 'timeline' | 'report';
        });
        break;

      case 'playwright_test_adapter':
        result = await this.handlePlaywrightTestAdapter(args as {
          action: string;
          config?: any;
          testPath?: string;
          reportFormat?: string;
          outputDir?: string;
        });
        break;

      case 'jest_adapter':
        result = await this.handleJestAdapter(args as {
          action: string;
          config?: any;
          testPath?: string;
          watchMode?: boolean;
          bail?: number;
          verbose?: boolean;
        });
        break;

      case 'mocha_adapter':
        result = await this.handleMochaAdapter(args as {
          action: string;
          config?: any;
          testPath?: string;
          bail?: boolean;
          watch?: boolean;
          require?: string[];
        });
        break;

      case 'test_reporter':
        result = await this.handleTestReporter(args as {
          action: string;
          sources?: Array<{framework: string, resultsPath: string, format: string}>;
          outputFormat?: string;
          outputPath?: string;
          includeScreenshots?: boolean;
          includeVideos?: boolean;
          analytics?: any;
          filters?: any;
          compareWith?: string;
          threshold?: any;
        });
        break;

      default:
        result = {
          success: false,
          error: {
            type: 'JAVASCRIPT_ERROR',
            message: `Unknown tool: ${name}`,
            details: { toolName: name },
          },
        };
    }

    // Ensure result is safely formatted
    try {
      const jsonString = JSON.stringify(result);
      return {
        content: [
          {
            type: 'text',
            text: jsonString,
          },
        ],
      };
    } catch (jsonError) {
      console.error('JSON serialization error:', jsonError);
      return this.createSafeErrorResponse(
        'SERIALIZATION_ERROR', 
        'Failed to serialize tool result'
      );
    }
  }

  /**
   * Load page tool implementation
   */
  private async loadPage(args: { url: string; waitUntil?: string }): Promise<ToolResult> {
    try {
      // Ensure browser is initialized before navigation
      if (!this.browserManager.isInitialized()) {
        await this.browserManager.initialize();
      }
      
      const waitCondition = (args.waitUntil as any) ?? 'domcontentloaded';
      await this.browserManager.navigateToUrl(args.url, waitCondition);
      
      return {
        success: true,
        data: {
          url: args.url,
          currentUrl: this.browserManager.getCurrentUrl(),
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Screenshot tool implementation
   */
  private async takeScreenshot(args: { fullPage?: boolean; quality?: number }): Promise<ToolResult> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${timestamp}.png`;
      const filePath = `./temp/${filename}`;
      
      const savedPath = await this.browserManager.takeScreenshot({
        fullPage: args.fullPage ?? true,
        ...(args.quality ? { quality: args.quality } : {}),
        format: 'png',
        filePath,
      });

      return {
        success: true,
        data: {
          filePath: savedPath,
          filename,
          fullPage: args.fullPage ?? true,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get current URL tool implementation
   */
  private async getCurrentUrl(): Promise<ToolResult> {
    try {
      const url = this.browserManager.getCurrentUrl();
      return {
        success: true,
        data: { url },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Close browser tool implementation
   */
  private async closeBrowser(): Promise<ToolResult> {
    try {
      await this.browserManager.close();
      return {
        success: true,
        data: { message: 'Browser closed successfully' },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get viewport info tool implementation
   */
  private async getViewportInfo(): Promise<ToolResult> {
    try {
      const viewportInfo = this.browserManager.getViewportInfo();
      return {
        success: true,
        data: viewportInfo,
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get DOM content tool implementation
   */
  private async getDOMContent(args: { selector?: string }): Promise<ToolResult> {
    try {
      const dom = await this.browserManager.getDOMContent(args.selector);
      return {
        success: true,
        data: {
          dom,
          selector: args.selector,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get page title tool implementation
   */
  private async getPageTitle(): Promise<ToolResult> {
    try {
      const title = await this.browserManager.getPageTitle();
      return {
        success: true,
        data: { title },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Scroll to element and screenshot tool implementation
   */
  private async scrollToElementAndScreenshot(args: { 
    selector: string; 
    quality?: number; 
    format?: 'png' | 'jpeg';
    timeout?: number; 
  }): Promise<ToolResult> {
    try {
      const timestamp = Date.now();
      const filePath = path.join(this.tempDir, `element-screenshot-${timestamp}.${args.format || 'png'}`);
      
      const screenshotPath = await this.browserManager.scrollToElementAndScreenshot(args.selector, {
        filePath,
        ...(args.quality !== undefined ? { quality: args.quality } : {}),
        ...(args.format !== undefined ? { format: args.format } : {}),
        ...(args.timeout !== undefined ? { timeout: args.timeout } : {}),
      });
      
      return {
        success: true,
        data: {
          screenshot: screenshotPath,
          selector: args.selector,
          format: args.format || 'png',
          message: 'Element screenshot captured successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Capture full scrollable page tool implementation
   */
  private async captureFullScrollablePage(args: { 
    quality?: number; 
    format?: 'png' | 'jpeg';
    timeout?: number; 
  }): Promise<ToolResult> {
    try {
      const timestamp = Date.now();
      const filePath = path.join(this.tempDir, `full-page-${timestamp}.${args.format || 'png'}`);
      
      const screenshotPath = await this.browserManager.captureFullScrollablePage({
        filePath,
        ...(args.quality !== undefined ? { quality: args.quality } : {}),
        ...(args.format !== undefined ? { format: args.format } : {}),
        ...(args.timeout !== undefined ? { timeout: args.timeout } : {}),
      });
      
      return {
        success: true,
        data: {
          screenshot: screenshotPath,
          format: args.format || 'png',
          message: 'Full scrollable page captured successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Click element tool implementation
   */
  private async clickElement(args: { selector: string; timeout?: number }): Promise<ToolResult> {
    try {
      await this.browserManager.clickElement(args.selector, {
        ...(args.timeout ? { timeout: args.timeout } : {}),
      });
      
      return {
        success: true,
        data: {
          selector: args.selector,
          message: 'Element clicked successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Type text tool implementation
   */
  private async typeText(args: { selector: string; text: string; delay?: number; clear?: boolean; timeout?: number }): Promise<ToolResult> {
    try {
      const typeOptions: { delay?: number; clear?: boolean; timeout?: number } = {};
      if (args.delay !== undefined) typeOptions.delay = args.delay;
      if (args.clear !== undefined) typeOptions.clear = args.clear;
      if (args.timeout !== undefined) typeOptions.timeout = args.timeout;
      
      await this.browserManager.typeText(args.selector, args.text, typeOptions);
      
      return {
        success: true,
        data: {
          selector: args.selector,
          text: args.text,
          message: 'Text typed successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Hover element tool implementation
   */
  private async hoverElement(args: { selector: string; timeout?: number; force?: boolean }): Promise<ToolResult> {
    try {
      const hoverOptions: { timeout?: number; force?: boolean } = {};
      if (args.timeout !== undefined) hoverOptions.timeout = args.timeout;
      if (args.force !== undefined) hoverOptions.force = args.force;
      
      await this.browserManager.hoverElement(args.selector, hoverOptions);
      
      return {
        success: true,
        data: {
          selector: args.selector,
          message: 'Element hovered successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Scroll page tool implementation
   */
  private async scrollPage(args: { direction?: string; amount?: number; selector?: string }): Promise<ToolResult> {
    try {
      const scrollOptions: { direction?: 'up' | 'down' | 'left' | 'right'; amount?: number; selector?: string } = {};
      if (args.direction) scrollOptions.direction = args.direction as any;
      if (args.amount !== undefined) scrollOptions.amount = args.amount;
      if (args.selector !== undefined) scrollOptions.selector = args.selector;
      
      await this.browserManager.scrollPage(scrollOptions);
      
      return {
        success: true,
        data: {
          direction: args.direction || 'down',
          amount: args.amount || 500,
          selector: args.selector,
          message: 'Page scrolled successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Press key tool implementation
   */
  private async pressKey(args: { key: string; selector?: string; timeout?: number }): Promise<ToolResult> {
    try {
      const keyOptions: { selector?: string; timeout?: number } = {};
      if (args.selector !== undefined) keyOptions.selector = args.selector;
      if (args.timeout !== undefined) keyOptions.timeout = args.timeout;
      
      await this.browserManager.pressKey(args.key, keyOptions);
      
      return {
        success: true,
        data: {
          key: args.key,
          selector: args.selector,
          message: 'Key pressed successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Wait for element tool implementation
   */
  private async waitForElement(args: { selector: string; state?: string; timeout?: number }): Promise<ToolResult> {
    try {
      const waitOptions: { state?: 'visible' | 'hidden' | 'attached' | 'detached'; timeout?: number } = {};
      if (args.state) waitOptions.state = args.state as any;
      if (args.timeout !== undefined) waitOptions.timeout = args.timeout;
      
      await this.browserManager.waitForElement(args.selector, waitOptions);
      
      return {
        success: true,
        data: {
          selector: args.selector,
          state: args.state || 'visible',
          message: 'Element wait completed successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Wait for navigation tool implementation
   */
  private async waitForNavigation(args: { url?: string; timeout?: number; waitUntil?: string }): Promise<ToolResult> {
    try {
      const navOptions: { url?: string; timeout?: number; waitUntil?: any } = {};
      if (args.url !== undefined) navOptions.url = args.url;
      if (args.timeout !== undefined) navOptions.timeout = args.timeout;
      if (args.waitUntil) navOptions.waitUntil = args.waitUntil;
      
      await this.browserManager.waitForNavigation(navOptions);
      
      return {
        success: true,
        data: {
          url: args.url,
          waitUntil: args.waitUntil || 'load',
          currentUrl: this.browserManager.getCurrentUrl(),
          message: 'Navigation wait completed successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Go back tool implementation
   */
  private async goBack(args: { timeout?: number; waitUntil?: string }): Promise<ToolResult> {
    try {
      const backOptions: { timeout?: number; waitUntil?: any } = {};
      if (args.timeout !== undefined) backOptions.timeout = args.timeout;
      if (args.waitUntil) backOptions.waitUntil = args.waitUntil;
      
      await this.browserManager.goBack(backOptions);
      
      return {
        success: true,
        data: {
          currentUrl: this.browserManager.getCurrentUrl(),
          message: 'Navigated back successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Go forward tool implementation
   */
  private async goForward(args: { timeout?: number; waitUntil?: string }): Promise<ToolResult> {
    try {
      const forwardOptions: { timeout?: number; waitUntil?: any } = {};
      if (args.timeout !== undefined) forwardOptions.timeout = args.timeout;
      if (args.waitUntil) forwardOptions.waitUntil = args.waitUntil;
      
      await this.browserManager.goForward(forwardOptions);
      
      return {
        success: true,
        data: {
          currentUrl: this.browserManager.getCurrentUrl(),
          message: 'Navigated forward successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Reload page tool implementation
   */
  private async reloadPage(args: { ignoreCache?: boolean; timeout?: number; waitUntil?: string }): Promise<ToolResult> {
    try {
      const reloadOptions: { ignoreCache?: boolean; timeout?: number; waitUntil?: any } = {};
      if (args.ignoreCache !== undefined) reloadOptions.ignoreCache = args.ignoreCache;
      if (args.timeout !== undefined) reloadOptions.timeout = args.timeout;
      if (args.waitUntil) reloadOptions.waitUntil = args.waitUntil;
      
      await this.browserManager.reloadPage(reloadOptions);
      
      return {
        success: true,
        data: {
          currentUrl: this.browserManager.getCurrentUrl(),
          ignoreCache: args.ignoreCache ?? false,
          message: `Page reloaded successfully${args.ignoreCache ? ' (hard refresh)' : ''}`,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Evaluate JavaScript tool implementation
   */
  private async evaluateJS(args: { code: string; timeout?: number }): Promise<ToolResult> {
    try {
      const jsOptions: { timeout?: number } = {};
      if (args.timeout !== undefined) jsOptions.timeout = args.timeout;
      
      const result = await this.browserManager.evaluateJavaScript(args.code, jsOptions);
      
      return {
        success: true,
        data: {
          code: args.code,
          result: result,
          type: typeof result,
          message: 'JavaScript executed successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Evaluate JavaScript on element tool implementation
   */
  private async evaluateJSOnElement(args: { selector: string; code: string; timeout?: number }): Promise<ToolResult> {
    try {
      const jsOptions: { timeout?: number } = {};
      if (args.timeout !== undefined) jsOptions.timeout = args.timeout;
      
      const result = await this.browserManager.evaluateJavaScriptOnElement(
        args.selector, 
        args.code, 
        jsOptions
      );
      
      return {
        success: true,
        data: {
          selector: args.selector,
          code: args.code,
          result: result,
          type: typeof result,
          message: 'JavaScript executed on element successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get element info tool implementation
   */
  private async getElementInfo(args: { selector: string; timeout?: number }): Promise<ToolResult> {
    try {
      const infoOptions: { timeout?: number } = {};
      if (args.timeout !== undefined) infoOptions.timeout = args.timeout;
      
      const elementInfo = await this.browserManager.getElementInfo(args.selector, infoOptions);
      
      return {
        success: true,
        data: {
          selector: args.selector,
          elementInfo: elementInfo,
          message: 'Element information retrieved successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get console logs tool implementation
   */
  private async getConsoleLogs(args: { level?: string; limit?: number }): Promise<ToolResult> {
    try {
      const options: { level?: string; limit?: number } = {};
      if (args.level !== undefined) options.level = args.level;
      if (args.limit !== undefined) options.limit = args.limit;
      
      const logs = this.browserManager.getConsoleLogs(options);
      
      return {
        success: true,
        data: {
          logs: logs,
          count: logs.length,
          level: args.level || 'all',
          message: `Retrieved ${logs.length} console log${logs.length === 1 ? '' : 's'}`,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Clear console logs tool implementation
   */
  private async clearConsoleLogs(): Promise<ToolResult> {
    try {
      this.browserManager.clearConsoleLogs();
      
      return {
        success: true,
        data: {
          message: 'Console logs cleared successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get network logs tool implementation
   */
  private async getNetworkLogs(args: { method?: string; status?: number; url_pattern?: string; limit?: number }): Promise<ToolResult> {
    try {
      const options: { method?: string; status?: number; urlPattern?: string; limit?: number } = {};
      if (args.method !== undefined) options.method = args.method;
      if (args.status !== undefined) options.status = args.status;
      if (args.url_pattern !== undefined) options.urlPattern = args.url_pattern;
      if (args.limit !== undefined) options.limit = args.limit;
      
      const logs = this.browserManager.getNetworkLogs(options);
      
      return {
        success: true,
        data: {
          logs: logs,
          count: logs.length,
          filters: {
            method: args.method || 'all',
            status: args.status || 'all',
            urlPattern: args.url_pattern || 'all',
          },
          message: `Retrieved ${logs.length} network log${logs.length === 1 ? '' : 's'}`,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Clear network logs tool implementation
   */
  private async clearNetworkLogs(): Promise<ToolResult> {
    try {
      this.browserManager.clearNetworkLogs();
      
      return {
        success: true,
        data: {
          message: 'Network logs cleared successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Set viewport size tool implementation
   */
  private async setViewportSize(args: { width: number; height: number }): Promise<ToolResult> {
    try {
      await this.browserManager.setViewportSize(args.width, args.height);
      
      return {
        success: true,
        data: {
          width: args.width,
          height: args.height,
          message: `Viewport size set to ${args.width}x${args.height} successfully`,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Set user agent tool implementation
   */
  private async setUserAgent(args: { userAgent: string }): Promise<ToolResult> {
    try {
      await this.browserManager.setUserAgent(args.userAgent);
      
      return {
        success: true,
        data: {
          userAgent: args.userAgent,
          message: 'User agent set successfully',
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Set geolocation tool implementation
   */
  private async setGeolocation(args: { latitude: number; longitude: number; accuracy?: number }): Promise<ToolResult> {
    try {
      await this.browserManager.setGeolocation(args.latitude, args.longitude, args.accuracy);
      
      return {
        success: true,
        data: {
          latitude: args.latitude,
          longitude: args.longitude,
          accuracy: args.accuracy ?? 100,
          message: `Geolocation set to ${args.latitude}, ${args.longitude} successfully`,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Switch browser engine tool implementation
   */
  private async switchBrowser(args: { engine: string }): Promise<ToolResult> {
    try {
      await this.browserManager.switchBrowserEngine(args.engine as BrowserEngine);
      
      const browserInfo = this.browserManager.getBrowserInfo();
      
      return {
        success: true,
        data: {
          engine: browserInfo.engine,
          version: browserInfo.version,
          message: `Successfully switched to ${args.engine} browser engine`,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get browser info tool implementation
   */
  private async getBrowserInfo(): Promise<ToolResult> {
    try {
      const browserInfo = this.browserManager.getBrowserInfo();
      
      return {
        success: true,
        data: {
          engine: browserInfo.engine,
          version: browserInfo.version,
          isInitialized: browserInfo.isInitialized,
          message: `Current browser: ${browserInfo.engine}${browserInfo.version ? ` v${browserInfo.version}` : ''}`,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * List available browsers tool implementation
   */
  private async listAvailableBrowsers(): Promise<ToolResult> {
    try {
      const availableEngines = BrowserManager.getAvailableEngines();
      
      return {
        success: true,
        data: {
          engines: availableEngines,
          count: availableEngines.length,
          message: `${availableEngines.length} browser engines available: ${availableEngines.join(', ')}`,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  // ====== ADVANCED DEBUGGING TOOL HANDLERS ======

  /**
   * Highlight element tool implementation
   */
  private async highlightElement(args: {
    selector: string;
    style?: { border?: string; backgroundColor?: string; outline?: string };
    duration?: number;
    showInfo?: boolean;
    timeout?: number;
  }): Promise<ToolResult> {
    try {
      const options: {
        style?: { border?: string; backgroundColor?: string; outline?: string };
        duration?: number;
        showInfo?: boolean;
        timeout?: number;
      } = {};
      
      if (args.style !== undefined) options.style = args.style;
      if (args.duration !== undefined) options.duration = args.duration;
      if (args.showInfo !== undefined) options.showInfo = args.showInfo;
      if (args.timeout !== undefined) options.timeout = args.timeout;

      const result = await this.browserManager.highlightElement(args.selector, options);
      
      return {
        success: true,
        data: {
          highlightedCount: result.highlightedCount,
          ...(result.elementInfo ? { elementInfo: result.elementInfo } : {}),
          message: `Highlighted ${result.highlightedCount} element${result.highlightedCount === 1 ? '' : 's'} matching "${args.selector}"`,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Trace execution tool implementation
   */
  private async traceExecution(args: {
    enabled?: boolean;
    options?: {
      screenshots?: boolean;
      snapshots?: boolean;
      sources?: boolean;
      network?: boolean;
      console?: boolean;
    };
    path?: string;
  }): Promise<ToolResult> {
    try {
      const tracingOptions: {
        enabled?: boolean;
        screenshots?: boolean;
        snapshots?: boolean;
        sources?: boolean;
        network?: boolean;
        console?: boolean;
        path?: string;
      } = {};
      
      if (args.enabled !== undefined) tracingOptions.enabled = args.enabled;
      if (args.options?.screenshots !== undefined) tracingOptions.screenshots = args.options.screenshots;
      if (args.options?.snapshots !== undefined) tracingOptions.snapshots = args.options.snapshots;
      if (args.options?.sources !== undefined) tracingOptions.sources = args.options.sources;
      if (args.options?.network !== undefined) tracingOptions.network = args.options.network;
      if (args.options?.console !== undefined) tracingOptions.console = args.options.console;
      if (args.path !== undefined) tracingOptions.path = args.path;

      const result = await this.browserManager.enableTracing(tracingOptions);
      
      return {
        success: true,
        data: {
          status: result.status,
          ...(result.tracePath ? { tracePath: result.tracePath } : {}),
          message: result.status,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Capture performance timeline tool implementation
   */
  private async capturePerformanceTimeline(args: {
    categories?: string[];
    duration?: number;
    includeMetrics?: boolean;
    format?: 'json' | 'timeline' | 'summary';
  }): Promise<ToolResult> {
    try {
      const perfOptions: {
        categories?: string[];
        duration?: number;
        includeMetrics?: boolean;
        format?: 'json' | 'timeline' | 'summary';
      } = {};
      
      if (args.categories !== undefined) perfOptions.categories = args.categories;
      if (args.duration !== undefined) perfOptions.duration = args.duration;
      if (args.includeMetrics !== undefined) perfOptions.includeMetrics = args.includeMetrics;
      if (args.format !== undefined) perfOptions.format = args.format;

      const result = await this.browserManager.capturePerformanceTimeline(perfOptions);
      
      return {
        success: true,
        data: {
          format: result.format,
          data: result.data,
          ...(result.metrics ? { metrics: result.metrics } : {}),
          timestamp: result.timestamp,
          message: `Captured performance timeline in ${result.format} format`,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Enable debug mode tool implementation
   */
  private async enableDebugMode(args: {
    enabled: boolean;
    level?: 'verbose' | 'info' | 'warn' | 'error';
    features?: {
      consoleLogging?: boolean;
      networkLogging?: boolean;
      performanceMonitoring?: boolean;
      elementInspection?: boolean;
      errorTracking?: boolean;
    };
    outputPath?: string;
  }): Promise<ToolResult> {
    try {
      const debugOptions: {
        enabled: boolean;
        level?: 'verbose' | 'info' | 'warn' | 'error';
        features?: {
          consoleLogging?: boolean;
          networkLogging?: boolean;
          performanceMonitoring?: boolean;
          elementInspection?: boolean;
          errorTracking?: boolean;
        };
        outputPath?: string;
      } = { enabled: args.enabled };
      
      if (args.level !== undefined) debugOptions.level = args.level;
      if (args.features !== undefined) debugOptions.features = args.features;
      if (args.outputPath !== undefined) debugOptions.outputPath = args.outputPath;

      const result = await this.browserManager.enableDebugMode(debugOptions);
      
      return {
        success: true,
        data: {
          status: result.status,
          features: result.features,
          message: result.status,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  // ====== SECURITY & VALIDATION TOOL HANDLERS ======

  /**
   * Handle CSP tool implementation
   */
  private async handleCSP(args: {
    action: 'bypass' | 'enforce' | 'report' | 'check';
    policies?: string[];
    bypassUnsafe?: boolean;
    reportOnly?: boolean;
    violationCallback?: string;
  }): Promise<ToolResult> {
    try {
      const cspOptions: {
        action: 'bypass' | 'enforce' | 'report' | 'check';
        policies?: string[];
        bypassUnsafe?: boolean;
        reportOnly?: boolean;
        violationCallback?: string;
      } = { action: args.action };

      if (args.policies !== undefined) cspOptions.policies = args.policies;
      if (args.bypassUnsafe !== undefined) cspOptions.bypassUnsafe = args.bypassUnsafe;
      if (args.reportOnly !== undefined) cspOptions.reportOnly = args.reportOnly;
      if (args.violationCallback !== undefined) cspOptions.violationCallback = args.violationCallback;

      const result = await this.browserManager.handleCSP(cspOptions);
      
      return {
        success: true,
        data: {
          action: result.action,
          status: result.status,
          ...(result.policies ? { policies: result.policies } : {}),
          ...(result.violations ? { violations: result.violations } : {}),
          message: result.message,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Manage certificates tool implementation
   */
  private async manageCertificates(args: {
    action: 'validate' | 'ignore' | 'add_trusted' | 'check_chain' | 'get_info';
    url?: string;
    certificatePath?: string;
    ignoreHTTPSErrors?: boolean;
    checkExpiry?: boolean;
    validateChain?: boolean;
  }): Promise<ToolResult> {
    try {
      const certOptions: {
        action: 'validate' | 'ignore' | 'add_trusted' | 'check_chain' | 'get_info';
        url?: string;
        certificatePath?: string;
        ignoreHTTPSErrors?: boolean;
        checkExpiry?: boolean;
        validateChain?: boolean;
      } = { action: args.action };

      if (args.url !== undefined) certOptions.url = args.url;
      if (args.certificatePath !== undefined) certOptions.certificatePath = args.certificatePath;
      if (args.ignoreHTTPSErrors !== undefined) certOptions.ignoreHTTPSErrors = args.ignoreHTTPSErrors;
      if (args.checkExpiry !== undefined) certOptions.checkExpiry = args.checkExpiry;
      if (args.validateChain !== undefined) certOptions.validateChain = args.validateChain;

      const result = await this.browserManager.manageCertificates(certOptions);
      
      return {
        success: true,
        data: {
          action: result.action,
          status: result.status,
          ...(result.certificateInfo ? { certificateInfo: result.certificateInfo } : {}),
          ...(result.chain ? { chain: result.chain } : {}),
          message: result.message,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Validate security tool implementation
   */
  private async validateSecurity(args: {
    checks?: string[];
    level?: 'basic' | 'intermediate' | 'advanced';
    includeHeaders?: boolean;
    scanContent?: boolean;
    reportFormat?: 'summary' | 'detailed' | 'json';
  }): Promise<ToolResult> {
    try {
      const securityOptions: {
        checks?: string[];
        level?: 'basic' | 'intermediate' | 'advanced';
        includeHeaders?: boolean;
        scanContent?: boolean;
        reportFormat?: 'summary' | 'detailed' | 'json';
      } = {};

      if (args.checks !== undefined) securityOptions.checks = args.checks;
      if (args.level !== undefined) securityOptions.level = args.level;
      if (args.includeHeaders !== undefined) securityOptions.includeHeaders = args.includeHeaders;
      if (args.scanContent !== undefined) securityOptions.scanContent = args.scanContent;
      if (args.reportFormat !== undefined) securityOptions.reportFormat = args.reportFormat;

      const result = await this.browserManager.validateSecurity(securityOptions);
      
      return {
        success: true,
        data: {
          level: result.level,
          overallScore: result.overallScore,
          results: result.results,
          ...(result.headers ? { headers: result.headers } : {}),
          recommendations: result.recommendations,
          summary: result.summary,
          message: `Security validation completed with overall score: ${result.overallScore}%`,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  // ====== ADVANCED MONITORING & ANALYTICS TOOL HANDLERS ======

  /**
   * Usage analytics tool implementation
   */
  private async manageUsageAnalytics(args: {
    action: 'start_tracking' | 'stop_tracking' | 'get_report' | 'reset_data' | 'configure';
    trackingConfig?: {
      trackPageViews?: boolean;
      trackUserInteractions?: boolean;
      trackPerformance?: boolean;
      trackErrors?: boolean;
      sessionTimeout?: number;
    };
    reportFormat?: 'summary' | 'detailed' | 'json' | 'csv';
    timeRange?: {
      start?: string;
      end?: string;
      preset?: 'last_hour' | 'last_day' | 'last_week' | 'last_month' | 'all_time';
    };
  }): Promise<ToolResult> {
    try {
      const analyticsOptions: {
        action: 'start_tracking' | 'stop_tracking' | 'get_report' | 'reset_data' | 'configure';
        trackingConfig?: {
          trackPageViews?: boolean;
          trackUserInteractions?: boolean;
          trackPerformance?: boolean;
          trackErrors?: boolean;
          sessionTimeout?: number;
        };
        reportFormat?: 'summary' | 'detailed' | 'json' | 'csv';
        timeRange?: {
          start?: string;
          end?: string;
          preset?: 'last_hour' | 'last_day' | 'last_week' | 'last_month' | 'all_time';
        };
      } = { action: args.action };

      if (args.trackingConfig !== undefined) analyticsOptions.trackingConfig = args.trackingConfig;
      if (args.reportFormat !== undefined) analyticsOptions.reportFormat = args.reportFormat;
      if (args.timeRange !== undefined) analyticsOptions.timeRange = args.timeRange;

      const result = await this.browserManager.manageUsageAnalytics(analyticsOptions);
      
      return {
        success: true,
        data: {
          action: result.action,
          status: result.status,
          ...(result.data ? { data: result.data } : {}),
          message: result.message,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Error tracking tool implementation
   */
  private async manageErrorTracking(args: {
    action: 'start_monitoring' | 'stop_monitoring' | 'get_errors' | 'clear_errors' | 'configure_alerts';
    errorTypes?: string[];
    alertConfig?: {
      enableAlerts?: boolean;
      threshold?: number;
      timeWindow?: number;
      notificationMethod?: 'console' | 'file' | 'webhook';
    };
    filters?: {
      severity?: 'all' | 'critical' | 'error' | 'warning' | 'info';
      source?: string;
      limit?: number;
    };
  }): Promise<ToolResult> {
    try {
      const trackingOptions: {
        action: 'start_monitoring' | 'stop_monitoring' | 'get_errors' | 'clear_errors' | 'configure_alerts';
        errorTypes?: string[];
        alertConfig?: {
          enableAlerts?: boolean;
          threshold?: number;
          timeWindow?: number;
          notificationMethod?: 'console' | 'file' | 'webhook';
        };
        filters?: {
          severity?: 'all' | 'critical' | 'error' | 'warning' | 'info';
          source?: string;
          limit?: number;
        };
      } = { action: args.action };

      if (args.errorTypes !== undefined) trackingOptions.errorTypes = args.errorTypes;
      if (args.alertConfig !== undefined) trackingOptions.alertConfig = args.alertConfig;
      if (args.filters !== undefined) trackingOptions.filters = args.filters;

      const result = await this.browserManager.manageErrorTracking(trackingOptions);
      
      return {
        success: true,
        data: {
          action: result.action,
          status: result.status,
          ...(result.data ? { data: result.data } : {}),
          message: result.message,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Performance monitoring tool implementation
   */
  private async managePerformanceMonitoring(args: {
    action: 'start_monitoring' | 'stop_monitoring' | 'get_metrics' | 'analyze_performance' | 'set_thresholds';
    metrics?: string[];
    thresholds?: {
      pageLoadTime?: number;
      firstContentfulPaint?: number;
      largestContentfulPaint?: number;
      cumulativeLayoutShift?: number;
      memoryUsage?: number;
    };
    samplingInterval?: number;
    reportFormat?: 'realtime' | 'summary' | 'detailed' | 'chart_data';
  }): Promise<ToolResult> {
    try {
      const monitoringOptions: {
        action: 'start_monitoring' | 'stop_monitoring' | 'get_metrics' | 'analyze_performance' | 'set_thresholds';
        metrics?: string[];
        thresholds?: {
          pageLoadTime?: number;
          firstContentfulPaint?: number;
          largestContentfulPaint?: number;
          cumulativeLayoutShift?: number;
          memoryUsage?: number;
        };
        samplingInterval?: number;
        reportFormat?: 'realtime' | 'summary' | 'detailed' | 'chart_data';
      } = { action: args.action };

      if (args.metrics !== undefined) monitoringOptions.metrics = args.metrics;
      if (args.thresholds !== undefined) monitoringOptions.thresholds = args.thresholds;
      if (args.samplingInterval !== undefined) monitoringOptions.samplingInterval = args.samplingInterval;
      if (args.reportFormat !== undefined) monitoringOptions.reportFormat = args.reportFormat;

      const result = await this.browserManager.managePerformanceMonitoring(monitoringOptions);
      
      return {
        success: true,
        data: {
          action: result.action,
          status: result.status,
          ...(result.data ? { data: result.data } : {}),
          message: result.message,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Session analytics tool implementation
   */
  private async manageSessionAnalytics(args: {
    action: 'start_session' | 'end_session' | 'get_session_data' | 'analyze_journey' | 'export_sessions';
    sessionConfig?: {
      trackPageFlow?: boolean;
      trackInteractionSequence?: boolean;
      trackTimings?: boolean;
      trackFormInteractions?: boolean;
      captureScreenshots?: boolean;
    };
    analysisType?: 'funnel_analysis' | 'path_analysis' | 'interaction_heatmap' | 'time_analysis' | 'conversion_analysis';
    filters?: {
      minDuration?: number;
      maxDuration?: number;
      browserEngine?: string;
      dateRange?: { start: string; end: string };
    };
    exportFormat?: 'json' | 'csv' | 'timeline' | 'report';
  }): Promise<ToolResult> {
    try {
      const sessionOptions: {
        action: 'start_session' | 'end_session' | 'get_session_data' | 'analyze_journey' | 'export_sessions';
        sessionConfig?: {
          trackPageFlow?: boolean;
          trackInteractionSequence?: boolean;
          trackTimings?: boolean;
          trackFormInteractions?: boolean;
          captureScreenshots?: boolean;
        };
        analysisType?: 'funnel_analysis' | 'path_analysis' | 'interaction_heatmap' | 'time_analysis' | 'conversion_analysis';
        filters?: {
          minDuration?: number;
          maxDuration?: number;
          browserEngine?: string;
          dateRange?: { start: string; end: string };
        };
        exportFormat?: 'json' | 'csv' | 'timeline' | 'report';
      } = { action: args.action };

      if (args.sessionConfig !== undefined) sessionOptions.sessionConfig = args.sessionConfig;
      if (args.analysisType !== undefined) sessionOptions.analysisType = args.analysisType;
      if (args.filters !== undefined) sessionOptions.filters = args.filters;
      if (args.exportFormat !== undefined) sessionOptions.exportFormat = args.exportFormat;

      const result = await this.browserManager.manageSessionAnalytics(sessionOptions);
      
      return {
        success: true,
        data: {
          action: result.action,
          status: result.status,
          ...(result.data ? { data: result.data } : {}),
          message: result.message,
        },
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Handle playwright_test_adapter tool calls
   */
  private async handlePlaywrightTestAdapter(args: any): Promise<ToolResult> {
    try {
      const { action, config, testPath, reportFormat, outputDir } = args;
      
      const result = await this.browserManager.playwrightTestAdapter(action, config, testPath, reportFormat, outputDir);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Handle jest_adapter tool calls
   */
  private async handleJestAdapter(args: any): Promise<ToolResult> {
    try {
      const { action, config, testPath, watchMode, bail, verbose } = args;
      
      const result = await this.browserManager.jestAdapter(action, config, testPath, watchMode, bail, verbose);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Handle mocha_adapter tool calls
   */
  private async handleMochaAdapter(args: any): Promise<ToolResult> {
    try {
      const { action, config, testPath, bail, watch, require } = args;
      
      const result = await this.browserManager.mochaAdapter(action, config, testPath, bail, watch, require);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Handle test_reporter tool calls
   */
  private async handleTestReporter(args: any): Promise<ToolResult> {
    try {
      const { 
        action, 
        sources, 
        outputFormat, 
        outputPath, 
        includeScreenshots, 
        includeVideos, 
        analytics, 
        filters, 
        compareWith, 
        threshold 
      } = args;
      
      const result = await this.browserManager.testReporter(
        action,
        sources,
        outputFormat,
        outputPath,
        includeScreenshots,
        includeVideos,
        analytics,
        filters,
        compareWith,
        threshold
      );
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof BrowserAutomationError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        };
      }
      throw error;
    }
  }

  /**
   * Start the MCP server
   */
  public async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      console.error('Received SIGINT, shutting down gracefully...');
      await this.browserManager.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('Received SIGTERM, shutting down gracefully...');
      await this.browserManager.close();
      process.exit(0);
    });
  }
}

// Export the server class for testing
export { InSiteServer };

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new InSiteServer();
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}