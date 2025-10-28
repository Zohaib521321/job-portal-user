# Google Search Console Schema Fixes

## Issues Fixed

### 1. Missing field 'addressRegion' (in 'jobLocation.address')
✅ **FIXED**: Added comprehensive Pakistani city-to-region mapping
- Automatically detects region from city names (Karachi → Sindh, Lahore → Punjab, etc.)
- Handles 100+ Pakistani cities across all provinces
- Fallback logic for unrecognized locations

### 2. Missing field 'postalCode' (in 'jobLocation.address')
✅ **FIXED**: Added postal code extraction
- Detects 5-digit Pakistani postal codes in location strings
- Optional field (only included when found)

### 3. Missing field 'streetAddress' (in 'jobLocation.address')
✅ **FIXED**: Added street address extraction
- Detects common address patterns (Street, Road, Avenue, etc.)
- Optional field (only included when found)

### 4. Missing field 'baseSalary'
✅ **FIXED**: Added comprehensive salary parsing
- Handles multiple formats: "PKR 40,000", "40k-50k", "competitive", etc.
- Extracts min/max values for salary ranges
- Converts "k" notation to full numbers (40k → 40000)
- Proper currency detection (PKR, Rs, Rupees)

## Implementation Details

### Salary Parsing (`parseSalary`)
```typescript
// Supported formats:
"PKR 40,000" → { minValue: 40000, currency: "PKR", unitText: "MONTH" }
"40k-50k" → { minValue: 40000, maxValue: 50000, currency: "PKR", unitText: "MONTH" }
"competitive" → null (no salary data)
"40k" → { minValue: 40000, currency: "PKR", unitText: "MONTH" }
```

### Location Parsing (`parseLocation`)
```typescript
// Supported formats:
"Karachi" → { addressLocality: "Karachi", addressRegion: "Sindh", addressCountry: "PK" }
"Lahore, Punjab" → { addressLocality: "Lahore", addressRegion: "Punjab", addressCountry: "PK" }
"123 Main Street, Lahore" → { addressLocality: "Lahore", addressRegion: "Punjab", streetAddress: "123 Main Street", addressCountry: "PK" }
```

### Updated Schema Structure
```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Karachi",
      "addressRegion": "Sindh",
      "addressCountry": "PK",
      "postalCode": "75000", // when available
      "streetAddress": "123 Main Street" // when available
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "PKR",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 40000,
      "maxValue": 50000,
      "unitText": "MONTH"
    }
  }
}
```

## Testing

To verify the fixes work:

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **Google Search Console**: Monitor for reduced warnings

## Expected Results

After deployment, you should see:
- ✅ No more "Missing field 'addressRegion'" warnings
- ✅ No more "Missing field 'postalCode'" warnings  
- ✅ No more "Missing field 'streetAddress'" warnings
- ✅ No more "Missing field 'baseSalary'" warnings

## Files Modified

- `/src/lib/seo.ts` - Added parsing functions and updated schema generation
- All job detail pages now use the enhanced schema automatically

## Notes

- All fields are optional and only included when data is available
- Handles edge cases like "competitive" salary (no schema generated)
- Maintains backward compatibility with existing job data
- Supports both Pakistani and international location formats
