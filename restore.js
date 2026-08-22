import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const NEW_DB_URL = process.env.DATABASE_URL;
if (!NEW_DB_URL) {
    throw new Error('Missing DATABASE_URL environment variable');
}

async function restoreAllData() {
    // Read the master backup file
    const rawData = fs.readFileSync('shima_full_backup.json');
    const allData = JSON.parse(rawData);

    const client = new Client({ connectionString: NEW_DB_URL });

    try {
        await client.connect();
        console.log("Connected to new database successfully!");

        // Loop through every table in the backup file
        for (const [tableName, rows] of Object.entries(allData)) {
            if (rows.length === 0) {
                console.log(`Skipping ${tableName}: 0 rows to insert.`);
                continue;
            }

            console.log(`Restoring ${rows.length} rows into table: ${tableName}...`);

            for (const row of rows) {
                // Extract keys and values dynamically
                const columns = Object.keys(row).map(key => `"${key}"`).join(', ');
                const values = Object.values(row);
                const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

                const query = `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

                try {
                    await client.query(query, values);
                } catch (insertErr) {
                    console.error(`Failed to insert row into ${tableName}:`, insertErr.message);
                }
            }
        }

        console.log("Full data restoration complete!");

    } catch (err) {
        console.error("Error connecting to new database:", err);
    } finally {
        await client.end();
    }
}

restoreAllData();