/**
 * Validation logic for CSV import data using Zod schemas
 */

import { z } from "zod";
import type {
  MappedRow,
  RowValidationError,
  ValidationResult,
} from "./types";

/**
 * Zod schema for a single listing import row
 */
export const listingImportSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email is too long")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Invalid website URL")
    .max(500, "Website URL is too long")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(50, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(500, "Address is too long")
    .optional()
    .or(z.literal("")),
  rowNumber: z.number().int().positive(),
});

/**
 * Zod schema for social media URL
 */
export const socialMediaSchema = z.object({
  platform: z.enum(["facebook", "twitter", "instagram", "linkedin", "youtube"]),
  url: z.string().url("Invalid social media URL").max(500, "URL is too long"),
});

/**
 * Validate a single row of data
 */
export function validateRow(
  row: MappedRow,
  rowNumber: number
): RowValidationError[] {
  const errors: RowValidationError[] = [];

  // Validate main fields
  const result = listingImportSchema.safeParse({
    ...row,
    rowNumber,
  });

  if (!result.success) {
    result.error.issues.forEach((error) => {
      errors.push({
        rowNumber,
        field: error.path.join("."),
        message: error.message,
        value: error.path.length > 0 ? String(row[error.path[0] as keyof MappedRow]) : undefined,
      });
    });
  }

  // Validate social media links
  if (row.socialMedia && row.socialMedia.length > 0) {
    row.socialMedia.forEach((social, index) => {
      const socialResult = socialMediaSchema.safeParse(social);
      if (!socialResult.success) {
        socialResult.error.issues.forEach((error) => {
          errors.push({
            rowNumber,
            field: `socialMedia[${index}].${error.path.join(".")}`,
            message: error.message,
            value: social.url,
          });
        });
      }
    });
  }

  return errors;
}

/**
 * Validate all rows and return validation result
 */
export function validateRows(rows: MappedRow[]): ValidationResult {
  const invalidRows: RowValidationError[] = [];
  const validRows: MappedRow[] = [];

  rows.forEach((row) => {
    const errors = validateRow(row, row.rowNumber);

    if (errors.length > 0) {
      invalidRows.push(...errors);
    } else {
      validRows.push(row);
    }
  });

  return {
    valid: invalidRows.length === 0,
    validRows,
    invalidRows,
    totalErrors: invalidRows.length,
  };
}

/**
 * Validate that required fields are mapped
 */
export function validateRequiredFieldsMapped(
  columnMapping: Record<string, string | null>
): { valid: boolean; missingFields: string[] } {
  const requiredFields = ["name"];
  const mappedFields = Object.values(columnMapping).filter(
    (field) => field !== null
  );

  const missingFields = requiredFields.filter(
    (field) => !mappedFields.includes(field)
  );

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Sanitize string value (trim, remove extra whitespace)
 */
export function sanitizeString(value: string | undefined | null): string {
  if (!value) return "";
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(
  url: string | undefined | null
): string | undefined {
  if (!url) return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Add https:// if no protocol specified
  if (!trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

/**
 * Validate email format (basic check)
 */
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Check if value is empty (null, undefined, or whitespace-only string)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  return false;
}
