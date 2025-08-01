#!/usr/bin/env node

/**
 * Test advanced browser interaction tools
 */

import { spawn } from 'child_process';

async function testAdvancedInteractions() {
  console.log('🚀 Testing Advanced Browser Interaction Tools...\n');

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
        clientInfo: { name: 'advanced-test', version: '1.0.0' }
      }
    },
    // List tools to verify new ones are available
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    },
    // Load a form page for testing interactions
    {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'load_page',
        arguments: {
          url: 'https://httpbin.org/forms/post',
          waitUntil: 'domcontentloaded'
        }
      }
    },
    // Test wait_for_element
    {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'wait_for_element',
        arguments: {
          selector: 'input[name="custname"]',
          state: 'visible',
          timeout: 10000
        }
      }
    },
    // Test hover_element on the form field
    {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'hover_element',
        arguments: {
          selector: 'input[name="custname"]',
          timeout: 5000
        }
      }
    },
    // Test type_text in the customer name field
    {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'type_text',
        arguments: {
          selector: 'input[name="custname"]',
          text: 'Claude AI Assistant',
          delay: 50,
          clear: true
        }
      }
    },
    // Test press_key to tab to next field
    {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'press_key',
        arguments: {
          key: 'Tab'
        }
      }
    },
    // Type in the email field
    {
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: {
        name: 'type_text',
        arguments: {
          selector: 'input[name="custemail"]',
          text: 'claude@anthropic.com',
          clear: true
        }
      }
    },
    // Test scroll_page
    {
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/call',
      params: {
        name: 'scroll_page',
        arguments: {
          direction: 'down',
          amount: 200
        }
      }
    },
    // Take screenshot to verify interactions worked
    {
      jsonrpc: '2.0',
      id: 10,
      method: 'tools/call',
      params: {
        name: 'screenshot',
        arguments: {
          fullPage: false
        }
      }
    },
    // Test press_key with Enter to submit form
    {
      jsonrpc: '2.0',
      id: 11,
      method: 'tools/call',
      params: {
        name: 'press_key',
        arguments: {
          key: 'Enter',
          selector: 'input[type="submit"]'
        }
      }
    },
    // Test wait_for_navigation to new page
    {
      jsonrpc: '2.0',
      id: 12,
      method: 'tools/call',
      params: {
        name: 'wait_for_navigation',
        arguments: {
          timeout: 10000,
          waitUntil: 'domcontentloaded'
        }
      }
    },
    // Get current URL to verify form submission
    {
      jsonrpc: '2.0',
      id: 13,
      method: 'tools/call',
      params: {
        name: 'get_current_url',
        arguments: {}
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

  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        responseCount++;
        
        const request = tests[responseCount - 1];
        
        if (request?.method === 'tools/list') {
          totalTools = response.result?.tools?.length || 0;
          const newTools = ['type_text', 'hover_element', 'scroll_page', 'press_key', 'wait_for_element', 'wait_for_navigation'];
          const availableTools = response.result?.tools?.map(t => t.name) || [];
          const hasNewTools = newTools.every(tool => availableTools.includes(tool));
          
          console.log(`📋 Total tools available: ${totalTools}`);
          console.log(`🆕 New interaction tools present: ${hasNewTools ? '✅' : '❌'}`);
          
          if (!hasNewTools) {
            const missing = newTools.filter(tool => !availableTools.includes(tool));
            console.log(`❌ Missing: ${missing.join(', ')}`);
          }
        }
        
        if (request?.method === 'tools/call') {
          const toolName = request.params.name;
          if (response.result?.content?.[0]?.text) {
            const content = JSON.parse(response.result.content[0].text);
            results[toolName] = content.success;
            
            if (content.success) {
              console.log(`✅ ${toolName}: ${content.data?.message || 'Success'}`);
            } else {
              console.log(`❌ ${toolName}: ${content.error?.message || 'Failed'}`);
            }
          }
        }
        
        if (responseCount === tests.length) {
          const newToolsTests = ['type_text', 'hover_element', 'scroll_page', 'press_key', 'wait_for_element', 'wait_for_navigation'];
          const newToolsPassed = newToolsTests.filter(tool => results[tool]).length;
          
          console.log(`\n🎯 Advanced Interaction Results:`);
          console.log(`   📊 Total tools available: ${totalTools}`);
          console.log(`   🆕 New tools tested: ${newToolsPassed}/${newToolsTests.length}`);
          console.log(`   🏆 Success rate: ${Math.round(newToolsPassed/newToolsTests.length*100)}%`);
          
          const isSuccess = newToolsPassed === newToolsTests.length;
          console.log(`\n${isSuccess ? '🎉' : '⚠️'} Advanced Interactions: ${isSuccess ? 'READY FOR PRODUCTION' : 'NEEDS REVIEW'}`);
          
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
    await new Promise(resolve => setTimeout(resolve, i === 0 ? 1000 : 2000));
    server.stdin.write(JSON.stringify(tests[i]) + '\n');
  }

  setTimeout(() => {
    console.error('❌ Timeout after 60 seconds');
    server.kill();
    process.exit(1);
  }, 60000);
}

testAdvancedInteractions().catch(console.error);