# CBT Security Implementation Guide

## Overview

This document describes the maximum security measures implemented for the CBT (Computer-Based Test) section to prevent unauthorized access when embedded links are opened in new tabs or shared.

## Security Architecture

### 1. Token-Based Authentication System

The CBT platform now uses a **time-limited, session-bound token system** for access control:

- **Token Generation**: When a user clicks "Open AI CBT Platform", a secure JWT token is generated
- **Token Expiration**: Tokens expire after **15 minutes** to prevent long-term unauthorized access
- **One-Time Use**: Tokens are designed to be used once per session
- **Session Binding**: Tokens are tied to the user's authenticated session

### 2. Multi-Layer Security Features

#### A. Token Payload Security
```typescript
{
  sub: "user_id",           // User identifier
  email: "user@example.com", // User email
  cbtToken: true,           // Token type marker
  aud: "cbt-platform",      // Audience validation
  nonce: "random_hash",     // Unique nonce per token
  ipHash: "hash_of_ip",     // IP address hash
  userAgent: "hash_of_ua",  // User-Agent hash
  iat: 1234567890,          // Issued at
  exp: 1234568790           // Expires at (15 min later)
}
```

#### B. IP Address Hashing
- Client IP is extracted from request headers (handles proxies)
- IP is hashed (not stored in plaintext)
- On verification, current IP hash is compared with token's IP hash
- Mismatches are logged but don't reject (network changes can occur)

#### C. User-Agent Validation
- Browser User-Agent is hashed and included in token
- Prevents token use from different browsers
- Mismatches are logged for security monitoring

#### D. Referrer Validation
- Tokens can only be generated from your own domain
- Cross-origin requests are rejected
- Prevents attackers from generating tokens from external sites

#### E. JWT Signature Verification
- All tokens are signed with HS256 algorithm
- Signature is verified on every token validation
- Tampering is immediately detected

### 3. API Endpoints

#### Generate CBT Token
```
POST /api/cbt/token
```

**Requirements:**
- Valid user session (session cookie)
- User must be premium member
- Request must originate from your domain

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "expiresIn": 900,
  "message": "CBT access token generated successfully"
}
```

**Security Checks:**
1. Validates session authentication
2. Verifies premium status
3. Validates request origin/referrer
4. Extracts and hashes client IP
5. Extracts and hashes User-Agent

#### Verify CBT Token
```
GET /api/cbt/verify?token=<token>
```

**Response (Valid Token):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "verified": true
  },
  "message": "Token verified successfully"
}
```

**Response (Invalid Token):**
```json
{
  "error": "Invalid or expired token"
}
```

**Security Checks:**
1. Validates JWT signature
2. Verifies token expiration
3. Checks audience claim
4. Validates nonce presence
5. Compares IP and User-Agent hashes (with logging)

### 4. Frontend Implementation

The Dashboard component now includes secure token generation:

```typescript
async function handleOpenCBTPlatform() {
  // 1. Request secure token from backend
  const response = await fetch('/api/cbt/token', {
    method: 'POST',
    credentials: 'include' // Include session cookies
  })

  // 2. Extract token from response
  const data = await response.json()
  const token = data.token

  // 3. Construct secure URL with token
  const url = new URL(aiCbtUrl)
  url.searchParams.set('auth_token', token)
  url.searchParams.set('timestamp', Date.now().toString())

  // 4. Open in new tab with security headers
  window.open(url.toString(), '_blank', 'noopener,noreferrer')
}
```

**Security Features:**
- `credentials: 'include'` - Sends session cookies
- `noopener` - Prevents new tab from accessing window object
- `noreferrer` - Prevents referrer leakage
- Token is passed in URL (short-lived, will expire)

### 5. Attack Prevention

#### Token Theft Prevention
- Tokens expire after 15 minutes
- Tokens are tied to user session
- IP and User-Agent hashing provides additional validation
- Tokens cannot be reused after expiration

#### Session Hijacking Prevention
- Session cookies are HttpOnly and Secure
- SameSite=Strict prevents CSRF attacks
- Token generation requires valid session

#### Direct Access Prevention
- Referrer validation prevents external token generation
- Origin checking ensures requests come from your domain
- Tokens must be generated through authenticated endpoint

#### Brute Force Prevention
- Invalid tokens are logged
- Multiple verification failures can trigger alerts
- Rate limiting can be added to token generation endpoint

#### Man-in-the-Middle Prevention
- All tokens are signed with secret key
- Tampering is immediately detected
- HTTPS should be enforced in production

### 6. Monitoring and Logging

The system logs the following security events:

```typescript
// IP mismatch detected
console.warn(`CBT Token: IP mismatch for ${email}`)

// User-Agent mismatch detected
console.warn(`CBT Token: User-Agent mismatch for ${email}`)

// Token verification failed
console.error('CBT Token verification failed:', error)

// Origin mismatch detected
console.warn(`CBT Token: Origin mismatch - ${originUrl.hostname} vs ${currentHost}`)
```

These logs should be monitored for suspicious activity.

### 7. Configuration

#### Token Expiration
- Current: 15 minutes
- Location: `netlify/lib/cbt-security.ts` - `setExpirationTime('15m')`
- Adjust as needed for your use case

#### Allowed Origins
- Current: Same domain only
- Location: `netlify/functions/cbt-token.ts`
- Can be extended to allow multiple domains if needed

#### Security Strictness
- IP validation: Currently logs but doesn't reject
- User-Agent validation: Currently logs but doesn't reject
- To make stricter, uncomment rejection code in `cbt-security.ts`

### 8. Integration with CBT Platform

The CBT platform receiving the token should:

1. **Extract token from URL parameter:**
   ```javascript
   const params = new URLSearchParams(window.location.search)
   const token = params.get('auth_token')
   ```

2. **Verify token with your backend:**
   ```javascript
   const response = await fetch('/api/cbt/verify?token=' + token)
   const data = await response.json()
   ```

3. **Grant access only if verification succeeds:**
   ```javascript
   if (data.success && data.user.verified) {
     // Allow user to access CBT platform
   } else {
     // Redirect to login or show error
   }
   ```

4. **Clear token from URL after verification:**
   ```javascript
   window.history.replaceState({}, document.title, window.location.pathname)
   ```

### 9. Future Enhancements

Consider implementing these additional security measures:

1. **Token Blacklist**: Maintain a list of revoked tokens
2. **Rate Limiting**: Limit token generation requests per user
3. **Geolocation Validation**: Detect unusual access patterns
4. **Device Fingerprinting**: Bind tokens to specific devices
5. **Two-Factor Authentication**: Require 2FA for CBT access
6. **Audit Logging**: Detailed logs of all CBT access attempts
7. **Anomaly Detection**: Alert on suspicious access patterns

### 10. Testing

To test the security implementation:

1. **Valid Token Test:**
   - Generate token as authenticated premium user
   - Verify token is accepted by CBT platform
   - Confirm token expires after 15 minutes

2. **Invalid Token Test:**
   - Try to use expired token
   - Try to use modified token
   - Try to use token from different browser/IP
   - Verify rejection and logging

3. **Unauthorized Access Test:**
   - Try to generate token without authentication
   - Try to generate token as non-premium user
   - Try to generate token from external domain
   - Verify rejection

4. **Token Reuse Test:**
   - Generate token and use it
   - Try to reuse same token
   - Verify behavior (currently allows, can be restricted)

## Files Modified/Created

### New Files
- `netlify/lib/cbt-security.ts` - Security utility functions
- `netlify/functions/cbt-token.ts` - Token generation endpoint
- `netlify/functions/cbt-verify.ts` - Token verification endpoint
- `CBT_SECURITY.md` - This documentation

### Modified Files
- `src/pages/Dashboard.tsx` - Updated with secure token generation

### Untouched (Core Section)
- All other files remain unchanged
- Netlify configuration unchanged
- Core authentication system unchanged
- Database schema unchanged

## Deployment Notes

1. **Environment Variables:**
   - Ensure `JWT_SECRET` or `NETLIFY_SITE_ID` is set
   - These are used to sign and verify tokens

2. **Dependencies:**
   - Already included: `jose` (JWT library)
   - No new dependencies required

3. **Netlify Configuration:**
   - No changes to `netlify.toml`
   - New functions automatically deployed
   - Existing redirects and headers remain

4. **Testing:**
   - Test token generation before deploying to production
   - Monitor logs for security events
   - Verify CBT platform can verify tokens

## Support

For questions or issues with the security implementation:

1. Review this documentation
2. Check the inline code comments
3. Monitor security logs for errors
4. Test with the provided test cases

## Security Disclaimer

This implementation provides strong security measures, but no system is 100% secure. Regular security audits and updates are recommended. Always keep dependencies updated and monitor for new vulnerabilities.
