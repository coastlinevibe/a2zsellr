# A2Z Business Directory - Bulk Upload Specification

## Overview
This document outlines the complete specification for the bulk profile upload feature in the A2Z Business Directory platform. The system will allow administrators to upload hundreds of business profiles at once with automated location creation and default product assignment.

## Requirements Summary

### Data Format & Volume
- **Format**: CSV file upload
- **Volume**: ~300 profiles per batch
- **Processing**: Single category per batch upload
- **Validation**: Full column validation with error reporting

### Profile Configuration
- **Subscription Tier**: Business tier for all bulk uploads
- **Status**: Active immediately upon upload
- **Duplicates**: Remove duplicate profiles (same name + address)
- **Contact Info**: Allow duplicate emails/phones for multi-location businesses

### Location Management
- **Auto-Creation**: Create missing locations in database
- **Coverage**: All provinces across South Africa
- **Data Source**: Province, city, and address from CSV
- **Integration**: Link profiles to existing or new location records

## CSV Structure

### Required Columns
```csv
display_name,address,city,province,website_url,phone_number,email,business_category
```

### Column Specifications
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| display_name | VARCHAR | Yes | Business/profile name |
| address | TEXT | Yes | Full business address |
| city | VARCHAR | Yes | City/location name |
| province | VARCHAR | Yes | South African province |
| website_url | VARCHAR | No | Business website |
| phone_number | VARCHAR | No | Contact phone |
| email | VARCHAR | No | Contact email |
| business_category | VARCHAR | Yes | Category slug (same for batch) |

> **Note**: The `business_location` field in the database is **not** provided in the CSV. It is automatically generated from the `city` and `province` values using a slug format (for example, `Mokopane` + `Limpopo` → `mokopane-limpopo`).

## Default Products System

### Product Assignment
- **Quantity**: 10 default products per profile
- **Images**: No images (text-only)
- **Category-Based**: Products match business category
- **Pricing**: Realistic South African pricing

### Example: Butcher Shop Products
1. **Lamb Chops 500g** - R45.00
   - Description: "Best quality chops, very soft cut"
   - Details: "Clean, Nice red color, Juicy and soft, Not too boney"

2. **Beef Steaks 1kg** - R85.00
   - Description: "Premium cuts, tender and juicy"
   - Details: "Fresh, Grade A beef, Perfect for grilling"

3. **Chicken Breasts 500g** - R35.00
   - Description: "Fresh, lean protein"
   - Details: "Skinless, boneless, farm fresh"

4. **Pork Ribs 1kg** - R65.00
   - Description: "Succulent and flavorful"
   - Details: "Meaty ribs, perfect for braai"

5. **Mince Beef 500g** - R40.00
   - Description: "Fresh ground beef"
   - Details: "Lean mince, daily fresh preparation"

6. **Boerewors 1kg** - R55.00
   - Description: "Traditional South African sausage"
   - Details: "Authentic recipe, coarse grind"

7. **Bacon 500g** - R50.00
   - Description: "Crispy, smoky flavor"
   - Details: "Streaky bacon, perfect thickness"

8. **Chicken Thighs 1kg** - R45.00
   - Description: "Juicy and tender"
   - Details: "Bone-in thighs, skin-on"

9. **Beef Biltong 250g** - R75.00
   - Description: "Dried, seasoned meat"
   - Details: "Traditional spices, air-dried"

10. **Sosaties 500g** - R60.00
    - Description: "Marinated meat skewers"
    - Details: "Mixed meat, traditional marinade"

## Process Flow

### Phase 1: Data Validation
1. **CSV Upload** - Admin uploads CSV file
2. **Column Validation** - Check all required columns present
3. **Data Validation** - Validate email formats, phone numbers, URLs
4. **Duplicate Detection** - Identify duplicate profiles
5. **Preview Generation** - Show upload summary before processing

### Phase 2: Location Processing
1. **Location Check** - Query existing locations in database
2. **Missing Location Creation** - Auto-create new locations
   - Generate slug from city name
   - Set province from CSV data
   - Default country to "South Africa"
   - Mark as active
3. **Location Assignment** - Link profiles to location records

### Phase 3: Profile Creation
1. **Profile Insert** - Bulk insert validated profiles
   - Set subscription_tier = 'business'
   - Set is_active = true
   - Generate unique IDs
   - Set created_at/updated_at timestamps
2. **Error Handling** - Track failed insertions
3. **Success Tracking** - Count successful creations

### Phase 4: Product Generation
1. **Category Detection** - Identify business category from CSV
2. **Product Template Selection** - Choose appropriate product set from defaultProducts.ts
3. **Product Creation** - Generate exactly 10 products per profile
   - Link to profile_id
   - Set is_active = true
   - No images initially (image_urls = null)
   - Category-specific products with realistic SA pricing
   - Include name, description, price_cents, and details
4. **Category-Based Products**:
   - **butcher-shop**: Lamb Chops, Beef Steaks, Chicken Breasts, Pork Ribs, Mince Beef, Boerewors, Bacon, Chicken Thighs, Beef Biltong, Sosaties
   - **restaurant**: Grilled Chicken Burger, Beef Steak, Fish and Chips, Chicken Schnitzel, Pasta Bolognese, Caesar Salad, Pizza Margherita, Lamb Curry, Seafood Platter, Chocolate Cake
   - **bakery**: Fresh White Bread, Whole Wheat Bread, Croissants, Chocolate Muffins, Meat Pies, Sausage Rolls, Birthday Cake, Rusks, Donuts, Sandwich Platters
   - **grocery**: Fresh Milk, Brown Eggs, White Sugar, Cooking Oil, Rice, Potatoes, Onions, Tomatoes, Bananas, Apples
   - **fallback**: Generic products for unknown categories
5. **Bulk Product Insert** - Insert all products efficiently using profile_products table

### Phase 5: Reporting
1. **Success Summary** - Count of created profiles and products
2. **Error Report** - List of failed records with reasons
3. **Location Report** - New locations created
4. **Duplicate Report** - Profiles skipped due to duplication

## Database Impact

### Tables Affected
- **profiles** - Main profile records
- **locations** - New location creation
- **profile_products** - Default product creation
- **categories** - Reference for validation

### Performance Considerations
- **Batch Processing** - Process in chunks to avoid timeouts
- **Transaction Management** - Rollback on critical failures
- **Index Usage** - Optimize queries for bulk operations
- **Memory Management** - Stream large CSV files

## System Placement

### Admin Dashboard Integration
The bulk upload system will be integrated into the existing admin dashboard at `/app/admin/page.tsx`:

1. **New Tab Addition**: Add "BULK UPLOAD" tab to the existing navigation
2. **Tab Position**: Place after "CATEGORIES" tab, before "RESET SYSTEM" tab
3. **Tab Configuration**:
   ```javascript
   { key: 'bulk-upload', label: 'BULK UPLOAD', icon: Upload, color: 'bg-indigo-500' }
   ```

### File Structure
- **Frontend Component**: `/components/BulkUploadManager.tsx`
- **API Endpoint**: `/app/api/admin/bulk-upload/route.ts`
- **Utility Functions**: `/lib/bulkUploadUtils.ts`
- **Product Templates**: `/lib/defaultProducts.ts`

### Admin Interface Integration

### New Admin Tab
- Add "Bulk Upload" tab to existing admin dashboard
- Position after "Categories" tab
- Use consistent styling with existing tabs

### Upload Interface
- **File Upload** - Drag & drop CSV upload
- **Category Selection** - Choose category for batch
- **Preview Mode** - Show data before processing
- **Progress Tracking** - Real-time upload progress
- **Results Display** - Success/error summary

## Error Handling

### Validation Errors
- Missing required columns
- Invalid email formats
- Invalid phone number formats
- Invalid URL formats
- Duplicate profile detection

### Processing Errors
- Database connection failures
- Transaction rollback scenarios
- File parsing errors
- Memory/timeout issues

### Recovery Mechanisms
- Partial success handling
- Resume capability for large uploads
- Error logging for debugging
- User-friendly error messages

## Security Considerations

### Access Control
- Admin-only functionality
- Role-based permissions
- Audit logging for uploads

### Data Validation
- SQL injection prevention
- XSS protection
- File type validation
- Size limits on uploads

## Future Enhancements

### Potential Additions
- **Image Bulk Upload** - Separate image processing
- **Update Mode** - Bulk update existing profiles
- **Template Management** - Custom product templates
- **Scheduling** - Automated recurring uploads
- **API Integration** - External system integration

## Implementation Timeline

### Phase 1: Core Development (Week 1)
- CSV parsing and validation
- Location auto-creation
- Basic profile insertion

### Phase 2: Product System (Week 1)
- Default product templates
- Category-based product assignment
- Bulk product creation

### Phase 3: Admin Interface (Week 2)
- Upload interface design
- Progress tracking
- Results reporting

### Phase 4: Testing & Refinement (Week 2)
- End-to-end testing
- Performance optimization
- Error handling refinement

## Success Metrics

### Performance Targets
- **Upload Speed**: 300 profiles in under 2 minutes
- **Success Rate**: 95%+ successful profile creation
- **Error Recovery**: Clear error reporting for failures

### Quality Measures
- **Data Integrity**: No corrupted profile data
- **Location Accuracy**: Correct province/city mapping
- **Product Consistency**: All profiles get 10 products

---

**Document Version**: 1.0  
**Last Updated**: November 13, 2025  
**Status**: Approved for Development
