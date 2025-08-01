#!/usr/bin/env node

/**
 * Cleanup script for temporary files generated during testing
 */

import { rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const tempDir = join(projectRoot, 'temp');

console.log('🧹 Cleaning up temporary files...');

try {
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true });
    console.log('✅ Temporary files cleaned up successfully');
  } else {
    console.log('✅ No temporary files to clean up');
  }
} catch (error) {
  console.error('❌ Error cleaning up temporary files:', error.message);
  process.exit(1);
}