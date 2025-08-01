/**
 * Text cleaning utilities for removing unwanted characters and formatting
 */

export class TextCleaner {
  /**
   * Remove newline characters and normalize whitespace
   */
  static removeNewlines(text: string): string {
    return text
      .replace(/\n/g, ' ')           // Replace newlines with spaces
      .replace(/\r/g, ' ')           // Replace carriage returns with spaces
      .replace(/\s+/g, ' ')          // Replace multiple spaces with single space
      .trim();                       // Remove leading/trailing whitespace
  }

  /**
   * Clean and normalize text with various regex patterns
   */
  static cleanText(text: string): string {
    return text
      .replace(/\n/g, ' ')                    // Remove newlines
      .replace(/\r/g, ' ')                    // Remove carriage returns
      .replace(/\t/g, ' ')                    // Replace tabs with spaces
      .replace(/\s+/g, ' ')                   // Normalize multiple spaces
      .replace(/[""]/g, '"')                  // Normalize quotes
      .replace(/['']/g, "'")                  // Normalize apostrophes
      .replace(/…/g, '...')                   // Replace ellipsis
      .replace(/–/g, '-')                     // Replace en-dash
      .replace(/—/g, '-')                     // Replace em-dash
      .replace(/\u00A0/g, ' ')                // Replace non-breaking spaces
      .replace(/[\u2000-\u200B]/g, ' ')       // Replace various Unicode spaces
      .trim();
  }

  /**
   * Clean response text specifically for API responses
   */
  static cleanResponse(text: string): string {
    return text
      .replace(/\n+/g, ' ')                   // Replace multiple newlines with space
      .replace(/\r+/g, ' ')                   // Replace multiple carriage returns
      .replace(/\s*\n\s*/g, ' ')              // Remove newlines with surrounding spaces
      .replace(/\s{2,}/g, ' ')                // Replace 2+ spaces with single space
      .replace(/^\s+|\s+$/g, '')              // Trim start and end
      .replace(/\s+([.!?])/g, '$1')           // Remove space before punctuation
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Ensure space after sentence endings
      .trim();
  }

  /**
   * Clean structured data fields
   */
  static cleanStructuredData(obj: any): any {
    if (typeof obj === 'string') {
      return this.cleanResponse(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanStructuredData(item));
    }
    
    if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        cleaned[key] = this.cleanStructuredData(value);
      }
      return cleaned;
    }
    
    return obj;
  }

  /**
   * Remove specific patterns from text
   */
  static removePatterns(text: string, patterns: RegExp[]): string {
    let cleaned = text;
    patterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    return cleaned.trim();
  }

  /**
   * Normalize email formatting in responses
   */
  static normalizeEmailFormat(text: string): string {
    return text
      .replace(/Subject:\s*\n/g, 'Subject: ')
      .replace(/\n\nHello\s+/g, ' Hello ')
      .replace(/\n\nThank you/g, ' Thank you')
      .replace(/\n\nBest regards,?\s*\n/g, ' Best regards, ')
      .replace(/\n\n/g, ' ')
      .replace(/\n/g, ' ')
      .trim();
  }
}

/**
 * Regex patterns for common cleaning operations
 */
export const CLEANING_PATTERNS = {
  // Remove email headers and signatures
  EMAIL_HEADERS: /^(Subject:|From:|To:|Date:).*$/gm,
  
  // Remove excessive whitespace
  EXCESSIVE_WHITESPACE: /\s{3,}/g,
  
  // Remove line breaks in the middle of sentences
  MID_SENTENCE_BREAKS: /([a-z,])\n([a-z])/g,
  
  // Remove formatting artifacts
  FORMATTING_ARTIFACTS: /[\u200B-\u200D\uFEFF]/g,
  
  // Clean up bullet points
  BULLET_POINTS: /^\s*[-•*]\s*/gm,
  
  // Remove extra periods
  EXTRA_PERIODS: /\.{2,}/g
};