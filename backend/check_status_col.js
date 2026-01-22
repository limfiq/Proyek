const db = require('./src/models');

async function checkStatusColumn() {
    try {
        const tableInfo = await db.sequelize.getQueryInterface().describeTable('Sidangs');
        if (tableInfo.status) {
            console.log("STATUS_COLUMN_EXISTS");
        } else {
            console.log("STATUS_COLUMN_MISSING");
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

checkStatusColumn();
