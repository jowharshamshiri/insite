# Changelog

All notable changes to InSite will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0]

### Added

- 16 new tools for debugging, security, monitoring, and visual testing
- Debugging tools (4): highlight_element, trace_execution, capture_performance_timeline, debug_mode
- Security and validation tools (3): handle_csp, manage_certificates, validate_security
- Monitoring and analytics tools (4): usage_analytics, error_tracking, performance_monitoring, session_analytics
- Visual testing tools (5): screenshot_compare, visual_regression_testing, cross_browser_visual_validation, element_screenshot_compare, visual_test_reporting
- Testing framework adapters (4): playwright_test_adapter, jest_adapter, mocha_adapter, test_reporter
- Test suite structure with unit/integration/e2e directories
- npm scripts for testing and development
- Setup script (`npm run install:full`)
- Claude Code configuration documentation

### Changed

- Rebranded from "Browser MCP" to "InSite"
- Server class renamed from BrowserMCPServer to InSiteServer
- Server name changed from 'browser-mcp-server' to 'insite-server'
- Moved internal documentation to `internal/` directory
- Restructured test files into `tests/` directory
- Updated README with new project structure

### Fixed

- TypeScript compilation issues
- Tool implementation validation

### Removed

- Standalone `mcp-config.json` file

## [1.1.0]

### Added

- Multi-browser engine support tools (3): switch_browser, get_browser_info, list_available_browsers
- Browser engine switching (Chromium, Firefox, WebKit)
- Cross-browser testing capabilities
- Browser configuration options

### Changed

- Console and network monitoring with filtering
- Browser configuration management
- Error handling and recovery mechanisms
- Performance optimizations

## [1.0.0]

### Added

- Console and network monitoring tools (4): get_console_logs, clear_console_logs, get_network_logs, clear_network_logs
- Configuration tools (3): set_viewport_size, set_user_agent, set_geolocation, close_browser
- Real-time console message capture
- Network request/response tracking
- Browser configuration capabilities

### Changed

- Browser lifecycle management with cleanup
- Memory usage optimization
- TypeScript type definitions
- Error handling implementation

## [0.2.0] - 2025-07-29

### Added

- Interaction tools (6): hover_element, scroll_page, press_key, wait_for_element, wait_for_navigation, get_element_info
- JavaScript execution tools (3): evaluate_js, evaluate_js_on_element, element analysis
- Navigation tools (3): go_back, go_forward, reload_page, get_current_url
- Element interaction capabilities
- JavaScript execution with timeout protection
- Browser history management
- Wait and synchronization functions

### Changed

- Element selection and interaction reliability
- Error handling with context
- Performance optimizations

## [0.1.0]

### Added

- Core automation tools (8): load_page, screenshot, get_dom, get_page_title, click_element, type_text, get_viewport_info, close_browser
- MCP server implementation
- Playwright browser automation integration
- TypeScript implementation
- Error handling and validation
- Browser lifecycle management
- Page loading with wait conditions
- Screenshot capture with options
- DOM content extraction
- Element interaction (clicking, typing)
- Viewport management
- Resource cleanup

---

## Version History Summary

- v1.2.0 - 50 tools with debugging, security, monitoring, visual testing
- v1.1.0 - 33 tools with multi-browser support
- v1.0.0 - 30 tools with monitoring and configuration
- v0.2.0 - 20 tools with interactions and JavaScript
- v0.1.0 - 8 core automation tools

## Development Phases

### Phase 1: Foundation (v0.1.0)
Browser automation with 8 tools

### Phase 2: Interactions (v0.2.0)
User interactions and element manipulation

### Phase 3: Navigation & JavaScript (v0.2.0)
Browser control and JavaScript execution

### Phase 4: Monitoring & Configuration (v1.0.0)
Console/network monitoring and browser configuration

### Phase 5A: Multi-Browser Support (v1.1.0)
Cross-browser engine capabilities

### Phase 5B: Features (v1.2.0)
Debugging, security, monitoring, visual testing, testing framework integration

## Project Statistics

- Total Tools: 50
- Tool Categories: 13
- Browser Engines: 3 (Chromium, Firefox, WebKit)
- Code Lines: 5000+ TypeScript
- Platform Support: Windows, macOS, Linux
