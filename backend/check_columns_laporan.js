require('dotenv').config();
const db = require('./src/models');

async function checkColumns() {
    try {
        await db.sequelize.authenticate();
        console.log('Connected to DB.');

        const tables = ['LaporanAkhirs', 'LaporanTengahs', 'LaporanMingguans', 'KomponenNilais'];

        for (const table of tables) {
            try {
                const tableInfo = await db.sequelize.getQueryInterface().describeTable(table);
                console.log(`Columns in ${table}:`, Object.keys(tableInfo));
            } catch (e) {
                console.error(`Error describing ${table}:`, e.message);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

checkColumns();

