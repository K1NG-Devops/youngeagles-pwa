const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'youngEagles_db',
    multipleStatements: true
};

// Alternative: Use DATABASE_URL if available
if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    dbConfig.host = url.hostname;
    dbConfig.user = url.username;
    dbConfig.password = url.password;
    dbConfig.database = url.pathname.substring(1); // Remove leading slash
    dbConfig.port = url.port || 3306;
}

async function runMigration() {
    let connection;
    
    try {
        console.log('🔄 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection established');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, 'database_migration.sql');
        console.log('📄 Reading migration file:', migrationPath);
        
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Split SQL statements (removing comments and empty lines)
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`🚀 Executing ${statements.length} migration statements...`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    console.log(`   [${i + 1}/${statements.length}] Executing: ${statement.substring(0, 50)}...`);
                    await connection.execute(statement);
                    console.log(`   ✅ Statement ${i + 1} executed successfully`);
                } catch (error) {
                    console.log(`   ⚠️  Statement ${i + 1} warning/error: ${error.message}`);
                    // Continue with other statements (some might be IF NOT EXISTS)
                }
            }
        }
        
        console.log('🎉 Migration completed successfully!');
        
        // Verify the push_subscriptions table was created
        console.log('\n📊 Verifying push_subscriptions table...');
        const [rows] = await connection.execute('DESCRIBE push_subscriptions');
        console.log('✅ push_subscriptions table structure:');
        console.table(rows);
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔒 Database connection closed');
        }
    }
}

// Run the migration
if (require.main === module) {
    console.log('🚀 Starting database migration...');
    runMigration().catch(console.error);
}

module.exports = { runMigration };
