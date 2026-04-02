#!/usr/bin/env node
// Automatically setup Supabase database tables
import pkg from 'pg';
const { Client } = pkg;
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL or DIRECT_URL not found in .env');
  process.exit(1);
}

console.log('🔧 Setting up MassMotion database...\n');

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read SQL schema
    const schema = readFileSync(join(__dirname, 'supabase-schema.sql'), 'utf8')
      .replace(/DO \$\$[\s\S]*?END \$\$;/g, ''); // Remove NOTICE blocks for pg client

    console.log('\n📝 Creating tables and policies...');

    await client.query(schema);

    console.log('✅ Tables created successfully');

    // Verify table exists
    const result = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename = 'reactions'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Verified: reactions table exists');

      // Check policies
      const policies = await client.query(`
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'reactions'
      `);

      console.log(`✅ Verified: ${policies.rows.length} security policies created`);
      policies.rows.forEach(row => {
        console.log(`   - ${row.policyname}`);
      });
    }

    console.log('\n🎉 Database setup complete!');
    console.log('Now run: node test-supabase.js');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tables already exist, skipping...');
      return true;
    }
    console.error('❌ Setup failed:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

setupDatabase().then(success => {
  process.exit(success === false ? 1 : 0);
});
