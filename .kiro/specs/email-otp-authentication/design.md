# Design Document

## Overview

This design outlines the implementation of Email OTP authentication to replace the existing magic link system. The solution leverages Better Auth's built-in `emailOTP` plugin, which is already imported but not configured. The implementation will modify the authentication flow to send 6-digit codes instead of magic links, update the UI to accept OTP input, and create a new email template for OTP delivery.

## Architecture

### High-Level Flow

```
User enters email → Server sends OTP → User enters code → Server verifies → User authenticated
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Sign In Page  │  Sign Up Page  │  Verify OTP Page          │
│  (email input) │  (email input) │  (OTP input + resend)     │
└────────┬────────────────┬────────────────┬──────────────────┘
         │                │                │
         └────────────────┴────────────────┘
                          │
                    Auth Client
                  (emailOTPClient)
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                     Server Layer                             │
├─────────────────────────────────────────────────────────────┤
│                    Better Auth Server                        │
│                   (emailOTP plugin)                          │
│                          │                                   │
│         ┌────────────────┼────────────────┐                 │
│         │                │                │                 │
│    Email Service   Verification DB   Session Manager        │
│   (sendOTPEmail)    (Prisma)         (Better Auth)          │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Server Configuration (app/auth.ts)

**Changes Required:**
- Remove `magicLink` plugin
- Configure `emailOTP` plugin with custom email sender
- Set OTP expiration to 5 minutes (300 seconds)

**Configuration:**
```typescript
emailOTP({
  expiresIn: 60 * 5, // 5 minutes
  sendOTP: async ({ email, otp }) => {
    // Send OTP email using existing email infrastructure
  },
})
```

### 2. Client Configuration (lib/auth-client.ts)

**Changes Required:**
- Remove `magicLinkClient` plugin
- Add `emailOTPClient` plugin
- Update error message mappings for OTP-specific errors

**New Error Codes:**
- `INVALID_OTP`: "Invalid code. Please check and try again."
- `OTP_EXPIRED`: "This code has expired. Please request a new one."
- `TOO_MANY_REQUESTS`: "Too many attempts. Please wait before trying again."

### 3. Email Template (components/emails/OTPEmail.tsx)

**New Component:**
A React Email component that displays:
- Large, prominent 6-digit OTP code
- Expiration time (5 minutes)
- Security warning
- Resilience Web branding

**Design Pattern:**
Follow the existing `SignInEmail.tsx` structure and styling for consistency.

### 4. Sign In Page (app/auth/signin/page.tsx)

**Changes Required:**
- Replace `authClient.signIn.magicLink()` with `authClient.signIn.emailOtp()`
- Update success message to indicate OTP was sent
- Redirect to `/auth/verify-otp` instead of `/auth/verify-request`
- Store email in session storage for verification page

### 5. Sign Up Page (app/auth/signup/page.tsx)

**Changes Required:**
- Replace `authClient.signIn.magicLink()` with `authClient.signIn.emailOtp()`
- Update success message to indicate OTP was sent
- Redirect to `/auth/verify-otp` instead of `/auth/verify-request`
- Store email in session storage for verification page

### 6. Verify OTP Page (app/auth/verify-otp/page.tsx)

**New Component:**
A new page that:
- Displays 6-digit OTP input field
- Shows the email address the code was sent to
- Provides "Resend code" button
- Handles OTP verification via `authClient.verifyEmailOtp()`
- Displays error messages for invalid/expired codes
- Redirects to callback URL on success

**UI Components:**
- OTP input field (6 digits, numeric only)
- Resend button with rate limiting feedback
- Error message display
- Loading states

### 7. Legacy Verify Request Page

**Changes Required:**
- Keep the page for backward compatibility
- Add redirect logic to `/auth/verify-otp` if accessed directly
- Display deprecation message

## Data Models

### Verification Table (Existing)

The Better Auth `emailOTP` plugin uses the existing `Verification` table configured in `app/auth.ts`:

```typescript
verification: {
  modelName: 'Verification',
}
```

**Fields Used:**
- `id`: Unique identifier
- `identifier`: User's email address
- `value`: Hashed OTP code
- `expiresAt`: Expiration timestamp
- `createdAt`: Creation timestamp

**No schema changes required** - Better Auth handles OTP storage automatically.

## Error Handling

### Client-Side Errors

1. **Invalid OTP Format**
   - Validate 6-digit numeric input before submission
   - Show inline validation error

2. **Network Errors**
   - Catch and display user-friendly messages
   - Log to Sentry with context

3. **Rate Limiting**
   - Track resend attempts client-side
   - Disable resend button with countdown timer

### Server-Side Errors

1. **Email Sending Failures**
   - Log to Sentry with email provider details
   - Return user-friendly error message
   - Allow retry

2. **Database Errors**
   - Log to Sentry with query context
   - Return generic error message
   - Maintain system stability

3. **Invalid/Expired OTP**
   - Return specific error codes
   - Allow user to request new code
   - Track failed attempts

### Error Logging Strategy

All errors will be logged to Sentry with:
- User email (hashed for privacy)
- Error type and message
- Request context
- Timestamp

## Testing Strategy

### Unit Tests

1. **OTP Email Template**
   - Verify correct OTP display
   - Verify expiration time display
   - Verify security message inclusion

2. **Client Error Handling**
   - Test error message mapping
   - Test validation logic
   - Test rate limiting logic

### Integration Tests

1. **Authentication Flow**
   - Test complete sign-in flow with OTP
   - Test complete sign-up flow with OTP
   - Test OTP resend functionality
   - Test expired OTP handling
   - Test invalid OTP handling

2. **Email Delivery**
   - Test OTP email sending
   - Test email template rendering
   - Test email delivery failures

### End-to-End Tests

1. **User Journey - Sign In**
   - Enter email → Receive OTP → Enter code → Authenticated

2. **User Journey - Sign Up**
   - Enter email → Receive OTP → Enter code → Account created

3. **User Journey - Resend**
   - Enter email → Request resend → Receive new OTP → Enter code

4. **Error Scenarios**
   - Invalid OTP code
   - Expired OTP code
   - Rate limiting
   - Network failures

### Manual Testing Checklist

- [ ] Sign in with existing account
- [ ] Sign up with new account
- [ ] Resend OTP code
- [ ] Enter invalid OTP
- [ ] Wait for OTP expiration
- [ ] Test rate limiting
- [ ] Verify email formatting
- [ ] Test on mobile devices
- [ ] Test with screen readers
- [ ] Verify redirect flows

## Migration Strategy

### Phase 1: Preparation
1. Add `emailOTPClient` to auth client alongside `magicLinkClient`
2. Create OTP email template
3. Create verify OTP page

### Phase 2: Server Configuration
1. Add `emailOTP` plugin to server config
2. Keep `magicLink` plugin temporarily for backward compatibility
3. Test OTP flow in development

### Phase 3: Client Migration
1. Update sign-in page to use OTP
2. Update sign-up page to use OTP
3. Deploy to staging for testing

### Phase 4: Cleanup
1. Remove `magicLink` plugin from server
2. Remove `magicLinkClient` from client
3. Update verify-request page with deprecation notice
4. Monitor for any issues

### Rollback Plan

If issues arise:
1. Revert client changes to use magic link
2. Keep both plugins active on server
3. Investigate and fix issues
4. Retry migration

## Security Considerations

1. **OTP Storage**
   - OTPs are hashed before storage (handled by Better Auth)
   - Expired OTPs are automatically cleaned up

2. **Rate Limiting**
   - Maximum 3 OTP requests per 10 minutes per email
   - Prevents brute force attacks

3. **OTP Expiration**
   - 5-minute expiration window
   - Balances security and user experience

4. **Email Security**
   - Use existing secure email infrastructure
   - Include security warnings in emails
   - No sensitive data in email subject

5. **Session Management**
   - Existing Better Auth session handling
   - No changes to session security model

## Performance Considerations

1. **Email Delivery**
   - Async email sending to avoid blocking
   - Existing email infrastructure handles queuing

2. **Database Queries**
   - Better Auth optimizes verification lookups
   - Automatic cleanup of expired OTPs

3. **Client-Side**
   - Minimal JavaScript for OTP input
   - Progressive enhancement for accessibility

## Accessibility

1. **OTP Input**
   - Proper label association
   - ARIA attributes for screen readers
   - Keyboard navigation support
   - Clear focus indicators

2. **Error Messages**
   - ARIA live regions for dynamic errors
   - Clear, descriptive error text
   - Visual and text-based indicators

3. **Email Template**
   - High contrast for readability
   - Large, clear OTP display
   - Semantic HTML structure

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- No IE11 support (consistent with Next.js 15)
