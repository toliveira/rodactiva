# GitHub Setup Instructions

This document provides step-by-step instructions to set up the Rodactiva website repository on GitHub.

## Prerequisites

- GitHub account
- Git installed on your machine
- GitHub CLI (optional but recommended)

## Step 1: Create a New Repository on GitHub

1. Go to [GitHub](https://github.com) and log in
2. Click the **+** icon in the top right corner
3. Select **New repository**
4. Fill in the details:
   - **Repository name**: `rodactiva-website`
   - **Description**: Modern website for Rodactiva adventure sports association
   - **Visibility**: Public (or Private if preferred)
   - **Initialize repository**: Leave unchecked (we'll push existing code)
5. Click **Create repository**

## Step 2: Initialize Git Locally

```bash
cd /home/ubuntu/rodactiva-website

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Rodactiva website with Firebase integration"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/rodactiva-website.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Set Up Environment Variables

Create the following files in your GitHub repository (via GitHub UI or locally):

### For Development (.env.development)
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_RECAPTCHA_KEY=your_recaptcha_key
```

### For Staging (.env.staging)
```
VITE_FIREBASE_API_KEY=your_staging_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_staging_auth_domain
# ... other variables
```

### For Production (.env.production)
```
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_auth_domain
# ... other variables
```

**Note**: Never commit `.env` files. They're already in `.gitignore`.

## Step 4: Set Up GitHub Actions (Optional)

Create `.github/workflows/deploy.yml` for automated deployment:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '22'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Build
      run: pnpm build
      env:
        VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
        # ... add other secrets
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        channelId: live
        projectId: rodactiva-c1b0b
```

## Step 5: Add GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add all Firebase configuration as secrets:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`
   - `FIREBASE_RECAPTCHA_KEY`
   - `FIREBASE_SERVICE_ACCOUNT` (for deployment)

## Step 6: Populate Firestore with Initial Data

Run the seeding script to populate your Firebase Firestore with initial data:

```bash
# Make sure you have the correct Firebase credentials in .env.production
node scripts/seed-firestore.mjs
```

## Step 7: Deploy to Firebase Hosting

### Option 1: Manual Deployment

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init hosting

# Build the project
pnpm build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Option 2: Automated Deployment via GitHub Actions

The GitHub Actions workflow (if set up) will automatically deploy on every push to `main`.

## Step 8: Configure Custom Domain (Optional)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Hosting**
4. Click **Connect domain**
5. Follow the instructions to add your custom domain

## Useful Commands

```bash
# View git status
git status

# View commit history
git log

# Create a new branch
git checkout -b feature/your-feature-name

# Push changes
git push origin feature/your-feature-name

# Create a pull request on GitHub UI
```

## Troubleshooting

### Firebase Deployment Issues
- Ensure Firebase CLI is installed: `npm install -g firebase-tools`
- Check Firebase project ID in `.firebaserc`
- Verify you're logged in: `firebase login`

### Environment Variables Not Loading
- Ensure `.env.production` is in the root directory
- Restart the dev server after changing environment variables
- Check that variable names match in your code

### Firestore Seeding Issues
- Ensure Firebase credentials are correct in `.env.production`
- Check Firestore security rules allow writes
- Verify network connection to Firebase

## Next Steps

1. Set up branch protection rules
2. Configure code review requirements
3. Set up automated testing
4. Monitor Firebase usage and costs
5. Set up error tracking (e.g., Sentry)

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase Hosting Deployment](https://firebase.google.com/docs/hosting/github-integration)
