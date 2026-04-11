# BACKEND FIX REQUIRED: Notifications API Returning 500 Error

---

## 🤖 **PROMPT FOR BACKEND AI**

```
Fix the GET /api/v1/notifications endpoint that's returning 500 Internal Server Error.

Requirements:
- Endpoint: GET /notifications with optional query params (page, limit, isRead, type)
- Requires JWT authentication via Authorization header
- When user has NO notifications: return 204 No Content (NOT 500 error)
- When user has notifications: return 200 OK with JSON:
  {
    "notifications": [...],
    "unreadCount": 5,
    "pagination": { "page": 1, "limit": 20, "total": 5, "pages": 1 }
  }
- Extract userId from JWT token, filter notifications by userId
- Ensure database table exists with proper schema
- Add error handling and logging

Test: curl -H "Authorization: Bearer <TOKEN>" https://nmsl-api.onrender.com/api/v1/notifications?isRead=false
```

---

## Issue Summary
The GET `/api/v1/notifications` endpoint is returning a **500 Internal Server Error** when called from the frontend.

## Error Details
- **Endpoint**: `GET https://nmsl-api.onrender.com/api/v1/notifications?isRead=false`
- **Status Code**: 500 Internal Server Error
- **Date Observed**: April 11, 2026
- **Request Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`

## Expected Behavior
The endpoint should return:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "PASSWORD_CHANGED",
      "title": "Password Changed",
      "message": "Please sign in with your new password",
      "isRead": false,
      "actionUrl": "/auth/sign-in",
      "metadata": {
        "timestamp": "2026-04-11T11:08:33.876Z"
      },
      "createdAt": "2026-04-11T11:08:33.876Z"
    }
  ],
  "unreadCount": 5,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

## Current Frontend Implementation
The frontend is correctly:
- ✅ Sending Authorization header with JWT token
- ✅ Making GET request to `/notifications?isRead=false`
- ✅ Handling response data with TypeScript types
- ✅ Displaying error messages when API fails

## Possible Backend Issues

### 1. Database Query Error
The notifications table might not exist or have incorrect schema:
```sql
-- Expected notifications table structure
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  actionUrl VARCHAR(500),
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### 2. Missing User Authentication
The endpoint might not be properly checking the JWT token:
- Verify the user is authenticated before querying notifications
- Extract userId from JWT token
- Only return notifications for the authenticated user

### 3. TypeScript/NestJS Error
Check for:
- Missing DTO validation
- Incorrect query parameters handling
- Database connection issues
- Missing error handling try/catch blocks

## Debug Steps for Backend Team

1. **Check Server Logs**
   - Look for stack traces in the backend logs
   - Check for database connection errors
   - Verify JWT token validation is working

2. **Test Endpoint Directly**
   ```bash
   curl -X GET "https://nmsl-api.onrender.com/api/v1/notifications?isRead=false" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json"
   ```

3. **Verify Database**
   - Check if notifications table exists
   - Verify there are no constraint violations
   - Test query directly in database

4. **Check Code**
   ```typescript
   // Example NestJS Controller (should look similar)
   @Get('notifications')
   @UseGuards(JwtAuthGuard)
   async getNotifications(
     @Query() query: GetNotificationsDto,
     @Req() req: Request,
   ) {
     const userId = req.user.id;
     return this.notificationsService.findAll(userId, query);
   }
   ```

## Temporary Workaround
The frontend now shows:
- ❌ Error message: "Failed to load notifications - Backend API error"
- 🔄 Retry button for users to try again
- ⏱️ Auto-refresh is disabled when errors occur

## Required Action
**URGENT**: Backend team needs to:
1. Fix the 500 error in `/api/v1/notifications` endpoint
2. Ensure proper error handling and logging
3. Test with valid JWT tokens
4. Verify database schema matches expected structure
5. Deploy fix to production (Render)

## Contact
Frontend implementation is complete and working. Issue is entirely on backend API.

## Related Endpoints
These also need to be tested/verified:
- `PATCH /api/v1/notifications/:id/mark-read`
- `POST /api/v1/notifications/mark-all-read`

Both should also handle authentication and return proper responses.
