const { dbHelper } = require('./lib/supabaseHelper.ts');

async function runMigration() {
  console.log('Adding address column to profiles table...');
  
  try {
    // Add address column
    const result = await dbHelper.query(`
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
    `);
    
    if (result.success) {
      console.log('✅ Address column added successfully!');
      
      // Verify by checking table structure
      const tableInfo = await dbHelper.getTableInfo('profiles');
      if (tableInfo.success) {
        const hasAddress = tableInfo.columns.includes('address');
        console.log('Address column exists:', hasAddress ? '✅ YES' : '❌ NO');
        console.log('Total columns now:', tableInfo.columnCount);
      }
    } else {
      console.error('❌ Error adding column:', result.error);
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

runMigration();
