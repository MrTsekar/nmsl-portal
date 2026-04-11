# Backend Update: Services Location Selector

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

## Success Criteria
✅ Services can be created with any of the 6 Nigeria locations  
✅ Location field is validated (rejects invalid locations)  
✅ GET requests return the correct stored location  
✅ Location is NOT overridden with admin's facility
