# Firebase Security Rules Update Guide

## Overview
Your Firebase Realtime Database is currently in test mode which will expire soon. This guide will help you update to production-ready security rules that protect your data while allowing your crypto price monitor to function properly.

## Quick Update Instructions

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Realtime Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update the Rules
1. Copy the entire contents of `firebase-rules.json` file
2. Replace the existing rules in the Firebase Console
3. Click **Publish** to apply the new rules
4. The warning about expiring rules should disappear

## Understanding the Security Rules

### 1. Price Data (`/prices`)
```json
"prices": {
  ".read": true,  // Anyone can read price data
  ".write": "auth != null || (data.exists() && data.child('apiKey').val() === newData.child('apiKey').val())"
}
```
- **Read**: Public access (anyone can view crypto prices)
- **Write**: Only authenticated users OR requests with a valid API key
- **Validation**: Ensures price data has required fields (price, timestamp, symbol)

### 2. User Alerts (`/alerts`)
```json
"alerts": {
  ".read": "auth != null",
  ".write": "auth != null",
  "$userId": {
    ".read": "$userId === auth.uid",
    ".write": "$userId === auth.uid"
  }
}
```
- **Read/Write**: Only authenticated users can access their own alerts
- **Privacy**: Users cannot see or modify other users' alerts

### 3. User Profiles (`/users`)
```json
"users": {
  ".read": "auth != null",
  "$userId": {
    ".read": "$userId === auth.uid",
    ".write": "$userId === auth.uid"
  }
}
```
- **Access**: Users can only read/write their own profile data
- **Validation**: Ensures user data has required fields (email, createdAt)

### 4. Configuration (`/config`)
```json
"config": {
  ".read": true,
  ".write": "auth != null && auth.token.admin === true"
}
```
- **Read**: Public access for app configuration
- **Write**: Only admin users can modify configuration

## Setting Up Authentication

### Option 1: Anonymous Authentication (Simplest)
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Anonymous** provider
3. In your app, add:
```javascript
import { signInAnonymously } from 'firebase/auth';

// Sign in anonymously when app starts
signInAnonymously(auth)
  .then(() => console.log('Signed in anonymously'))
  .catch(error => console.error('Auth error:', error));
```

### Option 2: Email/Password Authentication
1. Enable **Email/Password** provider in Firebase Console
2. Implement sign-up and sign-in forms in your app
3. Use Firebase Auth SDK methods:
```javascript
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Sign up
createUserWithEmailAndPassword(auth, email, password)
  .then(userCredential => {
    // User created
  });

// Sign in
signInWithEmailAndPassword(auth, email, password)
  .then(userCredential => {
    // User signed in
  });
```

### Option 3: API Key for Server-Side Writes
For server-side price updates without authentication:
1. Generate a secure API key
2. Store it in your environment variables
3. Include it when writing price data:
```javascript
// When writing price data
const priceData = {
  price: 50000,
  timestamp: Date.now(),
  symbol: 'BTC',
  apiKey: process.env.FIREBASE_API_KEY // Your secret key
};
```

## Security Best Practices

### 1. Environment Variables
Never hardcode sensitive data. Use environment variables:
```bash
# .env file (add to .gitignore)
FIREBASE_API_KEY=your-secret-api-key
FIREBASE_PROJECT_ID=your-project-id
```

### 2. Rate Limiting
Consider implementing rate limiting for write operations:
```json
".write": "auth != null && !root.child('rateLimits').child(auth.uid).exists()"
```

### 3. Data Validation
Always validate data structure and types:
- Numbers should be positive where appropriate
- Strings should have length limits
- Timestamps should be reasonable

### 4. Regular Security Audits
- Review rules monthly
- Check Firebase Security Rules Simulator
- Monitor usage patterns in Firebase Console

## Testing Your Rules

### Using Firebase Security Rules Simulator
1. In Firebase Console, go to **Rules** tab
2. Click **Simulator** button
3. Test different scenarios:
   - Authenticated read/write
   - Unauthenticated read
   - Wrong user ID access

### Common Test Cases
1. **Public price read**: Should succeed
2. **Authenticated price write**: Should succeed
3. **Unauthenticated alert access**: Should fail
4. **User accessing another user's data**: Should fail

## Troubleshooting

### Issue: "Permission Denied" errors
- Check if user is authenticated
- Verify the data path matches rules
- Ensure data structure matches validation rules

### Issue: Rules not updating
- Clear browser cache
- Wait 1-2 minutes for propagation
- Check for syntax errors in rules

### Issue: App stops working after rules update
- Implement authentication in your app
- Add API key for server-side writes
- Check browser console for specific errors

## Migration Checklist

- [ ] Back up current data
- [ ] Copy new rules to Firebase Console
- [ ] Implement authentication in app
- [ ] Test all app features
- [ ] Monitor for errors in first 24 hours
- [ ] Document any custom API keys used

## Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/database/security)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Security Rules Cookbook](https://firebase.google.com/docs/rules/basics)

## Support

If you encounter issues:
1. Check Firebase Status page
2. Review error messages in browser console
3. Test with Security Rules Simulator
4. Consider Firebase Support for production apps