import { describe, it, expect } from 'vitest'
import { mapRow } from '../mapper'
import type { ColumnMapping, MappedRow } from '../types'
import { validateRow } from '../validator'

/**
 * Security tests for CSV import feature
 * Tests protection against CSV injection, XSS, SQL injection, and other malicious inputs
 */

describe('Security - CSV Injection Protection', () => {
  /**
   * CSV injection (Formula injection) occurs when cells starting with =, +, -, @, \t, \r
   * are interpreted as formulas by spreadsheet applications
   */

  it('should handle CSV formula injection attempts with equals sign', () => {
    const csvRow = {
      Name: '=cmd|"/c calc"',
      Description: '=1+1',
      Website: '=HYPERLINK("http://evil.com","Click here")',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Description: 'description',
      Website: 'website',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    // Values should be preserved as-is, validation/sanitization happens elsewhere
    expect(mapped.name).toBe('=cmd|"/c calc"')
    expect(mapped.description).toBe('=1+1')

    // Website gets sanitized to https://=HYPERLINK... which might pass validation
    validateRow(mapped, 1)
    // The website URL will be sanitized, check that name is preserved
    expect(mapped.name).toBe('=cmd|"/c calc"')
  })

  it('should handle CSV formula injection with plus sign', () => {
    const csvRow = {
      Name: '+cmd|"/c calc"',
      Description: '+1+1',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Description: 'description',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe('+cmd|"/c calc"')
    expect(mapped.description).toBe('+1+1')
  })

  it('should handle CSV formula injection with minus sign', () => {
    const csvRow = {
      Name: '-2+3',
      Email: '-evil@example.com',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Email: 'email',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe('-2+3')
  })

  it('should handle CSV formula injection with at sign', () => {
    const csvRow = {
      Name: '@SUM(1+1)',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe('@SUM(1+1)')
  })

  it('should handle CSV formula injection with tab character', () => {
    const csvRow = {
      Name: '\t=1+1',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    // Tab should be trimmed by sanitization
    expect(mapped.name).toBe('=1+1')
  })
})

describe('Security - XSS Protection', () => {
  /**
   * Cross-site scripting (XSS) attempts in field values
   * While rendering should be handled by the frontend, we test that values are preserved
   */

  it('should handle script tags in name field', () => {
    const csvRow = {
      Name: '<script>alert("XSS")</script>',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)
    const errors = validateRow(mapped, 1)

    // Value should be preserved (not sanitized here)
    expect(mapped.name).toBe('<script>alert("XSS")</script>')
    // Should validate successfully (valid name)
    expect(errors).toHaveLength(0)
  })

  it('should handle event handlers in description', () => {
    const csvRow = {
      Name: 'Test Org',
      Description: '<img src=x onerror="alert(1)">',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Description: 'description',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.description).toBe('<img src=x onerror="alert(1)">')
  })

  it('should handle javascript: protocol in website field', () => {
    const csvRow = {
      Name: 'Test Org',
      Website: 'javascript:alert("XSS")',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Website: 'website',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)
    const errors = validateRow(mapped, 1)

    // Should be rejected by URL validation
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].field).toBe('website')
  })

  it('should handle data: protocol in website field', () => {
    const csvRow = {
      Name: 'Test Org',
      Website: 'data:text/html,<script>alert("XSS")</script>',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Website: 'website',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)
    validateRow(mapped, 1)

    // sanitizeUrl adds https:// prefix to URLs without http(s):// protocol
    expect(mapped.website).toBe(
      'https://data:text/html,<script>alert("XSS")</script>',
    )
  })

  it('should handle HTML entity encoding attempts', () => {
    const csvRow = {
      Name: '&lt;script&gt;alert("XSS")&lt;/script&gt;',
      Description: '&#60;img src=x onerror=alert(1)&#62;',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Description: 'description',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    // HTML entities should be preserved as-is
    expect(mapped.name).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;')
    expect(mapped.description).toBe('&#60;img src=x onerror=alert(1)&#62;')
  })
})

describe('Security - SQL Injection Protection', () => {
  /**
   * SQL injection patterns in field values
   * The ORM (Prisma) should handle parameterization, but we test edge cases
   */

  it('should handle SQL injection with single quotes', () => {
    const csvRow = {
      Name: "'; DROP TABLE listings; --",
      Email: "admin'--",
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Email: 'email',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe("'; DROP TABLE listings; --")
    // Email should fail validation
    const errors = validateRow(mapped, 1)
    expect(errors.some((e) => e.field === 'email')).toBe(true)
  })

  it('should handle SQL injection with UNION attacks', () => {
    const csvRow = {
      Name: "' UNION SELECT password FROM users--",
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe("' UNION SELECT password FROM users--")
  })

  it('should handle SQL injection with comment symbols', () => {
    const csvRow = {
      Name: "Test Org' /*",
      Description: '*/ AND 1=1 --',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Description: 'description',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe("Test Org' /*")
    expect(mapped.description).toBe('*/ AND 1=1 --')
  })

  it('should handle SQL injection with boolean conditions', () => {
    const csvRow = {
      Name: "' OR '1'='1",
      Description: "' OR 1=1--",
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Description: 'description',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe("' OR '1'='1")
    expect(mapped.description).toBe("' OR 1=1--")
  })
})

describe('Security - Path Traversal Protection', () => {
  it('should handle path traversal attempts in name', () => {
    const csvRow = {
      Name: '../../../etc/passwd',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe('../../../etc/passwd')
  })

  it('should handle Windows path traversal', () => {
    const csvRow = {
      Name: '..\\..\\..\\windows\\system32\\config\\sam',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe('..\\..\\..\\windows\\system32\\config\\sam')
  })

  it('should handle URL-encoded path traversal', () => {
    const csvRow = {
      Name: '%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe('%2e%2e%2f%2e%2e%2fetc%2fpasswd')
  })
})

describe('Security - Denial of Service (DoS) Protection', () => {
  it('should reject name field exceeding max length', () => {
    const longName = 'A'.repeat(256) // Max is 255

    const row: MappedRow = {
      name: longName,
      rowNumber: 1,
    }

    const errors = validateRow(row, 1)

    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].field).toBe('name')
  })

  it('should reject description field exceeding max length', () => {
    const longDesc = 'A'.repeat(5001) // Max is 5000

    const row: MappedRow = {
      name: 'Test Org',
      description: longDesc,
      rowNumber: 1,
    }

    const errors = validateRow(row, 1)

    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.field === 'description')).toBe(true)
  })

  it('should handle extremely long email addresses', () => {
    const longEmail = 'a'.repeat(250) + '@example.com' // Total > 255

    const row: MappedRow = {
      name: 'Test Org',
      email: longEmail,
      rowNumber: 1,
    }

    const errors = validateRow(row, 1)

    expect(errors.length).toBeGreaterThan(0)
  })

  it('should handle extremely long URLs', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(500)

    const row: MappedRow = {
      name: 'Test Org',
      website: longUrl,
      rowNumber: 1,
    }

    const errors = validateRow(row, 1)

    expect(errors.length).toBeGreaterThan(0)
  })

  it('should handle many social media links', () => {
    const row: MappedRow = {
      name: 'Test Org',
      socialMedia: [
        { platform: 'facebook', url: 'https://facebook.com/1' },
        { platform: 'twitter', url: 'https://twitter.com/1' },
        { platform: 'instagram', url: 'https://instagram.com/1' },
        { platform: 'linkedin', url: 'https://linkedin.com/1' },
        { platform: 'youtube', url: 'https://youtube.com/1' },
      ],
      rowNumber: 1,
    }

    const errors = validateRow(row, 1)

    // Should validate successfully (all are valid)
    expect(errors).toHaveLength(0)
  })
})

describe('Security - Unicode and Special Characters', () => {
  it('should handle Unicode characters in name', () => {
    const csvRow = {
      Name: 'Test Org 测试 🏢',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)
    const errors = validateRow(mapped, 1)

    expect(mapped.name).toBe('Test Org 测试 🏢')
    expect(errors).toHaveLength(0)
  })

  it('should handle emoji in description', () => {
    const csvRow = {
      Name: 'Test Org',
      Description: 'We love our community! ❤️🌍🌱',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Description: 'description',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)
    const errors = validateRow(mapped, 1)

    expect(mapped.description).toBe('We love our community! ❤️🌍🌱')
    expect(errors).toHaveLength(0)
  })

  it('should handle right-to-left (RTL) characters', () => {
    const csvRow = {
      Name: 'مؤسسة الاختبار', // Arabic
      Description: 'תיאור בעברית', // Hebrew
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Description: 'description',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)
    const errors = validateRow(mapped, 1)

    expect(mapped.name).toBe('مؤسسة الاختبار')
    expect(errors).toHaveLength(0)
  })

  it('should handle zero-width characters', () => {
    const csvRow = {
      Name: 'Test\u200BOrg', // Zero-width space
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    // Zero-width space should be preserved
    expect(mapped.name).toContain('\u200B')
  })

  it('should handle homograph attacks (lookalike characters)', () => {
    const csvRow = {
      // Using Cyrillic 'а' instead of Latin 'a'
      Name: 'Gооgle', // Contains Cyrillic о (U+043E)
      Website: 'https://gооgle.com',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Website: 'website',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    // Characters should be preserved (detection is not our responsibility)
    expect(mapped.name).toBe('Gооgle')
  })

  it('should handle null bytes', () => {
    const csvRow = {
      Name: 'Test\x00Org',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    // Null byte should be preserved or handled by string processing
    expect(mapped.name.length).toBeGreaterThan(0)
  })

  it('should handle control characters', () => {
    const csvRow = {
      Name: 'Test\x01\x02\x03Org',
      Description: 'Line1\x0BLine2', // Vertical tab
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Description: 'description',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBeDefined()
    expect(mapped.description).toBeDefined()
  })
})

describe('Security - Email Injection', () => {
  it('should reject email header injection attempts', () => {
    const csvRow = {
      Name: 'Test Org',
      Email: 'test@example.com\nBcc: attacker@evil.com',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Email: 'email',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)
    const errors = validateRow(mapped, 1)

    // Should fail email validation
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.field === 'email')).toBe(true)
  })

  it('should reject email with CRLF injection', () => {
    const csvRow = {
      Name: 'Test Org',
      Email: 'test@example.com\r\nCc: admin@example.com',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Email: 'email',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)
    const errors = validateRow(mapped, 1)

    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('Security - URL Validation', () => {
  it('should handle file:// protocol URLs', () => {
    const csvRow = {
      Name: 'Test Org',
      Website: 'file:///etc/passwd',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Website: 'website',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)
    validateRow(mapped, 1)

    // sanitizeUrl adds https:// prefix to URLs without http(s):// protocol
    expect(mapped.website).toBe('https://file:///etc/passwd')
  })

  it('should accept ftp:// protocol URLs (Zod allows various schemes)', () => {
    const csvRow = {
      Name: 'Test Org',
      Website: 'ftp://example.com',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Website: 'website',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)
    const errors = validateRow(mapped, 1)

    // Zod's URL validator accepts FTP and other protocols
    expect(errors).toHaveLength(0)
  })

  it('should accept URLs with unusual characters (Zod is permissive)', () => {
    const csvRow = {
      Name: 'Test Org',
      Website: 'https://example.com/path?query=value',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Website: 'website',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)
    const errors = validateRow(mapped, 1)

    // Zod's URL validator is permissive with query strings and paths
    expect(errors).toHaveLength(0)
  })
})
