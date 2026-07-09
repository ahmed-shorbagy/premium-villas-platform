import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

// Your old, locked database connection string
const OLD_DB_URL = "postgresql://postgres.idnehwkrufbgfmlkexvi:0vLw4AsC7xrmZEJE@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";
async function backupAllData() {
    const client = new Client({ connectionString: OLD_DB_URL });

    try {
        await client.connect();
        console.log("Connected to old database successfully!");

        // Dynamically fetch all table names in the public schema
        const tablesQuery = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);

        const allData = {};

        for (let row of tablesQuery.rows) {
            const tableName = row.table_name;
            console.log(`Backing up table: ${tableName}...`);

            const tableData = await client.query(`SELECT * FROM "${tableName}"`);
            allData[tableName] = tableData.rows;
        }

        // Save all data from all tables to a single local JSON file
        fs.writeFileSync('shima_full_backup.json', JSON.stringify(allData, null, 2));
        console.log("Successfully backed up ALL tables to shima_full_backup.json!");

    } catch (err) {
        console.error("Error backing up data:", err);
    } finally {
        await client.end();
    }
}

backupAllData();