#!/usr/bin/env node

/**
 * Test browser navigation tools
 */

import { spawn } from 'child_process';

async function testNavigationTools() {
  console.log('🚀 Testing Browser Navigation Tools...\n');

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
        clientInfo: { name: 'nav-test', version: '1.0.0' }
      }
    },
    // List tools to verify navigation tools are available
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    },
    // Load initial page
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
    // Navigate to another page to create history
    {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'load_page',
        arguments: {
          url: 'https://httpbin.org/html',
          waitUntil: 'domcontentloaded'
        }
      }
    },
    // Get current URL to verify we're on the second page
    {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'get_current_url',
        arguments: {}
      }
    },
    // Test go_back
    {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'go_back',
        arguments: {
          timeout: 10000,
          waitUntil: 'domcontentloaded'
        }
      }
    },
    // Verify we're back on the first page
    {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'get_current_url',
        arguments: {}
      }
    },
    // Test go_forward
    {
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: {
        name: 'go_forward',
        arguments: {
          timeout: 10000,
          waitUntil: 'domcontentloaded'
        }
      }
    },
    // Verify we're forward on the second page again
    {
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/call',
      params: {
        name: 'get_current_url',
        arguments: {}
      }
    },
    // Test reload_page (normal)
    {
      jsonrpc: '2.0',
      id: 10,
      method: 'tools/call',
      params: {
        name: 'reload_page',
        arguments: {
          ignoreCache: false,
          timeout: 10000,
          waitUntil: 'domcontentloaded'
        }
      }
    },
    // Test reload_page (hard refresh)
    {
      jsonrpc: '2.0',
      id: 11,
      method: 'tools/call',
      params: {
        name: 'reload_page',
        arguments: {
          ignoreCache: true,
          timeout: 10000,
          waitUntil: 'domcontentloaded'
        }
      }
    },
    // Final URL check
    {
      jsonrpc: '2.0',
      id: 12,
      method: 'tools/call',
      params: {
        name: 'get_current_url',
        arguments: {}
      }
    },
    // Take screenshot to verify final state
    {
      jsonrpc: '2.0',
      id: 13,
      method: 'tools/call',
      params: {
        name: 'screenshot',
        arguments: {
          fullPage: false
        }
      }
    },
    // Close browser
    {
      jsonrpc: '2.0',
      id: 14,
      method: 'tools/call',
      params: {
        name: 'close_browser',
        arguments: {}
      }
    }
  ];

  let responseCount = 0;
  const results = {};
  let totalTools = 0;
  const urlHistory = [];

  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        responseCount++;
        
        const request = tests[responseCount - 1];
        
        if (request?.method === 'tools/list') {
          totalTools = response.result?.tools?.length || 0;
          const navTools = ['go_back', 'go_forward', 'reload_page'];
          const availableTools = response.result?.tools?.map(t => t.name) || [];
          const hasNavTools = navTools.every(tool => availableTools.includes(tool));
          
          console.log(`📋 Total tools available: ${totalTools}`);
          console.log(`🧭 Navigation tools present: ${hasNavTools ? '✅' : '❌'}`);
          
          if (!hasNavTools) {
            const missing = navTools.filter(tool => !availableTools.includes(tool));
            console.log(`❌ Missing: ${missing.join(', ')}`);
          }
        }
        
        if (request?.method === 'tools/call') {
          const toolName = request.params.name;
          if (response.result?.content?.[0]?.text) {
            const content = JSON.parse(response.result.content[0].text);
            results[toolName] = content.success;
            
            // Track URL changes for navigation verification
            if (content.data?.url) {
              urlHistory.push({ tool: toolName, url: content.data.url });
              console.log(`🔗 ${toolName}: ${content.data.url}`);
            } else if (content.data?.currentUrl) {
              urlHistory.push({ tool: toolName, url: content.data.currentUrl });
              console.log(`🔗 ${toolName}: ${content.data.currentUrl}`);
            }
            
            if (content.success) {
              console.log(`✅ ${toolName}: ${content.data?.message || 'Success'}`);
            } else {
              console.log(`❌ ${toolName}: ${content.error?.message || 'Failed'}`);
            }
          }
        }
        
        if (responseCount === tests.length) {
          const navTools = ['go_back', 'go_forward', 'reload_page'];
          const navToolsPassed = navTools.filter(tool => results[tool]).length;
          
          console.log(`\n🎯 Navigation Tools Results:`);
          console.log(`   📊 Total tools available: ${totalTools}`);
          console.log(`   🧭 Navigation tools tested: ${navToolsPassed}/${navTools.length}`);
          console.log(`   🏆 Success rate: ${Math.round(navToolsPassed/navTools.length*100)}%`);
          
          // Analyze navigation history
          console.log(`\n📖 Navigation History:`);
          urlHistory.forEach((entry, i) => {
            console.log(`   ${i + 1}. ${entry.tool}: ${entry.url}`);
          });
          
          // Check for proper navigation flow
          const hasProperFlow = urlHistory.length >= 3 && 
            urlHistory.some(e => e.url.includes('/html')) &&
            urlHistory.some(e => e.url === 'https://httpbin.org/');
          
          console.log(`   🔄 Navigation flow verified: ${hasProperFlow ? '✅' : '❌'}`);
          
          const isSuccess = navToolsPassed === navTools.length;
          console.log(`\n${isSuccess ? '🎉' : '⚠️'} Navigation Tools: ${isSuccess ? 'READY FOR PRODUCTION' : 'NEEDS REVIEW'}`);
          
          server.kill();
          process.exit(isSuccess ? 0 : 1);
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
    await new Promise(resolve => setTimeout(resolve, i === 0 ? 1000 : 2500));
    server.stdin.write(JSON.stringify(tests[i]) + '\n');
  }

  setTimeout(() => {
    console.error('❌ Timeout after 60 seconds');
    server.kill();
    process.exit(1);
  }, 60000);
}

testNavigationTools().catch(console.error);