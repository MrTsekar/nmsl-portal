# Backend Quick Update - Services API

## TL;DR
Frontend updated - need 2 backend changes:

### 1. Location Field
- **Current Issue**: Services locked to admin's location
- **New Behavior**: Accept ANY location from: `Abuja, Lagos, Benin, Kaduna, Port Harcourt, Warri`
- **What to do**: Don't override `location` field with admin's facility - store exactly what frontend sends

```typescript
// Validate location as enum, but DON'T force admin's location
@IsEnum(['Abuja', 'Lagos', 'Benin', 'Kaduna', 'Port Harcourt', 'Warri'])
location: string;
```

### 2. Image Upload to Azure
- **Current Issue**: Storing base64 in database (huge!)
- **New Behavior**: Upload to Azure Blob Storage, return URLs
- **Affected Fields**: `bannerImageUrl`, `iconImageUrl` (services), `photoUrl` (board members)

**Flow:**
```
Frontend sends: "data:image/png;base64,iVBORw0KGg..."
Backend processes:
  1. Extract base64 data
  2. Upload to Azure Storage (container: nmsl-services or nmsl-board-members)
  3. Return Azure URL: "https://nmslstorage.blob.core.windows.net/services/{id}/banner.png"
```

**Test:**
```bash
# This should work - service in Port Harcourt, admin in Abuja
curl -X POST https://nmsl-api.onrender.com/api/v1/admin/services \
  -H "Authorization: Bearer {token}" \
  -d '{
    "location": "Port Harcourt",
    "bannerImageUrl": "data:image/png;base64,..."
  }'

# Response should have:
# - location: "Port Harcourt" (not admin's location)  
# - bannerImageUrl: "https://nmslstorage.blob.core.windows.net/..." (not base64)
```

## Priority
🔴 **High** - Already deployed to frontend, users can't create services with images until backend implements Azure upload
