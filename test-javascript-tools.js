#!/usr/bin/env node

/**
 * Test JavaScript execution tools
 */

import { spawn } from 'child_process';

async function testJavaScriptTools() {
  console.log('🚀 Testing JavaScript Execution Tools...\n');

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
        clientInfo: { name: 'js-test', version: '1.0.0' }
      }
    },
    // List tools to verify JavaScript tools are available
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    },
    // Load a page with content for testing
    {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'load_page',
        arguments: {
          url: 'https://httpbin.org/html',
          waitUntil: 'domcontentloaded'
        }
      }
    },
    // Test basic JavaScript execution - get page info
    {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'evaluate_js',
        arguments: {
          code: 'document.title',
          timeout: 5000
        }
      }
    },
    // Test JavaScript execution - get page dimensions
    {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'evaluate_js',
        arguments: {
          code: '({ width: window.innerWidth, height: window.innerHeight, userAgent: navigator.userAgent.substring(0, 50) })',
          timeout: 5000
        }
      }
    },
    // Test JavaScript execution - count elements
    {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'evaluate_js',
        arguments: {
          code: 'document.querySelectorAll("*").length',
          timeout: 5000
        }
      }
    },
    // Test JavaScript on element - get h1 text
    {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'evaluate_js_on_element',
        arguments: {
          selector: 'h1',
          code: 'return element.textContent.trim()',
          timeout: 5000
        }
      }
    },
    // Test JavaScript on element - get element properties
    {
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: {
        name: 'evaluate_js_on_element',
        arguments: {
          selector: 'h1',
          code: 'return { tag: element.tagName, text: element.textContent, id: element.id, classes: element.className }',
          timeout: 5000
        }
      }
    },
    // Test get_element_info on h1
    {
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/call',
      params: {
        name: 'get_element_info',
        arguments: {
          selector: 'h1',
          timeout: 5000
        }
      }
    },
    // Test get_element_info on body
    {
      jsonrpc: '2.0',
      id: 10,
      method: 'tools/call',
      params: {
        name: 'get_element_info',
        arguments: {
          selector: 'body',
          timeout: 5000
        }
      }
    },
    // Test JavaScript execution - modify page (non-destructive)
    {
      jsonrpc: '2.0',
      id: 11,
      method: 'tools/call',
      params: {
        name: 'evaluate_js',
        arguments: {
          code: 'document.body.style.backgroundColor = "lightblue"; "Background color changed"',
          timeout: 5000
        }
      }
    },
    // Take screenshot to verify JavaScript modification
    {
      jsonrpc: '2.0',
      id: 12,
      method: 'tools/call',
      params: {
        name: 'screenshot',
        arguments: {
          fullPage: false
        }
      }
    },
    // Test error handling with invalid JavaScript
    {
      jsonrpc: '2.0',
      id: 13,
      method: 'tools/call',
      params: {
        name: 'evaluate_js',
        arguments: {
          code: 'this.is.invalid.javascript()',
          timeout: 5000
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
  const jsResults = [];

  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        responseCount++;
        
        const request = tests[responseCount - 1];
        
        if (request?.method === 'tools/list') {
          totalTools = response.result?.tools?.length || 0;
          const jsTools = ['evaluate_js', 'evaluate_js_on_element', 'get_element_info'];
          const availableTools = response.result?.tools?.map(t => t.name) || [];
          const hasJSTools = jsTools.every(tool => availableTools.includes(tool));
          
          console.log(`📋 Total tools available: ${totalTools}`);
          console.log(`⚡ JavaScript tools present: ${hasJSTools ? '✅' : '❌'}`);
          
          if (!hasJSTools) {
            const missing = jsTools.filter(tool => !availableTools.includes(tool));
            console.log(`❌ Missing: ${missing.join(', ')}`);
          }
        }
        
        if (request?.method === 'tools/call') {
          const toolName = request.params.name;
          if (response.result?.content?.[0]?.text) {
            const content = JSON.parse(response.result.content[0].text);
            results[toolName] = content.success;
            
            // Log JavaScript execution results
            if (content.success && (toolName === 'evaluate_js' || toolName === 'evaluate_js_on_element')) {
              const result = content.data?.result;
              const resultType = content.data?.type;
              jsResults.push({ tool: toolName, result, type: resultType });
              console.log(`✅ ${toolName}: ${typeof result === 'string' ? result : JSON.stringify(result)} (${resultType})`);
            } else if (content.success && toolName === 'get_element_info') {
              const elementInfo = content.data?.elementInfo;
              console.log(`✅ ${toolName}: ${elementInfo?.tagName} element - visible: ${elementInfo?.visible}, enabled: ${elementInfo?.enabled}`);
            } else if (content.success) {
              console.log(`✅ ${toolName}: ${content.data?.message || 'Success'}`);
            } else {
              console.log(`❌ ${toolName}: ${content.error?.message || 'Failed'}`);
              // For error testing, this might be expected
              if (toolName === 'evaluate_js' && content.error?.message?.includes('invalid')) {
                console.log(`   🎯 Expected error for invalid JavaScript - test passed!`);
                results[toolName] = true; // Mark as success since error was expected
              }
            }
          }
        }
        
        if (responseCount === tests.length) {
          const jsTools = ['evaluate_js', 'evaluate_js_on_element', 'get_element_info'];
          const jsToolsPassed = jsTools.filter(tool => results[tool]).length;
          
          console.log(`\n🎯 JavaScript Tools Results:`);
          console.log(`   📊 Total tools available: ${totalTools}`);
          console.log(`   ⚡ JavaScript tools tested: ${jsToolsPassed}/${jsTools.length}`);
          console.log(`   🏆 Success rate: ${Math.round(jsToolsPassed/jsTools.length*100)}%`);
          
          // Show JavaScript execution summary
          console.log(`\n⚡ JavaScript Execution Summary:`);
          jsResults.forEach((entry, i) => {
            const preview = typeof entry.result === 'string' ? 
              entry.result.substring(0, 50) : 
              JSON.stringify(entry.result).substring(0, 50);
            console.log(`   ${i + 1}. ${entry.tool}: ${preview} (${entry.type})`);
          });
          
          const isSuccess = jsToolsPassed === jsTools.length;
          console.log(`\n${isSuccess ? '🎉' : '⚠️'} JavaScript Tools: ${isSuccess ? 'READY FOR PRODUCTION' : 'NEEDS REVIEW'}`);
          
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

testJavaScriptTools().catch(console.error);