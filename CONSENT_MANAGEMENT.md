# Microsoft Clarity Consent Management Implementation

## Overview

This implementation follows Microsoft's Clarity Consent Management guidelines, providing users with full control over their privacy preferences while ensuring compliance with GDPR, CCPA, and other privacy regulations.

## Documentation References

- [Microsoft Clarity Consent Management](https://learn.microsoft.com/en-us/clarity/setup-and-installation/consent-management)
- [Clarity Consent API v2](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2)

## Implementation Components

### 1. Cookie Consent Banner Component
**Location**: `/app/components/CookieConsent.tsx`

A client-side component that:
- Displays a consent banner to first-time visitors
- Provides three consent categories:
  - **Necessary Cookies**: Always enabled (required for site functionality)
  - **Analytics Cookies**: Controls Microsoft Clarity tracking
  - **Marketing Cookies**: Controls marketing/advertising tracking
- Offers three consent options:
  - **Accept All**: Grants all permissions
  - **Reject All**: Only necessary cookies enabled
  - **Customize**: Granular control over each category
- Stores user preferences in localStorage
- Communicates consent to Clarity via Consent API v2

### 2. Consent Storage
**Key**: `sreve-cookie-consent`

Stored in localStorage as JSON:
```json
{
  "necessary": true,
  "analytics": false,
  "marketing": false
}
```

### 3. Clarity Integration
**Location**: `/app/layout.tsx`

The Clarity script is modified to:
1. Load Clarity tracking script
2. Check for saved consent preferences
3. Apply consent using `window.clarity('consent', boolean)`
4. Default to **no consent** until user provides explicit permission

## How It Works

### First Visit Flow

1. User visits the site
2. Clarity loads but tracking is **disabled by default**
3. Cookie consent banner appears at the bottom
4. User makes a choice (Accept/Reject/Customize)
5. Consent is saved to localStorage
6. Clarity consent is updated immediately via API
7. Banner disappears

### Return Visit Flow

1. User visits the site
2. Clarity loads and checks localStorage for saved consent
3. If consent was granted, Clarity tracking starts immediately
4. If consent was denied, Clarity tracking remains disabled
5. Banner does not appear (user already made a choice)

## Clarity Consent API v2

The implementation uses Clarity's Consent API v2:

```javascript
// Grant consent (enable tracking)
window.clarity('consent');

// Revoke consent (disable tracking)
window.clarity('consent', false);
```

### When Consent is Granted
- Full session recording enabled
- Heatmaps active
- User behavior analytics collected
- Data visible in Clarity dashboard

### When Consent is Denied
- No session recording
- No heatmaps
- No user behavior tracking
- Clarity loads but collects nothing

## Styling

**Location**: `/app/styles/cookie-consent.css`

Follows Sreve's dark theme design system:
- Three levels of darkness (#000000, #0f0f0f, #1f1f1f)
- Text hierarchy (white, light grey, dark grey)
- Orange accents for CTAs and active states
- Glass/frost effects for modern UI
- Fully responsive design

## User Experience

### Banner Placement
- Fixed at bottom of viewport
- Non-intrusive gradient overlay
- Does not block content
- Dismisses after selection

### Customization Options
- Toggle switches for each category
- Clear descriptions of what each category does
- Link to Privacy Policy
- Save and Back buttons

## Privacy Compliance

### GDPR Compliance
✅ Explicit consent required before tracking
✅ Granular control over data collection
✅ Easy consent withdrawal
✅ Clear privacy policy link
✅ No tracking without consent

### CCPA Compliance
✅ Opt-out mechanism provided
✅ Clear disclosure of data collection
✅ User control over personal information

### Best Practices
✅ Consent requested on first visit
✅ Default to privacy (no tracking without consent)
✅ Persistent consent storage
✅ Clear communication about data usage
✅ Easy to change preferences

## Testing the Implementation

### Test Consent Flow

1. **First Visit Test**:
   ```
   - Clear localStorage
   - Visit site
   - Verify banner appears
   - Check that Clarity is disabled (Network tab: no data sent)
   - Grant consent
   - Verify Clarity starts tracking (Network tab: data sent to Clarity)
   ```

2. **Reject Consent Test**:
   ```
   - Clear localStorage
   - Visit site
   - Click "Reject All"
   - Verify banner disappears
   - Check that Clarity remains disabled
   - Reload page - banner should not reappear
   ```

3. **Custom Consent Test**:
   ```
   - Clear localStorage
   - Visit site
   - Click "Customize"
   - Toggle analytics off, marketing on
   - Save preferences
   - Verify Clarity respects analytics toggle
   ```

### Browser Console Testing

Check consent status:
```javascript
// View saved consent
JSON.parse(localStorage.getItem('sreve-cookie-consent'))

// Check if Clarity is loaded
typeof window.clarity === 'function'

// Manually grant consent
window.clarity('consent')

// Manually revoke consent
window.clarity('consent', false)
```

## Updating Consent Categories

To add or modify consent categories, update:

1. **ConsentState interface** in `CookieConsent.tsx`:
   ```typescript
   interface ConsentState {
     necessary: boolean;
     analytics: boolean;
     marketing: boolean;
     // Add new categories here
   }
   ```

2. **applyClarityConsent function** to handle new categories

3. **Banner UI** to display new toggle switches

## Future Enhancements

Potential improvements:
- [ ] Google Analytics consent integration
- [ ] Google Ads consent integration
- [ ] Consent management dashboard for users
- [ ] Cookie preference change button in footer
- [ ] Multilingual support for banner
- [ ] Consent analytics (% users accepting/rejecting)

## Support

For issues or questions:
- Check Microsoft Clarity documentation
- Review consent logs in browser console
- Test in incognito mode for first-visit behavior
- Verify localStorage is not disabled in browser

## Maintenance

### Regular Checks
- Test consent flow quarterly
- Update privacy policy when categories change
- Monitor Clarity dashboard for tracking data
- Verify compliance with new regulations

### Known Limitations
- Requires JavaScript enabled
- Requires localStorage enabled
- Banner dismissed permanently (no way to reopen without clearing localStorage)

## Implementation Checklist

✅ Cookie consent banner component created
✅ Consent storage in localStorage
✅ Clarity Consent API v2 integration
✅ Three consent categories implemented
✅ Default to no tracking without consent
✅ Dark theme styling applied
✅ Responsive design for all devices
✅ Privacy policy link included
✅ Build passes without errors
✅ Documentation complete

---

**Last Updated**: 2025-01-30
**Implementation Version**: 1.0
**Clarity Consent API Version**: v2
