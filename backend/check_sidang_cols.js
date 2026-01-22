const db = require('./src/models');

async function checkColumns() {
    try {
        const tableInfo = await db.sequelize.getQueryInterface().describeTable('Sidangs');
        console.log(JSON.stringify(tableInfo, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

checkColumns();
