# Browser MCP Server - API Reference

**Version**: 1.2.0  
**Platform**: Enterprise Browser Automation Platform  
**Tools**: 50 operational tools across 13 categories

## Overview

The Browser MCP Server provides a comprehensive Model Context Protocol (MCP) implementation for browser automation, offering 50 operational tools across multiple categories including navigation, interaction, debugging, security, monitoring, and testing framework integration.

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the MCP server
node dist/server.js
```

## Tool Categories

### 1. Navigation Tools (5 tools)
Core page navigation and browser history management.

#### `load_page`
Navigate to a URL and wait for page load completion.

**Parameters:**
- `url` (string, required): Target URL to navigate to
- `waitUntil` (string, optional): Wait condition - `"load"`, `"domcontentloaded"`, `"networkidle"`, `"commit"` (default: `"domcontentloaded"`)

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
Navigate backward in browser history.

**Parameters:**
- `timeout` (number, optional): Timeout in milliseconds (default: 30000)
- `waitUntil` (string, optional): Wait condition (default: `"load"`)

#### `go_forward`
Navigate forward in browser history.

**Parameters:**
- `timeout` (number, optional): Timeout in milliseconds (default: 30000)
- `waitUntil` (string, optional): Wait condition (default: `"load"`)

#### `reload_page`
Reload the current page with optional cache control.

**Parameters:**
- `ignoreCache` (boolean, optional): Hard refresh ignoring cache (default: false)
- `timeout` (number, optional): Timeout in milliseconds (default: 30000)
- `waitUntil` (string, optional): Wait condition (default: `"load"`)

#### `get_current_url`
Retrieve the current page URL.

**Parameters:** None

### 2. Visual Tools (2 tools)
Screenshot capture and viewport management.

#### `screenshot`
Capture page screenshots with quality control.

**Parameters:**
- `fullPage` (boolean, optional): Capture full scrollable page (default: true)
- `quality` (number, optional): JPEG quality 0-100 (PNG ignores this)

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

#### `get_viewport_info`
Get current viewport dimensions and device pixel ratio.

**Parameters:** None

**Returns:**
```json
{
  "width": 1280,
  "height": 720,
  "devicePixelRatio": 2.0
}
```

### 3. DOM Analysis Tools (2 tools)
HTML content extraction and page metadata.

#### `get_dom`
Extract HTML content with optional CSS selector filtering.

**Parameters:**
- `selector` (string, optional): CSS selector to filter content

#### `get_page_title`
Get the current page title.

**Parameters:** None

### 4. Interaction Tools (7 tools)
User interaction simulation and element manipulation.

#### `click_element`
Click elements using CSS selectors.

**Parameters:**
- `selector` (string, required): CSS selector for target element
- `timeout` (number, optional): Operation timeout in milliseconds (default: 30000)

#### `type_text`
Type text into input elements with realistic timing.

**Parameters:**
- `selector` (string, required): CSS selector for input element
- `text` (string, required): Text to type
- `delay` (number, optional): Keystroke delay in milliseconds (default: 0)
- `clear` (boolean, optional): Clear existing text first (default: true)
- `timeout` (number, optional): Operation timeout (default: 30000)

#### `hover_element`
Trigger hover effects on elements.

**Parameters:**
- `selector` (string, required): CSS selector for target element
- `timeout` (number, optional): Operation timeout (default: 30000)
- `force` (boolean, optional): Bypass actionability checks (default: false)

#### `scroll_page`
Scroll page or specific elements.

**Parameters:**
- `direction` (string, optional): `"up"`, `"down"`, `"left"`, `"right"` (default: `"down"`)
- `amount` (number, optional): Scroll distance in pixels (default: 500)
- `selector` (string, optional): Element selector to scroll (defaults to page)

#### `press_key`
Press keyboard keys and key combinations.

**Parameters:**
- `key` (string, required): Key to press (e.g., `"Enter"`, `"Tab"`, `"Control+a"`)
- `selector` (string, optional): Element to focus before key press
- `timeout` (number, optional): Operation timeout (default: 30000)

#### `wait_for_element`
Wait for element state changes.

**Parameters:**
- `selector` (string, required): CSS selector for target element
- `state` (string, optional): `"visible"`, `"hidden"`, `"attached"`, `"detached"` (default: `"visible"`)
- `timeout` (number, optional): Wait timeout (default: 30000)

#### `wait_for_navigation`
Wait for page navigation completion.

**Parameters:**
- `url` (string, optional): URL pattern to wait for
- `timeout` (number, optional): Wait timeout (default: 30000)
- `waitUntil` (string, optional): Wait condition (default: `"load"`)

### 5. JavaScript Execution Tools (3 tools)
Custom JavaScript execution and element analysis.

#### `evaluate_js`
Execute JavaScript code in page context.

**Parameters:**
- `code` (string, required): JavaScript code to execute
- `timeout` (number, optional): Execution timeout (default: 30000)

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
Execute JavaScript on specific elements.

**Parameters:**
- `selector` (string, required): CSS selector for target element
- `code` (string, required): JavaScript code (element available as `element` variable)
- `timeout` (number, optional): Execution timeout (default: 30000)

#### `get_element_info`
Get comprehensive element information.

**Parameters:**
- `selector` (string, required): CSS selector for target element
- `timeout` (number, optional): Operation timeout (default: 30000)

### 6. Console & Network Monitoring Tools (4 tools)
Real-time console and network activity monitoring.

#### `get_console_logs`
Capture console messages with filtering.

**Parameters:**
- `level` (string, optional): Filter by level - `"all"`, `"log"`, `"warn"`, `"error"`, `"debug"`
- `limit` (number, optional): Maximum number of logs to return

#### `clear_console_logs`
Clear console log buffer.

**Parameters:** None

#### `get_network_logs`
Monitor network requests and responses.

**Parameters:**
- `method` (string, optional): Filter by HTTP method
- `status` (number, optional): Filter by status code
- `url_pattern` (string, optional): Filter by URL pattern
- `limit` (number, optional): Maximum logs to return

#### `clear_network_logs`
Clear network monitoring buffer.

**Parameters:** None

### 7. Configuration Tools (3 tools)
Browser configuration and environment setup.

#### `set_viewport_size`
Configure browser viewport dimensions.

**Parameters:**
- `width` (number, required): Viewport width in pixels
- `height` (number, required): Viewport height in pixels

#### `set_user_agent`
Configure browser user agent string.

**Parameters:**
- `userAgent` (string, required): User agent string to set

#### `set_geolocation`
Configure browser geolocation.

**Parameters:**
- `latitude` (number, required): Latitude coordinate
- `longitude` (number, required): Longitude coordinate
- `accuracy` (number, optional): Location accuracy in meters

### 8. Browser Management Tools (4 tools)
Browser lifecycle and engine management.

#### `close_browser`
Gracefully close browser and cleanup resources.

**Parameters:** None

#### `switch_browser`
Switch between browser engines dynamically.

**Parameters:**
- `engine` (string, required): `"chromium"`, `"firefox"`, `"webkit"`
- `headless` (boolean, optional): Run in headless mode

#### `get_browser_info`
Get current browser engine information.

**Parameters:** None

#### `list_available_browsers`
List all available browser engines.

**Parameters:** None

### 9. Advanced Debugging Tools (4 tools)
Enterprise debugging and performance analysis.

#### `highlight_element`
Visually highlight elements for debugging.

**Parameters:**
- `selector` (string, required): CSS selector for element to highlight
- `style` (object, optional): Highlight style configuration
- `duration` (number, optional): Highlight duration in milliseconds
- `tooltip` (string, optional): Tooltip text to display

#### `trace_execution`
Enable step-by-step execution tracing.

**Parameters:**
- `action` (string, required): `"start"`, `"stop"`, `"get_trace"`
- `options` (object, optional): Tracing configuration options

#### `capture_performance_timeline`
Capture browser performance timeline data.

**Parameters:**
- `action` (string, required): `"start"`, `"stop"`, `"get_metrics"`
- `metrics` (array, optional): Specific metrics to capture

#### `debug_mode`
Enable/disable comprehensive debugging mode.

**Parameters:**
- `action` (string, required): `"enable"`, `"disable"`, `"status"`
- `features` (array, optional): Specific debug features to control

### 10. Security & Validation Tools (3 tools)
Security scanning and validation capabilities.

#### `handle_csp`
Configure Content Security Policy handling.

**Parameters:**
- `action` (string, required): `"bypass"`, `"enforce"`, `"report"`
- `policies` (array, optional): CSP policies to manage

#### `manage_certificates`
Certificate validation and management.

**Parameters:**
- `action` (string, required): `"validate"`, `"bypass"`, `"get_info"`
- `options` (object, optional): Certificate handling options

#### `validate_security`
Comprehensive security validation.

**Parameters:**
- `checks` (array, optional): Specific security checks to perform
- `reportLevel` (string, optional): `"basic"`, `"detailed"`, `"comprehensive"`

### 11. Advanced Monitoring & Analytics Tools (4 tools)
Usage tracking and performance monitoring.

#### `usage_analytics`
Track and report browser automation usage patterns.

**Parameters:**
- `action` (string, required): `"start"`, `"stop"`, `"get_report"`
- `config` (object, optional): Analytics configuration

#### `error_tracking`
Advanced error tracking and alerting.

**Parameters:**
- `action` (string, required): `"start"`, `"stop"`, `"get_errors"`, `"clear"`
- `config` (object, optional): Error tracking configuration

#### `performance_monitoring`
Real-time performance monitoring.

**Parameters:**
- `action` (string, required): `"start"`, `"stop"`, `"get_metrics"`
- `metrics` (array, optional): Performance metrics to monitor

#### `session_analytics`
Session-based analytics and user journey tracking.

**Parameters:**
- `action` (string, required): `"start"`, `"end"`, `"get_data"`, `"analyze"`
- `config` (object, optional): Session tracking configuration

### 12. Visual Testing & Comparison Tools (5 tools)
Advanced visual testing and regression analysis.

#### `screenshot_compare`
Advanced screenshot comparison with diff generation.

**Parameters:**
- `action` (string, required): `"capture_baseline"`, `"compare"`, `"update_baseline"`
- `name` (string, required): Screenshot name/identifier
- `threshold` (number, optional): Comparison threshold percentage

#### `visual_regression_testing`
Automated visual regression testing framework.

**Parameters:**
- `action` (string, required): `"initialize"`, `"run_tests"`, `"get_results"`
- `config` (object, optional): Test configuration options

#### `cross_browser_visual_validation`
Visual consistency validation across browser engines.

**Parameters:**
- `action` (string, required): `"run_comparison"`, `"get_report"`
- `engines` (array, optional): Browser engines to compare

#### `element_screenshot_compare`
Element-specific visual testing.

**Parameters:**
- `selector` (string, required): CSS selector for target element
- `action` (string, required): `"capture"`, `"compare"`
- `name` (string, required): Element screenshot identifier

#### `visual_test_reporting`
Comprehensive visual test reporting.

**Parameters:**
- `action` (string, required): `"generate_report"`, `"get_gallery"`
- `format` (string, optional): Report format - `"html"`, `"json"`, `"pdf"`

### 13. Testing Framework Integration Tools (4 tools)
Integration with popular testing frameworks.

#### `playwright_test_adapter`
Integration adapter for Playwright Test runner.

**Parameters:**
- `action` (string, required): `"initialize"`, `"configure"`, `"run_test"`, `"get_results"`, `"cleanup"`
- `config` (object, optional): Playwright Test configuration
- `testPath` (string, optional): Specific test file or pattern
- `outputDir` (string, optional): Output directory for reports

**Example:**
```json
{
  "name": "playwright_test_adapter",
  "arguments": {
    "action": "configure",
    "config": {
      "testDir": "./tests",
      "workers": 2,
      "retries": 1,
      "projects": [
        {"name": "chromium", "browser": "chromium"},
        {"name": "firefox", "browser": "firefox"}
      ]
    }
  }
}
```

#### `jest_adapter`
Integration adapter for Jest testing framework.

**Parameters:**
- `action` (string, required): `"initialize"`, `"configure"`, `"run_test"`, `"get_results"`, `"watch"`
- `config` (object, optional): Jest configuration options
- `testPath` (string, optional): Test file or pattern
- `watchMode` (boolean, optional): Enable watch mode

#### `mocha_adapter`
Integration adapter for Mocha testing framework.

**Parameters:**
- `action` (string, required): `"initialize"`, `"configure"`, `"run_test"`, `"get_results"`, `"watch"`
- `config` (object, optional): Mocha configuration options
- `testPath` (string, optional): Test specification
- `watch` (boolean, optional): Enable watch mode

#### `test_reporter`
Advanced test reporting and result aggregation.

**Parameters:**
- `action` (string, required): `"generate_report"`, `"aggregate_results"`, `"export_data"`, `"get_analytics"`, `"compare_runs"`
- `sources` (array, optional): Test result sources to aggregate
- `outputFormat` (string, optional): Report format - `"html"`, `"json"`, `"pdf"`, `"xml"`, `"csv"`
- `analytics` (object, optional): Analytics configuration
- `compareWith` (string, optional): Previous results for comparison

## Response Format

All tools return responses in the following format:

```json
{
  "success": true|false,
  "data": {
    // Tool-specific response data
  },
  "error": {
    "type": "ERROR_TYPE",
    "message": "Error description",
    "details": {}
  }
}
```

## Error Types

- `BROWSER_NOT_INITIALIZED`: Browser not started
- `BROWSER_NOT_SUPPORTED`: Unsupported browser engine
- `PAGE_NOT_LOADED`: No page currently loaded
- `ELEMENT_NOT_FOUND`: CSS selector matched no elements
- `NAVIGATION_FAILED`: Page navigation unsuccessful
- `TIMEOUT_ERROR`: Operation exceeded timeout
- `JAVASCRIPT_ERROR`: JavaScript execution failed
- `NETWORK_ERROR`: Network request failed
- `INVALID_URL`: URL format invalid
- `INVALID_SELECTOR`: CSS selector syntax invalid
- `FILE_OPERATION_ERROR`: File system operation failed

## Best Practices

### 1. Error Handling
Always check the `success` field in responses and handle errors appropriately.

### 2. Timeouts
Set appropriate timeouts for operations based on expected page load times and network conditions.

### 3. Element Waiting
Use `wait_for_element` before interacting with dynamic content.

### 4. Resource Management
Call `close_browser` when finished to clean up resources.

### 5. Performance
- Use `networkidle` wait condition for SPAs
- Implement proper retry logic for flaky operations
- Monitor console and network logs for debugging

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

For technical support and advanced configuration options, refer to the troubleshooting guide and enterprise deployment documentation.