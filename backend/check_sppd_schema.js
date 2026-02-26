const db = require('./src/models');

async function checkDb() {
    try {
        const tables = await db.sequelize.getQueryInterface().showAllTables();
        console.log('Tables in database:', tables);

        const sppdTable = tables.find(t => t.toLowerCase() === 'sppds');
        if (sppdTable) {
            const sppdInfo = await db.sequelize.getQueryInterface().describeTable(sppdTable);
            console.log(`Columns in ${sppdTable}:`, Object.keys(sppdInfo));
        } else {
            console.log('sppds table does not exist!');
        }

        const pendaftaranTable = tables.find(t => t.toLowerCase() === 'pendaftarans');
        if (pendaftaranTable) {
            const pendaftaranInfo = await db.sequelize.getQueryInterface().describeTable(pendaftaranTable);
            console.log(`Columns in ${pendaftaranTable}:`, Object.keys(pendaftaranInfo));
        } else {
            console.log('pendaftarans table does not exist!');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

checkDb();
