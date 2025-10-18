# GitHub Actions Setup Guide for Crypto Price Monitor

## Overview
This guide will help you set up automated crypto price collection using GitHub Actions, which runs directly on GitHub's servers - no local computer needed!

## Prerequisites
- GitHub account with this repository
- Repository must be public OR you have GitHub Actions minutes available

## Step-by-Step Setup

### Step 1: Enable GitHub Actions
1. Go to your repository on GitHub: https://github.com/EUO-oma/crypto-price-monitor
2. Click on the "Actions" tab
3. If prompted, enable GitHub Actions for the repository

### Step 2: Create Personal Access Token (PAT)
1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "crypto-price-monitor-actions"
4. Select these scopes:
   - ✅ repo (all permissions under repo)
   - ✅ workflow
5. Set expiration (recommend: 90 days, remember to renew)
6. Click "Generate token"
7. **COPY THE TOKEN NOW** - you won't see it again!

### Step 3: Add Token as Repository Secret
1. Go to your repository Settings
2. Navigate to: Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `GITHUB_TOKEN_WORKFLOW`
5. Value: Paste the token you copied
6. Click "Add secret"

### Step 4: Create Workflow File
The workflow file is already created at `.github/workflows/collect-prices.yml`

### Step 5: Verify Setup
1. Go to the Actions tab in your repository
2. You should see "Collect Crypto Prices" workflow
3. Click "Run workflow" → "Run workflow" to test manually
4. Wait for it to complete (green checkmark = success)

### Step 6: Check Results
1. Go to your repository's main page
2. Check the `data/` folder for new JSON files
3. Look at commit history to see automated commits

## Customization Options

### Change Schedule
Edit `.github/workflows/collect-prices.yml`:
```yaml
schedule:
  - cron: '0 */6 * * *'  # Current: every 6 hours
```

Common schedules:
- `'0 * * * *'` - Every hour
- `'0 */2 * * *'` - Every 2 hours
- `'0 0,12 * * *'` - Twice daily (midnight and noon)
- `'*/30 * * * *'` - Every 30 minutes

### Add More Cryptocurrencies
Edit `collector.js` and add to the `COINS` array:
```javascript
const COINS = ['bitcoin', 'ethereum', 'dogecoin', 'your-new-coin'];
```

## Troubleshooting

### Workflow Not Running
- Check Actions tab for error messages
- Ensure GitHub Actions is enabled
- Verify the PAT token hasn't expired

### Permission Errors
- Make sure the PAT has correct permissions
- Verify secret name matches in workflow file

### No Data Updates
- Check if CoinGecko API is accessible
- Look at workflow run logs for errors

## Cost Considerations
- Public repositories: GitHub Actions is FREE
- Private repositories: 2,000 minutes/month free, then paid

## Monitoring
- GitHub will email you if workflows fail
- Check Actions tab regularly for status
- Set up GitHub notifications for workflow runs

## Security Notes
- Never commit tokens or secrets
- Rotate PAT tokens regularly
- Use repository secrets for sensitive data

## Support
- Check workflow logs in Actions tab
- Review GitHub Actions documentation
- Ensure collector.js works locally first