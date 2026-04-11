# 🔴 URGENT: Fix Notifications API - 500 Error

## Problem
`GET /api/v1/notifications?isRead=false` returns **500 Internal Server Error** instead of proper response.

## What Should Happen

### When user has NO notifications:
```http
HTTP/1.1 204 No Content
```
OR
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "notifications": [],
  "unreadCount": 0,
  "pagination": { "page": 1, "limit": 20, "total": 0, "pages": 0 }
}
```

### When user HAS notifications:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "notifications": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "password_changed",
      "title": "Password Changed",
      "message": "Please sign in with your new password",
      "isRead": false,
      "actionUrl": "/auth/sign-in",
      "metadata": null,
      "createdAt": "2026-04-11T12:00:00.000Z"
    }
  ],
  "unreadCount": 1,
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

## Fix Checklist

1. **Check if notifications table exists** in database
2. **Extract userId from JWT token** in Authorization header
3. **Query notifications** filtered by userId
4. **If empty result**: Return 200 with empty array (or 204)
5. **If has results**: Return 200 with proper JSON structure
6. **Add try/catch** error handling with logging
7. **Test endpoint** with valid JWT token

## Database Schema (if table missing)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  actionUrl VARCHAR(500),
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(userId);
CREATE INDEX idx_notifications_read ON notifications(isRead);
```

## Expected Behavior
- ✅ Empty notifications → 200 OK with empty array
- ✅ Has notifications → 200 OK with data
- ❌ 500 error should NEVER happen for valid requests
- ❌ Only return 401 if JWT token is invalid/missing

## Test Command
```bash
curl -v -H "Authorization: Bearer <JWT_TOKEN>" \
  "https://nmsl-api.onrender.com/api/v1/notifications?isRead=false"
```

**Frontend is working correctly. Backend must return proper HTTP responses, not 500 errors.**
