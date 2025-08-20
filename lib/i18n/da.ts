// lib/i18n/da.ts
// Danish language strings for Timestamp 3.0

export const da = {
  // App metadata
  appName: 'Timestamp 3.0',
  appDescription: 'Tidsregistrering for freelancere',
  
  // Navigation
  home: 'Hjem',
  entries: 'Registreringer',
  reports: 'Rapporter',
  settings: 'Indstillinger',
  
  // Common actions
  save: 'Gem',
  saved: 'Gemt',
  cancel: 'Annuller',
  delete: 'Slet',
  edit: 'Rediger',
  add: 'Tilføj',
  close: 'Luk',
  back: 'Tilbage',
  next: 'Næste',
  previous: 'Forrige',
  
  // Authentication
  login: 'Log ind',
  logout: 'Log ud',
  signIn: 'Log ind',
  signOut: 'Log ud',
  email: 'E-mail',
  password: 'Adgangskode',
  enterEmail: 'Indtast din e-mail',
  enterPassword: 'Indtast din adgangskode',
  signingIn: 'Logger ind...',
  loginFailed: 'Login mislykkedes',
  checkCredentials: 'Tjek dine legitimationsoplysninger',
  signupsDisabled: 'Tilmeldinger er deaktiveret. Kontakt din administrator for adgang.',
  
  // Time tracking
  stamp: 'STEMPEL',
  stampDescription: 'Første stempel starter din dag, andet stempel slutter den. Yderligere stempler opdaterer sluttiden.',
  tapToRecord: 'Tryk for at registrere et tidsstempel',
  startedTracking: 'Begyndte tidsregistrering',
  stoppedTracking: 'Stoppede tidsregistrering',
  updatedEndTime: 'Opdaterede sluttid',
  
  // Timesheet period
  currentTimesheetPeriod: 'Nuværende tidsperiode',
  rolloverOnDay: 'Omdeling på dag',
  rolloverHappensTonight: 'Omdeling sker kl. 00:00 dansk tid i aften',
  rolloverDayInfo: 'Omdeling sker kl. 00:00 dansk tid i aften',
  
  // Settings
  timesheetRolloverDay: 'Tidsperiode omdelingsdag',
  rolloverDayDescription: 'Dag i måneden hvor tidsperioder nulstilles (UTC tidszone)',
  currentSetting: 'Nuværende indstilling: Dag {day} i hver måned',
  dayOfMonth: 'Dag {day}',
  
  timeRoundingRule: 'Tidsafrundingsregel',
  roundingDescription: 'Automatisk afrunding af tidsregistreringer til nærmeste interval',
  noRounding: 'Ingen afrunding',
  fiveMinutes: '5 minutter',
  tenMinutes: '10 minutter',
  fifteenMinutes: '15 minutter',
  roundingInfo: {
    none: 'Tidsregistreringer afrundes ikke',
    '5': 'Tid afrundes til nærmeste 5 minutter',
    '10': 'Tid afrundes til nærmeste 10 minutter',
    '15': 'Tid afrundes til nærmeste 15 minutter'
  },
  
  // Rollover hour
  rolloverHour: 'Omdelingstime',
  rolloverHourDescription: 'Time på dagen hvor tidsperioden nulstilles (0-23)',
  rolloverHourHelp: 'Indtast en time mellem 0 og 23. 0 = midnat, 12 = middag, 23 = 23:00',

  // Language
  language: 'Sprog',
  languageDescription: 'Vælg sproget for applikationen',
  
  // Data management
  dataBackup: 'Datasikkerhedskopi',
  lastBackup: 'Sidste sikkerhedskopi',
  noBackupYet: 'Ingen sikkerhedskopi endnu',
  backupNow: 'Sikkerhedskopi nu',
  backingUp: 'Laver sikkerhedskopi...',
  backupEnabled: 'Sikkerhedskopi aktiveret',
  backupDisabled: 'Sikkerhedskopi deaktiveret',
  
  // Account
  account: 'Konto',
  signedInAs: 'Logget ind som',
  
  // Reports
  selectDateRange: 'Vælg datoperiode',
  fromDate: 'Fra dato',
  toDate: 'Til dato',
  to: 'til',
  last7Days: 'Sidste 7 dage',
  exportOptions: 'Eksportmuligheder',
  exportCSV: 'Eksporter CSV',
  exportPDF: 'Eksporter PDF',
  csvDescription: 'Regnearksformat til analyse',
  pdfDescription: 'Formateret rapport til deling',
  reportPreview: 'Rapportforhåndsvisning',
  period: 'Periode',
  exportNote: 'Eksport inkluderer alle tidsregistreringer i denne periode',
  
  // Entries
  date: 'Dato',
  start: 'Start',
  end: 'Slut',
  total: 'Total',
  noEntriesInPeriod: 'Ingen registreringer i denne periode endnu',
  entriesFound: '{count} registreringer fundet',
  editAdd: 'Rediger / Tilføj',
  timeEntries: 'Tidsregistreringer',
  last30Days: 'Sidste 30 dage',
  lastRollover: 'Sidste omdeling',
  addEntry: 'Tilføj registrering',
  selectedDate: 'Valgt dato: {date}',
  
  // Status messages
  settingsSaved: 'Indstillinger gemt succesfuldt',
  failedToSave: 'Kunne ikke gemme indstillinger',
  loggedOutSuccessfully: 'Logget ud succesfuldt',
  failedToLogout: 'Kunne ikke logge ud',
  csvExportedSuccessfully: 'CSV eksporteret succesfuldt',
  pdfExportedSuccessfully: 'PDF eksporteret succesfuldt',
  failedToExport: 'Kunne ikke eksportere',
  pleaseSelectDates: 'Vælg venligst både start- og slutdato',
  endDateBeforeStart: 'Slutdato kan ikke være før startdato',
  failedToLoadEntries: 'Kunne ikke indlæse registreringer for valgt periode',
  pleaseSelectValidDateRangeWithEntries: 'Vælg venligst en gyldig datoperiode med registreringer',
  csvDownloadStarted: 'CSV download startet',
  csvShareOpened: 'CSV-deling åbnet',
  pdfPrintWindowOpened: 'PDF-printvindue åbnet',
  pdfShareOpened: 'PDF-deling åbnet',
  
  // Help text
  aboutSettings: 'Om indstillinger',
  rolloverDayHelp: 'Omdelingsdag bestemmer hvornår din tidsperiode nulstilles hver måned',
  roundingRulesHelp: 'Afrundingsregler gælder for alle tidsregistreringer ved beregning af totaler',
  utcConsistency: 'Alle tider behandles i UTC for at sikre konsistens',
  
  // Validation
  rolloverDayRange: 'Omdelingsdag skal være mellem 1 og 28',
  rolloverHourRange: 'Omdelingstime skal være mellem 0 og 23',
  
  // Loading states
  loading: 'Indlæser...',
  saving: 'Gemmer...',
  processing: 'Behandler...',
  
  // Empty states
  noData: 'Ingen data',
  noResults: 'Ingen resultater',
  
  // Errors
  error: 'Fejl',
  warning: 'Advarsel',
  success: 'Succes',
  info: 'Information',
  somethingWentWrong: 'Noget gik galt',
  tryAgain: 'Prøv igen',
  contactSupport: 'Kontakt support',
  
  // Generic
  yes: 'Ja',
  no: 'Nej',
  ok: 'OK',
  confirm: 'Bekræft',
  reset: 'Nulstil',
  refresh: 'Opdater',
  search: 'Søg',
  filter: 'Filtrer',
  sort: 'Sortér',
  more: 'Mere',
  less: 'Mindre',
  all: 'Alle',
  none: 'Ingen',
  select: 'Vælg',
  choose: 'Vælg',
  upload: 'Upload',
  download: 'Download',
  export: 'Eksporter',
  import: 'Importer',
  copy: 'Kopier',
  paste: 'Indsæt',
  cut: 'Klip',
  undo: 'Fortryd',
  redo: 'Gendan',
};

export type StringToken = keyof typeof da;
export default da;
