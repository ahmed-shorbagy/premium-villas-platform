import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PutBucketCorsCommand, S3Client } from '@aws-sdk/client-s3';

const required = [
  'R2_ENDPOINT',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const extraOrigins = (process.env.R2_CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'supabase',
  'functions',
  'r2-presign',
  'cors.json',
);

const corsRules = JSON.parse(await readFile(corsPath, 'utf8'));
if (extraOrigins.length > 0 && Array.isArray(corsRules[0]?.AllowedOrigins)) {
  corsRules[0].AllowedOrigins = [
    ...new Set([...corsRules[0].AllowedOrigins, ...extraOrigins]),
  ];
}

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

await client.send(
  new PutBucketCorsCommand({
    Bucket: process.env.R2_BUCKET,
    CORSConfiguration: { CORSRules: corsRules },
  }),
);

console.log(`Applied CORS to R2 bucket ${process.env.R2_BUCKET}`);
console.log('Allowed origins:', corsRules[0].AllowedOrigins.join(', '));
