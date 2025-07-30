const fs = require('fs');
const path = require('path');

// Define the directory to search in
const apiDirPath = path.join(__dirname, '..', 'app', 'api');
const libDirPath = path.join(__dirname, '..', 'lib');

// Function to recursively update files
function fixSupabaseAuth(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixSupabaseAuth(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // 1. Update import from lib/supabase to lib/supabase-api
        if (content.includes("import { createServerComponentClient } from '@/lib/supabase'") || 
            content.includes('import { createServerComponentClient } from "@/lib/supabase"')) {
          content = content.replace(
            /import { createServerComponentClient } from ['"][@/]lib\/supabase['"]/g,
            `import { createServerComponentClient } from '@/lib/supabase-api'`
          );
          updated = true;
        }
        
        // 2. Fix double-invocation pattern in createServerComponentClient()()
        if (content.includes('createServerComponentClient()()')) {
          content = content.replace(
            /createServerComponentClient\(\)\(\)/g,
            'createServerComponentClient()'
          );
          updated = true;
        }
        
        // 3. Pass request and response to createServerComponentClient where appropriate
        if (content.includes('await createServerComponentClient()') && 
            (content.includes('NextRequest') || content.includes('NextResponse'))) {
          // Find parameter names for req and res
          const reqParam = content.match(/\b(req|request)\s*:\s*NextRequest\b/);
          const resParam = content.match(/\b(res|response)\s*:\s*NextResponse\b/);
          
          if (reqParam && reqParam[1]) {
            const reqName = reqParam[1];
            const resName = resParam ? resParam[1] : null;
            
            if (resName) {
              content = content.replace(
                /await createServerComponentClient\(\)/g,
                `await createServerComponentClient(${reqName}, ${resName})`
              );
            } else {
              content = content.replace(
                /await createServerComponentClient\(\)/g,
                `await createServerComponentClient(${reqName})`
              );
            }
            updated = true;
          }
        }
        
        // 4. Fix const supabase = createServerComponentClient() to use await
        if (content.includes('const supabase = createServerComponentClient(')) {
          content = content.replace(
            /const supabase = createServerComponentClient\(/g,
            'const supabase = await createServerComponentClient('
          );
          updated = true;
        }
        
        if (updated) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Updated: ${filePath}`);
        }
      } catch (err) {
        console.error(`Error processing file ${filePath}: ${err.message}`);
      }
    }
  }
}

// Start the update process
console.log('Starting Supabase auth migration...');
fixSupabaseAuth(apiDirPath);
fixSupabaseAuth(libDirPath);
console.log('Supabase auth migration completed!');
