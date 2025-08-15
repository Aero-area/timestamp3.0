# GitHub Setup Guide

Follow these steps to set up your GitHub repository and deploy your Timestamp 3.0 app.

## 🚀 Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `stamp-time-tracking` (or your preferred name)
   - **Description**: "A modern time tracking app for freelancers built with React Native and Expo"
   - **Visibility**: Choose Public or Private
   - **Initialize with**: Don't add README, .gitignore, or license (we already have these)
5. Click "Create repository"

## 🔗 Step 2: Connect Your Local Repository

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/stamp-time-tracking.git

# Set the main branch as upstream
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## 🔐 Step 3: Set Up GitHub Secrets

For the GitHub Actions deployment to work, you need to add secrets:

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add these secrets one by one:

### Required Secrets:
- **Name**: `EXPO_PUBLIC_SUPABASE_URL`
  - **Value**: Your Supabase project URL
- **Name**: `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - **Value**: Your Supabase anon key
- **Name**: `EXPO_PUBLIC_BACKUP_BUCKET`
  - **Value**: Your backup bucket name
- **Name**: `EXPO_PUBLIC_BACKUP_ENABLED`
  - **Value**: `false` (or `true` if you want backups)

### Vercel Secrets (if using Vercel deployment):
- **Name**: `VERCEL_TOKEN`
  - **Value**: Get from [Vercel Account Settings](https://vercel.com/account/tokens)
- **Name**: `VERCEL_ORG_ID`
  - **Value**: Get from Vercel project settings
- **Name**: `VERCEL_PROJECT_ID`
  - **Value**: Get from Vercel project settings

## 🚀 Step 4: Deploy Your App

### Option A: GitHub Actions (Automatic)
- Push to `main` branch
- GitHub Actions will automatically build and deploy
- Check the **Actions** tab for deployment status

### Option B: Manual Deployment
```bash
# Build the app
npm run build:web

# Deploy to Vercel
npm run deploy:vercel

# Or deploy to Netlify
npm run deploy:netlify
```

## 📱 Step 5: Test Your Deployment

1. **Check the Actions tab** for build status
2. **Visit your deployed URL** (Vercel/Netlify will provide this)
3. **Test all functionality**:
   - Login with your Supabase credentials
   - Test the timestamp functionality
   - Navigate between tabs
   - Test offline functionality

## 🔧 Troubleshooting

### If push fails:
```bash
# Check remote configuration
git remote -v

# Remove and re-add remote if needed
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/stamp-time-tracking.git
```

### If GitHub Actions fail:
1. Check the Actions tab for error details
2. Verify all secrets are properly set
3. Check that environment variables are correct
4. Ensure Supabase project is accessible

### If deployment fails:
1. Test locally first: `npm start`
2. Check build locally: `npm run build:web`
3. Verify environment variables in deployment platform

## 📋 Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Configure monitoring** and analytics
3. **Set up staging environment** for testing
4. **Implement feature branches** for development
5. **Set up automated testing** pipeline

## 🎯 Quick Commands Reference

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Build app
npm run build:web

# Start development
npm start
```

## 🔒 Security Reminders

- ✅ `.env` file is in `.gitignore` (won't be committed)
- ✅ Environment variables are set as GitHub secrets
- ✅ Supabase RLS is enabled
- ✅ No hardcoded secrets in code

---

**Your app is now ready for deployment!** 🎉

Follow the steps above and your Timestamp 3.0 app will be live on the web with automatic deployments on every push to main.
