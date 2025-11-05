# Implementation Plan

- [x] 1. Create OTP email template component
  - Create `components/emails/OTPEmail.tsx` with 6-digit OTP display, expiration time, and security warning
  - Use existing email styles from `components/emails/styles.ts`
  - Follow the structure of `SignInEmail.tsx` for consistency
  - Include prominent OTP code display with large, readable font
  - Add expiration time message (5 minutes)
  - Include security warning about ignoring unsolicited emails
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Configure server-side Email OTP plugin
  - Update `app/auth.ts` to configure the `emailOTP` plugin
  - Set OTP expiration to 5 minutes (300 seconds)
  - Implement `sendOTP` function using existing `sendEmail` helper
  - Import and use the new `OTPEmail` component
  - Keep `magicLink` plugin temporarily for backward compatibility
  - _Requirements: 1.1, 1.5, 2.1, 5.1, 5.2_

- [x] 3. Update auth client configuration
  - Update `lib/auth-client.ts` to add `emailOTPClient` plugin alongside `magicLinkClient`
  - Add new error codes and messages for OTP-specific errors (INVALID_OTP, OTP_EXPIRED, TOO_MANY_REQUESTS)
  - Export `verifyEmailOtp` function from auth client
  - _Requirements: 1.4, 3.1, 6.1, 6.2, 6.3, 6.4_

- [x] 4. Create OTP verification page
- [x] 4.1 Create verify OTP page component
  - Create `app/auth/verify-otp/page.tsx` with OTP input form
  - Implement 6-digit numeric input field with validation
  - Add "Resend code" button with rate limiting (max 3 per 10 minutes)
  - Display the email address the code was sent to (from session storage)
  - Implement OTP verification using `authClient.verifyEmailOtp()`
  - Handle success by redirecting to callback URL
  - Display error messages for invalid/expired codes
  - Add loading states for verification and resend actions
  - _Requirements: 1.3, 1.4, 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.4_

- [x] 4.2 Implement rate limiting UI
  - Track resend attempts in component state
  - Disable resend button after 3 attempts within 10 minutes
  - Show countdown timer until user can retry
  - Display rate limit error message when exceeded
  - _Requirements: 4.4, 4.5, 6.4_

- [x] 5. Update sign-in page for OTP flow
  - Update `app/auth/signin/page.tsx` to use `authClient.signIn.emailOtp()` instead of `magicLink`
  - Store email in session storage before redirect
  - Redirect to `/auth/verify-otp` instead of `/auth/verify-request`
  - Update success message to indicate OTP was sent
  - Handle email sending errors with user-friendly messages
  - _Requirements: 1.1, 1.2, 2.5, 6.3, 6.5_

- [x] 6. Update sign-up page for OTP flow
  - Update `app/auth/signup/page.tsx` to use `authClient.signIn.emailOtp()` instead of `magicLink`
  - Store email in session storage before redirect
  - Redirect to `/auth/verify-otp` instead of `/auth/verify-request`
  - Update success message to indicate OTP was sent
  - Handle email sending errors with user-friendly messages
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.3, 6.5_

- [x] 7. Update legacy verify-request page
  - Update `app/auth/verify-request/page.tsx` to show deprecation message
  - Add automatic redirect to `/auth/verify-otp` if email is in session storage
  - Keep page for backward compatibility with any existing magic links
  - _Requirements: 5.5_

- [x] 8. Remove magic link configuration
  - Remove `magicLink` plugin from `app/auth.ts`
  - Remove `magicLinkClient` from `lib/auth-client.ts`
  - Remove unused magic link error messages from ERROR_MESSAGES
  - Verify no other files reference magic link functionality
  - _Requirements: 5.3, 5.4_

- [ ] 9. Add Sentry error logging
  - Ensure all OTP-related errors are logged to Sentry with appropriate context
  - Add error boundaries around OTP verification flow
  - Include email (hashed), error type, and timestamp in logs
  - Test error logging in development environment
  - _Requirements: 6.5_

- [ ]* 10. Create integration tests for OTP flow
  - Write tests for complete sign-in flow with OTP
  - Write tests for complete sign-up flow with OTP
  - Write tests for OTP resend functionality
  - Write tests for expired OTP handling
  - Write tests for invalid OTP handling
  - Write tests for rate limiting behavior
  - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.3, 4.1, 4.2, 4.3, 4.4_
