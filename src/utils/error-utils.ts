/**
 * Error handling utilities for Browser MCP Server
 */

import { BrowserAutomationError, type BrowserErrorType } from '../types.js';

/**
 * Wrap async operations with timeout and error handling
 */
export async function withTimeout<T>(
  operation: Promise<T>,
  timeout: number,
  errorMessage: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new BrowserAutomationError('TIMEOUT_ERROR', `${errorMessage} (timeout: ${timeout}ms)`));
    }, timeout);
  });

  try {
    return await Promise.race([operation, timeoutPromise]);
  } catch (error) {
    if (error instanceof BrowserAutomationError) {
      throw error;
    }
    throw new BrowserAutomationError(
      'JAVASCRIPT_ERROR',
      `${errorMessage}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalError: error }
    );
  }
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new BrowserAutomationError(
      'INVALID_URL',
      `Invalid URL format: ${url}`,
      { url }
    );
  }
}

/**
 * Validate CSS selector format
 */
export function validateSelector(selector: string): void {
  if (!selector || selector.trim().length === 0) {
    throw new BrowserAutomationError(
      'INVALID_SELECTOR',
      'CSS selector cannot be empty',
      { selector }
    );
  }

  // Basic validation for common selector issues
  if (selector.includes('..') || selector.includes('//')) {
    throw new BrowserAutomationError(
      'INVALID_SELECTOR',
      'CSS selector contains invalid characters',
      { selector }
    );
  }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  type: BrowserErrorType,
  message: string,
  details?: Record<string, unknown>
) {
  return {
    success: false as const,
    error: {
      type,
      message,
      ...(details ? { details } : {}),
    },
  };
}

/**
 * Handle Playwright errors and convert to BrowserAutomationError
 */
export function handlePlaywrightError(error: unknown, context: string): BrowserAutomationError {
  if (error instanceof BrowserAutomationError) {
    return error;
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  // Map common Playwright errors to specific types
  if (errorMessage.includes('Target page, context or browser has been closed')) {
    return new BrowserAutomationError(
      'BROWSER_NOT_INITIALIZED',
      `${context}: Browser connection lost`,
      { originalError: error }
    );
  }

  if (errorMessage.includes('Timeout') || errorMessage.includes('timeout')) {
    return new BrowserAutomationError(
      'TIMEOUT_ERROR',
      `${context}: Operation timed out - ${errorMessage}`,
      { originalError: error }
    );
  }

  if (errorMessage.includes('waiting for locator') || errorMessage.includes('not found')) {
    return new BrowserAutomationError(
      'ELEMENT_NOT_FOUND',
      `${context}: Element not found - ${errorMessage}`,
      { originalError: error }
    );
  }

  if (errorMessage.includes('Navigation failed') || errorMessage.includes('net::')) {
    return new BrowserAutomationError(
      'NAVIGATION_FAILED',
      `${context}: Navigation failed - ${errorMessage}`,
      { originalError: error }
    );
  }

  return new BrowserAutomationError(
    'JAVASCRIPT_ERROR',
    `${context}: ${errorMessage}`,
    { originalError: error }
  );
}