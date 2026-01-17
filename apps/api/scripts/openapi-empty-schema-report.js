#!/usr/bin/env node
/**
 * OpenAPI Empty Schema Report
 *
 * Analisa um documento OpenAPI e gera relatório de schemas vazios,
 * incluindo quais operações são impactadas.
 *
 * Uso:
 *   node openapi-empty-schema-report.js --file ../path/to/openapi.json
 *   node openapi-empty-schema-report.js --url http://localhost:3000/docs-json
 *   node openapi-empty-schema-report.js --file ../path/to/openapi.json --csv
 *
 * Sem dependências externas - usa apenas Node.js built-ins.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Parse args
const args = process.argv.slice(2);
const fileArg = args.indexOf('--file');
const urlArg = args.indexOf('--url');
const csvArg = args.includes('--csv');

const filePath = fileArg !== -1 ? args[fileArg + 1] : null;
const urlPath = urlArg !== -1 ? args[urlArg + 1] : null;

if (!filePath && !urlPath) {
  console.error('Uso: node openapi-empty-schema-report.js --file <path> | --url <url> [--csv]');
  process.exit(1);
}

/**
 * Fetch JSON from URL
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON from URL'));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Check if schema is "empty" (no properties and no composition)
 */
function isEmptySchema(schema) {
  if (!schema || typeof schema !== 'object') return true;

  // Has properties with content
  if (schema.properties && Object.keys(schema.properties).length > 0) return false;

  // Has composition (allOf, oneOf, anyOf)
  if (schema.allOf && schema.allOf.length > 0) return false;
  if (schema.oneOf && schema.oneOf.length > 0) return false;
  if (schema.anyOf && schema.anyOf.length > 0) return false;

  // Is array with items defined
  if (schema.type === 'array' && schema.items) return false;

  // Has enum values
  if (schema.enum && schema.enum.length > 0) return false;

  // Has additionalProperties defined as object
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') return false;

  return true;
}

/**
 * Recursively extract all $ref pointing to schemas
 */
function extractSchemaRefs(obj, refs = []) {
  if (!obj || typeof obj !== 'object') return refs;

  if (obj.$ref && typeof obj.$ref === 'string' && obj.$ref.startsWith('#/components/schemas/')) {
    refs.push(obj.$ref.replace('#/components/schemas/', ''));
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractSchemaRefs(item, refs);
    }
  } else {
    for (const value of Object.values(obj)) {
      extractSchemaRefs(value, refs);
    }
  }

  return refs;
}

/**
 * Extract operation info from paths
 */
function extractOperations(paths) {
  const operations = [];
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

  for (const [pathKey, pathItem] of Object.entries(paths || {})) {
    for (const method of methods) {
      const op = pathItem[method];
      if (!op) continue;

      const refs = extractSchemaRefs(op);
      operations.push({
        method: method.toUpperCase(),
        path: pathKey,
        operationId: op.operationId || 'N/A',
        tags: op.tags || [],
        schemaRefs: [...new Set(refs)],
      });
    }
  }

  return operations;
}

/**
 * Main analysis
 */
async function analyze() {
  console.log('='.repeat(70));
  console.log('  OPENAPI EMPTY SCHEMA REPORT');
  console.log('='.repeat(70));
  console.log('');

  // Load OpenAPI
  let openapi;
  if (filePath) {
    const resolvedPath = path.resolve(filePath);
    console.log(`Fonte: ${resolvedPath}`);
    openapi = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  } else {
    console.log(`Fonte: ${urlPath}`);
    openapi = await fetchJson(urlPath);
  }

  console.log(`OpenAPI Version: ${openapi.openapi}`);
  console.log(`Title: ${openapi.info?.title || 'N/A'}`);
  console.log('');

  // Analyze schemas
  const schemas = openapi.components?.schemas || {};
  const schemaNames = Object.keys(schemas);
  const emptySchemas = new Set();
  const okSchemas = new Set();

  for (const [name, schema] of Object.entries(schemas)) {
    if (isEmptySchema(schema)) {
      emptySchemas.add(name);
    } else {
      okSchemas.add(name);
    }
  }

  console.log('='.repeat(70));
  console.log('  1. CONTAGEM DE SCHEMAS');
  console.log('='.repeat(70));
  console.log(`  Total de schemas:  ${schemaNames.length}`);
  console.log(`  Schemas OK:        ${okSchemas.size}`);
  console.log(`  Schemas VAZIOS:    ${emptySchemas.size}`);
  console.log('');

  // Extract operations and refs
  const operations = extractOperations(openapi.paths);
  const allRefs = [];
  for (const op of operations) {
    allRefs.push(...op.schemaRefs);
  }

  const uniqueRefsInPaths = [...new Set(allRefs)];
  const emptyRefsInPaths = uniqueRefsInPaths.filter(r => emptySchemas.has(r));

  console.log('='.repeat(70));
  console.log('  2. REFS EM PATHS/OPERATIONS');
  console.log('='.repeat(70));
  console.log(`  Total de operacoes (endpoints):     ${operations.length}`);
  console.log(`  Total de refs a schemas em paths:   ${allRefs.length}`);
  console.log(`  Schemas unicos referenciados:       ${uniqueRefsInPaths.length}`);
  console.log(`  Schemas VAZIOS referenciados:       ${emptyRefsInPaths.length}`);
  console.log('');

  // Count refs per empty schema
  const emptySchemaRefCount = {};
  for (const ref of allRefs) {
    if (emptySchemas.has(ref)) {
      emptySchemaRefCount[ref] = (emptySchemaRefCount[ref] || 0) + 1;
    }
  }

  const sortedEmptySchemas = Object.entries(emptySchemaRefCount)
    .sort((a, b) => b[1] - a[1]);

  console.log('='.repeat(70));
  console.log('  3. TOP 15 SCHEMAS VAZIOS MAIS REFERENCIADOS');
  console.log('='.repeat(70));
  sortedEmptySchemas.slice(0, 15).forEach(([name, count], i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${name.padEnd(45)} ${count} refs`);
  });
  if (sortedEmptySchemas.length === 0) {
    console.log('  (Nenhum schema vazio e referenciado em paths)');
  }
  console.log('');

  // Operations affected by empty schemas
  const affectedOps = operations.filter(op =>
    op.schemaRefs.some(ref => emptySchemas.has(ref))
  );

  // Tag impact
  const tagImpact = {};
  for (const op of affectedOps) {
    for (const tag of op.tags) {
      tagImpact[tag] = (tagImpact[tag] || 0) + 1;
    }
  }

  const sortedTags = Object.entries(tagImpact).sort((a, b) => b[1] - a[1]);

  console.log('='.repeat(70));
  console.log('  4. TOP 10 TAGS/DOMINIOS MAIS IMPACTADOS');
  console.log('='.repeat(70));
  sortedTags.slice(0, 10).forEach(([tag, count], i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${tag.padEnd(35)} ${count} operacoes afetadas`);
  });
  if (sortedTags.length === 0) {
    console.log('  (Nenhuma tag impactada)');
  }
  console.log('');

  console.log('='.repeat(70));
  console.log('  5. OPERACOES AFETADAS POR SCHEMAS VAZIOS (primeiras 20)');
  console.log('='.repeat(70));
  affectedOps.slice(0, 20).forEach((op, i) => {
    const emptyRefs = op.schemaRefs.filter(r => emptySchemas.has(r));
    console.log(`  ${String(i + 1).padStart(2)}. ${op.method.padEnd(6)} ${op.path}`);
    console.log(`      operationId: ${op.operationId}`);
    console.log(`      tags: [${op.tags.join(', ')}]`);
    console.log(`      schemas vazios: [${emptyRefs.join(', ')}]`);
    console.log('');
  });

  console.log('='.repeat(70));
  console.log('  6. RESUMO');
  console.log('='.repeat(70));
  console.log(`  - ${emptySchemas.size} de ${schemaNames.length} schemas estao vazios (${((emptySchemas.size/schemaNames.length)*100).toFixed(1)}%)`);
  console.log(`  - ${emptyRefsInPaths.length} schemas vazios sao referenciados em paths`);
  console.log(`  - ${affectedOps.length} de ${operations.length} operacoes sao afetadas (${((affectedOps.length/operations.length)*100).toFixed(1)}%)`);
  console.log(`  - ${sortedTags.length} tags/dominios tem operacoes com schemas vazios`);
  console.log('');

  // CSV export
  if (csvArg) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    const csvPath = path.resolve(__dirname, '..', '_openapi', `empty-schema-usage-${timestamp}.csv`);

    const csvLines = [
      'method,path,operationId,tags,emptySchemas',
      ...affectedOps.map(op => {
        const emptyRefs = op.schemaRefs.filter(r => emptySchemas.has(r));
        return `${op.method},"${op.path}","${op.operationId}","${op.tags.join(';')}","${emptyRefs.join(';')}"`;
      })
    ];

    fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8');
    console.log(`CSV exportado: ${csvPath}`);
  }

  // Return data for programmatic use
  return {
    totalSchemas: schemaNames.length,
    emptySchemas: [...emptySchemas],
    okSchemas: [...okSchemas],
    totalOperations: operations.length,
    affectedOperations: affectedOps,
    topEmptySchemas: sortedEmptySchemas.slice(0, 20),
    topTags: sortedTags.slice(0, 10),
  };
}

// Run
analyze().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
