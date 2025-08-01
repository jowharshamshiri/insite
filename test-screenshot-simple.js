#!/usr/bin/env node

/**
 * Simple test for new screenshot methods
 */

import { BrowserManager } from './dist/browser-manager.js';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import os from 'os';

async function testNewScreenshotMethods() {
  console.log('🧪 Testing new screenshot methods...');
  
  const browserManager = BrowserManager.getInstance();
  const tempDir = path.join(os.tmpdir(), 'insite-test');
  
  // Ensure temp directory exists
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }
  
  try {
    // Initialize browser
    await browserManager.initialize();
    console.log('✅ Browser initialized');
    
    // Load a test page with longer timeout
    await browserManager.navigateToUrl('https://httpbin.org/html');
    console.log('✅ Page loaded');
    
    // Test 1: Scroll to element and screenshot
    const elementScreenshotPath = path.join(tempDir, 'element-test.png');
    try {
      await browserManager.scrollToElementAndScreenshot('h1', {
        filePath: elementScreenshotPath,
        format: 'png'
      });
      
      if (existsSync(elementScreenshotPath)) {
        console.log('✅ Element screenshot method works');
        console.log(`   📸 Screenshot saved: ${elementScreenshotPath}`);
      } else {
        console.log('❌ Element screenshot file not created');
      }
    } catch (error) {
      console.log(`❌ Element screenshot failed: ${error.message}`);
    }
    
    // Test 2: Capture full scrollable page
    const fullPageScreenshotPath = path.join(tempDir, 'fullpage-test.png');
    try {
      await browserManager.captureFullScrollablePage({
        filePath: fullPageScreenshotPath,
        format: 'png'
      });
      
      if (existsSync(fullPageScreenshotPath)) {
        console.log('✅ Full page screenshot method works');
        console.log(`   📸 Screenshot saved: ${fullPageScreenshotPath}`);
      } else {
        console.log('❌ Full page screenshot file not created');
      }
    } catch (error) {
      console.log(`❌ Full page screenshot failed: ${error.message}`);
    }
    
    console.log('\n🎉 Screenshot methods test completed');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  } finally {
    try {
      await browserManager.close();
      console.log('✅ Browser closed');
    } catch (error) {
      console.log('⚠️ Error closing browser:', error.message);
    }
  }
}

testNewScreenshotMethods().catch(console.error);