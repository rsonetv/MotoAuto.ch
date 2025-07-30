const fs = require('fs');
const path = require('path');

// Find all schema files
const schemaFiles = [
  'lib/schemas/auctions-api-schema.ts',
  'lib/schemas/bids-api-schema.ts', 
  'lib/schemas/contact-api-schema.ts',
  'lib/schemas/listings-api-schema.ts',
  'lib/schemas/payments-api-schema.ts',
  'lib/schemas/vehicle-form-schema.ts'
];

function fixZodSchemas() {
  schemaFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    console.log(`Fixing ${filePath}...`);

    // Fix 1: Move .default() before .transform()
    content = content.replace(
      /\.transform\(([^)]+)\)(\s*)\.refine\(([^}]+})\)(\s*)\.default\("([^"]+)"\)/g,
      '.default("$5")$2.transform($1)$2.refine($3)'
    );

    // Fix 2: z.record(z.any()) -> z.record(z.string(), z.any())
    content = content.replace(
      /z\.record\(z\.any\(\)\)/g,
      'z.record(z.string(), z.any())'
    );

    // Fix 3: z.string().ip() -> z.string().ip() (in Zod 4, ip() is removed, use regex instead)
    content = content.replace(
      /z\.string\(\)\.ip\(\)/g,
      'z.string().regex(/^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/, "Invalid IP address")'
    );

    // Fix 4: enum required_error -> message in Zod 4
    content = content.replace(
      /z\.enum\(([^,]+),\s*{\s*required_error:\s*([^}]+)\s*}\)/g,
      'z.enum($1, { message: $2 })'
    );

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
  });
}

fixZodSchemas();
console.log('All Zod schema files fixed!');
