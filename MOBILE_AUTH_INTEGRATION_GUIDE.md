# Frontend Integration Guide - OTP Authentication

## Quick Start for React Native / Flutter Mobile App

### 1. Initialize Firebase Messaging

**React Native Example:**
```javascript
import messaging from '@react-native-firebase/messaging';
import { requestUserPermission } from './firebase-utils';

async function initializeFirebase() {
  // Request notification permission
  const authorized = await requestUserPermission();
  
  if (authorized) {
    // Get device token
    const token = await messaging.getToken();
    console.log('Device Token:', token);
    return token;
  }
  
  return null;
}

// Listen for notifications
messaging().onMessage(async (remoteMessage) => {
  console.log('FCM Message received:', remoteMessage);
  
  // Handle OTP notification
  if (remoteMessage.data?.type === 'auth_otp') {
    const otpCode = extractOTPFromMessage(remoteMessage.notification?.body);
    // Show OTP input screen to user
  }
});
```

### 2. Signup Flow

```javascript
async function signupUser(name, email, password) {
  try {
    const response = await fetch('http://api.example.com/api/auth/student/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        age: 18  // optional
      })
    });

    if (!response.ok) throw new Error('Signup failed');
    
    const data = await response.json();
    const userUUID = data.student.uuid;
    
    return {
      success: true,
      userUUID,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### 3. Register Device (First Time After Signup)

```javascript
async function registerDevice(userUUID, deviceToken) {
  try {
    const response = await fetch(
      'http://api.example.com/api/auth/device/register',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userUUID,
          deviceToken,
          deviceName: 'adil\'s phone',  // Get from device
          deviceType: 'android'  // or 'ios'
        })
      }
    );

    if (!response.ok) throw new Error('Device registration failed');
    
    const data = await response.json();
    
    // Save to local storage
    await AsyncStorage.setItem('userUUID', userUUID);
    await AsyncStorage.setItem('deviceToken', deviceToken);
    
    return { success: true, deviceId: data.data.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 4. Login Flow with OTP

```javascript
async function initiateLogin(email, password) {
  try {
    // Step 1: Prepare device info
    const userUUID = await AsyncStorage.getItem('userUUID');
    const deviceToken = await AsyncStorage.getItem('deviceToken');
    
    // Step 2: Request OTP
    const otpResponse = await fetch(
      'http://api.example.com/api/auth/otp/send',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userUUID,
          deviceToken
        })
      }
    );

    if (!otpResponse.ok) {
      throw new Error('Failed to send OTP');
    }

    const otpData = await otpResponse.json();
    
    // Step 3: Show OTP input screen
    showOTPInputScreen({
      sessionId: otpData.sessionId,
      expiresIn: otpData.expiresIn,
      userUUID,
      email,
      password
    });
    
    return { success: true, sessionId: otpData.sessionId };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 5. OTP Input & Verification Screen

```javascript
// OTPInputScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet
} from 'react-native';

export function OTPInputScreen({ sessionId, expiresIn, userUUID, email, password }) {
  const [otpCode, setOtpCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(expiresIn);
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(5);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          Alert.alert('OTP Expired', 'Please request a new OTP');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  async function handleVerifyOTP() {
    if (otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'OTP must be 6 digits');
      return;
    }

    setIsVerifying(true);

    try {
      // Verify OTP
      const verifyResponse = await fetch(
        'http://api.example.com/api/auth/otp/verify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userUUID,
            sessionId,
            otpCode
          })
        }
      );

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        setAttempts(verifyData.attemptsRemaining || 5);
        Alert.alert(
          'Invalid OTP',
          `${verifyData.message}\nAttempts remaining: ${verifyData.attemptsRemaining}`
        );
        setOtpCode('');
        return;
      }

      // OTP verified! Now login with verification token
      const loginResponse = await fetch(
        'http://api.example.com/api/auth/student/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            verificationToken: verifyData.verificationToken
          })
        }
      );

      const loginData = await loginResponse.json();

      if (!loginData.accessToken) {
        Alert.alert('Login Failed', loginData.message);
        return;
      }

      // Save tokens
      await AsyncStorage.setItem('accessToken', loginData.accessToken);
      await AsyncStorage.setItem('refreshToken', loginData.refreshToken);

      // Navigate to dashboard
      navigation.replace('Dashboard');
      
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP Code</Text>
      <Text style={styles.subtitle}>
        Check your device notification for the 6-digit code
      </Text>

      <TextInput
        style={styles.input}
        placeholder="000000"
        placeholderTextColor="#999"
        keyboardType="numeric"
        maxLength={6}
        value={otpCode}
        onChangeText={setOtpCode}
        editable={!isVerifying}
      />

      <Text style={styles.timeLeft}>
        Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </Text>

      <Text style={styles.attempts}>
        Attempts remaining: {attempts}
      </Text>

      <TouchableOpacity
        style={[styles.button, isVerifying && styles.buttonDisabled]}
        onPress={handleVerifyOTP}
        disabled={isVerifying}
      >
        <Text style={styles.buttonText}>
          {isVerifying ? 'Verifying...' : 'Verify OTP'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResendOTP}>
        <Text style={styles.resendText}>
          Didn't receive code? Resend
        </Text>
      </TouchableOpacity>
    </View>
  );
}

async function handleResendOTP() {
  // Same as initiateLogin
  const response = await fetch(
    'http://api.example.com/api/auth/otp/send',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userUUID,
        deviceToken
      })
    }
  );

  if (response.ok) {
    Alert.alert('Success', 'New OTP sent to your device');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
    marginBottom: 20
  },
  timeLeft: {
    textAlign: 'center',
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 10
  },
  attempts: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  resendText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 15
  }
});
```

### 6. Complete Authentication Flow

```javascript
// authFlow.js
export async function completeAuthFlow(email, password, navigation) {
  try {
    // Step 1: Get device token
    const deviceToken = await messaging.getToken();
    
    // Step 2: Get or create user UUID
    let userUUID = await AsyncStorage.getItem('userUUID');
    
    if (!userUUID) {
      // First time - signup
      const signupResult = await signupUser('User Name', email, password);
      if (!signupResult.success) {
        throw new Error(signupResult.error);
      }
      userUUID = signupResult.userUUID;
      
      // Register device
      await registerDevice(userUUID, deviceToken);
    }
    
    // Step 3: Initiate OTP login
    const otpResult = await initiateLogin(email, password);
    if (!otpResult.success) {
      throw new Error(otpResult.error);
    }
    
    // Step 4: Show OTP input screen
    // (Component handles rest of flow)
    
  } catch (error) {
    Alert.alert('Authentication Error', error.message);
  }
}
```

### 7. Alternative: Traditional Password Login (Optional)

```javascript
async function loginWithPassword(email, password) {
  try {
    const response = await fetch(
      'http://api.example.com/api/auth/student/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password
          // No verificationToken - uses traditional password auth
        })
      }
    );

    const data = await response.json();

    if (data.accessToken) {
      // Save tokens and proceed
      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      return { success: true, data };
    }
    
    return { success: false, error: data.message };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Error Handling

```javascript
const ErrorMessages = {
  'INVALID_CREDENTIALS': 'Email or password is incorrect',
  'ACCOUNT_LOCKED': 'Account locked due to too many failed attempts',
  'ACCOUNT_NOT_ACTIVATED': 'Please verify your account first',
  'INVALID_TOKEN': 'OTP verification failed',
  'OTP_EXPIRED': 'OTP has expired, please request a new one',
  'TOO_MANY_ATTEMPTS': 'Too many verification attempts',
  'INVALID_DEVICE': 'Device not recognized'
};

async function handleAuthError(error) {
  const message = ErrorMessages[error.code] || error.message;
  Alert.alert('Authentication Error', message);
}
```

## Best Practices

✅ **Security:**
- Store tokens securely (use React Native Keychain)
- Clear tokens on logout
- Validate OTP before login
- Implement token refresh

✅ **UX:**
- Show countdown timer
- Allow OTP resend
- Provide clear error messages
- Auto-focus OTP input

✅ **Performance:**
- Cache device token
- Minimize API calls
- Handle network errors gracefully

✅ **Testing:**
- Test OTP timeout
- Test wrong OTP codes
- Test network failures
- Test token refresh

## Troubleshooting

**OTP not received?**
- Check notification permissions
- Ensure app is installed on device
- Try requesting new OTP

**Login fails after OTP?**
- Verify email/password are correct
- Check token validity
- Try logging out and back in

**Device not recognized?**
- Re-register device
- Check device token validity
- Restart app and device
