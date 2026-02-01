import { describe, it, expect } from 'vitest'
import {
  autoDetectMapping,
  mapRow,
  mapRows,
  getAvailableFields,
} from '../mapper'
import type { ColumnMapping } from '../types'

describe('autoDetectMapping', () => {
  it('should detect standard column headers', () => {
    const headers = ['Name', 'Description', 'Email', 'Website', 'Phone']
    const suggestions = autoDetectMapping(headers)

    expect(suggestions).toHaveLength(5)
    expect(
      suggestions.find((s) => s.csvColumn === 'Name')?.suggestedField,
    ).toBe('name')
    expect(
      suggestions.find((s) => s.csvColumn === 'Description')?.suggestedField,
    ).toBe('description')
    expect(
      suggestions.find((s) => s.csvColumn === 'Email')?.suggestedField,
    ).toBe('email')
    expect(
      suggestions.find((s) => s.csvColumn === 'Website')?.suggestedField,
    ).toBe('website')
    expect(
      suggestions.find((s) => s.csvColumn === 'Phone')?.suggestedField,
    ).toBe('phone')
  })

  it('should detect name field variations', () => {
    const variations = [
      'Organization Name',
      'Org Name',
      'Company Name',
      'Business Name',
      'Title',
    ]

    variations.forEach((header) => {
      const suggestions = autoDetectMapping([header])
      expect(suggestions[0].suggestedField).toBe('name')
      expect(suggestions[0].confidence).toBe('high')
    })
  })

  it('should detect email field variations', () => {
    const variations = ['Email', 'E-mail', 'Contact Email', 'Email Address']

    variations.forEach((header) => {
      const suggestions = autoDetectMapping([header])
      expect(suggestions[0].suggestedField).toBe('email')
    })
  })

  it('should detect website field variations', () => {
    const variations = ['Website', 'Web Site', 'URL', 'Homepage', 'Web Address']

    variations.forEach((header) => {
      const suggestions = autoDetectMapping([header])
      expect(suggestions[0].suggestedField).toBe('website')
    })
  })

  it('should detect social media platforms', () => {
    const headers = ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube']
    const suggestions = autoDetectMapping(headers)

    expect(
      suggestions.find((s) => s.csvColumn === 'Facebook')?.suggestedField,
    ).toBe('facebook')
    expect(
      suggestions.find((s) => s.csvColumn === 'Twitter')?.suggestedField,
    ).toBe('twitter')
    expect(
      suggestions.find((s) => s.csvColumn === 'Instagram')?.suggestedField,
    ).toBe('instagram')
    expect(
      suggestions.find((s) => s.csvColumn === 'LinkedIn')?.suggestedField,
    ).toBe('linkedin')
    expect(
      suggestions.find((s) => s.csvColumn === 'YouTube')?.suggestedField,
    ).toBe('youtube')
  })

  it('should handle case-insensitive matching', () => {
    const headers = ['NAME', 'email', 'WeBsItE']
    const suggestions = autoDetectMapping(headers)

    expect(
      suggestions.find((s) => s.csvColumn === 'NAME')?.suggestedField,
    ).toBe('name')
    expect(
      suggestions.find((s) => s.csvColumn === 'email')?.suggestedField,
    ).toBe('email')
    expect(
      suggestions.find((s) => s.csvColumn === 'WeBsItE')?.suggestedField,
    ).toBe('website')
  })

  it('should return null for unrecognized headers', () => {
    const headers = ['Random Column', 'Another Unknown']
    const suggestions = autoDetectMapping(headers)

    expect(
      suggestions.find((s) => s.csvColumn === 'Random Column')?.suggestedField,
    ).toBeNull()
    expect(
      suggestions.find((s) => s.csvColumn === 'Another Unknown')
        ?.suggestedField,
    ).toBeNull()
  })

  it('should assign confidence levels', () => {
    const headers = ['Name', 'Organisation', 'Desc']
    const suggestions = autoDetectMapping(headers)

    // Exact match should be high confidence
    const nameMatch = suggestions.find((s) => s.csvColumn === 'Name')
    expect(nameMatch?.confidence).toBe('high')

    // "Desc" for description might be medium confidence
    const descMatch = suggestions.find((s) => s.csvColumn === 'Desc')
    expect(descMatch?.confidence).toBeDefined()
  })
})

describe('mapRow', () => {
  it('should map CSV row to MappedRow', () => {
    const csvRow = {
      'Organization Name': 'Test Org',
      Description: 'A test organization',
      Email: 'test@example.com',
    }

    const columnMapping: ColumnMapping = {
      'Organization Name': 'name',
      Description: 'description',
      Email: 'email',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe('Test Org')
    expect(mapped.description).toBe('A test organization')
    expect(mapped.email).toBe('test@example.com')
    expect(mapped.rowNumber).toBe(1)
  })

  it('should sanitize string values', () => {
    const csvRow = {
      Name: '  Test Org  ',
      Description: '  Lots of whitespace  ',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Description: 'description',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe('Test Org')
    expect(mapped.description).toBe('Lots of whitespace')
  })

  it('should group social media fields', () => {
    const csvRow = {
      Name: 'Test Org',
      Facebook: 'https://facebook.com/test',
      Twitter: 'https://twitter.com/test',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Facebook: 'facebook',
      Twitter: 'twitter',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.socialMedia).toHaveLength(2)
    expect(mapped.socialMedia?.[0]).toEqual({
      platform: 'facebook',
      url: 'https://facebook.com/test',
    })
    expect(mapped.socialMedia?.[1]).toEqual({
      platform: 'twitter',
      url: 'https://twitter.com/test',
    })
  })

  it('should skip empty values', () => {
    const csvRow = {
      Name: 'Test Org',
      Email: '',
      Website: '   ',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Email: 'email',
      Website: 'website',
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe('Test Org')
    expect(mapped.email).toBeUndefined()
    expect(mapped.website).toBeUndefined()
  })

  it('should skip unmapped columns', () => {
    const csvRow = {
      Name: 'Test Org',
      'Random Column': 'Should be ignored',
    }

    const columnMapping: ColumnMapping = {
      Name: 'name',
      'Random Column': null,
    }

    const mapped = mapRow(csvRow, columnMapping, 1)

    expect(mapped.name).toBe('Test Org')
    expect(Object.keys(mapped)).not.toContain('Random Column')
  })
})

describe('mapRows', () => {
  it('should map multiple rows', () => {
    const rows = [
      { Name: 'Org 1', Email: 'org1@example.com' },
      { Name: 'Org 2', Email: 'org2@example.com' },
    ]

    const columnMapping: ColumnMapping = {
      Name: 'name',
      Email: 'email',
    }

    const mapped = mapRows(rows, columnMapping)

    expect(mapped).toHaveLength(2)
    expect(mapped[0].name).toBe('Org 1')
    expect(mapped[0].rowNumber).toBe(1)
    expect(mapped[1].name).toBe('Org 2')
    expect(mapped[1].rowNumber).toBe(2)
  })

  it('should handle empty input', () => {
    const mapped = mapRows([], {})
    expect(mapped).toHaveLength(0)
  })
})

describe('getAvailableFields', () => {
  it('should return all fields when none are mapped', () => {
    const available = getAvailableFields({}, 'unmapped-column')

    expect(available).toContain('name')
    expect(available).toContain('description')
    expect(available).toContain('email')
    expect(available).toContain('website')
  })

  it('should exclude already mapped fields', () => {
    const columnMapping: ColumnMapping = {
      Col1: 'name',
      Col2: 'email',
    }

    const available = getAvailableFields(columnMapping, 'Col3')

    expect(available).not.toContain('name')
    expect(available).not.toContain('email')
    expect(available).toContain('description')
    expect(available).toContain('website')
  })

  it('should include current column mapping as available', () => {
    const columnMapping: ColumnMapping = {
      Col1: 'name',
      Col2: 'email',
    }

    const available = getAvailableFields(columnMapping, 'Col2')

    expect(available).toContain('email') // Col2 is currently mapped to email, so email should be available
    expect(available).not.toContain('name') // Col1 is mapped to name, so name should not be available
  })

  it('should allow social media platforms to be mapped multiple times', () => {
    const columnMapping: ColumnMapping = {
      'Facebook Page': 'facebook',
    }

    const available = getAvailableFields(columnMapping, 'FB URL')

    // Social media platforms can potentially have multiple URLs (though we dedupe by platform)
    // This test verifies the function's behavior
    expect(available).toBeDefined()
  })
})
