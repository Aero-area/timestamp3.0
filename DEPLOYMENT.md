# Deployment Guide

This guide covers deploying your Timestamp 3.0 app to various platforms.

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
npm run deploy:vercel
```

### 2. Netlify
```bash
# Build the app
npm run deploy:netlify

# Then drag the dist/ folder to Netlify dashboard
```

### 3. Manual Web Build
```bash
# Build for web
npm run build:web

# The dist/ folder contains your deployable files
```

## 📋 Pre-Deployment Checklist

- [ ] Environment variables are set in deployment platform
- [ ] Supabase project is active and accessible
- [ ] Database schema is properly configured
- [ ] RLS policies are enabled
- [ ] Storage buckets are configured (if using backups)

## 🔐 Environment Variables Setup

### Vercel
1. Go to your project settings
2. Navigate to Environment Variables
3. Add these variables:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_BACKUP_BUCKET`
   - `EXPO_PUBLIC_BACKUP_ENABLED`

### Netlify
1. Go to Site settings > Environment variables
2. Add the same variables as above

### GitHub Actions
1. Go to repository Settings > Secrets and variables > Actions
2. Add repository secrets for all environment variables

## 🏗️ Build Commands

```bash
# Web build
npm run build:web

# Android build
npm run build:android

# iOS build
npm run build:ios

# Clean build
npm run clean
```

## 📱 Mobile App Deployment

### Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for platforms
eas build --platform android
eas build --platform ios
```

### App Store / Google Play
1. Build using EAS or Expo CLI
2. Follow platform-specific submission guidelines
3. Ensure all app store requirements are met

## 🔄 Continuous Deployment

### GitHub Actions
The included workflow automatically:
- Runs tests on PRs
- Builds the app on main branch
- Deploys to Vercel on successful build

### Manual Deployment
```bash
# Test locally first
npm start

# Build and deploy
npm run deploy:web
```

## 🚨 Troubleshooting

### Build Failures
```bash
# Clear cache and reinstall
npm run clean

# Check environment variables
echo $EXPO_PUBLIC_SUPABASE_URL

# Verify dependencies
npm audit
```

### Environment Variable Issues
- Ensure variables start with `EXPO_PUBLIC_`
- Check for typos in variable names
- Verify values are properly set in deployment platform

### Supabase Connection Issues
- Verify project URL and API key
- Check RLS policies
- Ensure project is not paused

## 📊 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npx expo export --platform web --analyze

# Optimize images
# Use expo-image with proper sizing
```

### Runtime Optimization
- Implement lazy loading for routes
- Use React.memo for expensive components
- Optimize re-renders with proper state management

## 🔒 Security Considerations

- Never commit `.env` files
- Use environment variables for all secrets
- Enable RLS in Supabase
- Implement proper authentication flows
- Regular security audits

## 📈 Monitoring

### Vercel Analytics
- Built-in performance monitoring
- Real user metrics
- Error tracking

### Custom Monitoring
- Implement error boundaries
- Add performance monitoring
- Track user interactions

## 🎯 Next Steps

1. **Choose deployment platform** (Vercel recommended)
2. **Set up environment variables** in your chosen platform
3. **Configure custom domain** if needed
4. **Set up monitoring** and analytics
5. **Test deployment** thoroughly
6. **Monitor performance** and user feedback

---

For more detailed information, refer to the main README.md file.
