# Backend Update: Location Selector + Image Upload

## 🚨 QUICK SUMMARY FOR BACKEND
**Two changes needed:**

1. **Location Selector**: Accept ANY Nigeria location in `POST/PATCH /admin/services` - don't force admin's location
2. **Image Upload**: Upload base64 images to Azure, return Azure URLs (not base64)

---

## Change Summary
Frontend now allows admins to **select any location** when creating/editing services, instead of hardcoding to their admin location.

## What Changed (Frontend)
- Services form now has a location dropdown
- Available locations: **Abuja, Lagos, Benin, Kaduna, Port Harcourt, Warri**
- Users can select different location than their admin facility

## Backend Requirements

### 1. Accept Location Field
Ensure `POST /admin/services` and `PATCH /admin/services/{id}` accept `location` field:

```json
{
  "name": "Cardiology Services",
  "category": "Specialist Care",
  "location": "Lagos",  // ← Can be ANY Nigeria location, not just admin's
  "shortDescription": "...",
  ...
}
```

### 2. Validate Location (Enum)
Add validation for allowed locations:

```typescript
enum NigeriaLocation {
  ABUJA = 'Abuja',
  LAGOS = 'Lagos',
  BENIN = 'Benin',
  KADUNA = 'Kaduna',
  PORT_HARCOURT = 'Port Harcourt',
  WARRI = 'Warri'
}

class CreateServiceDto {
  @IsEnum(NigeriaLocation)
  location: NigeriaLocation;
  // ... other fields
}
```

### 3. Store & Return Location
- Store the exact location value sent by frontend
- **DO NOT override** with admin's location
- Return location in all service responses (list, get, create, update)

## Test Command
```bash
curl -X POST https://nmsl-api.onrender.com/api/v1/admin/services \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Service",
    "category": "Primary Care",
    "location": "Port Harcourt",
    "shortDescription": "Testing location selector",
    "keyServices": []
  }'
```

**Expected:** Service created with `location: "Port Harcourt"`, not admin's location.

## Image Upload Requirements

### Services Images (`bannerImageUrl`, `iconImageUrl`)
Frontend currently sends base64 data URLs. Backend should:

1. **Accept base64 data URLs** in create/update requests:
   ```json
   {
     "bannerImageUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
     "iconImageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
   }
   ```

2. **Upload to Azure Blob Storage**:
   - Extract image data from base64 string
   - Determine file type from data URL prefix (`image/png`, `image/jpeg`, etc.)
   - Upload to Azure Storage container (e.g., `nmsl-services`)
   - Generate unique filename: `services/{id}/banner.{ext}` or `services/{id}/icon.{ext}`

3. **Return Azure Storage URLs** in response:
   ```json
   {
     "id": "uuid",
     "bannerImageUrl": "https://nmslstorage.blob.core.windows.net/services/uuid/banner.png",
     "iconImageUrl": "https://nmslstorage.blob.core.windows.net/services/uuid/icon.jpg",
     ...
   }
   ```

### Board Members Photos (`photoUrl`)
Same pattern for board member profile photos:

1. Accept base64 data URL in `photoUrl` field
2. Upload to Azure Storage (`nmsl-board-members` container)
3. Store as `board-members/{id}/photo.{ext}`
4. Return Azure Storage URL in response

**Frontend will handle converting uploaded files to base64 before sending.**

## Success Criteria
✅ Services can be created with any of the 6 Nigeria locations  
✅ Location field is validated (rejects invalid locations)  
✅ GET requests return the correct stored location  
✅ Location is NOT overridden with admin's facility  
✅ Base64 images are uploaded to Azure Blob Storage  
✅ Azure Storage URLs are returned and stored in database  
✅ Images are publicly accessible via Azure CDN URLs
