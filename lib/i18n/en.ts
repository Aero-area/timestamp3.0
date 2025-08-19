// lib/i18n/en.ts
// English language strings for Timestamp 3.0

export const en = {
  // App metadata
  appName: 'Timestamp 3.0',
  appDescription: 'Time tracking for freelancers',

  // Navigation
  home: 'Home',
  entries: 'Entries',
  reports: 'Reports',
  settings: 'Settings',

  // Common actions
  save: 'Save',
  saved: 'Saved',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  close: 'Close',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',

  // Authentication
  login: 'Login',
  logout: 'Logout',
  signIn: 'Sign In',
  signOut: 'Sign Out',
  email: 'Email',
  password: 'Password',
  enterEmail: 'Enter your email',
  enterPassword: 'Enter your password',
  signingIn: 'Signing in...',
  loginFailed: 'Login failed',
  checkCredentials: 'Check your credentials',
  signupsDisabled: 'Signups are disabled. Contact your administrator for access.',

  // Time tracking
  stamp: 'STAMP',
  stampDescription: 'First stamp starts your day, second stamp ends it. Subsequent stamps update the end time.',
  tapToRecord: 'Tap to record a timestamp',
  startedTracking: 'Started time tracking',
  stoppedTracking: 'Stopped time tracking',
  updatedEndTime: 'Updated end time',

  // Timesheet period
  currentTimesheetPeriod: 'Current Timesheet Period',
  rolloverOnDay: 'Rollover on day',
  rolloverHappensTonight: 'Rollover happens at 00:00 Danish time tonight',
  rolloverDayInfo: 'Rollover happens at 00:00 Danish time tonight',

  // Settings
  timesheetRolloverDay: 'Timesheet Rollover Day',
  rolloverDayDescription: 'Day of the month when timesheet periods reset (UTC timezone)',
  currentSetting: 'Current setting: Day {day} of each month',
  dayOfMonth: 'Day {day}',

  timeRoundingRule: 'Time Rounding Rule',
  roundingDescription: 'Automatically round time entries to the nearest interval',
  noRounding: 'No rounding',
  fiveMinutes: '5 minutes',
  tenMinutes: '10 minutes',
  fifteenMinutes: '15 minutes',
  roundingInfo: {
    none: 'Time entries are not rounded',
    '5': 'Time is rounded to the nearest 5 minutes',
    '10': 'Time is rounded to the nearest 10 minutes',
    '15': 'Time is rounded to the nearest 15 minutes'
  },

  // Rollover hour
  rolloverHour: 'Rollover Hour',
  rolloverHourDescription: 'Hour of the day when the timesheet period resets (0-23)',
  rolloverHourHelp: 'Enter an hour between 0 and 23. 0 = midnight, 12 = noon, 23 = 11 PM',

  // Language
  language: 'Language',
  languageDescription: 'Choose the language for the application',

  // Data management
  dataBackup: 'Data Backup',
  lastBackup: 'Last backup',
  noBackupYet: 'No backup yet',
  backupNow: 'Backup now',
  backingUp: 'Backing up...',
  backupEnabled: 'Backup enabled',
  backupDisabled: 'Backup disabled',

  // Account
  account: 'Account',
  signedInAs: 'Signed in as',

  // Reports
  selectDateRange: 'Select date range',
  fromDate: 'From date',
  toDate: 'To date',
  to: 'to',
  last7Days: 'Last 7 days',
  exportOptions: 'Export Options',
  exportCSV: 'Export CSV',
  exportPDF: 'Export PDF',
  csvDescription: 'Spreadsheet format for analysis',
  pdfDescription: 'Formatted report for sharing',
  reportPreview: 'Report Preview',
  period: 'Period',
  exportNote: 'Export includes all time entries in this period',

  // Entries
  date: 'Date',
  start: 'Start',
  end: 'End',
  total: 'Total',
  noEntriesInPeriod: 'No entries in this period yet',
  entriesFound: '{count} entries found',

  // Status messages
  settingsSaved: 'Settings saved successfully',
  failedToSave: 'Failed to save settings',
  loggedOutSuccessfully: 'Logged out successfully',
  failedToLogout: 'Failed to log out',
  csvExportedSuccessfully: 'CSV exported successfully',
  pdfExportedSuccessfully: 'PDF exported successfully',
  failedToExport: 'Failed to export',
  pleaseSelectDates: 'Please select both start and end dates',
  endDateBeforeStart: 'End date cannot be before start date',
  failedToLoadEntries: 'Failed to load entries for the selected period',
  pleaseSelectValidDateRangeWithEntries: 'Please select a valid date range with entries',
  csvDownloadStarted: 'CSV download started',
  csvShareOpened: 'CSV share opened',
  pdfPrintWindowOpened: 'PDF print window opened',
  pdfShareOpened: 'PDF share opened',

  // Help text
  aboutSettings: 'About Settings',
  rolloverDayHelp: 'Rollover day determines when your timesheet period resets each month',
  roundingRulesHelp: 'Rounding rules apply to all time entries when calculating totals',
  utcConsistency: 'All times are handled in UTC to ensure consistency',

  // Validation
  rolloverDayRange: 'Rollover day must be between 1 and 28',
  rolloverHourRange: 'Rollover hour must be between 0 and 23',

  // Loading states
  loading: 'Loading...',
  saving: 'Saving...',
  processing: 'Processing...',

  // Empty states
  noData: 'No data',
  noResults: 'No results',

  // Errors
  error: 'Error',
  warning: 'Warning',
  success: 'Success',
  info: 'Information',
  somethingWentWrong: 'Something went wrong',
  tryAgain: 'Try again',
  contactSupport: 'Contact support',

  // Generic
  yes: 'Yes',
  no: 'No',
  ok: 'OK',
  confirm: 'Confirm',
  reset: 'Reset',
  refresh: 'Refresh',
  search: 'Search',
  filter: 'Filter',
  sort: 'Sort',
  more: 'More',
  less: 'Less',
  all: 'All',
  none: 'None',
  select: 'Select',
  choose: 'Choose',
  upload: 'Upload',
  download: 'Download',
  export: 'Export',
  import: 'Import',
  copy: 'Copy',
  paste: 'Paste',
  cut: 'Cut',
  undo: 'Undo',
  redo: 'Redo',
};

export type StringToken = keyof typeof en;
export default en;
