# InSite API Reference

**Version**: 1.2.4  
**Platform**: Enterprise Browser Automation Platform  
**Tools**: 52 operational tools across 13 categories

## Overview

InSite provides a comprehensive Model Context Protocol (MCP) implementation for browser automation, offering 52 operational tools across multiple categories including navigation, interaction, debugging, security, monitoring, and testing framework integration.

## Quick Start

```bash
# Install and run InSite MCP server
npx insite-mcp
```

### MCP Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "insite": {
      "command": "npx",
      "args": ["insite-mcp"]
    }
  }
}
```

## Tool Categories

### 1. Page Control (5 tools)

Core page navigation, browser history management, and lifecycle control.

#### `load_page`

Navigate to a URL and wait for page load completion with configurable wait conditions.

**Parameters:**
- `url` (string, required) - Target URL to navigate to
- `waitUntil` (string, optional) - Wait condition: "load", "domcontentloaded", "networkidle", "commit" (default: "domcontentloaded")

**Example:**
```json
{
  "name": "load_page",
  "arguments": {
    "url": "https://example.com",
    "waitUntil": "networkidle"
  }
}
```

#### `go_back`

Navigate backward in browser history with timeout control.

**Parameters:**
- `timeout` (number, optional) - Timeout in milliseconds (default: 30000)
- `waitUntil` (string, optional) - Wait condition (default: "load")

#### `go_forward`

Navigate forward in browser history with timeout control.

**Parameters:**
- `timeout` (number, optional) - Timeout in milliseconds (default: 30000)
- `waitUntil` (string, optional) - Wait condition (default: "load")

#### `reload_page`

Reload the current page with optional cache control and wait conditions.

**Parameters:**
- `ignoreCache` (boolean, optional) - Hard refresh ignoring cache (default: false)
- `timeout` (number, optional) - Timeout in milliseconds (default: 30000)
- `waitUntil` (string, optional) - Wait condition (default: "load")

#### `get_current_url`

Retrieve the current page URL including any fragments or query parameters.

**Parameters:** None

### 2. Visual & Screenshot Tools (4 tools)

Screenshot capture, viewport management, and advanced visual capture capabilities.

#### `screenshot`

Capture page screenshots with quality control and full-page support.

**Parameters:**
- `fullPage` (boolean, optional) - Capture full scrollable page (default: true)
- `quality` (number, optional) - JPEG quality 0-100 (PNG ignores this)

**Example:**
```json
{
  "name": "screenshot",
  "arguments": {
    "fullPage": true,
    "quality": 90
  }
}
```

#### `scroll_to_element_and_screenshot`

Scroll to a specific element and capture a screenshot of it with auto-scrolling behavior.

**Parameters:**
- `selector` (string, required) - CSS selector to locate the element
- `format` (string, optional) - Image format: "png" or "jpeg" (default: "png")
- `quality` (number, optional) - JPEG quality 0-100 (default: 90)
- `timeout` (number, optional) - Timeout to wait for element in milliseconds (default: 30000)

**Example:**
```json
{
  "name": "scroll_to_element_and_screenshot",
  "arguments": {
    "selector": "#main-content",
    "format": "png",
    "quality": 95
  }
}
```

#### `capture_full_scrollable_page`

Capture the entire scrollable page height in one long image with viewport optimization.

**Parameters:**
- `format` (string, optional) - Image format: "png" or "jpeg" (default: "png")
- `quality` (number, optional) - JPEG quality 0-100 (default: 90)
- `timeout` (number, optional) - Timeout for large page capture in milliseconds (default: 45000)

**Example:**
```json
{
  "name": "capture_full_scrollable_page",
  "arguments": {
    "format": "jpeg",
    "quality": 85,
    "timeout": 60000
  }
}
```

#### `get_viewport_info`

Get current viewport dimensions and device pixel ratio information.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "width": 1280,
    "height": 720,
    "devicePixelRatio": 2.0
  }
}
```

### 3. DOM Analysis Tools (2 tools)

HTML content extraction and page metadata analysis.

#### `get_dom`

Extract page DOM structure and content with optional CSS selector filtering.

**Parameters:**
- `selector` (string, optional) - CSS selector to filter DOM content

**Example:**
```json
{
  "name": "get_dom",
  "arguments": {
    "selector": ".main-content"
  }
}
```

#### `get_page_title`

Retrieve the current page title from the document head.

**Parameters:** None

### 4. Element Interaction Tools (7 tools)

User interaction simulation and element manipulation capabilities.

#### `click_element`

Click elements using CSS selectors with timeout and actionability checks.

**Parameters:**
- `selector` (string, required) - CSS selector for target element
- `timeout` (number, optional) - Operation timeout in milliseconds (default: 30000)

**Example:**
```json
{
  "name": "click_element",
  "arguments": {
    "selector": "button#submit",
    "timeout": 10000
  }
}
```

#### `type_text`

Type text into input elements with realistic timing and optional clearing.

**Parameters:**
- `selector` (string, required) - CSS selector for input element
- `text` (string, required) - Text to type
- `delay` (number, optional) - Keystroke delay in milliseconds (default: 0)
- `clear` (boolean, optional) - Clear existing text first (default: true)
- `timeout` (number, optional) - Operation timeout (default: 30000)

#### `hover_element`

Trigger hover effects on elements for dropdown menus and interactive components.

**Parameters:**
- `selector` (string, required) - CSS selector for target element
- `timeout` (number, optional) - Operation timeout (default: 30000)
- `force` (boolean, optional) - Bypass actionability checks (default: false)

#### `scroll_page`

Scroll the page or specific elements in any direction with pixel precision.

**Parameters:**
- `direction` (string, optional) - "up", "down", "left", "right" (default: "down")
- `amount` (number, optional) - Scroll distance in pixels (default: 500)
- `selector` (string, optional) - Element selector to scroll (defaults to page)

#### `press_key`

Press keyboard keys and key combinations with optional element focus.

**Parameters:**
- `key` (string, required) - Key to press (e.g., "Enter", "Tab", "Control+a")
- `selector` (string, optional) - Element to focus before key press
- `timeout` (number, optional) - Operation timeout (default: 30000)

**Supported Keys:** Enter, Tab, Escape, ArrowUp/Down/Left/Right, Space, Control+[key], Alt+[key], Shift+[key]

#### `wait_for_element`

Wait for elements to reach specific states before proceeding with automation.

**Parameters:**
- `selector` (string, required) - CSS selector for target element
- `state` (string, optional) - "visible", "hidden", "attached", "detached" (default: "visible")
- `timeout` (number, optional) - Wait timeout in milliseconds (default: 30000)

#### `wait_for_navigation`

Wait for page navigation completion with configurable wait conditions.

**Parameters:**
- `url` (string, optional) - URL pattern to wait for
- `timeout` (number, optional) - Wait timeout (default: 30000)
- `waitUntil` (string, optional) - Wait condition (default: "load")

### 5. JavaScript Execution Tools (3 tools)

JavaScript code execution and dynamic page analysis capabilities.

#### `evaluate_js`

Execute JavaScript code in the page context with return value capture.

**Parameters:**
- `code` (string, required) - JavaScript code to execute
- `timeout` (number, optional) - Execution timeout in milliseconds (default: 30000)

**Example:**
```json
{
  "name": "evaluate_js",
  "arguments": {
    "code": "document.querySelectorAll('a').length"
  }
}
```

#### `evaluate_js_on_element`

Execute JavaScript code on a specific element with element context.

**Parameters:**
- `selector` (string, required) - CSS selector for target element
- `code` (string, required) - JavaScript code to execute (element available as "element" variable)
- `timeout` (number, optional) - Execution timeout (default: 30000)

#### `get_element_info`

Get comprehensive information about elements using JavaScript inspection.

**Parameters:**
- `selector` (string, required) - CSS selector for target element
- `timeout` (number, optional) - Operation timeout (default: 30000)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "tagName": "BUTTON",
    "id": "submit",
    "className": "btn btn-primary",
    "textContent": "Submit Form",
    "attributes": { "type": "submit", "disabled": "false" },
    "boundingBox": { "x": 100, "y": 200, "width": 80, "height": 32 }
  }
}
```

### 6. Console & Network Monitoring Tools (4 tools)

Real-time console and network activity monitoring capabilities.

#### `get_console_logs`

Retrieve browser console messages with level filtering and pagination.

**Parameters:**
- `level` (string, optional) - Filter by level: "log", "info", "warn", "error", "debug"
- `limit` (number, optional) - Maximum number of logs to return (default: 100)

#### `clear_console_logs`

Clear stored console logs to start fresh monitoring.

**Parameters:** None

#### `get_network_logs`

Retrieve network request logs with comprehensive filtering options.

**Parameters:**
- `method` (string, optional) - Filter by HTTP method: "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
- `status` (number, optional) - Filter by status code
- `url_pattern` (string, optional) - Filter by URL pattern (regex)
- `limit` (number, optional) - Maximum number of requests to return (default: 100)

#### `clear_network_logs`

Clear stored network request logs for fresh monitoring sessions.

**Parameters:** None

### 7. Browser Configuration Tools (3 tools)

Browser settings and environment configuration capabilities.

#### `set_viewport_size`

Configure browser viewport dimensions for responsive testing.

**Parameters:**
- `width` (number, required) - Viewport width in pixels (100-4096)
- `height` (number, required) - Viewport height in pixels (100-4096)

#### `set_user_agent`

Set custom user agent string for browser identity simulation.

**Parameters:**
- `userAgent` (string, required) - User agent string to set

#### `set_geolocation`

Configure geolocation coordinates for location-based testing.

**Parameters:**
- `latitude` (number, required) - Latitude coordinate (-90 to 90)
- `longitude` (number, required) - Longitude coordinate (-180 to 180)
- `accuracy` (number, optional) - Location accuracy in meters (default: 100)

### 8. Browser Management Tools (4 tools)

Browser lifecycle and multi-engine management capabilities.

#### `close_browser`

Close the browser instance and cleanup all associated resources.

**Parameters:** None

**Note:** Always call this tool when finished to prevent memory leaks in long-running processes.

#### `switch_browser`

Switch between different browser engines for cross-browser testing.

**Parameters:**
- `engine` (string, required) - Browser engine: "chromium", "firefox", "webkit"

#### `get_browser_info`

Get comprehensive information about the current browser engine and capabilities.

**Parameters:** None

#### `list_available_browsers`

List all available browser engines with version information.

**Parameters:** None

### 9. Advanced Debugging Tools (4 tools)

Enterprise debugging and performance analysis capabilities.

#### `highlight_element`

Visually highlight elements on the page for debugging workflows.

**Parameters:**
- `selector` (string, required) - CSS selector for element(s) to highlight
- `style` (object, optional) - Highlight style configuration
- `duration` (number, optional) - Highlight duration in milliseconds (default: 3000, 0 for permanent)
- `showInfo` (boolean, optional) - Show element information tooltip (default: true)
- `timeout` (number, optional) - Operation timeout (default: 30000)

#### `trace_execution`

Enable detailed execution tracing for debugging browser operations.

**Parameters:**
- `enabled` (boolean, optional) - Enable or disable tracing (default: true)
- `options` (object, optional) - Tracing configuration options
- `path` (string, optional) - Path to save trace files

#### `capture_performance_timeline`

Capture detailed browser performance timeline data for optimization analysis.

**Parameters:**
- `categories` (array, optional) - Performance categories: "navigation", "resource", "measure", "mark", "paint", "layout", "longtask", "element"
- `duration` (number, optional) - Capture duration in milliseconds (default: 0 for current state)
- `includeMetrics` (boolean, optional) - Include Web Vitals metrics (default: true)
- `format` (string, optional) - Output format: "json", "timeline", "summary" (default: "json")

#### `debug_mode`

Enable or disable comprehensive debugging mode with enhanced logging.

**Parameters:**
- `enabled` (boolean, required) - Enable or disable debug mode
- `level` (string, optional) - Debug logging level: "verbose", "info", "warn", "error" (default: "info")
- `features` (object, optional) - Debug features to enable
- `outputPath` (string, optional) - Path for debug output files

### 10. Security & Validation Tools (3 tools)

Security scanning, CSP handling, and certificate management capabilities.

#### `handle_csp`

Configure Content Security Policy handling and compliance checking.

**Parameters:**
- `action` (string, required) - CSP action: "bypass", "enforce", "report", "check" (default: "check")
- `policies` (array, optional) - CSP policies to check or enforce
- `bypassUnsafe` (boolean, optional) - Allow bypassing unsafe CSP directives (default: false)
- `reportOnly` (boolean, optional) - Enable CSP report-only mode (default: false)
- `violationCallback` (string, optional) - JavaScript callback for CSP violations

#### `manage_certificates`

Certificate validation and custom certificate handling for HTTPS sites.

**Parameters:**
- `action` (string, required) - Certificate action: "validate", "ignore", "add_trusted", "check_chain", "get_info" (default: "validate")
- `url` (string, optional) - URL to check certificate for
- `certificatePath` (string, optional) - Path to certificate file
- `ignoreHTTPSErrors` (boolean, optional) - Ignore HTTPS certificate errors (default: false)
- `checkExpiry` (boolean, optional) - Check certificate expiry date (default: true)
- `validateChain` (boolean, optional) - Validate certificate chain (default: true)

#### `validate_security`

Comprehensive security validation and vulnerability scanning for web pages.

**Parameters:**
- `checks` (array, optional) - Security checks: "https_usage", "mixed_content", "insecure_forms", "csp_presence", "hsts_headers", "xss_protection", "clickjacking_protection", "content_type_options", "referrer_policy", "permissions_policy"
- `level` (string, optional) - Security validation level: "basic", "intermediate", "advanced" (default: "intermediate")
- `includeHeaders` (boolean, optional) - Include security header analysis (default: true)
- `scanContent` (boolean, optional) - Scan page content for security issues (default: true)
- `reportFormat` (string, optional) - Report format: "summary", "detailed", "json" (default: "detailed")

### 11. Advanced Monitoring & Analytics Tools (4 tools)

Usage tracking, error monitoring, and performance analysis capabilities.

#### `usage_analytics`

Track and report browser automation usage patterns and statistics.

**Parameters:**
- `action` (string, required) - Analytics action: "start_tracking", "stop_tracking", "get_report", "reset_data", "configure" (default: "get_report")
- `trackingConfig` (object, optional) - Configuration for usage tracking
- `reportFormat` (string, optional) - Report format: "summary", "detailed", "json", "csv" (default: "summary")
- `timeRange` (object, optional) - Time range for analytics report

#### `error_tracking`

Advanced error tracking, categorization, and alerting system.

**Parameters:**
- `action` (string, required) - Error tracking action: "start_monitoring", "stop_monitoring", "get_errors", "clear_errors", "configure_alerts" (default: "get_errors")
- `errorTypes` (array, optional) - Error types to track: "javascript_errors", "network_errors", "console_errors", "playwright_errors", "timeout_errors", "element_not_found", "security_errors"
- `alertConfig` (object, optional) - Alert configuration
- `filters` (object, optional) - Error filtering options

#### `performance_monitoring`

Real-time performance monitoring, profiling, and optimization insights.

**Parameters:**
- `action` (string, required) - Performance action: "start_monitoring", "stop_monitoring", "get_metrics", "analyze_performance", "set_thresholds" (default: "get_metrics")
- `metrics` (array, optional) - Performance metrics: "page_load_time", "first_contentful_paint", "largest_contentful_paint", "cumulative_layout_shift", "first_input_delay", "memory_usage", "cpu_usage", "network_timing", "resource_sizes", "dom_metrics"
- `thresholds` (object, optional) - Performance thresholds for alerting
- `samplingInterval` (number, optional) - Sampling interval in milliseconds (default: 1000)
- `reportFormat` (string, optional) - Report format: "realtime", "summary", "detailed", "chart_data" (default: "summary")

#### `session_analytics`

Session-based analytics, user journey tracking, and workflow optimization.

**Parameters:**
- `action` (string, required) - Session action: "start_session", "end_session", "get_session_data", "analyze_journey", "export_sessions" (default: "get_session_data")
- `sessionConfig` (object, optional) - Session tracking configuration
- `analysisType` (string, optional) - Analysis type: "funnel_analysis", "path_analysis", "interaction_heatmap", "time_analysis", "conversion_analysis" (default: "path_analysis")
- `filters` (object, optional) - Session filtering options
- `exportFormat` (string, optional) - Export format: "json", "csv", "timeline", "report" (default: "json")

### 12. Visual Testing & Comparison Tools (5 tools)

Advanced visual testing, screenshot comparison, and regression analysis capabilities.

#### `screenshot_compare`

Compare screenshots with diff generation for visual testing workflows.

**Parameters:**
- `baselineImage` (string, required) - Path to baseline/reference image file
- `currentImage` (string, optional) - Path to current screenshot (will take new if not provided)
- `diffOutputPath` (string, optional) - Path to save diff image
- `threshold` (number, optional) - Difference threshold 0-1 (default: 0.1)
- `includeAntiAliasing` (boolean, optional) - Include anti-aliasing differences (default: false)
- `highlightColor` (string, optional) - Color for highlighting differences (default: "#ff0000")
- `generateReport` (boolean, optional) - Generate detailed comparison report (default: true)

#### `visual_regression_testing`

Automated visual regression testing framework with baseline management.

**Parameters:**
- `testSuite` (string, required) - Name of the visual test suite
- `baselineDirectory` (string, optional) - Directory containing baseline images
- `testCases` (array, required) - Visual test cases to execute
- `threshold` (number, optional) - Global difference threshold (default: 0.1)
- `updateBaselines` (boolean, optional) - Update baseline images (default: false)

#### `cross_browser_visual_validation`

Validate visual consistency across different browser engines.

**Parameters:**
- `url` (string, required) - URL to test across browsers
- `browsers` (array, optional) - Browser engines: "chromium", "firefox", "webkit" (default: all)
- `viewports` (array, optional) - Viewport sizes to test
- `elements` (array, optional) - Specific elements to compare
- `threshold` (number, optional) - Difference threshold (default: 0.05)
- `outputDirectory` (string, optional) - Directory to save results

#### `element_screenshot_compare`

Compare specific elements across different states or versions.

**Parameters:**
- `selector` (string, required) - CSS selector for the element to compare
- `baselineImage` (string, optional) - Path to baseline element image
- `states` (array, optional) - Different states to capture and compare
- `includeMargin` (number, optional) - Include margin around element in pixels (default: 0)
- `threshold` (number, optional) - Comparison threshold (default: 0.1)

#### `visual_test_reporting`

Generate comprehensive visual test reports with image galleries.

**Parameters:**
- `reportName` (string, required) - Name of the test report
- `testResults` (array, required) - Test results to include in report
- `outputPath` (string, optional) - Path to save the report
- `format` (string, optional) - Report format: "html", "json", "junit" (default: "html")
- `includeMetadata` (boolean, optional) - Include test metadata (default: true)
- `generateGallery` (boolean, optional) - Generate image comparison gallery (default: true)

### 13. Testing Framework Integration Tools (4 tools)

Integration with popular testing frameworks and advanced reporting capabilities.

#### `playwright_test_adapter`

Integration adapter for Playwright Test runner with advanced configuration and reporting.

**Parameters:**
- `action` (string, required) - Adapter action: "initialize", "configure", "run_test", "get_results", "cleanup"
- `config` (object, optional) - Playwright Test configuration
- `testPath` (string, optional) - Specific test file or pattern to run
- `reportFormat` (string, optional) - Test report format: "html", "json", "junit", "list", "dot" (default: "html")
- `outputDir` (string, optional) - Output directory for reports (default: "./test-results")

**Example:**
```json
{
  "name": "playwright_test_adapter",
  "arguments": {
    "action": "configure",
    "config": {
      "testDir": "./tests/e2e",
      "workers": 2,
      "retries": 1,
      "projects": [
        { "name": "chromium", "browser": "chromium" },
        { "name": "firefox", "browser": "firefox" }
      ]
    }
  }
}
```

#### `jest_adapter`

Integration adapter for Jest testing framework with browser automation capabilities.

**Parameters:**
- `action` (string, required) - Jest adapter action: "initialize", "configure", "run_test", "get_results", "watch"
- `config` (object, optional) - Jest configuration options
- `testPath` (string, optional) - Specific test file or pattern to run
- `watchMode` (boolean, optional) - Enable watch mode for continuous testing (default: false)
- `bail` (number, optional) - Stop running tests after n failures (default: 0)
- `verbose` (boolean, optional) - Display individual test results (default: true)

#### `mocha_adapter`

Integration adapter for Mocha testing framework with browser automation hooks.

**Parameters:**
- `action` (string, required) - Mocha adapter action: "initialize", "configure", "run_test", "get_results", "watch"
- `config` (object, optional) - Mocha configuration options
- `testPath` (string, optional) - Specific test file or pattern to run
- `bail` (boolean, optional) - Bail after first test failure (default: false)
- `watch` (boolean, optional) - Watch files for changes (default: false)
- `require` (array, optional) - Modules to require before running tests

#### `test_reporter`

Advanced test reporting and result aggregation with multi-format output and analytics.

**Parameters:**
- `action` (string, required) - Reporter action: "generate_report", "aggregate_results", "export_data", "get_analytics", "compare_runs"
- `sources` (array, optional) - Test result sources to aggregate
- `outputFormat` (string, optional) - Output format: "html", "json", "pdf", "xml", "csv", "junit" (default: "html")
- `outputPath` (string, optional) - Output path for generated report (default: "./test-reports")
- `includeScreenshots` (boolean, optional) - Include screenshots in report (default: true)
- `includeVideos` (boolean, optional) - Include videos in report (default: false)
- `analytics` (object, optional) - Analytics configuration
- `filters` (object, optional) - Report filtering options
- `compareWith` (string, optional) - Path to previous test results for comparison
- `threshold` (object, optional) - Quality gate thresholds

## Response Format

All InSite tools return responses in the following standardized format following MCP protocol:

```json
{
  "success": true|false,
  "data": {
    // Tool-specific response data
  },
  "error": {
    "type": "ERROR_TYPE",
    "message": "Human-readable error description",
    "details": {
      // Additional error context
    }
  },
  "metadata": {
    "timestamp": "2025-08-01T10:30:00.000Z",
    "executionTime": 1250,
    "toolVersion": "1.2.4"
  }
}
```

## Error Types

InSite uses standardized error types for consistent error handling across all tools:

- **BROWSER_NOT_INITIALIZED** - Browser instance not started or initialization failed. Call load_page or switch_browser first.
- **ELEMENT_NOT_FOUND** - CSS selector matched no elements on the page. Verify selector syntax and element presence.
- **TIMEOUT_ERROR** - Operation exceeded the specified timeout duration. Consider increasing timeout or checking network conditions.
- **NAVIGATION_FAILED** - Page navigation was unsuccessful due to network issues, invalid URL, or server errors.
- **JAVASCRIPT_ERROR** - JavaScript execution failed or encountered an error. Check code syntax and page context.
- **NETWORK_ERROR** - Network request failed or timed out. Verify connectivity and server availability.
- **INVALID_URL** - URL format is invalid or malformed. Ensure proper protocol and domain format.
- **INVALID_SELECTOR** - CSS selector syntax is invalid. Verify selector format and escaping.
- **SECURITY_ERROR** - Security policy violation or certificate error. Check CSP settings and certificate validity.
- **CONFIGURATION_ERROR** - Invalid configuration parameters or settings. Verify parameter types and values.

## Best Practices

### 1. Error Handling
Always check the `success` field in responses and implement proper error handling with retry logic for transient failures.

### 2. Timeout Management
Set appropriate timeouts based on expected page load times and network conditions. Default 30-second timeouts may be insufficient for slow networks or complex pages.

### 3. Element Synchronization
Use `wait_for_element` before interacting with dynamic content to ensure elements are ready. Consider using `networkidle` wait condition for SPAs.

### 4. Resource Management
Always call `close_browser` when finished to clean up resources and prevent memory leaks in long-running processes.

### 5. Cross-Browser Testing
Use `switch_browser` and visual testing tools to ensure consistent behavior across different browser engines.

### 6. Performance Monitoring
Leverage monitoring tools to track performance metrics and identify optimization opportunities in your automation workflows.

### 7. Security Validation
Use security tools to validate CSP compliance, certificate validity, and identify potential security vulnerabilities.

### 8. Visual Regression Testing
Implement visual testing workflows to catch UI regressions and ensure consistent user experience across releases.

## Integration Examples

### Basic Navigation Flow
```json
[
  {"name": "load_page", "arguments": {"url": "https://example.com"}},
  {"name": "wait_for_element", "arguments": {"selector": "#main-content"}},
  {"name": "screenshot", "arguments": {"fullPage": true}},
  {"name": "close_browser", "arguments": {}}
]
```

### Form Automation
```json
[
  {"name": "load_page", "arguments": {"url": "https://example.com/form"}},
  {"name": "type_text", "arguments": {"selector": "#username", "text": "testuser"}},
  {"name": "type_text", "arguments": {"selector": "#password", "text": "password123"}},
  {"name": "click_element", "arguments": {"selector": "#submit-btn"}},
  {"name": "wait_for_navigation", "arguments": {"timeout": 10000}}
]
```

### Advanced Screenshot Workflow
```json
[
  {"name": "load_page", "arguments": {"url": "https://example.com"}},
  {"name": "capture_full_scrollable_page", "arguments": {"format": "png", "quality": 95}},
  {"name": "scroll_to_element_and_screenshot", "arguments": {"selector": "#footer", "format": "jpeg"}},
  {"name": "close_browser", "arguments": {}}
]
```

### Testing Framework Integration
```json
[
  {"name": "playwright_test_adapter", "arguments": {"action": "initialize"}},
  {"name": "playwright_test_adapter", "arguments": {
    "action": "configure",
    "config": {"testDir": "./e2e", "workers": 1}
  }},
  {"name": "playwright_test_adapter", "arguments": {
    "action": "run_test",
    "testPath": "./e2e/login.spec.js"
  }}
]
```

## Support

For comprehensive documentation and advanced configuration options, refer to the [InSite documentation](https://docs.insite.dev).

---

*InSite v1.2.4 - Enterprise Browser Automation Platform with 52 operational tools*