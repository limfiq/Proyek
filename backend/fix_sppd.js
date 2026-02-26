const db = require('./src/models');

async function fixSppd() {
    try {
        const tables = await db.sequelize.getQueryInterface().showAllTables();
        const periodeTable = tables.find(t => t.toLowerCase() === 'periodes');
        if (periodeTable) {
            const info = await db.sequelize.getQueryInterface().describeTable(periodeTable);
            console.log(`Columns in ${periodeTable}:`, Object.keys(info));
        }

        console.log('Syncing Sppd model with alter: true...');
        await db.Sppd.sync({ alter: true });
        console.log('Sppd model synced.');

        const sppdInfo = await db.sequelize.getQueryInterface().describeTable('sppds');
        console.log('Updated columns in sppds:', Object.keys(sppdInfo));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

fixSppd();
