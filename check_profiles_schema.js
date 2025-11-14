const { dbHelper } = require('./lib/supabaseHelper.ts');

async function checkProfilesSchema() {
  console.log('Checking profiles table schema...');
  
  try {
    // Get table structure
    const tableInfo = await dbHelper.getTableInfo('profiles');
    
    if (tableInfo.success) {
      console.log('\n=== PROFILES TABLE COLUMNS ===');
      console.log('Columns found:', tableInfo.columns);
      console.log('Total columns:', tableInfo.columnCount);
      
      console.log('\n=== SAMPLE DATA STRUCTURE ===');
      console.log(JSON.stringify(tableInfo.sampleData, null, 2));
      
      // Check for required bulk upload columns
      const requiredColumns = [
        'display_name',
        'address',
        'city',
        'province',
        'website_url',
        'phone_number',
        'email',
        'business_category'
      ];
      
      console.log('\n=== COLUMN MAPPING CHECK ===');
      requiredColumns.forEach(col => {
        const exists = tableInfo.columns.includes(col);
        console.log(`${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
      });
      
    } else {
      console.error('Error getting table info:', tableInfo.error);
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

checkProfilesSchema();
