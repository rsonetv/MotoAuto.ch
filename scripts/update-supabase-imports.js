const fs = require('fs');
const path = require('path');

// Define the directory to search in - use absolute path
const dirPath = path.join(__dirname, '..', 'app');

// Define patterns to replace
const oldImport = "import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'";
const newImport = "import { createClientComponentClient } from '@/lib/supabase'";

// Function to recursively search and replace in files
function searchAndReplace(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      searchAndReplace(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes(oldImport)) {
          content = content.replace(oldImport, newImport);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Updated imports in: ${filePath}`);
        }
      } catch (err) {
        console.error(`Error processing file ${filePath}: ${err.message}`);
      }
    }
  }
}

// Start the search and replace
searchAndReplace(dirPath);
console.log('Import replacement completed!');
