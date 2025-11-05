# Requirements Document

## Introduction

This feature replaces the existing magic link authentication system with Email OTP (One-Time Password) authentication using Better Auth. Users will receive a 6-digit code via email instead of a magic link, providing a more modern and streamlined authentication experience. The implementation will maintain backward compatibility with the existing database schema and user experience flow.

## Glossary

- **Authentication System**: The Better Auth-based system that manages user authentication and sessions
- **Email OTP**: Email-based One-Time Password authentication method where users receive a numeric code
- **Magic Link**: The current authentication method where users receive a clickable link via email
- **OTP Code**: A 6-digit numeric code sent to the user's email for authentication
- **Verification Page**: The page where users enter their OTP code after submitting their email
- **Auth Client**: The client-side Better Auth instance used for authentication operations
- **Auth Server**: The server-side Better Auth configuration in app/auth.ts

## Requirements

### Requirement 1

**User Story:** As a user, I want to sign in using an OTP code sent to my email, so that I can authenticate quickly without clicking email links

#### Acceptance Criteria

1. WHEN a user submits their email on the sign-in page, THE Authentication System SHALL send a 6-digit OTP code to the provided email address
2. WHEN the OTP is sent successfully, THE Authentication System SHALL redirect the user to the verification page
3. WHEN a user enters a valid OTP code, THE Authentication System SHALL authenticate the user and redirect them to the callback URL
4. IF the OTP code is invalid or expired, THEN THE Authentication System SHALL display an error message to the user
5. THE Authentication System SHALL expire OTP codes after 5 minutes from generation

### Requirement 2

**User Story:** As a user, I want to sign up using an OTP code sent to my email, so that I can create an account without clicking email links

#### Acceptance Criteria

1. WHEN a new user submits their email on the sign-up page, THE Authentication System SHALL send a 6-digit OTP code to the provided email address
2. WHEN the OTP is sent successfully, THE Authentication System SHALL redirect the user to the verification page
3. WHEN a new user enters a valid OTP code, THE Authentication System SHALL create a new user account and authenticate them
4. THE Authentication System SHALL redirect authenticated new users to the callback URL after successful verification
5. WHERE a user account already exists with the provided email, THE Authentication System SHALL allow sign-in using the OTP code

### Requirement 3

**User Story:** As a user, I want to receive a well-formatted OTP email, so that I can easily identify and use the code

#### Acceptance Criteria

1. THE Authentication System SHALL send OTP emails with a clear subject line indicating the purpose
2. THE Authentication System SHALL display the 6-digit OTP code prominently in the email body
3. THE Authentication System SHALL include the expiration time of the OTP code in the email
4. THE Authentication System SHALL include security information advising users to ignore the email if they did not request it
5. THE Authentication System SHALL use the existing email sending infrastructure and styling

### Requirement 4

**User Story:** As a user, I want to request a new OTP code if my previous one expired, so that I can complete authentication without restarting the process

#### Acceptance Criteria

1. WHEN a user is on the verification page, THE Authentication System SHALL provide a "Resend code" option
2. WHEN a user requests a new code, THE Authentication System SHALL invalidate any previous OTP codes for that email
3. WHEN a user requests a new code, THE Authentication System SHALL send a fresh 6-digit OTP code to their email
4. THE Authentication System SHALL prevent users from requesting more than 3 OTP codes within a 10-minute period
5. IF the rate limit is exceeded, THEN THE Authentication System SHALL display an error message with the time until they can retry

### Requirement 5

**User Story:** As a developer, I want the OTP authentication to integrate seamlessly with the existing Better Auth setup, so that no database migrations or breaking changes are required

#### Acceptance Criteria

1. THE Authentication System SHALL use the existing Better Auth Verification table for storing OTP codes
2. THE Authentication System SHALL maintain compatibility with the existing Session and User models
3. THE Authentication System SHALL remove the magic link plugin configuration from the server
4. THE Authentication System SHALL remove the magic link client plugin from the auth client
5. THE Authentication System SHALL preserve all existing user sessions during the migration

### Requirement 6

**User Story:** As a user, I want clear error messages when authentication fails, so that I understand what went wrong and how to fix it

#### Acceptance Criteria

1. IF an OTP code is incorrect, THEN THE Authentication System SHALL display "Invalid code. Please check and try again."
2. IF an OTP code has expired, THEN THE Authentication System SHALL display "This code has expired. Please request a new one."
3. IF the email sending fails, THEN THE Authentication System SHALL display "Unable to send code. Please try again."
4. IF rate limiting is triggered, THEN THE Authentication System SHALL display "Too many attempts. Please wait X minutes before trying again."
5. THE Authentication System SHALL log all authentication errors to Sentry for monitoring
