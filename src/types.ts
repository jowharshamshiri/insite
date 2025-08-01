/**
 * Type definitions for Browser MCP Server
 */

/**
 * Browser automation tool categories
 */
export type ToolCategory = 
  | 'navigation'
  | 'visual' 
  | 'dom'
  | 'interaction'
  | 'javascript'
  | 'wait'
  | 'configuration'
  | 'console';

/**
 * Browser automation error types
 */
export type BrowserErrorType =
  | 'BROWSER_NOT_INITIALIZED'
  | 'BROWSER_NOT_SUPPORTED'
  | 'PAGE_NOT_LOADED'
  | 'ELEMENT_NOT_FOUND'
  | 'NAVIGATION_FAILED'
  | 'TIMEOUT_ERROR'
  | 'JAVASCRIPT_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_URL'
  | 'INVALID_SELECTOR'
  | 'FILE_OPERATION_ERROR';

/**
 * Custom error class for browser automation operations
 */
export class BrowserAutomationError extends Error {
  constructor(
    public readonly type: BrowserErrorType,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BrowserAutomationError';
  }
}

/**
 * Tool result wrapper for consistent response format
 */
export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    type: BrowserErrorType;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Screenshot capture options
 */
export interface ScreenshotOptions {
  fullPage?: boolean;
  quality?: number;
  type?: 'png' | 'jpeg';
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Viewport information
 */
export interface ViewportInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
}

/**
 * Element information
 */
export interface ElementInfo {
  tagName: string;
  id?: string;
  className?: string;
  textContent?: string;
  visible: boolean;
  enabled: boolean;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Wait condition types
 */
export type WaitCondition = 
  | 'load'
  | 'domcontentloaded'
  | 'networkidle'
  | 'commit';

/**
 * Click options
 */
export interface ClickOptions {
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  delay?: number;
  force?: boolean;
  modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>;
  position?: { x: number; y: number };
  timeout?: number;
}