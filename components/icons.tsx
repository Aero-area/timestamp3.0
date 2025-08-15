// components/icons.tsx
import React from 'react';
import { Feather } from '@expo/vector-icons';

type P = { size?: number; color?: string; fill?: string };

// named exports (you already have these)
export const AlertTriangle = (p: P) => <Feather name="alert-triangle" {...p} />;
export const AlertCircle   = (p: P) => <Feather name="alert-circle" {...p} />;
export const CheckCircle   = (p: P) => <Feather name="check-circle" {...p} />;
export const XCircle       = (p: P) => <Feather name="x-circle" {...p} />;

export const BarChart3     = (p: P) => <Feather name="bar-chart-2" {...p} />; // closest
export const Calendar      = (p: P) => <Feather name="calendar" {...p} />;
export const Settings      = (p: P) => <Feather name="settings" {...p} />;

export const LogIn         = (p: P) => <Feather name="log-in" {...p} />;
export const LogOut        = (p: P) => <Feather name="log-out" {...p} />;
export const RefreshCw     = (p: P) => <Feather name="refresh-cw" {...p} />;

export const FileSpreadsheet = (p: P) => <Feather name="file-text" {...p} />; // stand-in
export const Database        = (p: P) => <Feather name="database" {...p} />;

// Add the missing Play icon
export const Play          = (p: P) => <Feather name="play" {...p} />;

// Add missing icons for Settings and Reports screens
export const Save          = (p: P) => <Feather name="save" {...p} />;
export const Clock         = (p: P) => <Feather name="clock" {...p} />;
export const RotateCcw     = (p: P) => <Feather name="rotate-ccw" {...p} />;
export const Check         = (p: P) => <Feather name="check" {...p} />;
export const Download      = (p: P) => <Feather name="download" {...p} />;
export const FileText      = (p: P) => <Feather name="file-text" {...p} />;

// default export so accidental `import Icons from '@/components/icons'` still works
const Icons = {
  AlertTriangle, AlertCircle, CheckCircle, XCircle,
  BarChart3, Calendar, Settings,
  LogIn, LogOut, RefreshCw,
  FileSpreadsheet, Database, Play,
  Save, Clock, RotateCcw, Check, Download, FileText,
};
export default Icons;