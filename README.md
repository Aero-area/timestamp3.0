# Timestamp 3.0 - Freelancer Time Tracking App

A modern, React Native time tracking application built with Expo for freelancers to easily record and manage their work hours.

## 🚀 Features

- **One-Button Time Stamping** - Simple tap to start/stop tracking
- **Automatic Period Management** - Configurable timesheet rollover dates
- **Offline Support** - Queue stamps when offline, sync when back online
- **Data Export** - CSV and PDF export capabilities
- **Backup System** - Automatic data backup to Supabase Storage
- **Cross-Platform** - Works on iOS, Android, and Web

## 📋 Prerequisites

Before running this app, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Supabase Account** with a project set up
- **Expo Go App** (for mobile testing)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "Timestamp 3.0"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the project root with:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_BACKUP_BUCKET=your_backup_bucket_name
   EXPO_PUBLIC_BACKUP_ENABLED=false
   ```

## 🗄️ Supabase Setup

### 1. Create Project
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Note your Project URL and anon/public key

### 2. Database Schema
Create the `day_entries` table with this SQL:

```sql
CREATE TABLE day_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date_utc DATE NOT NULL,
  start_ts TIMESTAMPTZ,
  end_ts TIMESTAMPTZ,
  total_hhmm TEXT,
  inserted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date_utc)
);

-- Enable Row Level Security
ALTER TABLE day_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can manage their own entries" ON day_entries
  FOR ALL USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_day_entries_user_date ON day_entries(user_id, date_utc);
```

### 3. Storage Setup (Optional)
If you want to enable backups:
- Go to Storage in your Supabase dashboard
- Create a new bucket named `backups` (or your preferred name)
- Set it to private
- Update your `.env` file with the bucket name

## 🚀 Running the App

### Development Mode
```bash
npm start
```

### Web Version
```bash
npm run web
```

### Build for Production
```bash
npm run build
```

## 📱 Testing the App

### Web Browser
- Open http://localhost:8081 (or the port shown in terminal)
- Use your browser's developer tools for mobile simulation

### Mobile Device
- Install Expo Go from App Store/Google Play
- Scan the QR code displayed in terminal
- Ensure your phone and computer are on the same network

### Simulator/Emulator
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Make sure you have Xcode (iOS) or Android Studio installed

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill existing processes
pkill -f "expo start"
pkill -f "npm start"

# Or use a different port
EXPO_PORT=8082 npm start
```

#### 2. Environment Variables Not Loading
- Ensure `.env` file is in the project root (not in subdirectories)
- Restart the development server after adding environment variables
- Check that variable names start with `EXPO_PUBLIC_`

#### 3. Supabase Connection Issues
- Verify your Supabase URL and key are correct
- Check that your Supabase project is active
- Ensure RLS policies are properly configured

#### 4. Package Version Conflicts
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Update packages to compatible versions
npm install expo@latest
```

### Error Messages

#### "Element type is invalid: expected a string... but got: undefined"
- This usually means a component import is missing
- Check that all icons are properly exported from `components/icons.tsx`
- Restart the development server

#### "Supabase env vars missing"
- Verify your `.env` file exists and has correct values
- Restart the development server

## 📁 Project Structure

```
Timestamp 3.0/
├── app/                    # Expo Router app directory
│   ├── (tabs)/           # Tab navigation screens
│   │   ├── index.tsx     # Home screen with stamp button
│   │   ├── entries.tsx   # Time entries list
│   │   ├── reports.tsx   # Export and reporting
│   │   └── settings.tsx  # App configuration
│   └── _layout.tsx       # Root layout and providers
├── components/            # Reusable UI components
│   ├── icons.tsx         # Icon components
│   ├── LoginScreen.tsx   # Authentication screen
│   └── SetupScreen.tsx   # Environment setup screen
├── providers/             # React Context providers
│   ├── AuthProvider.tsx  # Authentication state
│   ├── TimeTrackingProvider.tsx # Time tracking logic
│   ├── SettingsProvider.tsx # App settings
│   └── ...               # Other providers
├── utils/                 # Utility functions
│   ├── supabase.ts       # Supabase client setup
│   └── api.ts            # API functions
├── lib/                   # Core libraries
│   └── time.ts           # Time utility functions
└── types/                 # TypeScript type definitions
```

## 🔐 Authentication

The app uses Supabase Auth for user management:

- **Sign Up**: Currently disabled (contact admin for access)
- **Sign In**: Use your email and password
- **Session Management**: Automatic token refresh and persistence

## ⚙️ Configuration

### Timesheet Rollover
- Configure when your timesheet period resets each month
- Default: Day 1 of each month
- Range: 1-28 days

### Time Rounding
- No rounding (default)
- 5-minute intervals
- 10-minute intervals
- 15-minute intervals

### Backup Settings
- Automatic daily backups (when enabled)
- Manual backup option
- 90-day retention period

## 📊 Usage

### Recording Time
1. **Start Tracking**: Tap the STAMP button to begin
2. **Stop Tracking**: Tap STAMP again to end
3. **Update Time**: Additional stamps update the end time

### Viewing Entries
- Navigate to the Entries tab
- View all time entries for the current period
- See start time, end time, and total duration

### Exporting Data
- Go to Reports tab
- Select date range
- Export as CSV or PDF
- Download or share as needed

## 🚨 Important Notes

- **Environment Variables**: Never commit your `.env` file to version control
- **Supabase Security**: Always use Row Level Security (RLS) in production
- **Backup**: Regularly test your backup system
- **Offline Mode**: The app queues stamps when offline and syncs when back online

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your environment variables are correct
3. Ensure Supabase is properly configured
4. Check the browser console for error messages
5. Restart the development server

## 📄 License

This project is private and proprietary.

---

**Happy Time Tracking!** ⏰
