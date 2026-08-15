require("dotenv").config();

const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL missing in local .env");
    process.exit(1);
}

const sqlitePath = path.join(__dirname, "polyportal.db");
const db = new sqlite3.Database(sqlitePath);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function quote(name) {
    return `"${String(name).replace(/"/g, '""')}"`;
}

function pgType(sqliteType = "") {
    const type = sqliteType.toUpperCase();

    if (type.includes("INT")) return "BIGINT";
    if (
        type.includes("REAL") ||
        type.includes("FLOAT") ||
        type.includes("DOUBLE")
    ) {
        return "DOUBLE PRECISION";
    }

    if (
        type.includes("DATE") ||
        type.includes("TIME")
    ) {
        return "TIMESTAMP";
    }

    return "TEXT";
}

function pgDefault(value, columnType) {
    if (value === null || value === undefined) {
        return "";
    }

    const raw = String(value).trim();

    if (!raw) return "";

    if (/^CURRENT_TIMESTAMP$/i.test(raw)) {
        return " DEFAULT CURRENT_TIMESTAMP";
    }

    if (/^NULL$/i.test(raw)) {
        return " DEFAULT NULL";
    }

    if (/strftime\s*\(\s*'%s'/i.test(raw)) {
        return " DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT)";
    }

    if (/^-?\d+(\.\d+)?$/.test(raw)) {
        return ` DEFAULT ${raw}`;
    }

    if (
        (raw.startsWith("'") && raw.endsWith("'")) ||
        (raw.startsWith('"') && raw.endsWith('"'))
    ) {
        return ` DEFAULT ${raw}`;
    }

    return "";
}

async function migrate() {
    const client = await pool.connect();

    try {
        console.log("✅ Connected to Neon");

        const tables = await all(`
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
              AND name != 'sqlite_sequence'
            ORDER BY name
        `);

        console.log(`📦 Found ${tables.length} GSP tables`);

        await client.query("BEGIN");

        /*
         * STEP 1
         * Recreate all SQLite tables in Neon.
         */
        for (const { name: table } of tables) {
            const columns = await all(
                `PRAGMA table_info(${quote(table)})`
            );

            const pkColumns = columns
                .filter(column => Number(column.pk) > 0)
                .sort((a, b) => a.pk - b.pk);

            await client.query(
                `DROP TABLE IF EXISTS ${quote(table)} CASCADE`
            );

            const definitions = columns.map(column => {
                let definition =
                    `${quote(column.name)} ${pgType(column.type)}`;

                if (
                    pkColumns.length === 1 &&
                    Number(column.pk) > 0
                ) {
                    definition += " PRIMARY KEY";
                } else if (Number(column.notnull) === 1) {
                    definition += " NOT NULL";
                }

                if (Number(column.pk) === 0) {
                    definition += pgDefault(
                        column.dflt_value,
                        column.type
                    );
                }

                return definition;
            });

            if (pkColumns.length > 1) {
                definitions.push(
                    `PRIMARY KEY (${pkColumns
                        .map(column => quote(column.name))
                        .join(", ")})`
                );
            }

            await client.query(`
                CREATE TABLE ${quote(table)} (
                    ${definitions.join(",\n")}
                )
            `);

            console.log(`✅ Created: ${table}`);
        }

        /*
         * STEP 2
         * Copy every row preserving original IDs.
         */
        for (const { name: table } of tables) {
            const columns = await all(
                `PRAGMA table_info(${quote(table)})`
            );

            const columnNames = columns.map(column => column.name);

            const rows = await all(
                `SELECT * FROM ${quote(table)}`
            );

            for (const row of rows) {
                const values = columnNames.map(
                    column => row[column]
                );

                const placeholders = values.map(
                    (_, index) => `$${index + 1}`
                );

                const sql = `
                    INSERT INTO ${quote(table)}
                    (
                        ${columnNames.map(quote).join(", ")}
                    )
                    VALUES
                    (
                        ${placeholders.join(", ")}
                    )
                `;

                await client.query(sql, values);
            }

            console.log(
                `📥 ${table}: ${rows.length} rows migrated`
            );
        }

        /*
         * STEP 3
         * Recreate UNIQUE constraints/indexes.
         */
        for (const { name: table } of tables) {
            const indexes = await all(
                `PRAGMA index_list(${quote(table)})`
            );

            for (const index of indexes) {
                if (!Number(index.unique)) continue;

                // Primary key already exists.
                if (index.origin === "pk") continue;

                const indexColumns = await all(
                    `PRAGMA index_info(${quote(index.name)})`
                );

                if (!indexColumns.length) continue;

                const columnNames = indexColumns
                    .sort((a, b) => a.seqno - b.seqno)
                    .map(item => item.name);

                const safeIndexName =
                    `uq_${table}_${columnNames.join("_")}`
                        .replace(/[^a-zA-Z0-9_]/g, "_")
                        .slice(0, 60);

                await client.query(`
                    CREATE UNIQUE INDEX ${quote(safeIndexName)}
                    ON ${quote(table)}
                    (
                        ${columnNames.map(quote).join(", ")}
                    )
                `);
            }
        }

        /*
         * STEP 4
         * Create PostgreSQL sequences for INTEGER primary keys.
         * This allows future INSERTs to generate new IDs.
         */
        for (const { name: table } of tables) {
            const columns = await all(
                `PRAGMA table_info(${quote(table)})`
            );

            const pk = columns.find(
                column =>
                    Number(column.pk) === 1 &&
                    String(column.type)
                        .toUpperCase()
                        .includes("INT")
            );

            if (!pk) continue;

            const sequenceName =
                `${table}_${pk.name}_seq`
                    .replace(/[^a-zA-Z0-9_]/g, "_");

            await client.query(
                `CREATE SEQUENCE IF NOT EXISTS ${quote(sequenceName)}`
            );

            await client.query(`
                ALTER SEQUENCE ${quote(sequenceName)}
                OWNED BY ${quote(table)}.${quote(pk.name)}
            `);

            await client.query(`
                ALTER TABLE ${quote(table)}
                ALTER COLUMN ${quote(pk.name)}
                SET DEFAULT nextval('${sequenceName}')
            `);

            await client.query(`
                SELECT setval(
                    '${sequenceName}',
                    GREATEST(
                        COALESCE(
                            (SELECT MAX(${quote(pk.name)})
                             FROM ${quote(table)}),
                            0
                        ) + 1,
                        1
                    ),
                    false
                )
            `);
        }

        /*
         * STEP 5
         * Verify SQLite count == Neon count.
         */
        console.log("\n========== VERIFICATION ==========");

        for (const { name: table } of tables) {
            const sqliteCount = await all(
                `SELECT COUNT(*) AS count
                 FROM ${quote(table)}`
            );

            const neonResult = await client.query(
                `SELECT COUNT(*) AS count
                 FROM ${quote(table)}`
            );

            const source = Number(sqliteCount[0].count);
            const target = Number(neonResult.rows[0].count);

            if (source !== target) {
                throw new Error(
                    `${table} mismatch: SQLite=${source}, Neon=${target}`
                );
            }

            console.log(
                `✅ ${table}: ${source} / ${target}`
            );
        }

        await client.query("COMMIT");

        console.log("\n======================================");
        console.log("🎉 SQLITE → NEON MIGRATION COMPLETE");
        console.log("🎉 ALL TABLE COUNTS VERIFIED");
        console.log("======================================");

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("\n❌ MIGRATION FAILED");
        console.error(error);

        process.exitCode = 1;

    } finally {
        db.close();
        client.release();
        await pool.end();
    }
}

migrate();