const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const config = require('./config/database.js')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: console.log,
});

async function optimize() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const queries = [
            // Pendaftarans
            'CREATE INDEX idx_pendaftaran_mahasiswa ON Pendaftarans(mahasiswaId)',
            'CREATE INDEX idx_pendaftaran_dosen ON Pendaftarans(dosenPembimbingId)',
            'CREATE INDEX idx_pendaftaran_periode ON Pendaftarans(periodeId)',
            'CREATE INDEX idx_pendaftaran_status ON Pendaftarans(status)',

            // LaporanHarians
            'CREATE INDEX idx_laporanharian_pendaftaran ON LaporanHarians(pendaftaranId)',
            'CREATE INDEX idx_laporanharian_status ON LaporanHarians(status)',

            // LaporanMingguans
            'CREATE INDEX idx_laporanmingguan_pendaftaran ON LaporanMingguans(pendaftaranId)',
            'CREATE INDEX idx_laporanmingguan_status ON LaporanMingguans(status)',

            // Sidangs
            'CREATE INDEX idx_sidang_pendaftaran ON Sidangs(pendaftaranId)',
            'CREATE INDEX idx_sidang_dosen_penguji ON Sidangs(dosenPengujiId)'
        ];

        for (const query of queries) {
            try {
                await sequelize.query(query);
                console.log(`Success: ${query}`);
            } catch (e) {
                if (e.original && (e.original.errno === 1061 || e.original.code === 'ER_DUP_KEYNAME')) {
                    console.log(`Skipped (already exists): ${query}`);
                } else {
                    console.error(`Error executing ${query}:`, e.message);
                }
            }
        }

        console.log('Database optimization complete!');
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

optimize();
