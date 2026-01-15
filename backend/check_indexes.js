const db = require('./src/models');

const checkIndexes = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connected.');
        const [results, metadata] = await db.sequelize.query("SHOW INDEX FROM Users");
        console.log(`Found ${results.length} indexes on Users.`);
        // console.log(results.map(r => r.Key_name));

        // Count username indexes
        const usernameIndexes = results.filter(r => r.Column_name === 'username');
        console.log(`username indexes: ${usernameIndexes.length}`);
        console.log(usernameIndexes.map(r => r.Key_name));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
checkIndexes();
