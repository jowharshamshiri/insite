#!/usr/bin/env node

/**
 * Comprehensive MVP validation test for Browser MCP Server
 * Tests all 8 essential tools with real-world scenarios
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

/**
 * Test MVP functionality with comprehensive validation
 */
async function testMVPComplete() {
  console.log('🚀 Running comprehensive Browser MCP Server MVP validation...');
  console.log('Testing all 8 essential tools with real-world scenarios\n');

  // Start the server
  const server = spawn('node', ['dist/server.js'], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  // Comprehensive test sequence
  const tests = [
    // Initialize
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'mvp-test-client', version: '1.0.0' }
      }
    },
    // Verify all 8 tools are available
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    },
    // Test 1: load_page - Navigate to httpbin.org (more reliable)
    {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'load_page',
        arguments: {
          url: 'https://httpbin.org/',
          waitUntil: 'domcontentloaded'
        }
      }
    },
    // Test 2: get_current_url - Verify navigation worked
    {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'get_current_url',
        arguments: {}
      }
    },
    // Test 3: get_page_title - Get httpbin.org title
    {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'get_page_title',
        arguments: {}
      }
    },
    // Test 4: get_viewport_info - Check viewport
    {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'get_viewport_info',
        arguments: {}
      }
    },
    // Test 5: screenshot - Take full page screenshot
    {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'screenshot',
        arguments: {
          fullPage: true
        }
      }
    },
    // Test 6: get_dom - Get page content
    {
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: {
        name: 'get_dom',
        arguments: {}
      }
    },
    // Load different page for interaction test
    {
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/call',
      params: {
        name: 'load_page',
        arguments: {
          url: 'https://httpbin.org/forms/post',
          waitUntil: 'networkidle'
        }
      }
    },
    // Test 7: click_element - Click on form element
    {
      jsonrpc: '2.0',
      id: 10,
      method: 'tools/call',
      params: {
        name: 'click_element',
        arguments: {
          selector: 'input[name="custname"]',
          timeout: 10000
        }
      }
    },
    // Take screenshot after interaction
    {
      jsonrpc: '2.0',
      id: 11,
      method: 'tools/call',
      params: {
        name: 'screenshot',
        arguments: {
          fullPage: false
        }
      }
    },
    // Test 8: close_browser - Clean shutdown
    {
      jsonrpc: '2.0',
      id: 12,
      method: 'tools/call',
      params: {
        name: 'close_browser',
        arguments: {}
      }
    }
  ];

  let responseCount = 0;
  const responses = [];
  const screenshotFiles = [];
  const testResults = {
    load_page: false,
    get_current_url: false,
    get_page_title: false,
    get_viewport_info: false,
    screenshot: false,
    get_dom: false,
    click_element: false,
    close_browser: false
  };

  // Handle server responses
  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        responses.push(response);
        responseCount++;
        
        // Parse response content for tool results
        if (response.result?.content?.[0]?.text) {
          const content = JSON.parse(response.result.content[0].text);
          
          // Track successful tool calls
          const request = tests[responseCount - 1];
          if (request && request.method === 'tools/call') {
            const toolName = request.params.name;
            if (content.success && testResults.hasOwnProperty(toolName)) {
              testResults[toolName] = true;
              console.log(`✅ ${toolName}: PASSED`);
            } else if (!content.success) {
              console.log(`❌ ${toolName}: FAILED - ${content.error?.message || 'Unknown error'}`);
            }
          }
          
          // Track screenshots
          if (content.success && content.data?.filePath) {
            screenshotFiles.push(content.data.filePath);
          }
        }
        
        // Special handling for tools/list response
        if (response.result?.tools && Array.isArray(response.result.tools)) {
          const toolNames = response.result.tools.map(tool => tool.name);
          const expectedTools = Object.keys(testResults);
          const hasAllTools = expectedTools.every(tool => toolNames.includes(tool));
          
          console.log(`📋 Tools available: ${toolNames.length}/8`);
          console.log(`🎯 All required tools present: ${hasAllTools ? '✅' : '❌'}`);
          
          if (!hasAllTools) {
            const missing = expectedTools.filter(tool => !toolNames.includes(tool));
            console.log(`❌ Missing tools: ${missing.join(', ')}`);
          }
        }
        
        if (responseCount === tests.length) {
          console.log('\n🏁 MVP Validation Complete!');
          
          // Final results
          console.log('\n📊 Test Results:');
          Object.entries(testResults).forEach(([tool, passed]) => {
            console.log(`   ${passed ? '✅' : '❌'} ${tool}`);
          });
          
          const passedCount = Object.values(testResults).filter(Boolean).length;
          console.log(`\n🎯 Overall: ${passedCount}/8 tools working (${Math.round(passedCount/8*100)}%)`);
          
          // Verify screenshot files
          console.log('\n📸 Screenshot verification:');
          screenshotFiles.forEach(file => {
            if (existsSync(file)) {
              console.log(`   ✅ ${file}`);
            } else {
              console.log(`   ❌ ${file} (missing)`);
            }
          });
          
          // MVP Success criteria
          const mvpSuccess = passedCount === 8 && screenshotFiles.length >= 2;
          console.log(`\n🏆 MVP Status: ${mvpSuccess ? '✅ READY FOR PRODUCTION' : '❌ NEEDS FIXES'}`);
          
          server.kill();
          process.exit(mvpSuccess ? 0 : 1);
        }
      } catch (e) {
        console.log('Raw output:', line);
      }
    }
  });

  // Handle server errors
  server.on('error', (error) => {
    console.error('❌ Server error:', error.message);
    process.exit(1);
  });

  server.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Server exited with code ${code}`);
      process.exit(1);
    }
  });

  // Send test requests with appropriate delays
  for (let i = 0; i < tests.length; i++) {
    await new Promise(resolve => setTimeout(resolve, i === 0 ? 1000 : 2500));
    
    const request = JSON.stringify(tests[i]) + '\n';
    console.log(`\n[${i + 1}/${tests.length}] ${tests[i].method}${tests[i].params.name ? ` (${tests[i].params.name})` : ''}`);
    server.stdin.write(request);
  }

  // Extended timeout for comprehensive test
  setTimeout(() => {
    console.error('❌ Test timeout after 120 seconds');
    server.kill();
    process.exit(1);
  }, 120000);
}

testMVPComplete().catch(error => {
  console.error('❌ MVP validation failed:', error.message);
  process.exit(1);
});