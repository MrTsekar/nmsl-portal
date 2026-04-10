# Backend Fix Request: Services API

## Issue
The `POST /admin/services` endpoint is returning **500 Internal Server Error** when creating new services.

## Current Problem
The frontend is sending the correct payload according to the API specification, but the backend is rejecting it.

## Frontend Payload (What We're Sending)
```json
{
  "name": "yes yes yes",
  "category": "Primary Care",
  "location": "Abuja",
  "shortDescription": "yes no no no no",
  "fullDescription": "yen yen yen yen yen yen yen",
  "bannerImageUrl": "data:image/png;base64,...",
  "iconImageUrl": "data:image/png;base64,...",
  "keyServices": [
    {
      "title": "yen",
      "description": "yen"
    }
  ]
}
```

## Expected Backend Behavior

### 1. **KeyServices Should NOT Have `id` Field on Create**
When creating a new service, `keyServices` array items should only contain:
- `title` (string)
- `description` (string)

**DO NOT expect `id` field** - the backend should generate IDs for keyServices.

### 2. **Images as Base64 Data URLs**
The frontend converts uploaded images to base64 data URLs like:
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

Backend should:
- Accept base64 data URLs
- Store them as-is OR convert/upload to cloud storage
- Return the same format in responses

### 3. **Response Format**
After successfully creating a service, return the full service object with generated IDs:
```json
{
  "id": "uuid-generated-by-backend",
  "name": "yes yes yes",
  "category": "Primary Care",
  "location": "Abuja",
  "shortDescription": "yes no no no no",
  "fullDescription": "yen yen yen yen yen yen yen",
  "bannerImageUrl": "data:image/png;base64,...",
  "iconImageUrl": "data:image/png;base64,...",
  "keyServices": [
    {
      "id": "ks-uuid-generated-by-backend",
      "title": "yen",
      "description": "yen"
    }
  ],
  "createdAt": "2026-04-10T23:00:00Z",
  "updatedAt": "2026-04-10T23:00:00Z"
}
```

## Required Backend Changes

### 1. Update DTO/Validation
**CreateServiceDto should accept:**
```typescript
class CreateServiceDto {
  @IsString()
  name: string;

  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @IsString()
  location: string;

  @IsString()
  shortDescription: string;

  @IsString()
  @IsOptional()
  fullDescription: string;

  @IsString()
  @IsOptional()
  bannerImageUrl?: string;

  @IsString()
  @IsOptional()
  iconImageUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKeyServiceDto)
  keyServices: CreateKeyServiceDto[];
}

class CreateKeyServiceDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
  
  // DO NOT include 'id' here - backend generates it
}
```

### 2. Service Creation Logic
```typescript
async create(createServiceDto: CreateServiceDto): Promise<Service> {
  const service = this.serviceRepository.create({
    ...createServiceDto,
    // Backend generates IDs for keyServices
    keyServices: createServiceDto.keyServices.map(ks => ({
      title: ks.title,
      description: ks.description,
      // Let TypeORM/database generate the ID
    })),
  });

  return await this.serviceRepository.save(service);
}
```

### 3. Update Service (PATCH)
For updates, keyServices SHOULD include IDs:
```json
{
  "keyServices": [
    {
      "id": "existing-id",
      "title": "updated title",
      "description": "updated description"
    }
  ]
}
```

## Testing Checklist

### Test Case 1: Create Service with KeyServices
**Request:**
```http
POST /admin/services
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Test Service",
  "category": "Primary Care",
  "location": "Abuja",
  "shortDescription": "Test description",
  "fullDescription": "Full description here",
  "keyServices": [
    { "title": "Service 1", "description": "Description 1" },
    { "title": "Service 2", "description": "Description 2" }
  ]
}
```

**Expected Response:** 201 Created with full service object including generated IDs

### Test Case 2: Create Service with Images
**Request:**
```http
POST /admin/services
Authorization: Bearer {token}

{
  "name": "Imaging Service",
  "category": "Diagnostic Services",
  "location": "Lagos",
  "shortDescription": "Imaging services",
  "bannerImageUrl": "data:image/png;base64,iVBORw0KG...",
  "iconImageUrl": "data:image/jpeg;base64,/9j/4AAQ...",
  "keyServices": []
}
```

**Expected Response:** 201 Created with images stored correctly

### Test Case 3: Update Service
**Request:**
```http
PATCH /admin/services/{id}
Authorization: Bearer {token}

{
  "shortDescription": "Updated description",
  "keyServices": [
    {
      "id": "ks-uuid-1",
      "title": "Updated title",
      "description": "Updated description"
    }
  ]
}
```

**Expected Response:** 200 OK with updated service

## Error Handling

Return proper HTTP status codes:
- **201** - Created successfully
- **400** - Bad request (validation error)
- **401** - Unauthorized
- **403** - Forbidden (wrong role)
- **500** - Internal server error (with error details in dev mode)

## Current Error (500 Response)
When we send the create request, backend returns 500 error. Please check:
1. Database constraints (are they rejecting base64 strings?)
2. DTO validation (is it expecting `id` in keyServices?)
3. TypeORM relationships (cascade/eager loading configured?)
4. Error logs on backend - what's the actual error?

## Priority: HIGH
This blocks the admin from managing services on the live site.

---

## Additional Issue: Session Not Persisting After Refresh

### Problem
Users are being logged out when they refresh the page, even though Zustand persist middleware is configured.

### Status: INVESTIGATING FRONTEND
Backend token system is working correctly. Issue is likely in frontend persistence/restoration.

### What's Implemented
- Zustand store with `persist` middleware
- `localStorage` key: `nmsl-auth-storage`
- Token stored under: `nmsl-token`

### Frontend Debugging Required
1. **Check if token is actually being saved:**
   ```javascript
   // After login, in browser console:
   console.log(localStorage.getItem('nmsl-auth-storage'));
   // Should show: {"state":{"token":"...","user":{...},"isAuthenticated":true},"version":0}
   ```

2. **Check if token is being restored on refresh:**
   ```javascript
   // On page load, check store state:
   const token = useAuthStore.getState().token;
   console.log('Restored token:', token);
   console.log('Is authenticated:', useAuthStore.getState().isAuthenticated);
   ```

3. **Verify token in API requests:**
   ```javascript
   // In axios interceptor, verify:
   console.log('Auth header:', config.headers.Authorization);
   // Should be: "Bearer eyJhbGciOiJIUzI1NiIs..."
   ```

4. **Check token expiration:**
   ```javascript
   // Decode JWT (install: npm install jwt-decode)
   import { jwtDecode } from 'jwt-decode';
   const decoded = jwtDecode(token);
   console.log('Token expires:', new Date(decoded.exp * 1000));
   // Should be 7 days from issue time
   ```

### Possible Frontend Issues
- Zustand persist middleware not hydrating before AuthGuard runs
- localStorage being cleared by another script
- Token format mismatch between storage and API client
- Browser privacy/incognito mode blocking localStorage

---

**Contact:** Frontend team has implemented the correct payload. Please review backend validation and service creation logic.
