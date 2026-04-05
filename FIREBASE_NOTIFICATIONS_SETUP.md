# Firebase Notifications - Setup Complete! ✅

## What Was Implemented

### 1. **Database Architecture** 🗄️
- **Quiz Server DB** (quizServer): Stores local notifications
- **Shared Microservice DB** (edulearn-social): Stores device tokens (shared with microservice)
- Both databases initialized on app startup

### 2. **Firebase Integration** 🔥
- Firebase Admin SDK configured
- Service account credentials loaded from `src/config/firebase-service-account.json`
- VAPID key for web push notifications configured
- Firebase Messaging initialized automatically

### 3. **Models Created** 📋
- **Notification** Model: Stores notification history on quiz server
- **DeviceToken** Model: Uses shared microservice database (from `edulearn-social`)

### 4. **Services Implemented** ⚙️
- **firebase-notification.service.js**: Core notification service
  - Send to single user: `sendToUser()`
  - Send to multiple users: `sendToUsers()`
  - Register device tokens: `registerDeviceToken()`
  - Specific notification types: login, quiz assigned, completed, achievements, grades
  - Auto-cleanup of invalid/old tokens

- **microservice.service.js**: Inter-service communication
  - Sync notifications with microservice
  - Sync device tokens
  - Health checks

### 5. **API Endpoints** 🛣️

#### User Endpoints (Authenticated)
```
POST   /api/v1/notifications/device-token
       - Register a device for push notifications

DELETE /api/v1/notifications/device-token/:token
       - Unregister a device

GET    /api/v1/notifications
       - Get all notifications (paginated)
       - Query: page, limit

GET    /api/v1/notifications/unread-count
       - Get unread notification count

PATCH  /api/v1/notifications/:notificationId/read
       - Mark notification as read

DELETE /api/v1/notifications/:notificationId
       - Delete a notification

DELETE /api/v1/notifications
       - Clear all notifications
```

#### Internal API Endpoints (Microservice Only)
```
POST   /api/v1/internal/device-tokens/sync
       - Sync device tokens from microservice

GET    /api/v1/internal/device-tokens/:userUUID
       - Get device tokens for a user

POST   /api/v1/internal/device-tokens/mark-invalid
       - Mark tokens as invalid

POST   /api/v1/internal/notifications/sync
       - Sync notifications from microservice

GET    /api/v1/internal/notifications/:userUUID
       - Get notifications for a user

POST   /api/v1/internal/device-tokens/cleanup
       - Cleanup old device tokens
```

### 6. **Configuration** ⚙️

Required environment variables (added to .env):
```
# Shared Database for Device Tokens
SHARED_DB_URI=mongodb+srv://adilyassar9898:adilyassar98A@cluster0.9tblz0r.mongodb.net/edulearn-social?appName=Cluster0

# Firebase Credentials
FIREBASE_SERVICE_ACCOUNT_JSON=./src/config/firebase-service-account.json
FIREBASE_VAPID_PUBLIC_KEY=BOiy3MKWfS5AYytJWPn65dNtlgBm-MyBtrSwWoYz_cJKJiRVhWDtSmBgV37HudhHgQEc8D3YrvhnuVzwBAdWEfQ

# Microservice Integration
MICROSERVICE_URL=https://a348-101-53-234-27.ngrok-free.app
MICROSERVICE_INTERNAL_TOKEN=edulearn-microservice-secret-internal-token-change-in-prod
```

---

## Testing

Run the test script to verify everything is working:
```bash
npm run test-notifications
```

Or add to package.json:
```json
{
  "scripts": {
    "test-notifications": "node test-notifications.js"
  }
}
```

---

## Next Steps - Integrate Notification Triggers

### 1. Update Auth Service (Login Notifications)

**File:** `src/services/auth.service.js` (or wherever you handle login)

```javascript
import firebaseNotificationService from './firebase-notification.service.js';

// Inside login function:
await firebaseNotificationService.sendAuthNotification(
    user.uuid,
    {
        deviceName: deviceInfo?.deviceName || 'Web Browser',
        location: deviceInfo?.location,
        ipAddress: deviceInfo?.ipAddress,
        timestamp: new Date()
    }
);
```

### 2. Update Quiz Service (Quiz Notifications)

**File:** `src/services/quiz.service.js`

```javascript
import firebaseNotificationService from './firebase-notification.service.js';

// Quiz Assignment:
await firebaseNotificationService.sendQuizAssignedNotification(
    studentUUIDs,
    {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.questions.length,
        imageUrl: quiz.imageUrl
    }
);

// Quiz Completion:
await firebaseNotificationService.sendQuizCompletedNotification(
    studentUUID,
    quiz,
    score,
    totalMarks
);

// Grade Release:
await firebaseNotificationService.sendGradeReleasedNotification(
    studentUUID,
    quiz,
    grade
);
```

### 3. Update Achievement Service

```javascript
import firebaseNotificationService from './firebase-notification.service.js';

await firebaseNotificationService.sendAchievementNotification(
    userUUID,
    achievement
);
```

---

## How Device Token Sync Works

```
User's Mobile App
    ↓
Calls POST /api/v1/notifications/device-token
    ↓
Quiz Server stores in shared DB (edulearn-social)
    ↓
Quiz Server notifies Microservice of sync (optional)
    ↓
Both servers can now send notifications to this device
```

---

## Files Created/Modified

### Created Files ✨
```
src/config/firebase.js                     - Firebase Admin SDK config
src/config/firebase-service-account.json   - Firebase credentials
src/models/deviceToken.js                  - Device token model (uses shared DB)
src/models/notification.js                 - Notification model
src/services/firebase-notification.service.js      - Notification service
src/services/microservice.service.js               - Microservice integration
src/controllers/Notification/notificationController.js  - Request handlers
src/routes/notificationRoutes.js            - Notification API routes (Fastify)
src/routes/internal.api.routes.js          - Internal API routes (Fastify)
test-notifications.js                       - Test script
```

### Modified Files 📝
```
app.js                          - Added shared DB init, Firebase init
src/config/connect.js           - Added connectSharedDB function
src/routes/index.js             - Added notification routes registration
.env                            - Added Firebase & microservice config
.gitignore                      - Already excludes *.json
```

---

## Troubleshooting

### Issue: "Shared database not initialized"
**Solution:** Make sure `SHARED_DB_URI` is set in .env before starting the app

### Issue: "Firebase credentials not found"
**Solution:** Verify `src/config/firebase-service-account.json` exists with valid JSON

### Issue: Device tokens not syncing with microservice
**Solution:** Check `MICROSERVICE_URL` and `MICROSERVICE_INTERNAL_TOKEN` match exactly

### Issue: Push notifications not received
**Solution:** 
1. Verify device token is registered
2. Check Firebase project is correct in credentials
3. Check browser/app has permission for notifications
4. Check browser console for errors

---

## Architecture Summary

```
┌─────────────────────────────────────────┐
│      Firebase Project (edulearn-ce604)  │
│     Cloud Messaging & Analytics         │
└──────────┬──────────────────────────────┘
           │
    ┌──────────────────────────────────────────┐
    │         Quiz Server (This App)           │
    ├──────────────────────────────────────────┤
    │ Database: quiz-server                    │
    │ - Users (existing)                       │
    │ - Notifications (audit trail)            │
    │ - Quizzes, Assignments, etc (existing)   │
    │                                          │
    │ Shared Connection: edulearn-social       │
    │ - Device Tokens (dual write)             │
    │                                          │
    │ Services:                                │
    │ - firebase-notification.service.js       │
    │ - microservice.service.js                │
    └────────────┬─────────────────────────────┘
                 │
                 ├─────→ Firebase Cloud Messaging
                 │       (sends push notifications)
                 │
                 └─────→ Microservice (ngrok URL)
                        (syncs data)
```

---

## Questions?

All notification types are ready to use:
- ✅ auth_login
- ✅ quiz_assigned
- ✅ quiz_completed
- ✅ achievement_unlocked
- ✅ grade_released
- ✅ homework_reminder (custom)

You can add custom notification types by extending the enum in the Notification model!
