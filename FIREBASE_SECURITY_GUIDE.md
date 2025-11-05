# Firebase Service Account Security Guide

## Overview

This guide explains how to properly secure Firebase service accounts and prevent exposing sensitive credentials in your crypto-price-monitor project.

## Current Security Status

### ✅ Good Practices Found
1. `.gitignore` properly configured to exclude service account files:
   - `*-firebase-adminsdk-*.json`
   - `serviceAccount*.json`
   - `firebase-service-account.json`
   - `config.js` and `config.json` are also excluded

2. Environment variable support implemented in `build-config.js`

3. Example configuration file provided (`config.example.js`)

### ⚠️ Security Concerns Identified

1. **Exposed API Keys in Multiple Files**
   - Firebase API keys and Supabase keys are hardcoded in several HTML files
   - These keys are currently exposed in the repository

2. **Sensitive Information in Documentation**
   - API keys are visible in setup documentation files

## Understanding Firebase Keys

### Public vs Private Keys

1. **Client-Side Keys (Less Sensitive)**
   - `apiKey`: Used for client authentication
   - `authDomain`, `projectId`, etc.: Configuration identifiers
   - These are meant to be public but should still be protected with security rules

2. **Service Account Keys (HIGHLY SENSITIVE)**
   - Contains `private_key`, `client_email`, `project_id`
   - NEVER commit these to version control
   - Used for server-side admin operations only

## Best Practices

### 1. Service Account File Management

**Never commit service account JSON files:**
```bash
# Example of what a service account file looks like - NEVER COMMIT THIS
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@your-project.iam.gserviceaccount.com",
  "client_id": "12345",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

### 2. Environment Variable Configuration

**For Local Development:**
```bash
# Create .env.local (already in .gitignore)
FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccount.json
# OR use individual values
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=service@project.iam.gserviceaccount.com
```

**For Production (Netlify):**
1. Store the entire service account JSON as a single environment variable:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
   ```

2. Or store individual components:
   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
   FIREBASE_CLIENT_EMAIL=service@project.iam.gserviceaccount.com
   ```

### 3. Secure Code Implementation

**For Server-Side/Build Scripts:**
```javascript
// Option 1: Load from JSON file (local dev only)
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

// Option 2: Parse from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

// Option 3: Construct from individual environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

// Initialize admin SDK
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

### 4. Client-Side Configuration

**Current Approach (Needs Improvement):**
```javascript
// ❌ Avoid hardcoding in files
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "project.firebaseapp.com"
};
```

**Recommended Approach:**
```javascript
// ✅ Load from environment or config loader
const firebaseConfig = {
  apiKey: window.ENV_CONFIG?.FIREBASE?.apiKey || '',
  authDomain: window.ENV_CONFIG?.FIREBASE?.authDomain || '',
  projectId: window.ENV_CONFIG?.FIREBASE?.projectId || ''
};
```

### 5. Security Rules Configuration

**Firebase Security Rules (firestore.rules):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Restrict access to authenticated users only
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.email in ['admin@example.com'];
    }
  }
}
```

**Realtime Database Rules:**
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null && auth.token.email_verified == true"
  }
}
```

## Migration Steps

### 1. Remove Hardcoded Keys
```bash
# Find all files with hardcoded keys
grep -r "AIzaSy" . --include="*.html" --include="*.js"

# Update each file to use config loader
```

### 2. Update Configuration Files
1. Ensure `config.js` is never committed (already in .gitignore)
2. Use `config.example.js` as template
3. Update all HTML files to use `config-loader.js`

### 3. Set Up Netlify Environment Variables
```bash
# Using Netlify CLI
netlify env:set FIREBASE_API_KEY "your-api-key"
netlify env:set FIREBASE_AUTH_DOMAIN "your-domain"
# ... etc
```

### 4. Clean Git History (if needed)
If sensitive data was already committed:
```bash
# Use BFG Repo-Cleaner
bfg --delete-files "serviceAccount*.json"
bfg --replace-text passwords.txt  # Create file with patterns to replace

# Or use git-filter-repo
git filter-repo --path serviceAccount.json --invert-paths

# Force push after cleaning
git push --force
```

## Monitoring and Auditing

### Regular Security Checks
1. **Weekly:** Review Firebase console for unusual activity
2. **Monthly:** Rotate service account keys
3. **Per Commit:** Ensure no sensitive files are included

### Automated Scanning
Add to `.github/workflows/security-check.yml`:
```yaml
name: Security Check
on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check for secrets
        run: |
          # Check for service account patterns
          if grep -r "private_key" . --include="*.json" --include="*.js"; then
            echo "⚠️ Potential private key found!"
            exit 1
          fi
          
          # Check for Firebase patterns
          if grep -r "firebase-adminsdk" . --include="*.json"; then
            echo "⚠️ Potential service account file found!"
            exit 1
          fi
```

## Emergency Response

### If Service Account is Exposed:

1. **Immediately revoke the exposed key:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Delete the old key from IAM console

2. **Check for unauthorized access:**
   - Review Firebase Authentication logs
   - Check Firestore/Database access logs
   - Monitor billing for unusual activity

3. **Update all systems:**
   - Update all environments with new credentials
   - Restart all services using the credentials

4. **Document the incident:**
   - Note when and how the exposure occurred
   - List all affected systems
   - Create action items to prevent recurrence

## Additional Resources

- [Firebase Security Checklist](https://firebase.google.com/docs/admin/setup#security)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

## Checklist for Developers

- [ ] Never commit service account JSON files
- [ ] Use environment variables for all sensitive configuration
- [ ] Enable Firebase Security Rules
- [ ] Regularly rotate service account keys
- [ ] Monitor Firebase usage and access logs
- [ ] Use least privilege principle for service accounts
- [ ] Enable 2FA on Google Cloud Console
- [ ] Review and update security rules regularly
- [ ] Use separate Firebase projects for dev/staging/production
- [ ] Implement proper error handling to avoid exposing keys in logs

Remember: **When in doubt, regenerate your keys!**