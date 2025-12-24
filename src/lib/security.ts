/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Escape dangerous characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitizes text content but preserves line breaks
 * Useful for messages and text areas
 */
export function sanitizeTextContent(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Preserve line breaks by converting to spaces first, then back
  const withLineBreaks = input.replace(/\n/g, '{{LINE_BREAK}}');
  
  let sanitized = sanitizeInput(withLineBreaks);
  
  // Restore line breaks
  sanitized = sanitized.replace(/\{\{LINE_BREAK\}\}/g, '\n');

  return sanitized;
}

/**
 * Validates phone number format
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters except +
  let sanitized = phone.replace(/[^\d+]/g, '');

  // Limit length
  if (sanitized.length > 20) {
    sanitized = sanitized.substring(0, 20);
  }

  return sanitized;
}

/**
 * Validates and sanitizes email
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim().toLowerCase();

  if (!emailRegex.test(trimmed)) {
    return '';
  }

  // Remove dangerous characters but keep email format
  return trimmed.replace(/[<>"']/g, '');
}

/**
 * Validates URL
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Validates input length
 */
export function validateLength(
  input: string,
  min: number = 0,
  max: number = Infinity
): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  const length = input.trim().length;
  return length >= min && length <= max;
}

/**
 * Sanitizes object with string values recursively
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  deep: boolean = false
): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as T[Extract<keyof T, string>];
    } else if (deep && typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key], true) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}

