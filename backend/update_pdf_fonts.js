const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'controllers', 'report.controller.js');
let content = fs.readFileSync(targetPath, 'utf8');

// Replace Fonts
content = content.replace(/Helvetica-Bold/g, 'Times-Bold');
content = content.replace(/Helvetica-Oblique/g, 'Times-Italic');
content = content.replace(/Helvetica/g, 'Times-Roman');

// Replace Color Theme
const oldTheme = `const C = {
  accent:  '#1d4ed8',   // primary blue
  accentL: '#dbeafe',   // light blue bg
  green:   '#15803d',
  greenL:  '#dcfce7',
  red:     '#b91c1c',
  redL:    '#fee2e2',
  amber:   '#b45309',
  amberL:  '#fef3c7',
  gray:    '#475569',
  muted:   '#94a3b8',
  border:  '#cbd5e1',
  borderL: '#e2e8f0',
  text:    '#0f172a',
  subtext: '#334155',
  white:   '#ffffff',
  light:   '#f8fafc',
  divider: '#e2e8f0',
};`;

const newTheme = `const C = {
  accent:  '#1e293b',   // Professional dark slate/navy
  accentL: '#f1f5f9',   // Very light slate for backgrounds
  green:   '#166534',   // Deep green for success/positive
  greenL:  '#f0fdf4',   // Light green
  red:     '#991b1b',   // Deep red for flags/warnings
  redL:    '#fef2f2',   // Light red
  amber:   '#9a3412',   // Amber/burnt orange
  amberL:  '#fff7ed',   // Light amber
  gray:    '#475569',   // Slate gray
  muted:   '#64748b',   // Lighter slate
  border:  '#cbd5e1',   // Borders
  borderL: '#e2e8f0',   // Light borders
  text:    '#0f172a',   // Almost black
  subtext: '#334155',   // Dark gray
  white:   '#ffffff',
  light:   '#f8fafc',
  divider: '#e2e8f0',
};`;

content = content.replace(oldTheme, newTheme);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated fonts and theme in report.controller.js');
