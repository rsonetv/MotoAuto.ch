const fs = require('fs');
const path = require('path');

// Define the directory to search in
const apiDirPath = path.join(__dirname, '..', 'app', 'api');

// Define the import patterns to replace
const oldImport = `import { createServerComponentClient } from '@/lib/supabase'`;
const newImport = `import { createServerComponentClient } from '@/lib/supabase-api'`;

// Function to recursively search and replace in files
function fixAPIImports(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixAPIImports(filePath);
    } else if (file.endsWith('.ts') && (file.includes('route.ts') || file.includes('api'))) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes(oldImport)) {
          content = content.replace(new RegExp(oldImport, 'g'), newImport);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Updated import in: ${filePath}`);
        }
      } catch (err) {
        console.error(`Error processing file ${filePath}: ${err.message}`);
      }
    }
  }
}

// Start the search and replace
fixAPIImports(apiDirPath);
console.log('API imports update completed!');

// Also fix imports in other server-side files
const otherFiles = [
  path.join(__dirname, '..', 'lib', 'auth-middleware.ts'),
  path.join(__dirname, '..', 'lib', 'websocket', 'server.ts'),
  path.join(__dirname, '..', 'lib', 'payment-logger.ts'),
  path.join(__dirname, '..', 'lib', 'rate-limit.ts')
];

otherFiles.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes(oldImport)) {
        content = content.replace(new RegExp(oldImport, 'g'), newImport);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated import in: ${filePath}`);
      }
    }
  } catch (err) {
    console.error(`Error processing file ${filePath}: ${err.message}`);
  }
});

console.log('All imports updated!');
