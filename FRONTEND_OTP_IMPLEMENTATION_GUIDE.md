# OTP-Based Registration & Authentication Implementation Guide

**For:** Frontend Team (React Native / Flutter)  
**Version:** 1.0  
**Last Updated:** April 3, 2026  
**Backend URL:** `https://your-backend-domain/api/auth`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Registration Flow](#registration-flow)
5. [Login Flow](#login-flow)
6. [Error Handling](#error-handling)
7. [Code Examples](#code-examples)
8. [Testing](#testing)

---

## Overview

This implementation uses a **3-step OTP verification process** for secure user registration:

1. **Request OTP** → User receives OTP on device
2. **Verify OTP** → User confirms OTP code
3. **Complete Registration** → User creates account with email/password

After registration, users login with **email and password** (separate flow).

---

## Architecture

```
┌─────────────────────────────────────────┐
│         REGISTRATION FLOW               │
├─────────────────────────────────────────┤
│  1. User enters phone number             │
│  2. Request OTP → Firebase sends SMS/app │
│  3. User enters 6-digit OTP              │
│  4. Verify OTP → Get verification ticket │
│  5. User enters email/password           │
│  6. Complete registration → Account made │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│           LOGIN FLOW                    │
├─────────────────────────────────────────┤
│  1. User enters email                   │
│  2. User enters password                │
│  3. Get JWT tokens (access + refresh)   │
│  4. User logged in to dashboard         │
└─────────────────────────────────────────┘
```

---

## API Endpoints

### Base URL
```
https://your-backend-domain/api/auth
```

### Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/register/request-otp` | POST | Send OTP to device |
| `/register/verify-otp` | POST | Verify OTP code |
| `/register/complete` | POST | Create account |
| `/student/login` | POST | User login |
| `/refresh-token` | POST | Refresh access token |

---

## Registration Flow

### Step 1: Request OTP

**Send OTP to user's device**

#### Request
```http
POST /api/auth/register/request-otp
Content-Type: application/json

{
  "phoneNumber": "+923001234567",
  "deviceToken": "FCM_device_token_here",
  "deviceName": "iPhone 12 Pro",
  "deviceType": "ios"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phoneNumber` | string | ✅ | User's phone number (international format) |
| `deviceToken` | string | ✅ | Firebase Cloud Messaging token |
| `deviceName` | string | ✅ | Device name (e.g., "iPhone 12 Pro", "Samsung Galaxy S21") |
| `deviceType` | string | ✅ | Either `"ios"` or `"android"` |

#### Success Response (200)
```json
{
  "success": true,
  "message": "OTP sent to your device",
  "data": {
    "sessionId": "a1b2c3d4e5f6g7h8i9j0",
    "expiresIn": 600,
    "phoneNumber": "+923001234567"
  }
}
```

#### Error Response Examples

**Missing Fields (400)**
```json
{
  "success": false,
  "message": "Missing required fields",
  "required": ["phoneNumber", "deviceToken", "deviceName", "deviceType"]
}
```

**Invalid Device Type (400)**
```json
{
  "success": false,
  "message": "Invalid deviceType. Must be \"android\" or \"ios\""
}
```

**Firebase Error (400)**
```json
{
  "success": false,
  "message": "Failed to send OTP",
  "error": "Firebase notification failed"
}
```

---

### Step 2: Verify OTP

**Verify the 6-digit code sent to device**

#### Request
```http
POST /api/auth/register/verify-otp
Content-Type: application/json

{
  "sessionId": "a1b2c3d4e5f6g7h8i9j0",
  "otpCode": "547378"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sessionId` | string | ✅ | From `request-otp` response |
| `otpCode` | string | ✅ | 6-digit OTP code from notification |

#### Success Response (200)
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now complete your registration.",
  "data": {
    "verificationTicket": "xyz789abc123def456ghi789",
    "expiresIn": 900,
    "phoneNumber": "+923001234567"
  }
}
```

#### Error Response Examples

**Invalid OTP (400)**
```json
{
  "success": false,
  "message": "Invalid OTP",
  "attemptsRemaining": 4
}
```

**Too Many Attempts (400)**
```json
{
  "success": false,
  "message": "Maximum verification attempts exceeded. Please request a new OTP.",
  "attemptsRemaining": 0
}
```

**Session Expired (404)**
```json
{
  "success": false,
  "message": "OTP session not found or expired"
}
```

**Missing Fields (400)**
```json
{
  "success": false,
  "message": "Missing required fields",
  "required": ["sessionId", "otpCode"]
}
```

---

### Step 3: Complete Registration

**Create user account with email and password**

#### Request
```http
POST /api/auth/register/complete
Content-Type: application/json

{
  "verificationTicket": "xyz789abc123def456ghi789",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+923001234567"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `verificationTicket` | string | ✅ | From `verify-otp` response |
| `email` | string | ✅ | User's email address |
| `password` | string | ✅ | At least 8 characters, should be strong |
| `firstName` | string | ✅ | User's first name |
| `lastName` | string | ✅ | User's last name |
| `phoneNumber` | string | ✅ | Must match verified phone number |

#### Success Response (201)
```json
{
  "success": true,
  "message": "Registration completed successfully! You can now login.",
  "data": {
    "userUUID": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Student"
  }
}
```

#### Error Response Examples

**Invalid Verification Ticket (401)**
```json
{
  "success": false,
  "message": "Invalid or expired verification ticket. Please complete OTP verification again."
}
```

**Verification Ticket Expired (401)**
```json
{
  "success": false,
  "message": "Verification ticket has expired. Please start registration again."
}
```

**Email Already Registered (409)**
```json
{
  "success": false,
  "message": "Email already registered. Please login or use a different email."
}
```

**Missing Fields (400)**
```json
{
  "success": false,
  "message": "Missing required fields",
  "required": ["verificationTicket", "email", "password", "firstName", "lastName"]
}
```

---

## Login Flow

### Login with Email & Password

**After registration is complete, user can login**

#### Request
```http
POST /api/auth/student/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | ✅ | Registered email address |
| `password` | string | ✅ | Account password |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userUUID": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "Student",
      "isActivated": true
    }
  }
}
```

#### Error Response Examples

**Invalid Credentials (401)**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**User Not Found (404)**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Error Handling

### Common HTTP Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | OK | Data processing successful |
| 201 | Created | Resource (user) created successfully |
| 400 | Bad Request | Invalid input, check parameters |
| 401 | Unauthorized | Invalid token/credentials, re-login required |
| 404 | Not Found | Resource not found or expired |
| 409 | Conflict | Email already exists, try different email |
| 429 | Too Many Requests | Rate limit exceeded, wait before retrying |
| 500 | Server Error | Backend error, contact support |

### Handling Rate Limiting

Rate limits per endpoint:
- **Registration endpoints**: 5 requests per minute
- **Login endpoint**: 5 requests per minute
- **Token refresh**: 10 requests per minute

**Rate Limit Response (429)**
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

**Frontend Action:** Show user a message and wait `retryAfter` seconds before allowing retry.

---

## Code Examples

### React Native Example

#### 1. Request OTP

```javascript
import * as firebase from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const requestOTP = async (phoneNumber, deviceName = 'default') => {
  try {
    // Get Firebase device token
    const messaging = getMessaging();
    const deviceToken = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY'
    });

    // Call backend
    const response = await fetch('https://your-backend/api/auth/register/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        deviceToken,
        deviceName,
        deviceType: Platform.OS // 'ios' or 'android'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('OTP sent! SessionId:', data.data.sessionId);
      return {
        success: true,
        sessionId: data.data.sessionId,
        expiresIn: data.data.expiresIn
      };
    } else {
      console.error('Error:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Request failed:', error);
    return { success: false, error: error.message };
  }
};
```

#### 2. Verify OTP

```javascript
const verifyOTP = async (sessionId, otpCode) => {
  try {
    const response = await fetch('https://your-backend/api/auth/register/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        otpCode
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('OTP verified! Ticket:', data.data.verificationTicket);
      return {
        success: true,
        verificationTicket: data.data.verificationTicket
      };
    } else {
      console.error('Verification failed:', data.message);
      return { 
        success: false, 
        error: data.message,
        attemptsRemaining: data.attemptsRemaining
      };
    }
  } catch (error) {
    console.error('Request failed:', error);
    return { success: false, error: error.message };
  }
};
```

#### 3. Complete Registration

```javascript
const completeRegistration = async (verificationTicket, email, password, firstName, lastName, phoneNumber) => {
  try {
    const response = await fetch('https://your-backend/api/auth/register/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verificationTicket,
        email,
        password,
        firstName,
        lastName,
        phoneNumber
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Registration complete! User:', data.data);
      return { success: true, user: data.data };
    } else {
      console.error('Registration failed:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Request failed:', error);
    return { success: false, error: error.message };
  }
};
```

#### 4. Login

```javascript
const login = async (email, password) => {
  try {
    const response = await fetch('https://your-backend/api/auth/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.success) {
      // Store tokens securely
      await AsyncStorage.setItem('accessToken', data.data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
      
      console.log('Login successful!', data.data.user);
      return { success: true, user: data.data.user };
    } else {
      console.error('Login failed:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Request failed:', error);
    return { success: false, error: error.message };
  }
};
```

#### 5. Complete Registration Screen Component

```javascript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegistrationScreen() {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Details
  const [loading, setLoading] = useState(false);
  
  // Step 1: Phone Number
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Step 2: OTP
  const [otpCode, setOtpCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  
  // Step 3: Account Details
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [verificationTicket, setVerificationTicket] = useState('');

  // Step 1: Request OTP
  const handleRequestOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    setLoading(true);
    const result = await requestOTP(phoneNumber, `${Platform.OS} Device`);
    setLoading(false);

    if (result.success) {
      setSessionId(result.sessionId);
      setStep(2);
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            Alert.alert('OTP Expired', 'Please request a new OTP');
            setStep(1);
            return 600;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter valid 6-digit OTP');
      return;
    }

    setLoading(true);
    const result = await verifyOTP(sessionId, otpCode);
    setLoading(false);

    if (result.success) {
      setVerificationTicket(result.verificationTicket);
      setStep(3);
    } else {
      Alert.alert(
        'Error',
        `${result.error}${result.attemptsRemaining ? `\nAttempts remaining: ${result.attemptsRemaining}` : ''}`
      );
    }
  };

  // Step 3: Complete Registration
  const handleCompleteRegistration = async () => {
    if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const result = await completeRegistration(
      verificationTicket,
      email,
      password,
      firstName,
      lastName,
      phoneNumber
    );
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Registration complete! Please login.');
      // Navigate to login screen
      navigation.navigate('Login');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {step === 1 && (
        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
            Enter Phone Number
          </Text>
          <TextInput
            placeholder="Enter phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
          />
          <TouchableOpacity
            onPress={handleRequestOTP}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#007AFF',
              padding: 15,
              borderRadius: 8
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                Send OTP
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
            Verify OTP
          </Text>
          <Text style={{ marginBottom: 10, color: '#666' }}>
            Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </Text>
          <TextInput
            placeholder="Enter 6-digit OTP"
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="number-pad"
            maxLength={6}
            style={{ borderWidth: 1, padding: 10, marginBottom: 20, fontSize: 24, letterSpacing: 10 }}
          />
          <TouchableOpacity
            onPress={handleVerifyOTP}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#007AFF',
              padding: 15,
              borderRadius: 8,
              marginBottom: 10
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                Verify OTP
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={{ color: '#007AFF', textAlign: 'center' }}>Back to Phone</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
            Create Account
          </Text>
          <TextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
          />
          <TextInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
          />
          <TextInput
            placeholder="Password (min 8 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
          />
          <TouchableOpacity
            onPress={handleCompleteRegistration}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#007AFF',
              padding: 15,
              borderRadius: 8
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                Complete Registration
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
```

---

### Flutter Example

#### 1. Request OTP

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'dart:io';

Future<Map<String, dynamic>> requestOTP(String phoneNumber) async {
  try {
    // Get Firebase device token
    final fcmToken = await FirebaseMessaging.instance.getToken();
    
    // Get device name
    final deviceInfo = DeviceInfoPlugin();
    String deviceName = 'Device';
    if (Platform.isAndroid) {
      final androidInfo = await deviceInfo.androidInfo;
      deviceName = androidInfo.model;
    } else if (Platform.isIOS) {
      final iosInfo = await deviceInfo.iosInfo;
      deviceName = iosInfo.model;
    }

    final response = await http.post(
      Uri.parse('https://your-backend/api/auth/register/request-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'phoneNumber': phoneNumber,
        'deviceToken': fcmToken,
        'deviceName': deviceName,
        'deviceType': Platform.isAndroid ? 'android' : 'ios',
      }),
    );

    final data = jsonDecode(response.body);
    
    if (data['success'] == true) {
      return {
        'success': true,
        'sessionId': data['data']['sessionId'],
        'expiresIn': data['data']['expiresIn'],
      };
    } else {
      return {'success': false, 'error': data['message']};
    }
  } catch (e) {
    return {'success': false, 'error': e.toString()};
  }
}
```

#### 2. Verify OTP

```dart
Future<Map<String, dynamic>> verifyOTP(String sessionId, String otpCode) async {
  try {
    final response = await http.post(
      Uri.parse('https://your-backend/api/auth/register/verify-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'sessionId': sessionId,
        'otpCode': otpCode,
      }),
    );

    final data = jsonDecode(response.body);
    
    if (data['success'] == true) {
      return {
        'success': true,
        'verificationTicket': data['data']['verificationTicket'],
      };
    } else {
      return {
        'success': false,
        'error': data['message'],
        'attemptsRemaining': data['attemptsRemaining'],
      };
    }
  } catch (e) {
    return {'success': false, 'error': e.toString()};
  }
}
```

#### 3. Complete Registration

```dart
Future<Map<String, dynamic>> completeRegistration({
  required String verificationTicket,
  required String email,
  required String password,
  required String firstName,
  required String lastName,
  required String phoneNumber,
}) async {
  try {
    final response = await http.post(
      Uri.parse('https://your-backend/api/auth/register/complete'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'verificationTicket': verificationTicket,
        'email': email,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
        'phoneNumber': phoneNumber,
      }),
    );

    final data = jsonDecode(response.body);
    
    if (data['success'] == true) {
      return {'success': true, 'user': data['data']};
    } else {
      return {'success': false, 'error': data['message']};
    }
  } catch (e) {
    return {'success': false, 'error': e.toString()};
  }
}
```

#### 4. Login

```dart
Future<Map<String, dynamic>> login(String email, String password) async {
  try {
    final response = await http.post(
      Uri.parse('https://your-backend/api/auth/student/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);
    
    if (data['success'] == true) {
      // Store tokens securely
      final secureStorage = FlutterSecureStorage();
      await secureStorage.write(key: 'accessToken', value: data['data']['accessToken']);
      await secureStorage.write(key: 'refreshToken', value: data['data']['refreshToken']);
      
      return {'success': true, 'user': data['data']['user']};
    } else {
      return {'success': false, 'error': data['message']};
    }
  } catch (e) {
    return {'success': false, 'error': e.toString()};
  }
}
```

---

## Testing

### Manual Testing Checklist

#### Registration Flow
- [ ] Phone number input accepts international format
- [ ] OTP sent successfully to device
- [ ] 6-digit OTP displays in notification
- [ ] OTP verification works with correct code
- [ ] Wrong OTP code shows error with attempts remaining
- [ ] After 5 wrong attempts, OTP expires
- [ ] User can request new OTP during timeout
- [ ] Email validation prevents duplicate registrations
- [ ] Password validation enforces minimum requirements
- [ ] Account created successfully
- [ ] User receives confirmation message

#### Login Flow
- [ ] User can login immediately after registration
- [ ] Wrong email shows error
- [ ] Wrong password shows error
- [ ] Successful login returns tokens
- [ ] Tokens stored securely
- [ ] User redirected to dashboard after login

#### Error Handling
- [ ] Network errors display user-friendly messages
- [ ] Rate limiting shows wait time
- [ ] Expired sessions prompt re-registration
- [ ] Server errors show generic message (don't leak backend details)

### Test Cases with Sample Data

**Test User 1: Successful Registration**
```
Phone: +923001234567
First Name: John
Last Name: Doe
Email: john.doe@example.com
Password: SecurePass123!
Device: iPhone 12
```

**Test User 2: Error Scenarios**
```
Invalid Phone: abc123 (should fail)
Duplicate Email: john.doe@example.com (after first user registered)
Weak Password: pass (should fail - less than 8 chars)
Invalid Device Type: windows (should fail - only ios/android)
```

---

## Security Best Practices

### For Frontend Development

1. **Secure Token Storage**
   - Never store tokens in localStorage (web) or standard SharedPreferences (mobile)
   - Use Secure Storage APIs:
     - iOS: Keychain
     - Android: Keystore
     - Web: HttpOnly cookies (backend should set them)

2. **OTP Handling**
   - Never log OTP codes
   - Clear OTP from input field after verification
   - Auto-fill OTP from SMS when possible (don't make users type)

3. **Password Requirements**
   - Enforce minimum 8 characters
   - Recommend: uppercase, lowercase, numbers, special chars
   - Show password strength indicator

4. **HTTPS Only**
   - Always use HTTPS for API calls
   - Reject HTTP connections
   - Implement certificate pinning for sensitive data

5. **Session Management**
   - Clear tokens on logout
   - Implement auto-logout on inactivity
   - Handle token refresh automatically
   - Show re-login prompt when refresh fails

6. **Rate Limiting**
   - Show user the rate limit message
   - Disable submit button during rate limit
   - Show countdown timer

---

## Troubleshooting

### Issue: "OTP sent but didn't receive notification"

**Solutions:**
1. Check Firebase credentials are valid
2. Verify device token is correct
3. Check device notification settings
4. Ensure Firebase Cloud Messaging is enabled
5. Check backend logs for Firebase errors

### Issue: "Verification ticket expired"

**Solutions:**
1. Verification ticket valid for 15 minutes only
2. User must complete registration within this time
3. User can restart registration if ticket expires

### Issue: "Email already registered"

**Solutions:**
1. User already has account
2. Show "Go to Login" option
3. Implement "Forgot Password" flow

### Issue: "Too many requests (429)"

**Solutions:**
1. Rate limit is 5 requests per minute per endpoint
2. Show countdown timer to user
3. Disable submit button during cooldown

---

## API Integration Checklist

- [ ] Backend URL configured correctly
- [ ] Firebase Cloud Messaging set up
- [ ] Error handling implemented for all scenarios
- [ ] Tokens stored securely
- [ ] HTTPS enabled
- [ ] Rate limiting handled
- [ ] Loading states shown during requests
- [ ] Offline detection implemented
- [ ] Timeout handling for network requests
- [ ] Event tracking/analytics added
- [ ] Logging (without sensitive data)
- [ ] Unit tests written for all flows
- [ ] Integration tests with backend
- [ ] Manual testing completed

---

## Support & Contact

**Backend Team:** [Your contact info]  
**API Documentation:** [Link to API docs]  
**Issue Tracking:** [Link to issue tracker]  
**Slack Channel:** [Channel name]

---

**Document Version:** 1.0  
**Last Updated:** April 3, 2026  
**Next Review:** April 10, 2026
