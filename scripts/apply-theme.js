// Script to replace Colors imports with useTheme hook across the frontend
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, 'frontend', 'src');

function walk(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      walk(fullPath, callback);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      callback(fullPath, fs.readFileSync(fullPath, 'utf8'));
    }
  }
}

function getImportPath(filePath) {
  // Calculate relative path from file to contexts/ThemeContext
  const fileDir = path.dirname(filePath);
  let relative = path.relative(fileDir, path.join(srcDir, 'contexts', 'ThemeContext'));
  relative = relative.replace(/\\/g, '/');
  if (!relative.startsWith('.')) relative = './' + relative;
  return relative.replace(/\.tsx?$/, '');
}

function getColorsImportPath(filePath) {
  // Calculate relative path from file to constants/colors
  const fileDir = path.dirname(filePath);
  let relative = path.relative(fileDir, path.join(srcDir, 'constants', 'colors'));
  relative = relative.replace(/\\/g, '/');
  if (!relative.startsWith('.')) relative = './' + relative;
  return relative.replace(/\.tsx?$/, '');
}

let count = 0;
const results = [];

walk(srcDir, (filePath, content) => {
  // Check if file imports Colors
  if (!content.includes("from '") || (!content.includes("constants/colors'") && !content.includes('constants/colors"'))) {
    return;
  }

  // Skip ThemeContext itself and colors.ts
  if (filePath.includes('ThemeContext') || filePath.includes('constants/colors')) {
    return;
  }

  const themeImportPath = getImportPath(filePath);
  const colorsImportPath = getColorsImportPath(filePath);
  
  // Build the theme import line
  const themeImportLine = `import { useTheme } from '${themeImportPath}';`;

  // 1. Replace the Colors import
  let newContent = content;
  
  // Handle different import patterns
  // Pattern: import { Colors } from '../../constants/colors';
  const importRegex = new RegExp(
    `import\\s*\\{\\s*Colors\\s*\\}\\s*from\\s*['"]${colorsImportPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?`,
    'g'
  );
  
  if (importRegex.test(newContent)) {
    newContent = newContent.replace(importRegex, themeImportLine);
    
    // 2. Add const { colors } = useTheme(); after the first function component declaration
    // Find the function component and add the hook
    const componentRegex = /(export\s+function\s+\w+[\s\S]*?\{[\s\S]*?)(\n\s*(?:const|let|var)\s)/;
    const match = newContent.match(componentRegex);
    
    if (match) {
      // Add the hook after the component opening
      newContent = newContent.replace(
        /(export\s+function\s+\w+[\s\S]*?\{)/,
        '$1\n  const { colors } = useTheme();'
      );
    }
    
    // 3. Replace Colors.xxx with colors.xxx
    newContent = newContent.replace(/Colors\./g, 'colors.');
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      count++;
      results.push(path.relative(srcDir, filePath));
    }
  }
});

console.log(`Updated ${count} files:`);
results.forEach(r => console.log(`  ${r}`));
