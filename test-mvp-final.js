#!/usr/bin/env node

/**
 * Final MVP validation test - simpler and more reliable
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

async function testMVPFinal() {
  console.log('🚀 Final Browser MCP Server MVP validation...\n');

  const server = spawn('node', ['dist/server.js'], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  const tests = [
    // Initialize
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'final-test', version: '1.0.0' }
      }
    },
    // List tools
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    },
    // load_page
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
    // get_current_url
    {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'get_current_url',
        arguments: {}
      }
    },
    // get_page_title
    {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'get_page_title',
        arguments: {}
      }
    },
    // get_viewport_info
    {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'get_viewport_info',
        arguments: {}
      }
    },
    // screenshot
    {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'screenshot',
        arguments: {
          fullPage: false
        }
      }
    },
    // get_dom (partial)
    {
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: {
        name: 'get_dom',
        arguments: {
          selector: 'title'
        }
      }
    },
    // click_element
    {
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/call',
      params: {
        name: 'click_element',
        arguments: {
          selector: 'a[href="/forms/post"]',
          timeout: 10000
        }
      }
    },
    // close_browser
    {
      jsonrpc: '2.0',
      id: 10,
      method: 'tools/call',
      params: {
        name: 'close_browser',
        arguments: {}
      }
    }
  ];

  let responseCount = 0;
  const results = {};
  const screenshots = [];

  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        responseCount++;
        
        const request = tests[responseCount - 1];
        if (request?.method === 'tools/call') {
          const toolName = request.params.name;
          if (response.result?.content?.[0]?.text) {
            const content = JSON.parse(response.result.content[0].text);
            results[toolName] = content.success;
            
            if (content.success) {
              console.log(`✅ ${toolName}`);
            } else {
              console.log(`❌ ${toolName}: ${content.error?.message}`);
            }
            
            if (content.data?.filePath) {
              screenshots.push(content.data.filePath);
            }
          }
        } else if (request?.method === 'tools/list') {
          console.log(`📋 Found ${response.result?.tools?.length || 0} tools`);
        }
        
        if (responseCount === tests.length) {
          const passed = Object.values(results).filter(Boolean).length;
          console.log(`\n🎯 Results: ${passed}/8 tools working`);
          
          screenshots.forEach(file => {
            console.log(`📸 Screenshot: ${existsSync(file) ? '✅' : '❌'} ${file}`);
          });
          
          console.log(`\n🏆 MVP Status: ${passed === 8 ? '✅ READY' : '❌ NEEDS WORK'}`);
          
          server.kill();
          process.exit(passed === 8 ? 0 : 1);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error.message);
    process.exit(1);
  });

  for (let i = 0; i < tests.length; i++) {
    await new Promise(resolve => setTimeout(resolve, i === 0 ? 1000 : 1500));
    server.stdin.write(JSON.stringify(tests[i]) + '\n');
  }

  setTimeout(() => {
    console.error('❌ Timeout');
    server.kill();
    process.exit(1);
  }, 45000);
}

testMVPFinal().catch(console.error);