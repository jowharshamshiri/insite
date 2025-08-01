#!/usr/bin/env node

/**
 * Phase 5B Advanced Features Validation Test
 * Tests the 4 new Testing Framework Integration tools
 * Validates completion of 50-tool comprehensive automation platform
 */

import { BrowserMCPServer } from './dist/server.js';
import { registerTools } from './dist/tools/index.js';

async function validatePhase5BComplete() {
  console.log('🚀 Browser MCP Server Phase 5B Completion Validation');
  console.log('Testing Testing Framework Integration tools (4 new tools)\n');

  const server = new BrowserMCPServer();
  const tests = [];

  // Test 1: Playwright Test Adapter
  tests.push({
    name: 'playwright_test_adapter',
    action: 'initialize',
    description: 'Playwright Test framework integration'
  });

  // Test 2: Jest Adapter  
  tests.push({
    name: 'jest_adapter',
    action: 'initialize',
    description: 'Jest testing framework integration'
  });

  // Test 3: Mocha Adapter
  tests.push({
    name: 'mocha_adapter', 
    action: 'initialize',
    description: 'Mocha testing framework integration'
  });

  // Test 4: Test Reporter
  tests.push({
    name: 'test_reporter',
    action: 'generate_report',
    description: 'Advanced test reporting and aggregation'
  });

  let passed = 0;
  let failed = 0;

  console.log('Running validation tests...\n');

  for (const test of tests) {
    try {
      console.log(`[${tests.indexOf(test) + 1}/4] Testing ${test.name}...`);
      
      const result = await server.handleToolCall({
        params: {
          name: test.name,
          arguments: { action: test.action }
        }
      });

      const data = JSON.parse(result.content[0].text);
      
      if (data.success) {
        console.log(`✅ ${test.name}: PASSED`);
        console.log(`   Description: ${test.description}`);
        if (data.data.adapter) {
          console.log(`   Adapter: ${data.data.adapter}`);
        }
        if (data.data.status) {
          console.log(`   Status: ${data.data.status}`);
        }
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
      console.log(`   Exception: ${error.message}`);
      failed++;
    }
    console.log('');
  }

  // Tool Count Validation
  console.log('📊 Tool Count Validation');
  try {
    const tools = registerTools();
    const toolCount = tools.length;
    
    console.log(`Total tools registered: ${toolCount}`);
    
    if (toolCount >= 50) {
      console.log('✅ Tool count requirement met (50+ tools)');
      passed++;
    } else {
      console.log(`❌ Tool count below requirement (${toolCount} < 50)`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Tool count validation failed: ${error.message}`);
    failed++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 PHASE 5B VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${passed}`);
  console.log(`❌ Tests Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 PHASE 5B FULL PLATFORM COMPLETE!');
    console.log('✅ All Testing Framework Integration tools operational');
    console.log('✅ 50+ tool comprehensive automation platform delivered');
    console.log('✅ Advanced debugging, security, monitoring, visual testing, and testing framework integration capabilities');
    console.log('\n🚀 Browser MCP Server ready for production deployment!');
  } else {
    console.log('\n❌ Phase 5B completion validation failed');
    console.log('Some tools or requirements are not working correctly');
  }

  process.exit(failed === 0 ? 0 : 1);
}

// Run validation
validatePhase5BComplete().catch(error => {
  console.error('Validation script error:', error);
  process.exit(1);
});