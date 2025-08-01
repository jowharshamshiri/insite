#!/usr/bin/env node

/**
 * Basic test script for Browser MCP Server functionality
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';

/**
 * Test MCP server with basic tool calls
 */
async function testMCPServer() {
  console.log('Testing Browser MCP Server...');

  // Start the server
  const server = spawn('node', ['dist/server.js'], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  // Test sequence
  const tests = [
    // Initialize request
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    },
    // List tools
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    },
    // Load page test
    {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'load_page',
        arguments: {
          url: 'https://example.com',
          waitUntil: 'domcontentloaded'
        }
      }
    },
    // Get current URL
    {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'get_current_url',
        arguments: {}
      }
    },
    // Get page title
    {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'get_page_title',
        arguments: {}
      }
    },
    // Take screenshot
    {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'screenshot',
        arguments: {
          fullPage: true
        }
      }
    },
    // Get viewport info
    {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'get_viewport_info',
        arguments: {}
      }
    },
    // Close browser
    {
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: {
        name: 'close_browser',
        arguments: {}
      }
    }
  ];

  let responseCount = 0;
  const responses = [];

  // Handle server responses
  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        responses.push(response);
        responseCount++;
        
        console.log(`Response ${responseCount}:`, JSON.stringify(response, null, 2));
        
        if (responseCount === tests.length) {
          console.log('\n✅ All tests completed successfully!');
          server.kill();
          process.exit(0);
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

  // Send test requests with delays
  for (let i = 0; i < tests.length; i++) {
    await new Promise(resolve => setTimeout(resolve, i === 0 ? 1000 : 2000));
    
    const request = JSON.stringify(tests[i]) + '\n';
    console.log(`\nSending request ${i + 1}:`, JSON.stringify(tests[i], null, 2));
    server.stdin.write(request);
  }

  // Timeout after 60 seconds
  setTimeout(() => {
    console.error('❌ Test timeout after 60 seconds');
    server.kill();
    process.exit(1);
  }, 60000);
}

testMCPServer().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});