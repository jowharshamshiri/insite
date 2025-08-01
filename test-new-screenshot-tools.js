#!/usr/bin/env node

/**
 * Test Suite for New Screenshot Tools
 * Tests scroll_to_element_and_screenshot and capture_full_scrollable_page
 */

import { spawn } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';

class TestRunner {
  constructor() {
    this.mcpProcess = null;
    this.tests = [];
    this.results = { passed: 0, failed: 0, total: 0 };
  }

  async startMCPServer() {
    console.log('🚀 Starting InSite MCP Server...');
    this.mcpProcess = spawn('node', ['dist/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ MCP Server started');
  }

  async stopMCPServer() {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      console.log('🛑 MCP Server stopped');
    }
  }

  async sendMCPRequest(method, params = {}) {
    return new Promise((resolve) => {
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: method,
        params: params
      };

      let response = '';
      
      const timeout = setTimeout(() => {
        resolve({ error: 'Request timeout' });
      }, 30000);

      this.mcpProcess.stdout.on('data', (data) => {
        response += data.toString();
        try {
          const parsed = JSON.parse(response);
          if (parsed.id === request.id) {
            clearTimeout(timeout);
            resolve(parsed);
          }
        } catch (e) {
          // Response might be incomplete, continue collecting
        }
      });

      this.mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async test(name, testFn) {
    this.results.total++;
    console.log(`\n🧪 Testing: ${name}`);
    
    try {
      await testFn();
      this.results.passed++;
      console.log(`✅ PASSED: ${name}`);
    } catch (error) {
      this.results.failed++;
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${error.message}`);
    }
  }

  async runAllTests() {
    console.log('🎯 InSite New Screenshot Tools Test Suite\n');
    
    await this.startMCPServer();
    
    try {
      // Test 1: Load a test page
      await this.test('Load Wikipedia homepage', async () => {
        const response = await this.sendMCPRequest('tools/call', {
          name: 'load_page',
          arguments: { url: 'https://en.wikipedia.org/wiki/Main_Page' }
        });
        
        // Parse MCP response format
        const content = response.result?.content?.[0]?.text;
        if (!content) {
          throw new Error(`No content in response: ${JSON.stringify(response)}`);
        }
        
        const result = JSON.parse(content);
        if (!result.success) {
          throw new Error(`Failed to load page: ${JSON.stringify(result)}`);
        }
      });

      // Test 2: Scroll to element and screenshot
      await this.test('Scroll to element and screenshot', async () => {
        const response = await this.sendMCPRequest('tools/call', {
          name: 'scroll_to_element_and_screenshot',
          arguments: { 
            selector: '#mp-welcometext',
            format: 'png'
          }
        });
        
        const content = response.result?.content?.[0]?.text;
        if (!content) {
          throw new Error(`No content in response: ${JSON.stringify(response)}`);
        }
        
        const result = JSON.parse(content);
        if (!result.success) {
          throw new Error(`Failed to scroll and screenshot element: ${JSON.stringify(result)}`);
        }
        
        const screenshotPath = result.data.screenshot;
        if (!existsSync(screenshotPath)) {
          throw new Error(`Screenshot file not created at ${screenshotPath}`);
        }
        
        console.log(`   📸 Element screenshot saved: ${screenshotPath}`);
      });

      // Test 3: Capture full scrollable page
      await this.test('Capture full scrollable page', async () => {
        const response = await this.sendMCPRequest('tools/call', {
          name: 'capture_full_scrollable_page',
          arguments: { 
            format: 'png',
            timeout: 60000  // Longer timeout for large pages
          }
        });
        
        if (response.error || !response.result?.success) {
          throw new Error(`Failed to capture full page: ${JSON.stringify(response)}`);
        }
        
        const screenshotPath = response.result.data.screenshot;
        if (!existsSync(screenshotPath)) {
          throw new Error(`Screenshot file not created at ${screenshotPath}`);
        }
        
        console.log(`   📸 Full page screenshot saved: ${screenshotPath}`);
      });

      // Test 4: Test with JPEG format
      await this.test('Element screenshot with JPEG format', async () => {
        const response = await this.sendMCPRequest('tools/call', {
          name: 'scroll_to_element_and_screenshot',
          arguments: { 
            selector: '#mp-tfa',
            format: 'jpeg',
            quality: 85
          }
        });
        
        if (response.error || !response.result?.success) {
          throw new Error(`Failed to take JPEG screenshot: ${JSON.stringify(response)}`);
        }
        
        const screenshotPath = response.result.data.screenshot;
        if (!existsSync(screenshotPath) || !screenshotPath.endsWith('.jpeg')) {
          throw new Error(`JPEG screenshot file not created properly at ${screenshotPath}`);
        }
        
        console.log(`   📸 JPEG element screenshot saved: ${screenshotPath}`);
      });

      // Test 5: Test with long page (GitHub repo)
      await this.test('Load GitHub repo and capture full page', async () => {
        // Load a GitHub repo page (long scrollable content)
        const loadResponse = await this.sendMCPRequest('tools/call', {
          name: 'load_page',
          arguments: { url: 'https://github.com/microsoft/playwright' }
        });
        
        if (loadResponse.error || !loadResponse.result?.success) {
          throw new Error(`Failed to load GitHub page: ${JSON.stringify(loadResponse)}`);
        }

        const response = await this.sendMCPRequest('tools/call', {
          name: 'capture_full_scrollable_page',
          arguments: { 
            format: 'png',
            timeout: 90000  // Extra long timeout for GitHub
          }
        });
        
        if (response.error || !response.result?.success) {
          throw new Error(`Failed to capture GitHub full page: ${JSON.stringify(response)}`);
        }
        
        const screenshotPath = response.result.data.screenshot;
        if (!existsSync(screenshotPath)) {
          throw new Error(`GitHub full page screenshot not created at ${screenshotPath}`);
        }
        
        console.log(`   📸 GitHub full page screenshot saved: ${screenshotPath}`);
      });

      // Test 6: Error handling - invalid selector
      await this.test('Error handling for invalid selector', async () => {
        const response = await this.sendMCPRequest('tools/call', {
          name: 'scroll_to_element_and_screenshot',
          arguments: { 
            selector: '#nonexistent-element-12345',
            timeout: 5000
          }
        });
        
        if (!response.error && response.result?.success) {
          throw new Error('Expected error for invalid selector but request succeeded');
        }
        
        console.log('   ✅ Correctly handled invalid selector error');
      });

    } finally {
      await this.stopMCPServer();
    }

    // Print results
    console.log('\n📊 Test Results:');
    console.log(`   Total: ${this.results.total}`);
    console.log(`   Passed: ${this.results.passed}`);
    console.log(`   Failed: ${this.results.failed}`);
    console.log(`   Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All new screenshot tests passed!');
    } else {
      console.log(`\n⚠️  ${this.results.failed} tests failed`);
      process.exit(1);
    }
  }
}

// Run the test suite
const runner = new TestRunner();
runner.runAllTests().catch(error => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
});