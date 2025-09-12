# 🎥 Video Call Server - Complete Implementation Guide

## 🚀 **Overview**

This is a complete WebRTC video calling solution integrated into our Quiz Server. The backend provides full signaling support for peer-to-peer video calls with real-time chat, participant management, and session handling.

---

## 📋 **Table of Contents**

1. [Backend Implementation](#backend-implementation)
2. [API Endpoints](#api-endpoints)
3. [Socket Events](#socket-events)
4. [Frontend Integration Guide](#frontend-integration-guide)
5. [Known Issues & Solutions](#known-issues--solutions)
6. [Testing](#testing)
7. [Architecture](#architecture)

---

## 🔧 **Backend Implementation**

### **Technologies Used:**
- **Framework**: Fastify
- **Database**: MongoDB (with TTL for session cleanup)
- **Real-time Communication**: Socket.IO
- **WebRTC Signaling**: Complete offer/answer/ICE candidate exchange

### **Key Features:**
- ✅ Session management with automatic cleanup (24h TTL)
- ✅ Real-time participant tracking
- ✅ WebRTC signaling (offers, answers, ICE candidates)
- ✅ Text chat with message history
- ✅ Microphone/video toggle support
- ✅ Comprehensive logging with emojis
- ✅ AdminJS integration for session management
- ✅ Error handling and participant disconnect management

---

## 🌐 **API Endpoints**

### **Base URL**: `http://localhost:3000/api`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/create-session` | Create new video call session | `{}` | `{"sessionId": "abc123"}` |
| `GET` | `/is-alive?sessionId=abc123` | Check if session exists | - | `{"isAlive": true}` |
| `GET` | `/session/:sessionId` | Get session details | - | Session object with participants & chat |
| `DELETE` | `/session/:sessionId` | Delete session | - | `{"message": "Session deleted"}` |

### **Example Usage:**

```javascript
// Create session
const response = await fetch('http://localhost:3000/api/create-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}'
});
const { sessionId } = await response.json();

// Check session
const isAlive = await fetch(`http://localhost:3000/api/is-alive?sessionId=${sessionId}`);
const { isAlive: alive } = await isAlive.json();
```

---

## 🔌 **Socket Events**

### **Connection Setup:**
```javascript
const socket = io('http://localhost:3000');
```

### **Client → Server Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `prepare-session` | `{sessionId, userId}` | Initialize session for user |
| `join-session` | `{sessionId, userId, name, photo, micOn, videoOn}` | Join video call |
| `current-room` | `{sessionId}` | Get current room info |
| `send-offer` | `{sessionId, offer, toUserId}` | Send WebRTC offer |
| `send-answer` | `{sessionId, answer, toUserId}` | Send WebRTC answer |
| `send-ice-candidate` | `{sessionId, candidate, toUserId}` | Send ICE candidate |
| `toggle-mic` | `{sessionId, userId, micOn}` | Toggle microphone |
| `toggle-video` | `{sessionId, userId, videoOn}` | Toggle video |
| `send-message` | `{sessionId, userId, message}` | Send chat message |
| `hang-up` | `{sessionId, userId}` | End call |
| `leave-session` | `{sessionId, userId}` | Leave session |

### **Server → Client Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `session-info` | `{participants: [...]}` | Session participant list |
| `current-room-info` | `{participants: [...], chat: [...]}` | Complete room state |
| `new-participant` | `{userId, name, socketId, ...}` | New user joined |
| `participant-left` | `{userId, name, ...}` | User left session |
| `participant-updated` | `{userId, micOn, videoOn, ...}` | User toggled mic/video |
| `receive-offer` | `{offer, fromUserId}` | Received WebRTC offer |
| `receive-answer` | `{answer, fromUserId}` | Received WebRTC answer |
| `receive-ice-candidate` | `{candidate, fromUserId}` | Received ICE candidate |
| `new-message` | `{userId, name, message, timestamp}` | New chat message |
| `call-ended` | - | Call ended by participant |
| `error` | `{message: "Error description"}` | Error occurred |

---

## 📱 **Frontend Integration Guide**

### **1. Required Dependencies:**
```bash
npm install socket.io-client react-native-webrtc
# iOS
cd ios && pod install
```

### **2. Permissions (React Native):**
```json
{
  "android.permission.CAMERA": true,
  "android.permission.RECORD_AUDIO": true,
  "android.permission.MODIFY_AUDIO_SETTINGS": true,
  "android.permission.INTERNET": true
}
```

### **3. Basic WebRTC Setup:**
```javascript
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  RTCView
} from 'react-native-webrtc';
import io from 'socket.io-client';

// ICE servers configuration
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// Initialize peer connection
const peerConnection = new RTCPeerConnection(iceServers);

// Get user media
const localStream = await mediaDevices.getUserMedia({
  video: true,
  audio: true
});

// Add local stream to peer connection
localStream.getTracks().forEach(track => {
  peerConnection.addTrack(track, localStream);
});
```

### **4. Socket Integration Example:**
```javascript
const socket = io('http://localhost:3000');

// Join session
socket.emit('join-session', {
  sessionId: 'your-session-id',
  userId: 'user-123',
  name: 'John Doe',
  photo: 'profile-url',
  micOn: true,
  videoOn: true
});

// Handle WebRTC signaling
socket.on('receive-offer', async ({ offer, fromUserId }) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  
  socket.emit('send-answer', {
    sessionId: 'your-session-id',
    answer: answer,
    toUserId: fromUserId
  });
});

socket.on('receive-answer', async ({ answer }) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('receive-ice-candidate', async ({ candidate }) => {
  await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// Handle ICE candidates
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit('send-ice-candidate', {
      sessionId: 'your-session-id',
      candidate: event.candidate,
      toUserId: 'target-user-id'
    });
  }
};

// Handle remote stream
peerConnection.ontrack = (event) => {
  const [remoteStream] = event.streams;
  // Display remote stream in RTCView
  setRemoteStream(remoteStream);
};
```

### **5. Video Display Component:**
```jsx
import { RTCView } from 'react-native-webrtc';

const VideoCall = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  return (
    <View style={styles.container}>
      {/* Local Video */}
      {localStream && (
        <RTCView
          style={styles.localVideo}
          streamURL={localStream.toURL()}
          mirror={true}
        />
      )}
      
      {/* Remote Video */}
      {remoteStream && (
        <RTCView
          style={styles.remoteVideo}
          streamURL={remoteStream.toURL()}
        />
      )}
    </View>
  );
};
```

---

## 🚨 **Known Issues & Solutions**

### **Issue: Video/Audio Not Working in React Native**

**Symptoms:**
- Socket connection works ✅
- Signaling (offers/answers/ICE candidates) works ✅
- Participants can join sessions ✅
- **BUT**: No video or audio streams are visible/audible ❌

**Most Common Causes:**

#### **1. Media Stream Setup Issues**
```javascript
// ❌ Wrong: Not properly getting user media
const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});

// ✅ Correct: React Native WebRTC way
import { mediaDevices } from 'react-native-webrtc';
const stream = await mediaDevices.getUserMedia({
  video: {
    width: 640,
    height: 480,
    frameRate: 30,
    facingMode: 'user'
  },
  audio: true
});
```

#### **2. Peer Connection Track Handling**
```javascript
// ❌ Wrong: Not adding local tracks
peerConnection.addStream(localStream); // Deprecated

// ✅ Correct: Add tracks individually
localStream.getTracks().forEach(track => {
  peerConnection.addTrack(track, localStream);
});
```

#### **3. Remote Stream Handling**
```javascript
// ❌ Wrong: Using deprecated onaddstream
peerConnection.onaddstream = (event) => {
  setRemoteStream(event.stream);
};

// ✅ Correct: Use ontrack
peerConnection.ontrack = (event) => {
  const [remoteStream] = event.streams;
  setRemoteStream(remoteStream);
};
```

#### **4. ICE Candidate Timing**
```javascript
// ❌ Wrong: Adding ICE candidates too early
socket.on('receive-ice-candidate', async ({ candidate }) => {
  await peerConnection.addIceCandidate(candidate);
});

// ✅ Correct: Check remote description first
socket.on('receive-ice-candidate', async ({ candidate }) => {
  if (peerConnection.remoteDescription) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } else {
    // Queue candidates for later
    queuedCandidates.push(candidate);
  }
});
```

#### **5. Platform-Specific Issues**

**Android:**
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

**iOS:**
```xml
<!-- ios/YourApp/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>This app needs camera access for video calling</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access for voice calling</string>
```

---

## 🧪 **Testing**

### **Backend Testing:**
```bash
# Start server
npm start

# Test socket connection
node test-comprehensive.js
```

### **Frontend Testing Checklist:**
- [ ] Socket connection established
- [ ] Can create and join sessions
- [ ] Local video stream appears
- [ ] WebRTC offers/answers exchanged
- [ ] ICE candidates exchanged
- [ ] Remote video stream appears
- [ ] Audio works both ways
- [ ] Chat messages work
- [ ] Mic/video toggle works
- [ ] Disconnect handling works

### **Debug Tools:**
```javascript
// Enable WebRTC debugging
peerConnection.addEventListener('connectionstatechange', () => {
  console.log('Connection state:', peerConnection.connectionState);
});

peerConnection.addEventListener('icegatheringstatechange', () => {
  console.log('ICE gathering state:', peerConnection.iceGatheringState);
});

// Log all socket events
socket.onAny((event, ...args) => {
  console.log('Socket event:', event, args);
});
```

---

## 🏗️ **Architecture**

```
┌─────────────────┐    WebRTC Signaling    ┌─────────────────┐
│   React Native  │◄─────Socket.IO────────►│   Quiz Server   │
│   Mobile App    │                        │   (Fastify)     │
├─────────────────┤                        ├─────────────────┤
│ • useWebRTC.js  │                        │ • videoCallController
│ • WSProvider.js │                        │ • Session Model │
│ • UserView.js   │                        │ • Socket Events │
│ • Call Screens  │                        │ • REST API      │
└─────────────────┘                        └─────────────────┘
         │                                           │
         │         Direct P2P Media Stream           │
         └───────────────WebRTC───────────────────────┘
                     (Audio/Video)
```

### **Data Flow:**
1. **Session Creation**: Frontend → REST API → MongoDB
2. **Socket Connection**: Frontend → Socket.IO → Backend
3. **WebRTC Signaling**: Frontend ↔ Socket.IO ↔ Backend ↔ Other Clients
4. **Media Streams**: Direct P2P between clients (not through server)
5. **Chat Messages**: Frontend → Socket.IO → Backend → All participants

---

## 📞 **Support**

For issues with your frontend implementation, please provide:

1. **useWebRTC.js** - Your WebRTC hook implementation
2. **WSProvider.js** - Socket connection logic
3. **UserView.js** - Video display component
4. **Console logs** - Any errors in React Native debugger
5. **Device info** - iOS/Android version, physical device or simulator

---

## 🎉 **Conclusion**

The backend is **100% functional** with comprehensive logging and all WebRTC signaling working perfectly. If video/audio isn't working, the issue is almost certainly in the frontend media stream handling, peer connection setup, or platform-specific WebRTC configuration.

**Backend Status**: ✅ Complete and Working  
**Frontend Status**: ⚠️ Needs WebRTC media stream debugging

---

**Last Updated**: August 17, 2025  
**Server URL**: http://localhost:3000  
**Admin Panel**: http://localhost:3000/admin
