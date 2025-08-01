# InSite - Browser Automation MCP Server

A Model Context Protocol (MCP) server implementation that provides browser automation tools using Playwright. Contains 50 tools organized into 13 categories.

## Overview

InSite is an MCP server that wraps Playwright browser automation functionality. It supports multiple browser engines (Chromium, Firefox, WebKit) and provides tools for page navigation, DOM interaction, JavaScript execution, and monitoring.

## Tools

### Page Control (6 tools)
- **load_page**: Navigate to a URL with configurable wait conditions
- **go_back**: Navigate to previous page in browser history
- **go_forward**: Navigate to next page in browser history
- **reload_page**: Refresh current page with optional cache bypass
- **get_current_url**: Retrieve current page URL
- **close_browser**: Clean up browser instance and resources

### Element Interaction (5 tools)
- **click_element**: Click on page elements using various selectors
- **type_text**: Input text into form fields and elements
- **hover_element**: Trigger hover state on elements
- **scroll_page**: Scroll page content in specified directions
- **press_key**: Send keyboard input and key combinations

### Content Extraction (4 tools)
- **get_dom**: Extract HTML content from current page
- **get_page_title**: Retrieve current page title
- **screenshot**: Capture full page or element screenshots
- **get_viewport_info**: Get current viewport dimensions and settings

### JavaScript Execution (3 tools)
- **evaluate_js**: Execute JavaScript code in page context
- **evaluate_js_on_element**: Run JavaScript on specific elements
- **get_element_info**: Extract element properties and attributes

### Synchronization (2 tools)
- **wait_for_element**: Wait for elements to appear or meet conditions
- **wait_for_navigation**: Wait for page navigation to complete

### Console & Network (4 tools)
- **get_console_logs**: Capture browser console messages with filtering
- **clear_console_logs**: Clear console log history
- **get_network_logs**: Monitor network requests and responses
- **clear_network_logs**: Clear network monitoring history

### Browser Configuration (3 tools)
- **set_viewport_size**: Configure browser window dimensions
- **set_user_agent**: Set custom user agent strings
- **set_geolocation**: Configure location permissions and coordinates

### Multi-Browser (3 tools)
- **switch_browser**: Change between Chromium, Firefox, and WebKit engines
- **get_browser_info**: Retrieve current browser engine information
- **list_available_browsers**: List all supported browser engines

### Debugging (4 tools)
- **highlight_element**: Visually highlight elements on page
- **trace_execution**: Record execution traces for debugging
- **capture_performance_timeline**: Capture detailed performance metrics
- **debug_mode**: Toggle advanced debugging features

### Security (3 tools)
- **handle_csp**: Manage Content Security Policy restrictions
- **manage_certificates**: Handle SSL certificate validation
- **validate_security**: Perform security checks on pages

### Monitoring (4 tools)
- **usage_analytics**: Track tool usage and performance statistics
- **error_tracking**: Monitor and log automation errors
- **performance_monitoring**: Real-time performance metric collection
- **session_analytics**: Analyze automation session data

### Visual Testing (5 tools)
- **screenshot_compare**: Compare screenshots for visual differences
- **visual_regression_testing**: Automated visual regression detection
- **cross_browser_visual_validation**: Validate visual consistency across browsers
- **element_screenshot_compare**: Compare specific element screenshots
- **visual_test_reporting**: Generate visual testing reports

### Test Integration (4 tools)
- **playwright_test_adapter**: Integration with Playwright Test framework
- **jest_adapter**: Jest testing framework integration
- **mocha_adapter**: Mocha testing framework integration
- **test_reporter**: Aggregated test result reporting

## Installation

### Quick Start with npx

```bash
# Run directly without installation
npx insite-mcp
```

### Global Installation

```bash
# Install globally 
npm install -g insite-mcp

# Run directly
insite-mcp
```

### Development Setup

```bash
git clone https://github.com/jowharshamshiri/insite.git
cd insite
npm run install:full
npm start
```

### Validation

```bash
# Test core functionality
npm run test:quick

# Test all tools
npm run test:comprehensive

# Run complete test suite
npm test
```

## Usage

### MCP Client Configuration

#### Using npx (Recommended)

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

#### Using global installation

```json
{
  "mcpServers": {
    "insite": {
      "command": "insite-mcp"
    }
  }
}
```

#### Using local development setup

```json
{
  "mcpServers": {
    "insite": {
      "command": "node",
      "args": ["/path/to/insite/dist/server.js"],
      "cwd": "/path/to/insite",
      "env": {
        "HEADLESS": "true",
        "VIEWPORT_WIDTH": "1280",
        "VIEWPORT_HEIGHT": "720",
        "TIMEOUT": "30000"
      }
    }
  }
}
```

### Basic Example

Load a page and take a screenshot:

```json
[
  {
    "name": "load_page",
    "arguments": {
      "url": "https://example.com",
      "waitUntil": "networkidle"
    }
  },
  {
    "name": "screenshot",
    "arguments": {
      "fullPage": true,
      "quality": 90
    }
  }
]
```

### Advanced Screenshot Examples

Scroll to a specific element and capture it:

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

Capture the entire scrollable page height:

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

## Configuration

### Environment Variables

```bash
INSITE_HEADLESS=false                    # Show browser window
INSITE_BROWSER_ENGINE=chromium           # Default browser engine
INSITE_VIEWPORT_WIDTH=1920               # Viewport width
INSITE_VIEWPORT_HEIGHT=1080              # Viewport height
INSITE_TIMEOUT=60000                     # Default timeout (ms)
INSITE_DEBUG_MODE=true                   # Enable debug features
INSITE_PERFORMANCE_MONITORING=true       # Enable performance tracking
INSITE_SECURITY_VALIDATION=true          # Enable security checks
```

## Architecture

### Project Structure

```
insite/
├── src/
│   ├── browser-manager.ts      # Browser lifecycle management
│   ├── server.ts               # MCP server implementation
│   ├── types.ts                # TypeScript definitions
│   ├── tools/                  # Tool definitions by category
│   └── utils/                  # Utility functions
├── tests/                      # Test suite
│   ├── unit/                   # Tool-specific tests
│   ├── integration/            # Feature tests
│   └── e2e/                    # Workflow tests
└── dist/                       # Compiled output
```

### Components

1. **Browser Manager** - Manages Playwright browser instances and lifecycle
2. **MCP Server** - Handles MCP protocol communication and tool routing
3. **Tool System** - Individual tool implementations organized by category
4. **Error Handling** - Error types and recovery mechanisms

## Testing

```bash
# Individual tool testing
npm run test:unit

# Feature integration testing
npm run test:integration  

# End-to-end workflow testing
npm run test:e2e

# Quick validation (8 core tools)
npm run test:quick

# All 52 tools
npm run test:comprehensive
```

## Documentation

### API Reference

Complete tool documentation with parameters, examples, and usage patterns:

- **[API Reference](./API-REFERENCE.md)** - Complete API documentation
- **[Interactive Docs](./docs/api-reference.html)** - Web-based API reference

### Advanced Screenshot Tools

- **scroll_to_element_and_screenshot**: Auto-scroll to element and capture screenshot
- **capture_full_scrollable_page**: Capture entire page height in one image

Both support PNG/JPEG formats with quality control and timeout handling.

## Browser Support

- Chromium (default)
- Firefox
- WebKit (Safari engine)

Dynamic switching between engines is supported during runtime.

## Limitations

- Requires Playwright browser binaries to be installed
- Some tools may not work identically across all browser engines
- Performance varies based on system resources and browser engine
- Network monitoring has engine-specific differences

## Contributing

1. Use TypeScript strict mode
2. Add error handling for new tools
3. Include tests for new functionality  
4. Update tool schemas
5. Maintain MCP protocol compliance

## License

MIT License - see LICENSE file for details.