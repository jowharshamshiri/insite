#!/usr/bin/env node

/**
 * Comprehensive test suite for console and network monitoring tools
 * Tests the new console/network logging capabilities added to Browser MCP Server
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';

// Use promisified setTimeout
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Test configuration
 */
const TEST_CONFIG = {
    TIMEOUT: 30000,
    SERVER_STARTUP_DELAY: 2000,
    OPERATION_DELAY: 1000,
    TEST_URL: 'https://httpbin.org/html',
    CONSOLE_TEST_URL: 'https://httpbin.org/html',
    NETWORK_TEST_URL: 'https://httpbin.org/json'
};

/**
 * MCP client for testing
 */
class MCPTestClient {
    constructor() {
        this.process = null;
        this.messageId = 1;
    }

    async start() {
        console.log('Starting Browser MCP Server...');
        this.process = spawn('node', ['dist/server.js'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Handle server errors
        this.process.stderr.on('data', (data) => {
            const message = data.toString();
            if (!message.includes('Received SIGINT') && !message.includes('shutting down')) {
                console.error('Server error:', message);
            }
        });

        // Wait for server to start
        await sleep(TEST_CONFIG.SERVER_STARTUP_DELAY);
        console.log('✅ Server started successfully');
    }

    async sendMessage(method, params = {}) {
        const message = {
            jsonrpc: '2.0',
            id: this.messageId++,
            method,
            params
        };

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout waiting for response to ${method}`));
            }, TEST_CONFIG.TIMEOUT);

            const handleResponse = (data) => {
                try {
                    const lines = data.toString().split('\n').filter(line => line.trim());
                    for (const line of lines) {
                        try {
                            const response = JSON.parse(line);
                            if (response.id === message.id) {
                                clearTimeout(timeout);
                                this.process.stdout.removeListener('data', handleResponse);
                                resolve(response);
                                return;
                            }
                        } catch (e) {
                            // Ignore invalid JSON lines
                        }
                    }
                } catch (error) {
                    clearTimeout(timeout);
                    this.process.stdout.removeListener('data', handleResponse);
                    reject(error);
                }
            };

            this.process.stdout.on('data', handleResponse);
            this.process.stdin.write(JSON.stringify(message) + '\n');
        });
    }

    async callTool(name, args = {}) {
        const response = await this.sendMessage('tools/call', {
            name,
            arguments: args
        });

        if (response.error) {
            throw new Error(`Tool call failed: ${response.error.message}`);
        }

        const result = JSON.parse(response.result.content[0].text);
        if (!result.success) {
            throw new Error(`Tool execution failed: ${result.error?.message || 'Unknown error'}`);
        }

        return result;
    }

    async stop() {
        if (this.process) {
            console.log('Stopping server...');
            this.process.kill('SIGINT');
            await sleep(1000);
            if (!this.process.killed) {
                this.process.kill('SIGKILL');
            }
        }
    }
}

/**
 * Test suite for console and network monitoring tools
 */
class ConsoleNetworkTestSuite {
    constructor() {
        this.client = new MCPTestClient();
        this.passed = 0;
        this.failed = 0;
    }

    async runTest(name, testFn) {
        try {
            console.log(`\n🧪 ${name}`);
            await testFn();
            console.log(`✅ ${name} - PASSED`);
            this.passed++;
        } catch (error) {
            console.error(`❌ ${name} - FAILED: ${error.message}`);
            this.failed++;
        }
    }

    async testConsoleLogging() {
        // Navigate to a page and generate console output with JavaScript
        await this.client.callTool('load_page', { 
            url: TEST_CONFIG.CONSOLE_TEST_URL,
            waitUntil: 'domcontentloaded' 
        });
        
        // Generate console logs using JavaScript execution
        await this.client.callTool('evaluate_js', {
            code: `
                console.log("test log message");
                console.warn("test warning message");
                console.error("test error message");
            `
        });
        
        // Wait for console messages to be captured
        await sleep(TEST_CONFIG.OPERATION_DELAY);

        // Get all console logs
        const logsResult = await this.client.callTool('get_console_logs');
        
        if (!logsResult.data.logs || !Array.isArray(logsResult.data.logs)) {
            throw new Error('Console logs should be an array');
        }

        if (logsResult.data.logs.length === 0) {
            throw new Error('Expected console logs to be captured');
        }

        // Verify log structure
        const firstLog = logsResult.data.logs[0];
        if (!firstLog.timestamp || !firstLog.level || !firstLog.text) {
            throw new Error('Console log entries should have timestamp, level, and text');
        }

        console.log(`   📝 Captured ${logsResult.data.logs.length} console log entries`);
    }

    async testConsoleLogFiltering() {
        // Get error logs only
        const errorLogsResult = await this.client.callTool('get_console_logs', { level: 'error' });
        
        if (!Array.isArray(errorLogsResult.data.logs)) {
            throw new Error('Filtered console logs should be an array');
        }

        // All returned logs should be error level
        const nonErrorLogs = errorLogsResult.data.logs.filter(log => log.level !== 'error');
        if (nonErrorLogs.length > 0) {
            throw new Error('Level filtering should only return error logs');
        }

        console.log(`   🔍 Filtered to ${errorLogsResult.data.logs.length} error logs`);
    }

    async testConsoleLogLimit() {
        // Get limited number of logs
        const limitedLogsResult = await this.client.callTool('get_console_logs', { limit: 2 });
        
        if (limitedLogsResult.data.logs.length > 2) {
            throw new Error('Limit parameter should restrict number of logs returned');
        }

        console.log(`   📏 Limited to ${limitedLogsResult.data.logs.length} logs`);
    }

    async testClearConsoleLogs() {
        // Clear console logs
        await this.client.callTool('clear_console_logs');
        
        // Verify logs are cleared
        const logsAfterClear = await this.client.callTool('get_console_logs');
        
        if (logsAfterClear.data.logs.length !== 0) {
            throw new Error('Console logs should be empty after clearing');
        }

        console.log('   🗑️ Console logs cleared successfully');
    }

    async testNetworkLogging() {
        // Load a page that makes network requests
        await this.client.callTool('load_page', { 
            url: TEST_CONFIG.NETWORK_TEST_URL,
            waitUntil: 'networkidle' 
        });
        
        // Wait for network requests to be captured
        await sleep(TEST_CONFIG.OPERATION_DELAY);

        // Get network logs
        const networkResult = await this.client.callTool('get_network_logs');
        
        if (!networkResult.data.logs || !Array.isArray(networkResult.data.logs)) {
            throw new Error('Network logs should be an array');
        }

        if (networkResult.data.logs.length === 0) {
            throw new Error('Expected network requests to be captured');
        }

        // Verify log structure
        const firstLog = networkResult.data.logs[0];
        if (!firstLog.timestamp || !firstLog.method || !firstLog.url) {
            throw new Error('Network log entries should have timestamp, method, and url');
        }

        console.log(`   🌐 Captured ${networkResult.data.logs.length} network requests`);
    }

    async testNetworkLogFiltering() {
        // Filter by GET method
        const getRequestsResult = await this.client.callTool('get_network_logs', { method: 'GET' });
        
        if (!Array.isArray(getRequestsResult.data.logs)) {
            throw new Error('Filtered network logs should be an array');
        }

        // All returned logs should be GET requests
        const nonGetRequests = getRequestsResult.data.logs.filter(log => log.method !== 'GET');
        if (nonGetRequests.length > 0) {
            throw new Error('Method filtering should only return GET requests');
        }

        console.log(`   🔍 Filtered to ${getRequestsResult.data.logs.length} GET requests`);
    }

    async testNetworkLogStatusFiltering() {
        // Filter by status code 200
        const successRequestsResult = await this.client.callTool('get_network_logs', { status: 200 });
        
        if (!Array.isArray(successRequestsResult.data.logs)) {
            throw new Error('Status filtered network logs should be an array');
        }

        // All returned logs should have status 200
        const non200Requests = successRequestsResult.data.logs.filter(log => log.status !== 200);
        if (non200Requests.length > 0) {
            throw new Error('Status filtering should only return requests with status 200');
        }

        console.log(`   ✅ Filtered to ${successRequestsResult.data.logs.length} requests with status 200`);
    }

    async testNetworkLogURLPatternFiltering() {
        // Filter by URL pattern
        const httpbinRequestsResult = await this.client.callTool('get_network_logs', { 
            url_pattern: 'httpbin\\.org' 
        });
        
        if (!Array.isArray(httpbinRequestsResult.data.logs)) {
            throw new Error('URL pattern filtered network logs should be an array');
        }

        // All returned logs should match the pattern
        const regex = new RegExp('httpbin\\.org');
        const nonMatchingRequests = httpbinRequestsResult.data.logs.filter(log => !regex.test(log.url));
        if (nonMatchingRequests.length > 0) {
            throw new Error('URL pattern filtering should only return matching requests');
        }

        console.log(`   🎯 Filtered to ${httpbinRequestsResult.data.logs.length} httpbin.org requests`);
    }

    async testClearNetworkLogs() {
        // Clear network logs
        await this.client.callTool('clear_network_logs');
        
        // Verify logs are cleared
        const logsAfterClear = await this.client.callTool('get_network_logs');
        
        if (logsAfterClear.data.logs.length !== 0) {
            throw new Error('Network logs should be empty after clearing');
        }

        console.log('   🗑️ Network logs cleared successfully');
    }

    async testCombinedMonitoring() {
        // Clear both log types first
        await this.client.callTool('clear_console_logs');
        await this.client.callTool('clear_network_logs');
        
        // Load a page and generate both console and network activity
        await this.client.callTool('load_page', { 
            url: TEST_CONFIG.NETWORK_TEST_URL,
            waitUntil: 'domcontentloaded' 
        });
        
        // Generate combined console and network activity using JavaScript
        await this.client.callTool('evaluate_js', {
            code: `
                console.log('Starting combined test');
                console.warn('Test warning message');
                
                // Make a network request
                fetch('https://httpbin.org/status/200')
                    .then(() => console.log('Network request completed'))
                    .catch(e => console.error('Network request failed:', e));
            `
        });
        
        // Wait for activity to complete
        await sleep(3000);

        // Check both console and network logs
        const consoleLogs = await this.client.callTool('get_console_logs');
        const networkLogs = await this.client.callTool('get_network_logs');
        
        if (consoleLogs.data.logs.length === 0) {
            throw new Error('Expected console logs from combined test');
        }
        
        if (networkLogs.data.logs.length === 0) {
            throw new Error('Expected network logs from combined test');
        }

        console.log(`   📊 Combined test: ${consoleLogs.data.logs.length} console logs, ${networkLogs.data.logs.length} network logs`);
    }

    async runAllTests() {
        console.log('🚀 Starting Console and Network Tools Test Suite');
        console.log('='.repeat(60));

        try {
            await this.client.start();

            // Console logging tests
            await this.runTest('Console Logging Basic Functionality', () => this.testConsoleLogging());
            await this.runTest('Console Log Level Filtering', () => this.testConsoleLogFiltering());
            await this.runTest('Console Log Limit Parameter', () => this.testConsoleLogLimit());
            await this.runTest('Clear Console Logs', () => this.testClearConsoleLogs());

            // Network logging tests
            await this.runTest('Network Request Logging', () => this.testNetworkLogging());
            await this.runTest('Network Log Method Filtering', () => this.testNetworkLogFiltering());
            await this.runTest('Network Log Status Filtering', () => this.testNetworkLogStatusFiltering());
            await this.runTest('Network Log URL Pattern Filtering', () => this.testNetworkLogURLPatternFiltering());
            await this.runTest('Clear Network Logs', () => this.testClearNetworkLogs());

            // Combined monitoring test
            await this.runTest('Combined Console and Network Monitoring', () => this.testCombinedMonitoring());

            // Final cleanup
            await this.client.callTool('close_browser');

        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            this.failed++;
        } finally {
            await this.client.stop();
        }

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📋 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📊 Total:  ${this.passed + this.failed}`);
        
        if (this.failed === 0) {
            console.log('\n🎉 All console and network monitoring tests passed!');
            console.log('✅ Console and network logging tools are working correctly');
            return true;
        } else {
            console.log(`\n💥 ${this.failed} test(s) failed`);
            return false;
        }
    }
}

// Run the test suite
const testSuite = new ConsoleNetworkTestSuite();
testSuite.runAllTests()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });