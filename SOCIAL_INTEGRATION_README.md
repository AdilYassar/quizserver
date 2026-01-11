# Social Microservice Integration Guide

## Overview
The Quiz Server now supports social microservice integration, serving as the primary source of truth for user and course data while publishing events for real-time synchronization.

## Architecture

```
┌─────────────────┐    Events    ┌────────────────────┐
│   Quiz Server   │ ──────────► │ Social Microservice │
│                 │             │                    │
│ • User/Course   │             │ • Social Profiles  │
│   Management    │◄────────────│ • Posts & Feeds    │
│                 │   APIs      │ • Groups & Chat    │
│ • Event         │             │ • Notifications    │
│   Publishing    │             └────────────────────┘
└─────────────────┘
```

## Setup Instructions

### 1. Environment Variables
Add to your `.env` file:
```env
QUIZ_SERVER_INTERNAL_TOKEN=social-microservice-secret-8923
RABBITMQ_URL=amqp://guest:guest@localhost:5672  # or cloud URL
```

### 2. Message Queue Setup

#### Option A: Local RabbitMQ
```bash
# Install RabbitMQ
choco install rabbitmq  # Windows
# or download from https://www.rabbitmq.com/download.html

# Start RabbitMQ
rabbitmq-server

# Enable management plugin (optional)
rabbitmq-plugins enable rabbitmq_management
# Access at http://localhost:15672 (guest/guest)
```

#### Option B: Cloud RabbitMQ (Recommended)
- **CloudAMQP**: https://www.cloudamqp.com/
- **Amazon MQ**: AWS-managed RabbitMQ
- **Google Cloud Pub/Sub**: Alternative message service

Example CloudAMQP setup:
```env
RABBITMQ_URL=amqp://username:password@host:port/vhost
```

### 3. Social Microservice Implementation

#### Event Consumption
```javascript
import socialService from './social-microservice-consumer.js';

// Start listening for user events
await socialService.connect();
```

#### API Integration
```javascript
// Fetch user data
const user = await socialService.fetchUserData(uuid);

// Fetch multiple users
const users = await socialService.fetchBatchUsers([uuid1, uuid2]);

// Fetch course students
const students = await socialService.fetchCourseStudents(courseId);
```

## API Endpoints

### Authentication
All internal APIs require:
```
Authorization: Bearer social-microservice-secret-8923
x-internal-service: social-microservice
```

### Available Endpoints

#### Get Single User
```
GET /api/internal/user/{uuid}
Response: User object with profile data
```

#### Get Batch Users
```
POST /api/internal/users/batch
Body: { "uuids": ["uuid1", "uuid2"] }
Response: Array of user objects
```

#### Get Course Students
```
GET /api/internal/courses/{courseId}/students
Response: Array of enrolled students
```

## Event Types

### User Events
Published to `user_events` exchange with topic routing:

#### user.created
```json
{
  "user": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2026-01-11T18:00:00.000Z"
}
```

#### user.updated
```json
{
  "user": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Smith",
    "email": "johnsmith@example.com"
  },
  "changes": ["name", "email"],
  "timestamp": "2026-01-11T18:00:00.000Z"
}
```

## Testing

### Run Integration Tests
```bash
# Test the complete integration
node test-social-integration.js

# Expected output: All endpoints return 200 status
```

### Manual Testing
```bash
# 1. Start Quiz Server
npm start

# 2. Start Social Microservice (in another terminal)
node social-microservice-example.js

# 3. Register a user via Quiz Server UI/API
# 4. Check social microservice logs for event processing
```

## Production Deployment

### Environment Setup
```env
NODE_ENV=production
QUIZ_SERVER_INTERNAL_TOKEN=your-secure-token-here
RABBITMQ_URL=your-cloud-rabbitmq-url
QUIZ_SERVER_URL=https://your-quiz-server.com
```

### Security Considerations
- Use strong, unique internal tokens
- Enable SSL/TLS for RabbitMQ connections
- Implement rate limiting on internal APIs
- Monitor event processing for failures

### Monitoring
- Track event processing success/failure rates
- Monitor API response times
- Set up alerts for RabbitMQ connection issues
- Log all data synchronization activities

## Troubleshooting

### Common Issues

#### RabbitMQ Connection Failed
- Verify RabbitMQ is running
- Check connection URL and credentials
- Ensure firewall allows port 5672

#### API Authentication Failed
- Verify `QUIZ_SERVER_INTERNAL_TOKEN` matches
- Check `x-internal-service` header is set
- Ensure internal routes are registered before session middleware

#### Events Not Received
- Confirm exchange `user_events` exists
- Check routing key pattern matching
- Verify consumer is bound to correct queue

#### User Data Not Found
- Ensure UUID format is correct
- Check user exists in Quiz Server database
- Verify internal API endpoints are accessible

## Next Steps

1. **Implement Social Features**: User profiles, posts, followers, groups
2. **Add More Events**: Course enrollment, quiz completion, achievements
3. **Real-time Features**: WebSocket integration for live updates
4. **Analytics**: Track social engagement metrics
5. **Admin Tools**: Moderation, content management

---

## Files Modified/Created

### Quiz Server Changes
- `src/routes/internal.routes.js` - Internal API endpoints
- `src/middleware/internal-auth.middleware.js` - Authentication
- `src/utils/rabbitmq.js` - Event publishing
- `src/controllers/User/userController.js` - Event triggers
- `app.js` - Route registration
- `.env` - Environment variables

### Social Microservice
- `social-microservice-consumer.js` - Event consumer & API client
- `social-microservice-example.js` - Usage example

### Testing
- `test-social-integration.js` - Comprehensive integration tests

---

**Integration Complete!** 🎉

The Quiz Server now successfully integrates with social microservices, providing real-time data synchronization and API access for building rich social features.</content>
<parameter name="filePath">d:\Apps\quizserver\SOCIAL_INTEGRATION_README.md
