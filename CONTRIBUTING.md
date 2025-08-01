# Contributing to InSite

Guidelines for contributing to this MCP server implementation for browser automation.

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Getting Started

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/jowharshamshiri/insite.git
   cd insite
   ```

3. Install dependencies:

   ```bash
   npm run install:full
   ```

4. Verify the build works:

   ```bash
   npm run test:quick
   ```

## Development Workflow

### Code Organization

- **src/browser-manager.ts** - Browser lifecycle management using Playwright
- **src/server.ts** - MCP server implementation and tool handlers
- **src/tools/** - Tool definitions organized by category
- **src/types.ts** - TypeScript definitions and error types
- **src/utils/** - Utility functions and error handling

### Testing

Test suite is organized into three categories:

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit      # Individual tool testing
npm run test:integration  # Feature integration testing
npm run test:e2e       # End-to-end workflow testing

# Quick validation
npm run test:quick     # 8 core tools
npm run test:enterprise  # All 50 tools
```

### Code Quality

Before submitting changes:

```bash
# Build the project
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

## Contributing Guidelines

### Adding New Tools

1. **Tool Definition**: Add tool schema to appropriate file in `src/tools/`
2. **Implementation**: Add handler logic to `src/browser-manager.ts`
3. **Registration**: Export tool from `src/tools/index.ts`
4. **Testing**: Add tests covering success and error cases
5. **Documentation**: Update tool documentation

### Tool Categories

- **Page Control** - Page loading, navigation, history management
- **Element Interaction** - Clicking, typing, hovering, scrolling, key presses
- **Content Extraction** - DOM analysis, element information, page content
- **JavaScript Execution** - Code execution, element analysis, dynamic content
- **Synchronization** - Wait conditions, navigation timing, element readiness
- **Console & Network** - Message capture, request/response monitoring
- **Browser Configuration** - Viewport, user agent, geolocation settings
- **Multi-Browser** - Engine switching, cross-browser automation
- **Debugging** - Element highlighting, execution tracing, performance capture
- **Security** - CSP handling, certificate management, security validation
- **Monitoring** - Usage analytics, error tracking, performance monitoring
- **Visual Testing** - Screenshot comparison, regression testing, visual validation
- **Test Integration** - Playwright, Jest, Mocha adapters, test reporting

### Code Standards

#### TypeScript

- Use strict TypeScript mode
- Provide type definitions
- Handle error scenarios with proper error types

#### Error Handling

- Use custom error types from `src/types.ts`
- Provide error messages with context
- Include error recovery suggestions where applicable

#### Performance

- Implement resource cleanup
- Use timeout protection for operations
- Consider memory efficiency in browser operations

#### Security

- Never log sensitive information
- Validate user inputs
- Follow security practices for browser automation

### Pull Request Process

1. **Fork and Branch**: Create a feature branch from `main`
2. **Develop**: Implement changes following the guidelines above
3. **Test**: Ensure all tests pass and add new tests for changes
4. **Quality**: Run build, lint, and format checks
5. **Document**: Update documentation as needed
6. **Pull Request**: Submit PR with clear description and testing evidence

### PR Requirements

- [ ] All tests pass (`npm test`)
- [ ] Code builds successfully (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] New functionality includes tests
- [ ] Documentation is updated
- [ ] Changes follow TypeScript strict mode
- [ ] Error handling is implemented

### Testing New Features

When adding new tools or features:

1. **Unit Tests**: Test individual tool functionality
2. **Integration Tests**: Test tool interaction with browser
3. **End-to-End Tests**: Test real-world usage scenarios
4. **Error Cases**: Test error conditions and edge cases
5. **Cross-Browser**: Verify compatibility across Chromium, Firefox, WebKit

### Documentation Updates

- Update tool schemas and parameter descriptions
- Add usage examples for new functionality
- Update API reference documentation
- Include troubleshooting information

## Project Architecture

### MCP Protocol Compliance

InSite implements the Model Context Protocol (MCP) specification:

- Tool registration and discovery
- Request/response handling
- Error reporting
- Capability negotiation

### Browser Management

- Singleton browser lifecycle management
- Multi-engine support (Chromium, Firefox, WebKit)
- Resource cleanup and memory management
- Concurrent operation safety

### Features

- Debugging capabilities
- Security validation and CSP handling
- Performance monitoring and analytics
- Visual testing and regression detection
- Testing framework integration

## Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check the [complete documentation](docs/index.html)

## License

By contributing to InSite, you agree that your contributions will be licensed under the MIT License.