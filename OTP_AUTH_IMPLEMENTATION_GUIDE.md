# OTP-Based Authentication with Device Registration

## Overview
This guide explains the complete flow for device registration and OTP-based authentication in the Quiz Server.

**Flow:**
1. User signs up → Gets `userUUID`
2. Register device → Send `deviceToken` + `userUUID`
3. Initiate login → Send `userUUID` + `deviceToken`
4. Receive OTP → Firebase notification with 6-digit code
5. Verify OTP → Send code + sessionId
6. Get verification token → Use in login request
7. Login with verification → Get JWT token

---

## API Endpoints

### 1. Device Registration
**Endpoint:** `POST /api/auth/device/register`

Register a device for a user after Firebase token is obtained.

**Request:**
```json
{
  "userUUID": "e05bb02d-d4d4-468d-8436-6ba765ff8e99",
  "deviceToken": "cOYuBZ-iRuuZpMok9QFOYu:APA91bGzSfVtpOExUVPapu_6dhs...",
  "deviceName": "adil's phone",
  "deviceType": "android"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userUUID": "e05bb02d-d4d4-468d-8436-6ba765ff8e99",
    "deviceName": "adil's phone",
    "deviceType": "android"
  }
}
```

**When to call:** After getting Firebase device token, before first login

---

### 2. Send OTP
**Endpoint:** `POST /api/auth/otp/send`

Initiate login by sending OTP to the registered device.

**Request:**
```json
{
  "userUUID": "e05bb02d-d4d4-468d-8436-6ba765ff8e99",
  "deviceToken": "cOYuBZ-iRuuZpMok9QFOYu:APA91bGzSfVtpOExUVPapu_6dhs..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully via Firebase notification",
  "sessionId": "d4c8f3a2e1b9f7c5d2a1e3f4b6c8d9e0",
  "expiresIn": 600
}
```

**Details:**
- OTP valid for 10 minutes (600 seconds)
- 6-digit code sent via Firebase notification
- `sessionId` required for OTP verification
- Save `sessionId` for next step

**Note:** Check device for notification with OTP code

---

### 3. Verify OTP
**Endpoint:** `POST /api/auth/otp/verify`

Verify the OTP code received on device.

**Request:**
```json
{
  "userUUID": "e05bb02d-d4d4-468d-8436-6ba765ff8e99",
  "sessionId": "d4c8f3a2e1b9f7c5d2a1e3f4b6c8d9e0",
  "otpCode": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "verificationToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z",
  "sessionId": "d4c8f3a2e1b9f7c5d2a1e3f4b6c8d9e0"
}
```

**Response (Failed):**
```json
{
  "success": false,
  "message": "Invalid OTP",
  "attemptsRemaining": 3
}
```

**Details:**
- 5 attempts allowed per OTP
- `verificationToken` required for login
- Save `verificationToken` for login request

---

### 4. Verify Token (Optional Pre-check)
**Endpoint:** `POST /api/auth/verify-token`

Optionally verify token validity before attempting login.

**Request:**
```json
{
  "userUUID": "e05bb02d-d4d4-468d-8436-6ba765ff8e99",
  "verificationToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification token is valid",
  "ready": true
}
```

---

### 5. Login with Verification (Modified)
**Endpoint:** `POST /api/auth/student/login` (Modified)

**Original request + verification token:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "verificationToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "uuid": "e05bb02d-d4d4-468d-8436-6ba765ff8e99",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

## Complete Client-Side Flow

### Step-by-step Implementation

**1. Initialize Firebase and get device token**
```javascript
// In React Native / Flutter app
const messaging = firebase.messaging();
const token = await messaging.getToken();
console.log('Device Token:', token);
```

**2. Send signup/login screen request**
```javascript
// User enters email and password
const email = "user@example.com";
const password = "password123";
```

**3. Register device (first time only)**
```javascript
const deviceResponse = await fetch('/api/auth/device/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userUUID: user.uuid, // From signup
    deviceToken: token,
    deviceName: getDeviceName(),
    deviceType: 'android' // or 'ios'
  })
});
```

**4. Request OTP**
```javascript
const otpResponse = await fetch('/api/auth/otp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userUUID: user.uuid,
    deviceToken: token
  })
});

const { sessionId, expiresIn } = await otpResponse.json();
// Show: "Check your device for OTP. Expires in: expiresIn seconds"
```

**5. User receives notification with OTP**
- Firebase notification arrives on device
- Show OTP input screen to user
- User enters 6-digit code

**6. Verify OTP**
```javascript
const verifyResponse = await fetch('/api/auth/otp/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userUUID: user.uuid,
    sessionId: sessionId,
    otpCode: userEnteredCode // "123456"
  })
});

const { verificationToken } = await verifyResponse.json();
```

**7. Login with verification**
```javascript
const loginResponse = await fetch('/api/auth/student/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: email,
    password: password,
    verificationToken: verificationToken
  })
});

const { token, refreshToken, user } = await loginResponse.json();
// Store tokens and proceed to dashboard
```

---

## Security Features

✅ **OTP Expiration:** 10 minutes validity
✅ **Rate Limiting:** Multiple OTP endpoints have rate limits
✅ **Attempt Tracking:** 5 verification attempts per OTP
✅ **Device Tracking:** Device token validation
✅ **Unique Sessions:** Each OTP has unique sessionId
✅ **IP & User Agent:** Logged for security audit

---

## Database Models

### OTP Schema
```javascript
{
  userUUID: String,
  deviceToken: String,
  code: String (6 digits),
  isVerified: Boolean,
  verificationAttempts: Number,
  maxAttempts: Number (5),
  expiresAt: Date,
  createdAt: Date,
  verifiedAt: Date,
  sessionId: String (unique),
  ipAddress: String,
  userAgent: String
}
```

### DeviceToken Schema
```javascript
{
  userUUID: String,
  token: String,
  deviceName: String,
  deviceType: String (android/ios),
  isInvalid: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing the Flow

### Using cURL

**1. Register Device**
```bash
curl -X POST http://localhost:3000/api/auth/device/register \
  -H "Content-Type: application/json" \
  -d '{
    "userUUID": "e05bb02d-d4d4-468d-8436-6ba765ff8e99",
    "deviceToken": "cOYuBZ-iRuuZpMok9QFOYu:APA91bGzSfVtpOExUVPapu_6dhs...",
    "deviceName": "Test Phone",
    "deviceType": "android"
  }'
```

**2. Send OTP**
```bash
curl -X POST http://localhost:3000/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "userUUID": "e05bb02d-d4d4-468d-8436-6ba765ff8e99",
    "deviceToken": "cOYuBZ-iRuuZpMok9QFOYu:APA91bGzSfVtpOExUVPapu_6dhs..."
  }'
```

**3. Verify OTP**
```bash
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userUUID": "e05bb02d-d4d4-468d-8436-6ba765ff8e99",
    "sessionId": "d4c8f3a2e1b9f7c5d2a1e3f4b6c8d9e0",
    "otpCode": "123456"
  }'
```

---

## Next Steps

1. ✅ Modify `loginStudent` controller to require `verificationToken`
2. ✅ Add validation middleware for OTP endpoints
3. ✅ Update mobile app to use new auth flow
4. ✅ Test end-to-end with real devices
5. ✅ Apply same flow to admin login
6. ✅ Add OTP resend endpoint (if needed)
7. ✅ Implement Firebase token refresh handling

---

## Troubleshooting

**Issue:** "OTP not received on device"
- Solution: Check device notification permissions
- Solution: Verify deviceToken is valid

**Issue:** "OTP expired"
- Solution: Request new OTP (10 minute validity)

**Issue:** "Too many verification attempts"
- Solution: Wait for new OTP (5 attempts allowed)

**Issue:** "Invalid OTP session"
- Solution: Send new OTP request with valid sessionId

---

## File Locations

- **OTP Model:** `src/models/otp.js`
- **Auth Service:** `src/services/auth.service.js`
- **OTP Controller:** `src/controllers/Auth/otpController.js`
- **Auth Routes:** `src/routes/auth.js`
- **Device Token Model:** `src/models/deviceToken.js`
