# InSite - Enterprise Browser Automation Platform

A comprehensive Model Context Protocol (MCP) server implementation providing 50 operational tools across 13 categories for enterprise-grade browser automation using Playwright.

## Overview

InSite is an enterprise-ready browser automation platform with advanced capabilities including multi-browser support, real-time monitoring, security validation, visual testing, and testing framework integration. Built with TypeScript and Playwright, it provides reliable cross-platform browser automation for enterprise environments.

## 🎉 Enterprise Platform Complete

**Version**: 1.2.0  
**Status**: Production Ready  
**Tools**: 50 operational tools  
**Categories**: 13 comprehensive categories  

### Key Achievements

✅ **Complete Development Cycle** - 5 phases delivered  
✅ **50 Operational Tools** - Full enterprise automation suite  
✅ **Multi-Browser Support** - Chromium, Firefox, WebKit engines  
✅ **Advanced Enterprise Features** - Debugging, security, monitoring, visual testing  
✅ **Testing Framework Integration** - Playwright Test, Jest, Mocha adapters  
✅ **Production Validation** - 100% success rate on all tools  

## Features

### 13 Tool Categories (50 Total Tools)

#### Core Automation (20 tools)
- **Navigation Tools (5)**: Page loading, history management, URL handling
- **Visual Tools (2)**: Screenshot capture, viewport management  
- **DOM Analysis (2)**: Content extraction, title retrieval
- **Interaction Tools (7)**: Clicking, typing, hovering, scrolling, key presses, element waiting
- **JavaScript Execution (3)**: Code execution, element analysis
- **Browser Management (1)**: Resource cleanup and lifecycle management

#### Platform Features (10 tools)
- **Console & Network Monitoring (4)**: Real-time message capture, network tracking
- **Configuration Tools (3)**: Viewport, user agent, geolocation setup
- **Browser Engine Management (3)**: Multi-engine support, dynamic switching

#### Enterprise Features (20 tools)
- **Advanced Debugging (4)**: Element highlighting, execution tracing, performance capture, debug mode
- **Security & Validation (3)**: CSP handling, certificate management, security scanning
- **Advanced Monitoring & Analytics (4)**: Usage tracking, error monitoring, performance analysis, session analytics
- **Visual Testing & Comparison (5)**: Screenshot comparison, regression testing, cross-browser validation
- **Testing Framework Integration (4)**: Playwright Test, Jest, Mocha adapters, advanced reporting

### Enterprise Capabilities

🔧 **Multi-Browser Engine Support** - Dynamic switching between Chromium, Firefox, WebKit  
🔒 **Security & Validation** - CSP handling, certificate management, vulnerability scanning  
📊 **Advanced Analytics** - Real-time monitoring, performance analysis, usage tracking  
🧪 **Visual Testing Framework** - Screenshot comparison, regression testing, cross-browser validation  
🔗 **Testing Integration** - Seamless integration with popular testing frameworks  
⚡ **Performance Monitoring** - Web Vitals tracking, timeline capture, optimization analysis  

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/insite.git
cd insite

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Build the project
npm run build

# Start the MCP server
npm start
```

### Validation

```bash
# Verify all 50 tools are operational
node test-phase5b-complete.js
```

You should see "🎉 PHASE 5B ENTERPRISE PLATFORM COMPLETE!" confirming all tools are working.

## Usage

### MCP Client Integration

Configure InSite as an MCP server:

```json
{
  "mcpServers": {
    "insite": {
      "command": "node",
      "args": ["/path/to/insite/dist/server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Basic Examples

**Load and screenshot a webpage:**
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

**Advanced form automation:**
```json
[
  {
    "name": "load_page",
    "arguments": {"url": "https://example.com/login"}
  },
  {
    "name": "type_text",
    "arguments": {"selector": "#username", "text": "testuser"}
  },
  {
    "name": "type_text", 
    "arguments": {"selector": "#password", "text": "password123"}
  },
  {
    "name": "click_element",
    "arguments": {"selector": "#login-button"}
  }
]
```

**Enterprise monitoring and testing:**
```json
[
  {
    "name": "performance_monitoring",
    "arguments": {
      "action": "start_monitoring",
      "metrics": ["pageLoadTime", "firstContentfulPaint"]
    }
  },
  {
    "name": "visual_regression_testing",
    "arguments": {
      "action": "run_tests", 
      "config": {"threshold": 0.1}
    }
  },
  {
    "name": "playwright_test_adapter",
    "arguments": {
      "action": "run_test",
      "testPath": "./e2e/critical-flow.spec.js"
    }
  }
]
```

## Configuration

### Environment Variables

```bash
# Browser Configuration
INSITE_HEADLESS=false                    # Run browsers visibly
INSITE_BROWSER_ENGINE=chromium           # Default engine
INSITE_VIEWPORT_WIDTH=1920               # Viewport width
INSITE_VIEWPORT_HEIGHT=1080              # Viewport height
INSITE_TIMEOUT=60000                     # Default timeout (ms)

# Enterprise Features
INSITE_DEBUG_MODE=true                   # Enable debug features
INSITE_PERFORMANCE_MONITORING=true       # Enable performance tracking
INSITE_SECURITY_VALIDATION=true          # Enable security scanning
```

## Documentation

📚 **[Complete Documentation Site](docs/index.html)** - Comprehensive documentation with examples  
🔧 **[API Reference](docs/api-reference.html)** - All 50 tools with parameters and examples  
🚀 **[Getting Started Guide](docs/getting-started.html)** - Setup and first steps  
📖 **[Examples](docs/examples.html)** - Real-world automation patterns  
🏗️ **[Deployment Guide](docs/deployment.html)** - Enterprise deployment instructions  

## Architecture

### Project Structure

```
insite/
├── src/
│   ├── browser-manager.ts      # Singleton browser lifecycle (3200+ lines)
│   ├── server.ts               # MCP server with 50 tool handlers (2200+ lines)
│   ├── types.ts                # TypeScript definitions and error types
│   ├── tools/                  # 50 tool definitions across 13 categories
│   │   ├── index.ts            # Tool registration and exports
│   │   ├── debugging-tools.ts   # Advanced debugging capabilities
│   │   ├── security-tools.ts    # Security validation and CSP management
│   │   ├── monitoring-tools.ts  # Analytics and performance monitoring
│   │   ├── visual-testing-tools.ts # Visual testing and comparison
│   │   ├── test-integration-tools.ts # Testing framework adapters
│   │   └── ...                 # Additional tool categories
│   └── utils/
│       └── error-utils.ts      # Comprehensive error handling
├── docs/                       # GitHub Pages documentation site
├── test-*.js                   # Validation and testing scripts
└── dist/                       # Compiled TypeScript output
```

### Core Components

1. **Browser Manager** - Singleton Playwright browser lifecycle with multi-engine support
2. **MCP Server** - Full MCP protocol implementation with 50 tool handlers
3. **Tool System** - Modular architecture with 13 categories of enterprise tools
4. **Error Handling** - Comprehensive error types and recovery mechanisms
5. **Enterprise Features** - Advanced debugging, security, monitoring, and testing capabilities

## Testing & Validation

### Test Suites

```bash
# Core functionality validation
node test-mvp-complete.js           # 8 core tools
node test-advanced-interactions.js  # Advanced interaction workflows
node test-navigation-tools.js       # Browser history and navigation
node test-javascript-tools.js       # JavaScript execution capabilities
node test-console-network-tools.js  # Monitoring and logging
node test-configuration-tools.js    # Browser configuration
node test-browser-engines.js        # Multi-browser engine support

# Enterprise features validation
node test-phase5b-complete.js       # All 50 tools operational test
```

### Quality Assurance

✅ **100% TypeScript Coverage** - Strict type checking throughout  
✅ **Comprehensive Error Handling** - All error scenarios covered  
✅ **Cross-Platform Testing** - Windows, macOS, Linux validated  
✅ **Multi-Browser Validation** - All engines tested and operational  
✅ **Real-World Testing** - Popular websites and complex scenarios  
✅ **Enterprise Feature Testing** - All advanced capabilities validated  

## Performance & Scalability

- **Memory Efficient** - Singleton browser management with proper cleanup
- **Concurrent Operations** - Safe parallel tool execution where appropriate  
- **Timeout Management** - Configurable timeouts with proper error handling
- **Resource Monitoring** - Built-in performance tracking and optimization
- **Enterprise Scale** - Designed for high-volume production environments

## Security

🔒 **Security-First Design**:
- CSP handling and bypass capabilities
- SSL certificate validation and management
- Comprehensive security scanning with recommendations
- Safe JavaScript execution with timeout protection
- Vulnerability detection and reporting

## Enterprise Support

- **Production Deployment** - Docker containerization and orchestration guides
- **Monitoring Integration** - Built-in analytics and performance tracking
- **Testing Framework Integration** - Seamless integration with existing test suites
- **Security Compliance** - Enterprise-grade security validation and reporting
- **24/7 Operations** - Robust error handling and recovery mechanisms

## Contributing

1. Follow TypeScript strict mode requirements
2. Add comprehensive error handling for all new tools
3. Include validation tests for new functionality  
4. Update tool schemas and documentation
5. Maintain MCP protocol compliance
6. Ensure enterprise-grade security and performance

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.2.0 - Enterprise Platform Complete (Current)
- ✅ 50 operational tools across 13 categories
- ✅ Complete testing framework integration
- ✅ Advanced debugging, security, monitoring, visual testing
- ✅ Production-ready with comprehensive documentation

### Previous Versions
- **v1.1.0** - Advanced Platform (30 tools, multi-browser support)
- **v1.0.0** - Platform Foundation (20 tools, core automation)
- **v0.2.0** - MVP Complete (8 essential tools)
- **v0.1.0** - Initial Implementation

---

**InSite** - Enterprise Browser Automation Platform  
*50 tools • 13 categories • 100% enterprise ready*