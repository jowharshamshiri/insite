/**
 * Security & Validation Tools for Browser MCP Server
 * 
 * Provides security-focused capabilities including CSP handling,
 * certificate management, and security validation.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Handle Content Security Policy Tool
 * Configure Content Security Policy handling and compliance checking
 */
export const handleCSPTool: Tool = {
  name: 'handle_csp',
  description: 'Configure Content Security Policy handling and compliance checking',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['bypass', 'enforce', 'report', 'check'],
        description: 'CSP action to take',
        default: 'check'
      },
      policies: {
        type: 'array',
        description: 'CSP policies to check or enforce',
        items: {
          type: 'string'
        }
      },
      bypassUnsafe: {
        type: 'boolean',
        description: 'Allow bypassing unsafe CSP directives (use with caution)',
        default: false
      },
      reportOnly: {
        type: 'boolean',
        description: 'Enable CSP report-only mode',
        default: false
      },
      violationCallback: {
        type: 'string',
        description: 'JavaScript callback for CSP violations (optional)'
      }
    },
    required: ['action']
  }
};

/**
 * Manage Certificates Tool
 * Certificate validation and custom certificate handling
 */
export const manageCertificatesTool: Tool = {
  name: 'manage_certificates',
  description: 'Certificate validation and custom certificate handling',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['validate', 'ignore', 'add_trusted', 'check_chain', 'get_info'],
        description: 'Certificate management action',
        default: 'validate'
      },
      url: {
        type: 'string',
        description: 'URL to check certificate for (required for validate, check_chain, get_info)'
      },
      certificatePath: {
        type: 'string',
        description: 'Path to certificate file (for add_trusted action)'
      },
      ignoreHTTPSErrors: {
        type: 'boolean',
        description: 'Ignore HTTPS certificate errors',
        default: false
      },
      checkExpiry: {
        type: 'boolean',
        description: 'Check certificate expiry date',
        default: true
      },
      validateChain: {
        type: 'boolean',
        description: 'Validate certificate chain',
        default: true
      }
    },
    required: ['action']
  }
};

/**
 * Validate Security Tool
 * Security validation and vulnerability scanning
 */
export const validateSecurityTool: Tool = {
  name: 'validate_security',
  description: 'Security validation and vulnerability scanning for web pages',
  inputSchema: {
    type: 'object',
    properties: {
      checks: {
        type: 'array',
        description: 'Security checks to perform',
        items: {
          type: 'string',
          enum: [
            'https_usage',
            'mixed_content',
            'insecure_forms',
            'csp_presence',
            'hsts_headers',
            'xss_protection',
            'clickjacking_protection',
            'content_type_options',
            'referrer_policy',
            'permissions_policy'
          ]
        },
        default: [
          'https_usage',
          'mixed_content',
          'csp_presence',
          'hsts_headers',
          'xss_protection'
        ]
      },
      level: {
        type: 'string',
        enum: ['basic', 'intermediate', 'advanced'],
        description: 'Security validation level',
        default: 'intermediate'
      },
      includeHeaders: {
        type: 'boolean',
        description: 'Include security header analysis',
        default: true
      },
      scanContent: {
        type: 'boolean',
        description: 'Scan page content for security issues',
        default: true
      },
      reportFormat: {
        type: 'string',
        enum: ['summary', 'detailed', 'json'],
        description: 'Security report format',
        default: 'detailed'
      }
    },
    required: []
  }
};

/**
 * All security tools export
 */
export const securityTools = [
  handleCSPTool,
  manageCertificatesTool,
  validateSecurityTool
];