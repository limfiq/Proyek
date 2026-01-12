const db = require('./src/models');

async function checkColumns() {
    try {
        const tableInfo = await db.sequelize.getQueryInterface().describeTable('Periodes');
        console.log('Columns in Periodes table:', Object.keys(tableInfo));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

checkColumns();
