#!/usr/bin/env node

/**
 * Real website interaction test for Browser MCP Server
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

/**
 * Test real website automation capabilities
 */
async function testRealWebsiteInteraction() {
  console.log('Testing Browser MCP Server with real website interaction...');

  // Start the server
  const server = spawn('node', ['dist/server.js'], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  // Test sequence with GitHub
  const tests = [
    // Initialize
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
    // Load GitHub homepage
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'load_page',
        arguments: {
          url: 'https://github.com',
          waitUntil: 'networkidle'
        }
      }
    },
    // Get page title
    {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'get_page_title',
        arguments: {}
      }
    },
    // Take screenshot of GitHub homepage
    {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'screenshot',
        arguments: {
          fullPage: true
        }
      }
    },
    // Get DOM content of header
    {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'get_dom',
        arguments: {
          selector: 'header'
        }
      }
    },
    // Navigate to Google
    {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'load_page',
        arguments: {
          url: 'https://www.google.com',
          waitUntil: 'domcontentloaded'
        }
      }
    },
    // Get Google page title
    {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'get_page_title',
        arguments: {}
      }
    },
    // Take screenshot of Google
    {
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: {
        name: 'screenshot',
        arguments: {
          fullPage: false
        }
      }
    },
    // Test click interaction on Google search box
    {
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/call',
      params: {
        name: 'click_element',
        arguments: {
          selector: 'textarea[name="q"]',
          timeout: 10000
        }
      }
    },
    // Get current URL
    {
      jsonrpc: '2.0',
      id: 10,
      method: 'tools/call',
      params: {
        name: 'get_current_url',
        arguments: {}
      }
    },
    // Close browser
    {
      jsonrpc: '2.0',
      id: 11,
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

  // Handle server responses
  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        responses.push(response);
        responseCount++;
        
        console.log(`\nResponse ${responseCount}:`, JSON.stringify(response, null, 2));
        
        // Check for screenshot file creation
        if (response.result?.content?.[0]?.text) {
          const content = JSON.parse(response.result.content[0].text);
          if (content.success && content.data?.filePath) {
            screenshotFiles.push(content.data.filePath);
          }
        }
        
        if (responseCount === tests.length) {
          console.log('\n🎉 All real website interaction tests completed!');
          
          // Verify screenshot files exist
          console.log('\n📸 Verifying screenshots:');
          screenshotFiles.forEach(file => {
            if (existsSync(file)) {
              console.log(`✅ Screenshot exists: ${file}`);
            } else {
              console.log(`❌ Screenshot missing: ${file}`);
            }
          });
          
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
    await new Promise(resolve => setTimeout(resolve, i === 0 ? 1000 : 3000));
    
    const request = JSON.stringify(tests[i]) + '\n';
    console.log(`\nSending request ${i + 1}:`, JSON.stringify(tests[i], null, 2));
    server.stdin.write(request);
  }

  // Timeout after 120 seconds
  setTimeout(() => {
    console.error('❌ Test timeout after 120 seconds');
    server.kill();
    process.exit(1);
  }, 120000);
}

testRealWebsiteInteraction().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});