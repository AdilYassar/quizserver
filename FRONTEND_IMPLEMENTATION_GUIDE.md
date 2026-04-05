# Frontend Implementation Guide - Profile & Password Reset

Complete guide for implementing Student Profile Updates, Profile Photo Upload, and Forgot Password functionality on your frontend (React Native, Web, or any client).

---

## Table of Contents
1. [Update User Profile](#1-update-user-profile)
2. [Upload Profile Photo](#2-upload-profile-photo)
3. [Forgot Password - Request Reset](#3-forgot-password---request-reset)
4. [Forgot Password - Verify & Reset (Web)](#4-forgot-password---verify--reset-web)
5. [Forgot Password - OTP Verification (Mobile)](#5-forgot-password---otp-verification-mobile)
6. [Error Handling & Best Practices](#6-error-handling--best-practices)
7. [Complete Code Examples](#7-complete-code-examples)

---

## 1. Update User Profile

### POST/PATCH `/api/auth/user/profile`

Update user profile information including name, email, phone, age, and bio.

### Request

```javascript
// Headers
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

// Body - All fields are optional, send only what you want to update
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+9876543210",
  "age": 25,
  "bio": "I'm a student learning to code"
}
```

### Response - Success (200)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "code": "PROFILE_UPDATED",
  "data": {
    "user": {
      "uuid": "user-uuid-123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+9876543210",
      "age": 25,
      "bio": "I'm a student learning to code",
      "photo": "https://drive.google.com/uc?export=download&id=xxxx",
      "role": "Student"
    },
    "updatedFields": ["name", "email", "phone", "age", "bio"]
  }
}
```

### Response - Validation Error (400)

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    "Email is already in use by another account",
    "Phone number is already in use by another account"
  ]
}
```

### Validation Rules

| Field | Rules | Examples |
|-------|-------|----------|
| **name** | String, max 100 chars | "John Doe" |
| **email** | Valid format, must be unique | "john@example.com" |
| **phone** | E.164 format, must be unique | "+919876543210", "+14155552671" |
| **age** | Number 0-150 | 25 |
| **bio** | String, max 500 chars | "Student learning web dev" |

### Frontend Implementation (React Example)

```jsx
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const updateProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await axios.patch(
      `${API_BASE_URL}/auth/user/profile`,
      profileData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Profile updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error.response?.data);
    throw error;
  }
};

// Usage
const handleProfileUpdate = async () => {
  const profileData = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+919876543210',
    age: 25,
    bio: 'Student'
  };

  try {
    const result = await updateProfile(profileData);
    alert('Profile updated successfully!');
  } catch (err) {
    alert(err.response?.data?.errors?.join('\n') || 'Update failed');
  }
};
```

---

## 2. Upload Profile Photo

### POST `/api/auth/user/upload-photo`

Upload a profile photo to Google Drive and save the URL to the database.

### Request

```javascript
// Headers
Authorization: Bearer {JWT_TOKEN}
Content-Type: multipart/form-data

// Form Data
- photo: [File] - Image file (JPG, PNG, GIF, WebP)
          Max size: 10MB

// Example: FormData object
const formData = new FormData();
formData.append('photo', fileInput.files[0]);
```

### Response - Success (200)

```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "code": "PHOTO_UPLOADED",
  "data": {
    "photoUrl": "https://drive.google.com/uc?export=download&id=abc123def456",
    "photoId": "abc123def456",
    "user": {
      "uuid": "user-uuid-123",
      "name": "John Doe",
      "email": "john@example.com",
      "photo": "https://drive.google.com/uc?export=download&id=abc123def456"
    }
  }
}
```

### Response - Error (400)

```json
{
  "success": false,
  "message": "Invalid file type. Please upload JPG, PNG, GIF, or WebP images only.",
  "code": "INVALID_FILE_TYPE"
}
```

### Frontend Implementation (React Example)

```jsx
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const uploadProfilePhoto = async (file) => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPG, PNG, GIF, or WebP');
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('photo', file);

    const token = localStorage.getItem('accessToken');
    
    const response = await axios.post(
      `${API_BASE_URL}/auth/user/upload-photo`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentComplete = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentComplete}%`);
        }
      }
    );

    console.log('Photo uploaded:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading photo:', error.message);
    throw error;
  }
};

// Usage with file input
const handlePhotoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    setUploading(true);
    const result = await uploadProfilePhoto(file);
    
    setUserPhoto(result.data.photoUrl);
    alert('Photo uploaded successfully!');
  } catch (err) {
    alert(err.message);
  } finally {
    setUploading(false);
  }
};

// JSX Component
function ProfilePhotoUpload() {
  const [uploading, setUploading] = useState(false);

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handlePhotoUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

### React Native Implementation

```javascript
import * as ImagePicker from 'expo-image-picker';

const uploadProfilePhotoRN = async (file) => {
  try {
    const formData = new FormData();
    formData.append('photo', {
      uri: file.uri,
      type: file.type,
      name: file.filename || 'photo.jpg'
    });

    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(
      `${API_BASE_URL}/auth/user/upload-photo`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      }
    );

    const data = await response.json();
    if (data.success) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

// Usage
const handlePickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    try {
      const uploadResult = await uploadProfilePhotoRN(result.assets[0]);
      console.log('Photo URL:', uploadResult.data.photoUrl);
    } catch (error) {
      alert(error.message);
    }
  }
};
```

---

## 3. Forgot Password - Request Reset

### POST `/api/auth/forgot-password/request`

Request a password reset. Sends both email link and OTP via Firebase notification.

### Request

```javascript
{
  "email": "user@example.com",
  "role": "Student"  // Optional, defaults to "Student"
}
```

### Response - Success (200)

```json
{
  "success": true,
  "message": "Password reset notification sent to your registered device",
  "code": "PASSWORD_RESET_REQUESTED",
  "data": {
    "expiresIn": 300,
    "devicesNotified": 1,
    "_debug": {
      "otp": "436802",
      "resetLink": "http://localhost:3000/reset-password?token=xxx&email=...",
      "resetToken": "xxx"
    }
  }
}
```

**Note:** The `_debug` object is only included in **development mode** for testing purposes.

### What Happens Next?

**If user has registered devices:**
- 📱 Firebase notification sent to all active devices
- 🔐 Notification contains OTP for mobile app
- 🔗 Reset link included for web browser

**If no devices (or in development):**
- ✅ Still generates OTP and reset link
- 📲 User can manually copy OTP from notification (if device comes online)
- 🌐 Reset link works immediately on any device

### Response - Error (400)

```json
{
  "success": false,
  "message": "Invalid email format",
  "code": "INVALID_EMAIL"
}
```

### Frontend Implementation (React Example)

```jsx
const requestPasswordReset = async (email, role = 'Student') => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/forgot-password/request`,
      { email, role }
    );

    console.log('Password reset requested:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error requesting reset:', error.response?.data);
    throw error;
  }
};

// Usage
const handleForgotPassword = async (email) => {
  try {
    const result = await requestPasswordReset(email);
    alert('Check your device for password reset notification!');
  } catch (error) {
    alert(error.response?.data?.message || 'Error requesting reset');
  }
};
```

---

## 4. Forgot Password - Verify & Reset (Web)

### GET `/api/auth/forgot-password/verify-link`

Verify if a reset link is still valid (before showing reset form).

### Request

```
GET /api/auth/forgot-password/verify-link?email=user@example.com&token=xxx&role=Student
```

### Response - Valid (200)

```json
{
  "success": true,
  "message": "Reset link is valid",
  "code": "LINK_VALID",
  "data": {
    "email": "user@example.com",
    "valid": true
  }
}
```

### POST `/api/auth/forgot-password/reset`

Reset password after token verification.

### Request

```javascript
{
  "email": "user@example.com",
  "resetToken": "abc123def456...",  // From URL parameter
  "newPassword": "SecurePassword123",
  "newPasswordConfirm": "SecurePassword123",
  "verifyMethod": "token",  // "token" for email link, "otp" for mobile
  "role": "Student"
}
```

### Response - Success (200)

```json
{
  "success": true,
  "message": "Password reset successful! You can now log in with your new password.",
  "code": "PASSWORD_RESET_SUCCESS",
  "data": {
    "email": "user@example.com",
    "message": "You may now login with your new password"
  }
}
```

### Response - Error (400)

```json
{
  "success": false,
  "message": "Invalid or expired reset token",
  "code": "INVALID_TOKEN"
}
```

### Frontend Implementation (React Example)

```jsx
import { useSearchParams } from 'react-router-dom';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  const email = searchParams.get('email');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkValid, setLinkValid] = useState(null);

  // Verify link on page load
  useEffect(() => {
    verifyResetLink();
  }, []);

  const verifyResetLink = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/forgot-password/verify-link`,
        {
          params: { email, token: resetToken, role: 'Student' }
        }
      );
      setLinkValid(true);
    } catch (error) {
      setLinkValid(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/forgot-password/reset`,
        {
          email,
          resetToken,
          newPassword: password,
          newPasswordConfirm: confirmPassword,
          verifyMethod: 'token',
          role: 'Student'
        }
      );

      alert('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      alert(error.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  if (linkValid === null) return <div>Verifying link...</div>;
  if (linkValid === false) return <div>Invalid or expired reset link</div>;

  return (
    <form onSubmit={handleResetPassword}>
      <div>
        <label>Email</label>
        <input type="email" value={email} disabled />
      </div>
      <div>
        <label>New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
        />
      </div>
      <div>
        <label>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}
```

---

## 5. Forgot Password - OTP Verification (Mobile)

### POST `/api/auth/forgot-password/verify-otp`

Verify OTP code from Firebase notification for mobile apps.

### Request

```javascript
{
  "email": "user@example.com",
  "otpCode": "123456",  // 6-digit OTP from notification
  "role": "Student"
}
```

### Response - Success (200)

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "code": "OTP_VERIFIED",
  "data": {
    "email": "user@example.com",
    "verified": true
  }
}
```

### Response - Error (400)

```json
{
  "success": false,
  "message": "Invalid or expired OTP code",
  "code": "INVALID_OTP"
}
```

### React Native Implementation

```javascript
import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ForgotPasswordScreen({ email }) {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          Alert.alert('OTP Expired', 'Please request a new reset code');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            otpCode: otp,
            role: 'Student'
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setOtpVerified(true);
        Alert.alert('Success', 'OTP verified! Now set your new password');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password/reset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            resetToken: otp, // Use OTP as the token
            newPassword: password,
            newPasswordConfirm: confirmPassword,
            verifyMethod: 'otp', // Mobile uses OTP
            role: 'Student'
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Password reset successful!');
        // Navigate to login screen
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        Reset Password
      </Text>

      {!otpVerified ? (
        <>
          <Text>Email: {email}</Text>

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              marginVertical: 10,
              borderRadius: 5
            }}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />

          <Text style={{ color: '#f44336', marginBottom: 15 }}>
            ⏱️ Time remaining: {formatTime(timeRemaining)}
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: '#667eea',
              padding: 12,
              borderRadius: 5,
              marginBottom: 10
            }}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              marginVertical: 10,
              borderRadius: 5
            }}
            placeholder="New Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              marginVertical: 10,
              borderRadius: 5
            }}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={{
              backgroundColor: '#667eea',
              padding: 12,
              borderRadius: 5
            }}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

export default ForgotPasswordScreen;
```

---

## 6. Error Handling & Best Practices

### Common Error Codes & Handling

```javascript
const handleApiError = (error) => {
  const status = error.response?.status;
  const code = error.response?.data?.code;

  switch (code) {
    case 'UNAUTHORIZED':
      // Redirect to login
      window.location.href = '/login';
      break;

    case 'VALIDATION_ERROR':
      // Show validation errors
      console.error('Validation errors:', error.response.data.errors);
      break;

    case 'INVALID_TOKEN':
    case 'INVALID_OTP':
      // Show expiry message
      alert('Reset token/OTP has expired. Please request a new one.');
      break;

    case 'PHOTO_UPLOADED':
      // Success - update UI
      console.log('Photo uploaded successfully');
      break;

    case 'USER_NOT_FOUND':
      alert('User not found');
      break;

    default:
      alert('An error occurred. Please try again.');
  }
};
```

### Security Best Practices

```javascript
// 1. Never store sensitive info in localStorage
❌ localStorage.setItem('password', password);
✅ localStorage.setItem('token', jwtToken);

// 2. Always use HTTPS in production
✅ const API_BASE_URL = process.env.REACT_APP_API_URL;

// 3. Sanitize file uploads
const validateFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
};

// 4. Validate passwords client-side too
const isPasswordStrong = (password) => {
  return password.length >= 6; // Server has stricter validation
};

// 5. Don't expose error details to users
❌ alert(`Error: ${error.response.data.sqlError}`);
✅ alert('An error occurred. Please try again later.');
```

### Retry Logic for Failed Uploads

```javascript
async function uploadWithRetry(file, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadProfilePhoto(file);
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## 7. Complete Code Examples

### React Hooks - Profile Manager

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function useProfileManager() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem('accessToken');

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Fetch profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/auth/user/profile-full');
      setUser(response.data.data.user);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      const response = await axiosInstance.patch('/auth/user/profile', updates);
      setUser(response.data.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0] || 'Failed to update profile';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload photo
  const uploadPhoto = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('photo', file);

      const response = await axiosInstance.post(
        '/auth/user/upload-photo',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setUser(response.data.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete photo
  const deletePhoto = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete('/auth/user/profile-photo');
      setUser({ ...user, photo: null });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete photo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadPhoto,
    deletePhoto
  };
}

export default useProfileManager;
```

### Usage in Component

```jsx
import useProfileManager from './useProfileManager';

function ProfileEditPage() {
  const { user, loading, error, updateProfile, uploadPhoto } = useProfileManager();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, email, bio });
      alert('Profile updated!');
    } catch (err) {
      alert(error);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadPhoto(file);
      alert('Photo uploaded!');
    } catch (err) {
      alert(error);
    }
  };

  return (
    <div>
      {user?.photo && <img src={user.photo} alt="Profile" style={{ width: 100 }} />}

      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          maxLength={500}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        disabled={loading}
      />

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default ProfileEditPage;
```

---

## Summary

| Feature | Endpoint | Method | Key Points |
|---------|----------|--------|-----------|
| Update Profile | `/api/auth/user/profile` | PATCH | All fields optional, validation per field |
| Upload Photo | `/api/auth/user/upload-photo` | POST | Multipart, 10MB max, auto-delete old |
| Request Reset | `/auth/forgot-password/request` | POST | Sends both email link + OTP |
| Verify Link | `/auth/forgot-password/verify-link` | GET | Check link validity before showing form |
| Reset Password | `/auth/forgot-password/reset` | POST | Requires token/OTP + new password |
| Verify OTP | `/auth/forgot-password/verify-otp` | POST | For mobile app OTP verification |

All endpoints use **JWT Bearer Token** authentication except password reset endpoints.
