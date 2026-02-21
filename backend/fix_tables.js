require('dotenv').config();
const db = require('./src/models');

const fixTables = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connected to DB.');

        console.log('Syncing KriteriaNilai...');
        await db.KriteriaNilai.sync({ alter: true });
        console.log('Synced KriteriaNilai.');

        console.log('Syncing KomponenNilai...');
        await db.KomponenNilai.sync({ alter: true });
        console.log('Synced KomponenNilai.');

        console.log('Syncing LaporanMingguan...');
        await db.LaporanMingguan.sync({ alter: true });
        console.log('Synced LaporanMingguan.');

        console.log('Syncing LaporanTengah...');
        await db.LaporanTengah.sync({ alter: true });
        console.log('Synced LaporanTengah.');

        console.log('Syncing LaporanAkhir...');
        await db.LaporanAkhir.sync({ alter: true });
        console.log('Synced LaporanAkhir.');

        console.log('Syncing LaporanHarian...');
        await db.LaporanHarian.sync({ alter: true });
        console.log('Synced LaporanHarian.');

        console.log('All tables synced successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing tables:', error);
        process.exit(1);
    }
}

fixTables();
