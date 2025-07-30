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

function fixZodSchemasRound2() {
  schemaFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    console.log(`Round 2 fixing ${filePath}...`);

    // Fix remaining .transform().default() patterns
    content = content.replace(
      /\.transform\(([^)]+)\)(\s*)\.default\("([^"]+)"\)/g,
      '.default("$3")$2.transform($1)'
    );

    // Fix .transform().refine().default() patterns
    content = content.replace(
      /\.transform\(([^)]+)\)(\s*)\.refine\(([^}]+})\)(\s*)\.default\("([^"]+)"\)/g,
      '.default("$5")$2.transform($1)$2.refine($3)'
    );

    // Fix boolean defaults in transform chains
    content = content.replace(
      /\.transform\(([^)]+)\)(\s*)\.default\("(true|false)"\)/g,
      '.default("$3")$2.transform($1)'
    );

    // Fix remaining z.record() issues that weren't caught
    content = content.replace(/z\.record\(z\.any\(\)\)/g, 'z.record(z.string(), z.any())');

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Round 2 fixed ${filePath}`);
  });
}

fixZodSchemasRound2();
console.log('Round 2 Zod schema fixes complete!');
