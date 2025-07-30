const fs = require('fs');
const path = require('path');

// Function to recursively fix all remaining API route issues
function fixAllSupabaseIssues(startDir) {
  function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          let updated = false;
          const originalContent = content;
          
          // 1. Fix all remaining @/lib/supabase imports to @/lib/supabase-api in API routes
          if (filePath.includes(path.sep + 'api' + path.sep) || filePath.includes('route.ts')) {
            if (content.includes('from "@/lib/supabase"') && !content.includes('from "@/lib/supabase-api"')) {
              content = content.replace(
                /import\s*{\s*createServerComponentClient\s*}\s*from\s*["']@\/lib\/supabase["']/g,
                'import { createServerComponentClient } from "@/lib/supabase-api"'
              );
              updated = true;
            }
          }
          
          // 2. Fix lib files to use supabase-api
          if (filePath.includes('lib' + path.sep) && !filePath.includes('supabase.ts') && !filePath.includes('supabase-api.ts')) {
            if (content.includes('from "./supabase"') || content.includes('from "@/lib/supabase"')) {
              content = content.replace(
                /import\s*{\s*createServerComponentClient\s*}\s*from\s*["']\.\/supabase["']/g,
                'import { createServerComponentClient } from "@/lib/supabase-api"'
              );
              content = content.replace(
                /import\s*{\s*createServerComponentClient\s*}\s*from\s*["']@\/lib\/supabase["']/g,
                'import { createServerComponentClient } from "@/lib/supabase-api"'
              );
              updated = true;
            }
          }
          
          // 3. Fix double parentheses calls
          if (content.includes('createServerComponentClient()()')) {
            content = content.replace(/createServerComponentClient\(\)\(\)/g, 'createServerComponentClient()');
            updated = true;
          }
          
          // 4. Fix calls with undefined req/res variables
          const reqResPattern = /createServerComponentClient\(req,\s*res\)\(\)/g;
          if (reqResPattern.test(content)) {
            // Check if req and res are defined in function signature
            const functionPatterns = [
              /export\s+async\s+function\s+\w+\s*\([^)]*req[^)]*NextRequest[^)]*\)/,
              /export\s+async\s+function\s+\w+\s*\([^)]*request[^)]*NextRequest[^)]*\)/
            ];
            
            const hasReqInSignature = functionPatterns.some(pattern => pattern.test(content));
            
            if (hasReqInSignature) {
              // Has req parameter, just remove extra parentheses
              content = content.replace(/createServerComponentClient\(req,\s*res\)\(\)/g, 'createServerComponentClient(req)');
            } else {
              // No req parameter, use simple call
              content = content.replace(/createServerComponentClient\(req,\s*res\)\(\)/g, 'createServerComponentClient()');
            }
            updated = true;
          }
          
          // 5. Fix simple req, res calls without extra parentheses
          const simpleReqResPattern = /createServerComponentClient\(req,\s*res\)/g;
          if (simpleReqResPattern.test(content)) {
            content = content.replace(/createServerComponentClient\(req,\s*res\)/g, 'createServerComponentClient(req)');
            updated = true;
          }
          
          // 6. Fix calls with just req but no variable definition
          if (content.includes('createServerComponentClient(req)') && !content.includes('req:') && !content.includes('request:')) {
            content = content.replace(/createServerComponentClient\(req\)/g, 'createServerComponentClient()');
            updated = true;
          }
          
          if (updated && content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed: ${filePath}`);
          }
        } catch (err) {
          console.error(`Error processing ${filePath}: ${err.message}`);
        }
      }
    }
  }
  
  processDirectory(startDir);
}

// Start the comprehensive fix
console.log('Starting comprehensive Supabase fix...');

const projectRoot = path.join(__dirname, '..');
const apiDir = path.join(projectRoot, 'app', 'api');
const libDir = path.join(projectRoot, 'lib');

fixAllSupabaseIssues(apiDir);
fixAllSupabaseIssues(libDir);

console.log('Comprehensive Supabase fix completed!');
