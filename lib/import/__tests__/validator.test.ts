import { describe, it, expect } from 'vitest'
import type { MappedRow } from '../types'
import { validateRow, validateRows, listingImportSchema } from '../validator'

describe('listingImportSchema', () => {
  it('should validate a complete valid row', () => {
    const validRow = {
      name: 'Test Organization',
      description: 'A test organization',
      category: 'Community',
      email: 'test@example.com',
      website: 'https://example.com',
      address: '123 Test St, Test City, TC1 2AB',
      rowNumber: 1,
    }

    const result = listingImportSchema.safeParse(validRow)
    expect(result.success).toBe(true)
  })

  it('should require name field', () => {
    const invalidRow = {
      description: 'A test organization',
      category: 'Community',
      rowNumber: 1,
    }

    const result = listingImportSchema.safeParse(invalidRow)
    expect(result.success).toBe(false)
  })

  it('should require description field', () => {
    const invalidRow = {
      name: 'Test Org',
      category: 'Community',
      rowNumber: 1,
    }

    const result = listingImportSchema.safeParse(invalidRow)
    expect(result.success).toBe(false)
    if (!result.success) {
      const descriptionError = result.error.issues.find(
        (issue) => issue.path[0] === 'description',
      )
      expect(descriptionError).toBeDefined()
    }
  })

  it('should require category field', () => {
    const invalidRow = {
      name: 'Test Org',
      description: 'A test organization',
      rowNumber: 1,
    }

    const result = listingImportSchema.safeParse(invalidRow)
    expect(result.success).toBe(false)
    if (!result.success) {
      const categoryError = result.error.issues.find(
        (issue) => issue.path[0] === 'category',
      )
      expect(categoryError).toBeDefined()
    }
  })

  it('should reject empty description', () => {
    const invalidRow = {
      name: 'Test Org',
      description: '',
      category: 'Community',
      rowNumber: 1,
    }

    const result = listingImportSchema.safeParse(invalidRow)
    expect(result.success).toBe(false)
    if (!result.success) {
      const descriptionError = result.error.issues.find(
        (issue) => issue.path[0] === 'description',
      )
      expect(descriptionError?.message).toContain('required')
    }
  })

  it('should reject empty category', () => {
    const invalidRow = {
      name: 'Test Org',
      description: 'A test organization',
      category: '',
      rowNumber: 1,
    }

    const result = listingImportSchema.safeParse(invalidRow)
    expect(result.success).toBe(false)
    if (!result.success) {
      const categoryError = result.error.issues.find(
        (issue) => issue.path[0] === 'category',
      )
      expect(categoryError?.message).toContain('required')
    }
  })

  it('should reject name longer than 255 characters', () => {
    const longName = 'A'.repeat(256)
    const invalidRow = {
      name: longName,
      description: 'A test organization',
      category: 'Community',
      rowNumber: 1,
    }

    const result = listingImportSchema.safeParse(invalidRow)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('too long')
    }
  })

  it('should reject invalid email format', () => {
    const invalidRow = {
      name: 'Test Org',
      description: 'A test organization',
      category: 'Community',
      email: 'not-an-email',
      rowNumber: 1,
    }

    const result = listingImportSchema.safeParse(invalidRow)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('email')
    }
  })

  it('should reject invalid website URL', () => {
    const invalidRow = {
      name: 'Test Org',
      description: 'A test organization',
      category: 'Community',
      website: 'not a url',
      rowNumber: 1,
    }

    const result = listingImportSchema.safeParse(invalidRow)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('URL')
    }
  })

  it('should accept optional fields as empty strings', () => {
    const validRow = {
      name: 'Test Organization',
      description: 'A test organization',
      category: 'Community',
      email: '',
      website: '',
      address: '',
      rowNumber: 1,
    }

    const result = listingImportSchema.safeParse(validRow)
    expect(result.success).toBe(true)
  })
})

describe('validateRow', () => {
  it('should return empty array for valid row', () => {
    const validRow: MappedRow = {
      name: 'Test Organization',
      description: 'A test org',
      category: 'Community',
      email: 'test@example.com',
      rowNumber: 1,
    }

    const errors = validateRow(validRow, 1)
    expect(errors).toHaveLength(0)
  })

  it('should return errors for invalid row', () => {
    const invalidRow: MappedRow = {
      name: '', // Empty name
      description: 'A test org',
      category: 'Community',
      email: 'invalid-email', // Invalid email
      rowNumber: 1,
    }

    const errors = validateRow(invalidRow, 1)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].rowNumber).toBe(1)
  })

  it('should validate social media links', () => {
    const rowWithSocialMedia: MappedRow = {
      name: 'Test Org',
      description: 'A test org',
      category: 'Community',
      socialMedia: [
        { platform: 'facebook', url: 'https://facebook.com/test' },
        { platform: 'twitter', url: 'not-a-url' }, // Invalid URL
      ],
      rowNumber: 1,
    }

    const errors = validateRow(rowWithSocialMedia, 1)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].field).toContain('socialMedia')
  })

  it('should include field name in error', () => {
    const invalidRow: MappedRow = {
      name: 'Test Org',
      description: 'A test org',
      category: 'Community',
      email: 'invalid',
      rowNumber: 5,
    }

    const errors = validateRow(invalidRow, 5)
    expect(errors[0].field).toBe('email')
    expect(errors[0].rowNumber).toBe(5)
  })
})

describe('validateRows', () => {
  it('should separate valid and invalid rows', () => {
    const rows: MappedRow[] = [
      { name: 'Valid Org 1', description: 'Desc 1', category: 'Community', rowNumber: 1 },
      { name: '', description: 'Desc 2', category: 'Community', rowNumber: 2 }, // Invalid: empty name
      { name: 'Valid Org 2', description: 'Desc 3', category: 'Community', rowNumber: 3 },
      { name: 'Org 3', description: 'Desc 4', category: 'Community', email: 'bad-email', rowNumber: 4 }, // Invalid email
    ]

    const result = validateRows(rows)

    expect(result.validRows).toHaveLength(2)
    expect(result.invalidRows.length).toBeGreaterThan(0)
    expect(result.valid).toBe(false)
  })

  it('should return valid=true when all rows are valid', () => {
    const rows: MappedRow[] = [
      { name: 'Org 1', description: 'Desc 1', category: 'Community', rowNumber: 1 },
      { name: 'Org 2', description: 'Desc 2', category: 'Community', email: 'test@example.com', rowNumber: 2 },
    ]

    const result = validateRows(rows)

    expect(result.valid).toBe(true)
    expect(result.validRows).toHaveLength(2)
    expect(result.invalidRows).toHaveLength(0)
  })

  it('should handle empty input', () => {
    const result = validateRows([])

    expect(result.valid).toBe(true)
    expect(result.validRows).toHaveLength(0)
    expect(result.invalidRows).toHaveLength(0)
  })
})
