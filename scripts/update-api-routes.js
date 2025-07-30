const fs = require('fs');
const path = require('path');

// Define the directory to search in
const apiDirPath = path.join(__dirname, '..', 'app', 'api');

// Function to recursively process API route files
function processAPIRoutes(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processAPIRoutes(filePath);
    } else if (file.endsWith('.ts') && (file.includes('route.ts') || file.includes('api'))) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Update Supabase import
        if (content.includes('import { createServerComponentClient } from ')) {
          content = content.replace(
            /import { createServerComponentClient } from ['"][@/]lib\/supabase(-api)?['"]/g,
            `import { createServerComponentClient } from '@/lib/supabase-api'`
          );
        }
        
        // Add NextRequest/NextResponse imports if needed
        if (!content.includes('NextRequest') || !content.includes('NextResponse')) {
          if (content.includes('import { NextResponse }')) {
            content = content.replace(
              /import { NextResponse } from ['"]next\/server['"]/g,
              `import { NextRequest, NextResponse } from 'next/server'`
            );
          } else if (!content.includes('import') || !content.includes('next/server')) {
            // Add the import if it doesn't exist
            content = `import { NextRequest, NextResponse } from 'next/server'\n${content}`;
          }
        }
        
        // Update handler parameters
        if (content.includes('export async function') && !content.includes('req: NextRequest')) {
          // Update GET, POST, PUT, DELETE, etc. handlers
          content = content.replace(
            /export async function (GET|POST|PUT|DELETE|PATCH)\s*\(\s*\)/g,
            'export async function $1(req: NextRequest, res: NextResponse)'
          );
          
          // Update generic handler
          content = content.replace(
            /export async function handler\s*\(\s*\)/g,
            'export async function handler(req: NextRequest, res: NextResponse)'
          );
        }
        
        // Update Supabase client creation with request/response
        if (content.includes('createServerComponentClient(')) {
          content = content.replace(
            /const supabase\s*=\s*await createServerComponentClient\(\s*\)/g,
            'const supabase = await createServerComponentClient(req, res)'
          );
          
          content = content.replace(
            /const supabase\s*=\s*createServerComponentClient\(\s*\)/g,
            'const supabase = await createServerComponentClient(req, res)'
          );
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated API route: ${filePath}`);
      } catch (err) {
        console.error(`Error processing file ${filePath}: ${err.message}`);
      }
    }
  }
}

// Start the processing
console.log('Starting API route update process...');
processAPIRoutes(apiDirPath);
console.log('API route update process completed!');
