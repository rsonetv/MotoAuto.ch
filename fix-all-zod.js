const fs = require('fs');
const path = require('path');

function fixAllZodFiles() {
  const allFiles = [
    'lib/schemas/auctions-api-schema.ts',
    'lib/schemas/bids-api-schema.ts', 
    'lib/schemas/contact-api-schema.ts',
    'lib/schemas/listings-api-schema.ts',
    'lib/schemas/payments-api-schema.ts',
    'lib/schemas/vehicle-form-schema.ts',
    'components/forms/add-vehicle-form/index.tsx'
  ];

  allFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;

    // Comprehensive Zod v4 fixes
    
    // 1. Fix all transform().default() patterns
    const transformDefaultRegex = /\.transform\(([^)]+)\)(\s*)\.default\("([^"]+)"\)/g;
    if (transformDefaultRegex.test(content)) {
      content = content.replace(transformDefaultRegex, '.default("$3")$2.transform($1)');
      changed = true;
    }

    // 2. Fix transform().refine().default() patterns  
    const transformRefineDefaultRegex = /\.transform\(([^)]+)\)(\s*)\.refine\(([^}]+})\)(\s*)\.default\("([^"]+)"\)/g;
    if (transformRefineDefaultRegex.test(content)) {
      content = content.replace(transformRefineDefaultRegex, '.default("$5")$2.transform($1)$2.refine($3)');
      changed = true;
    }

    // 3. Fix z.record(z.any()) -> z.record(z.string(), z.any())
    const recordRegex = /z\.record\(z\.any\(\)\)/g;
    if (recordRegex.test(content)) {
      content = content.replace(recordRegex, 'z.record(z.string(), z.any())');
      changed = true;
    }

    // 4. Fix z.string().ip() -> z.string().regex(/ip pattern/)
    const ipRegex = /z\.string\(\)\.ip\(\)/g;
    if (ipRegex.test(content)) {
      content = content.replace(ipRegex, 'z.string().regex(/^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/, "Invalid IP address")');
      changed = true;
    }

    // 5. Fix required_error -> message
    const requiredErrorRegex = /required_error:/g;
    if (requiredErrorRegex.test(content)) {
      content = content.replace(requiredErrorRegex, 'message:');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
    } else {
      console.log(`⚪ No changes needed in ${filePath}`);
    }
  });
}

fixAllZodFiles();
console.log('🎉 All Zod fixes completed!');
