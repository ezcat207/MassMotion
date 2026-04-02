#!/usr/bin/env node
// Test Supabase connection
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check if reactions table exists
    console.log('Test 1: Checking reactions table...');
    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Table check failed:', error.message);
      console.log('\n💡 Run the SQL from SUPABASE_SETUP.md to create the table.');
      return false;
    }

    console.log('✅ Table exists!');
    console.log(`   Found ${data ? data.length : 0} rows (showing first row only)`);

    // Test 2: Try inserting a test reaction
    console.log('\nTest 2: Testing insert...');
    const testReaction = {
      drama_id: 'test-drama-id',
      reaction_type: 'hype',
      session_id: 'test-session-' + Date.now(),
    };

    const { data: insertData, error: insertError } = await supabase
      .from('reactions')
      .insert(testReaction)
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      return false;
    }

    console.log('✅ Insert successful!');
    console.log('   Inserted reaction:', insertData);

    // Test 3: Read back the data
    console.log('\nTest 3: Testing read...');
    const { data: readData, error: readError } = await supabase
      .from('reactions')
      .select('*')
      .eq('drama_id', 'test-drama-id')
      .limit(5);

    if (readError) {
      console.error('❌ Read failed:', readError.message);
      return false;
    }

    console.log('✅ Read successful!');
    console.log(`   Found ${readData.length} test reactions`);

    // Cleanup: Delete test reactions
    console.log('\nCleaning up test data...');
    await supabase
      .from('reactions')
      .delete()
      .eq('drama_id', 'test-drama-id');

    console.log('\n🎉 All tests passed! Supabase is configured correctly.');
    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

testConnection().then((success) => {
  process.exit(success ? 0 : 1);
});
