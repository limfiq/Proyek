const db = require('./src/models');

const repair = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connected to DB.');

        const [results, metadata] = await db.sequelize.query("SHOW INDEX FROM Users");
        const usernameIndexes = results.filter(r => r.Column_name === 'username'); // Filter by column

        // Use a Set to get unique index names (show index returns row per column per index)
        const indexNames = [...new Set(usernameIndexes.map(r => r.Key_name))];

        console.log(`Found ${indexNames.length} indexes on username.`);

        for (const name of indexNames) {
            // Keep one? Or drop all and let sync fix it?
            // "PRIMARY" is not here because column is username.
            // If we drop all, sequelize might try to add one later.
            // Let's drop ALL of them.
            if (name === 'PRIMARY') continue; // Should not happen for username usually unless username is PK.

            console.log(`Dropping index: ${name}`);
            try {
                await db.sequelize.query(`DROP INDEX \`${name}\` ON Users`);
            } catch (err) {
                console.log(`Failed to drop ${name}: ${err.message}`);
            }
        }

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
repair();
