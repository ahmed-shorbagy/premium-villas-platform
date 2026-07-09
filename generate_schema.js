import pkg from 'pg';
const { Client } = pkg;

// Using the stable IPv4 Pooler connection string for your old database
const OLD_DB_URL = "postgresql://postgres.idnehwkrufbgfmlkexvi:0vLw4AsC7xrmZEJE@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";

async function generateSQLSchema() {
    const client = new Client({ connectionString: OLD_DB_URL });

    try {
        await client.connect();
        console.log("Connected to extract database blueprints...\n");

        // Array of your specific tables
        const targetTables = ['properties', 'banners', 'reservations', 'site_settings', 'user_roles', 'villa_availability'];

        for (const tableName of targetTables) {
            // Query to fetch columns and data types
            const columnRes = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

            if (columnRes.rows.length === 0) continue;

            let sqlLines = [];
            for (const col of columnRes.rows) {
                let line = `  "${col.column_name}" ${col.data_type.toUpperCase()}`;
                if (col.is_nullable === 'NO') line += ' NOT NULL';
                if (col.column_default) line += ` DEFAULT ${col.column_default}`;
                sqlLines.push(line);
            }

            console.log(`-- Blueprint for table: ${tableName}`);
            console.log(`CREATE TABLE IF NOT EXISTS "public"."${tableName}" (`);
            console.log(sqlLines.join(',\n'));
            console.log(`);\n`);
        }

    } catch (err) {
        console.error("Error generating schemas:", err);
    } finally {
        await client.end();
    }
}

generateSQLSchema();