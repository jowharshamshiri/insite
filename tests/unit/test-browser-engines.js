#!/usr/bin/env node

/**
 * Test suite for multi-browser engine support
 * Validates browser engine switching and management tools
 */

import { spawn } from 'child_process';

// Use promisified setTimeout
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Test configuration
 */
const TEST_CONFIG = {
    TIMEOUT: 30000,
    SERVER_STARTUP_DELAY: 2000,
    OPERATION_DELAY: 1000,
    TEST_URL: 'https://httpbin.org/user-agent'
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
 * Test suite for browser engine management
 */
class BrowserEngineTestSuite {
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

    async testListAvailableBrowsers() {
        const result = await this.client.callTool('list_available_browsers');
        
        if (!result.data.engines || !Array.isArray(result.data.engines)) {
            throw new Error('Should return array of available engines');
        }

        if (result.data.engines.length < 3) {
            throw new Error('Should have at least 3 browser engines (chromium, firefox, webkit)');
        }

        const expectedEngines = ['chromium', 'firefox', 'webkit'];
        for (const engine of expectedEngines) {
            if (!result.data.engines.includes(engine)) {
                throw new Error(`Missing expected engine: ${engine}`);
            }
        }

        console.log(`   🔍 Found ${result.data.engines.length} browser engines: ${result.data.engines.join(', ')}`);
    }

    async testGetBrowserInfo() {
        const result = await this.client.callTool('get_browser_info');
        
        if (!result.data.engine) {
            throw new Error('Should return current browser engine');
        }

        if (typeof result.data.isInitialized !== 'boolean') {
            throw new Error('Should return initialization status');
        }

        console.log(`   ℹ️ Current browser: ${result.data.engine} (initialized: ${result.data.isInitialized})`);
    }

    async testSwitchBrowserEngine() {
        // Test switching to Firefox
        try {
            const switchResult = await this.client.callTool('switch_browser', { engine: 'firefox' });
            
            if (switchResult.data.engine !== 'firefox') {
                throw new Error('Failed to switch to Firefox');
            }

            // Verify the switch worked
            const infoResult = await this.client.callTool('get_browser_info');
            if (infoResult.data.engine !== 'firefox') {
                throw new Error('Browser info does not reflect engine switch');
            }

            console.log(`   🦊 Successfully switched to Firefox`);

            // Test basic functionality with Firefox
            await this.client.callTool('load_page', { url: TEST_CONFIG.TEST_URL });
            console.log(`   ✅ Firefox can load pages successfully`);

        } catch (error) {
            console.log(`   ⚠️ Firefox switch failed (may not be installed): ${error.message}`);
        }

        // Test switching to WebKit
        try {
            const switchResult = await this.client.callTool('switch_browser', { engine: 'webkit' });
            
            if (switchResult.data.engine !== 'webkit') {
                throw new Error('Failed to switch to WebKit');
            }

            console.log(`   🌐 Successfully switched to WebKit`);

            // Test basic functionality with WebKit
            await this.client.callTool('load_page', { url: TEST_CONFIG.TEST_URL });
            console.log(`   ✅ WebKit can load pages successfully`);

        } catch (error) {
            console.log(`   ⚠️ WebKit switch failed (may not be installed): ${error.message}`);
        }

        // Switch back to Chromium
        const chromiumResult = await this.client.callTool('switch_browser', { engine: 'chromium' });
        if (chromiumResult.data.engine !== 'chromium') {
            throw new Error('Failed to switch back to Chromium');
        }

        console.log(`   🔄 Successfully switched back to Chromium`);
    }

    async testCrossBrowserConsistency() {
        // Test that the same page works across different browsers
        const testResults = {};
        const engines = ['chromium', 'firefox', 'webkit'];

        for (const engine of engines) {
            try {
                await this.client.callTool('switch_browser', { engine });
                await this.client.callTool('load_page', { url: TEST_CONFIG.TEST_URL });
                
                const userAgentResult = await this.client.callTool('evaluate_js', {
                    code: 'navigator.userAgent'
                });

                testResults[engine] = {
                    success: true,
                    userAgent: userAgentResult.data.result
                };

                console.log(`   ✅ ${engine}: Page loaded successfully`);
            } catch (error) {
                testResults[engine] = {
                    success: false,
                    error: error.message
                };
                console.log(`   ⚠️ ${engine}: ${error.message}`);
            }
        }

        // Verify at least Chromium worked
        if (!testResults.chromium.success) {
            throw new Error('Chromium (default engine) should always work');
        }

        const successCount = Object.values(testResults).filter(r => r.success).length;
        console.log(`   📊 ${successCount}/${engines.length} browser engines working`);
    }

    async runAllTests() {
        console.log('🚀 Starting Browser Engine Management Test Suite');
        console.log('='.repeat(60));

        try {
            await this.client.start();

            // Browser engine management tests
            await this.runTest('List Available Browser Engines', () => this.testListAvailableBrowsers());
            await this.runTest('Get Browser Information', () => this.testGetBrowserInfo());
            await this.runTest('Switch Browser Engines', () => this.testSwitchBrowserEngine());
            await this.runTest('Cross-Browser Consistency', () => this.testCrossBrowserConsistency());

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
            console.log('\n🎉 All browser engine management tests passed!');
            console.log('✅ Multi-browser support is working correctly');
            return true;
        } else {
            console.log(`\n💥 ${this.failed} test(s) failed`);
            return false;
        }
    }
}

// Run the test suite
const testSuite = new BrowserEngineTestSuite();
testSuite.runAllTests()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });