const fs = require('fs');
const path = require('path');

// Define the directory to search in
const apiDirPath = path.join(__dirname, '..', 'app', 'api');

// Define the pattern to fix
const oldPattern = `const supabase = createServerComponentClient()`;
const newPattern = `const supabase = await createServerComponentClient()`;

// Function to recursively search and replace in files
function fixAPIFiles(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixAPIFiles(filePath);
    } else if (file.endsWith('.ts') && (file.includes('route.ts') || file.includes('api'))) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes(oldPattern)) {
          content = content.replace(new RegExp(oldPattern, 'g'), newPattern);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Updated file: ${filePath}`);
        }
      } catch (err) {
        console.error(`Error processing file ${filePath}: ${err.message}`);
      }
    }
  }
}

// Start the search and replace
fixAPIFiles(apiDirPath);
console.log('API files update completed!');

// Also fix the auth-middleware.ts file
const authMiddlewarePath = path.join(__dirname, '..', 'lib', 'auth-middleware.ts');
try {
  let content = fs.readFileSync(authMiddlewarePath, 'utf8');
  
  if (content.includes(oldPattern)) {
    content = content.replace(new RegExp(oldPattern, 'g'), newPattern);
    fs.writeFileSync(authMiddlewarePath, content, 'utf8');
    console.log(`Updated file: ${authMiddlewarePath}`);
  }
} catch (err) {
  console.error(`Error processing file ${authMiddlewarePath}: ${err.message}`);
}

// Fix the websocket server file
const websocketServerPath = path.join(__dirname, '..', 'lib', 'websocket', 'server.ts');
try {
  let content = fs.readFileSync(websocketServerPath, 'utf8');
  
  if (content.includes(oldPattern)) {
    content = content.replace(new RegExp(oldPattern, 'g'), newPattern);
    fs.writeFileSync(websocketServerPath, content, 'utf8');
    console.log(`Updated file: ${websocketServerPath}`);
  }
} catch (err) {
  console.error(`Error processing file ${websocketServerPath}: ${err.message}`);
}

// Fix the payment-logger.ts file
const paymentLoggerPath = path.join(__dirname, '..', 'lib', 'payment-logger.ts');
try {
  let content = fs.readFileSync(paymentLoggerPath, 'utf8');
  
  if (content.includes(oldPattern)) {
    content = content.replace(new RegExp(oldPattern, 'g'), newPattern);
    fs.writeFileSync(paymentLoggerPath, content, 'utf8');
    console.log(`Updated file: ${paymentLoggerPath}`);
  }
} catch (err) {
  console.error(`Error processing file ${paymentLoggerPath}: ${err.message}`);
}

console.log('All files updated!');
