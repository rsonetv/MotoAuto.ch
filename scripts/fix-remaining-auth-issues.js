const fs = require('fs');
const path = require('path');

// Define the directories to search in
const apiDirPath = path.join(__dirname, '..', 'app', 'api');
const libDirPath = path.join(__dirname, '..', 'lib');

// Function to recursively fix all the remaining issues
function fixRemainingIssues(dir, isLibDir = false) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixRemainingIssues(filePath, isLibDir);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // 1. Fix remaining @/lib/supabase imports to @/lib/supabase-api in API routes
        if (dir.includes('api') || file.includes('route.ts')) {
          if (content.includes('from "@/lib/supabase"') || content.includes("from '@/lib/supabase'")) {
            content = content.replace(
              /from ['"][@/]lib\/supabase['"]/g,
              `from '@/lib/supabase-api'`
            );
            updated = true;
          }
        }
        
        // 2. Fix lib/auth-middleware.ts, lib/rate-limit.ts, lib/payment-logger.ts imports
        if (file.includes('auth-middleware.ts') || file.includes('rate-limit.ts') || file.includes('payment-logger.ts')) {
          if (content.includes("from './supabase'") || content.includes('from "./supabase"') || content.includes("from '@/lib/supabase'")) {
            content = content.replace(
              /from ['".\/]*[@/]?lib\/supabase['"]/g,
              `from '@/lib/supabase-api'`
            );
            updated = true;
          }
        }
        
        // 3. Fix any remaining double parentheses in createServerComponentClient()() calls
        if (content.includes('createServerComponentClient()()')) {
          content = content.replace(
            /createServerComponentClient\(\)\(\)/g,
            'createServerComponentClient()'
          );
          updated = true;
        }
        
        // 4. Fix 'request' variable name in auth-middleware.ts
        if (file.includes('auth-middleware.ts')) {
          content = content.replace(
            /createServerComponentClient\(request\)/g,
            'createServerComponentClient()'
          );
          updated = true;
        }
        
        if (updated) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Fixed remaining issues in: ${filePath}`);
        }
      } catch (err) {
        console.error(`Error processing file ${filePath}: ${err.message}`);
      }
    }
  }
}

// Start the fix process
console.log('Fixing remaining Supabase auth issues...');
fixRemainingIssues(apiDirPath);
fixRemainingIssues(libDirPath, true);
console.log('Remaining issues fixed!');
