#!/usr/bin/env node

/**
 * Comprehensive test suite for browser configuration tools
 * Tests the new configuration capabilities added to Browser MCP Server
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
    TEST_URL: 'https://httpbin.org/user-agent',
    GEO_TEST_URL: 'https://httpbin.org/json'
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
 * Test suite for browser configuration tools
 */
class ConfigurationTestSuite {
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

    async testViewportSizeConfiguration() {
        // Test setting viewport size
        const newWidth = 1024;
        const newHeight = 768;
        
        const result = await this.client.callTool('set_viewport_size', {
            width: newWidth,
            height: newHeight
        });

        if (result.data.width !== newWidth || result.data.height !== newHeight) {
            throw new Error(`Expected viewport ${newWidth}x${newHeight}, got ${result.data.width}x${result.data.height}`);
        }

        // Verify the viewport was actually changed
        const viewportInfo = await this.client.callTool('get_viewport_info');
        
        if (viewportInfo.data.width !== newWidth || viewportInfo.data.height !== newHeight) {
            throw new Error(`Viewport info doesn't match set values: expected ${newWidth}x${newHeight}, got ${viewportInfo.data.width}x${viewportInfo.data.height}`);
        }

        console.log(`   📐 Viewport set to ${newWidth}x${newHeight} successfully`);
    }

    async testViewportSizeRange() {
        // Test different viewport sizes
        const testSizes = [
            { width: 320, height: 568 },  // Mobile
            { width: 768, height: 1024 }, // Tablet
            { width: 1920, height: 1080 } // Desktop
        ];

        for (const size of testSizes) {
            await this.client.callTool('set_viewport_size', {
                width: size.width,
                height: size.height
            });

            const viewportInfo = await this.client.callTool('get_viewport_info');
            
            if (viewportInfo.data.width !== size.width || viewportInfo.data.height !== size.height) {
                throw new Error(`Failed to set viewport to ${size.width}x${size.height}`);
            }
        }

        console.log(`   📱 Successfully tested ${testSizes.length} different viewport sizes`);
    }

    async testUserAgentConfiguration() {
        // Test setting custom user agent
        const customUserAgent = 'Mozilla/5.0 (Test Browser) Browser MCP Test/1.0';
        
        await this.client.callTool('set_user_agent', {
            userAgent: customUserAgent
        });

        // Navigate to a page that shows user agent to verify it was set
        await this.client.callTool('load_page', {
            url: TEST_CONFIG.TEST_URL,
            waitUntil: 'domcontentloaded'
        });

        // Get the page content to check user agent
        const domResult = await this.client.callTool('get_dom');
        const pageContent = domResult.data.html || '';

        if (!pageContent.includes('Test Browser')) {
            // Try using JavaScript to get user agent instead
            const jsResult = await this.client.callTool('evaluate_js', {
                code: 'navigator.userAgent'
            });
            
            if (!jsResult.data.result.includes('Test Browser')) {
                throw new Error('Custom user agent was not applied to requests');
            }
        }

        console.log(`   🌐 Custom user agent applied successfully`);
    }

    async testUserAgentPresets() {
        // Test different common user agents
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        ];

        for (let i = 0; i < userAgents.length; i++) {
            const userAgent = userAgents[i];
            const result = await this.client.callTool('set_user_agent', {
                userAgent: userAgent
            });

            if (result.data.userAgent !== userAgent) {
                throw new Error(`Failed to set user agent ${i + 1}`);
            }
        }

        console.log(`   🖥️ Successfully tested ${userAgents.length} different user agents`);
    }

    async testGeolocationConfiguration() {
        // Test setting geolocation
        const latitude = 37.7749;  // San Francisco
        const longitude = -122.4194;
        const accuracy = 50;
        
        const result = await this.client.callTool('set_geolocation', {
            latitude: latitude,
            longitude: longitude,
            accuracy: accuracy
        });

        if (result.data.latitude !== latitude || result.data.longitude !== longitude) {
            throw new Error(`Geolocation was not set correctly: expected ${latitude}, ${longitude}, got ${result.data.latitude}, ${result.data.longitude}`);
        }

        if (result.data.accuracy !== accuracy) {
            throw new Error(`Geolocation accuracy was not set correctly: expected ${accuracy}, got ${result.data.accuracy}`);
        }

        console.log(`   🌍 Geolocation set to ${latitude}, ${longitude} with accuracy ${accuracy}m`);
    }

    async testGeolocationAccuracyDefault() {
        // Test geolocation with default accuracy
        const latitude = 40.7128;  // New York
        const longitude = -74.0060;
        
        const result = await this.client.callTool('set_geolocation', {
            latitude: latitude,
            longitude: longitude
            // No accuracy specified - should default to 100
        });

        if (result.data.accuracy !== 100) {
            throw new Error(`Default accuracy should be 100, got ${result.data.accuracy}`);
        }

        console.log(`   🎯 Geolocation with default accuracy (100m) works correctly`);
    }

    async testGeolocationRanges() {
        // Test geolocation with extreme values
        const testLocations = [
            { lat: -90, lng: -180, name: 'South Pole, Date Line' },      // Extreme negative
            { lat: 90, lng: 180, name: 'North Pole, Date Line' },        // Extreme positive
            { lat: 0, lng: 0, name: 'Null Island' },                     // Zero coordinates
            { lat: 51.5074, lng: -0.1278, name: 'London' }               // Real location
        ];

        for (const location of testLocations) {
            const result = await this.client.callTool('set_geolocation', {
                latitude: location.lat,
                longitude: location.lng,
                accuracy: 10
            });

            if (result.data.latitude !== location.lat || result.data.longitude !== location.lng) {
                throw new Error(`Failed to set geolocation for ${location.name}`);
            }
        }

        console.log(`   🗺️ Successfully tested ${testLocations.length} different locations`);
    }

    async testCombinedConfiguration() {
        // Test setting multiple configuration options together
        await this.client.callTool('set_viewport_size', {
            width: 1440,
            height: 900
        });

        await this.client.callTool('set_user_agent', {
            userAgent: 'Mozilla/5.0 (Combined Test) BrowserMCP/1.0'
        });

        await this.client.callTool('set_geolocation', {
            latitude: 48.8566,  // Paris
            longitude: 2.3522,
            accuracy: 25
        });

        // Verify all settings work together
        const viewportInfo = await this.client.callTool('get_viewport_info');
        if (viewportInfo.data.width !== 1440 || viewportInfo.data.height !== 900) {
            throw new Error('Viewport setting lost in combined configuration');
        }

        // Load a page to test user agent
        await this.client.callTool('load_page', {
            url: TEST_CONFIG.TEST_URL,
            waitUntil: 'domcontentloaded'
        });

        const jsResult = await this.client.callTool('evaluate_js', {
            code: 'navigator.userAgent'
        });
        
        if (!jsResult.data.result.includes('Combined Test')) {
            throw new Error('User agent setting lost in combined configuration');
        }

        console.log('   ⚙️ Combined configuration settings all work together');
    }

    async runAllTests() {
        console.log('🚀 Starting Browser Configuration Tools Test Suite');
        console.log('='.repeat(60));

        try {
            await this.client.start();

            // Viewport configuration tests
            await this.runTest('Viewport Size Configuration', () => this.testViewportSizeConfiguration());
            await this.runTest('Viewport Size Range Testing', () => this.testViewportSizeRange());

            // User agent configuration tests
            await this.runTest('User Agent Configuration', () => this.testUserAgentConfiguration());
            await this.runTest('User Agent Presets Testing', () => this.testUserAgentPresets());

            // Geolocation configuration tests
            await this.runTest('Geolocation Configuration', () => this.testGeolocationConfiguration());
            await this.runTest('Geolocation Default Accuracy', () => this.testGeolocationAccuracyDefault());
            await this.runTest('Geolocation Range Testing', () => this.testGeolocationRanges());

            // Combined configuration test
            await this.runTest('Combined Configuration Settings', () => this.testCombinedConfiguration());

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
            console.log('\n🎉 All configuration tools tests passed!');
            console.log('✅ Browser configuration tools are working correctly');
            return true;
        } else {
            console.log(`\n💥 ${this.failed} test(s) failed`);
            return false;
        }
    }
}

// Run the test suite
const testSuite = new ConfigurationTestSuite();
testSuite.runAllTests()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });