const { Sequelize } = require('sequelize');
const config = require('./config/database.js');
const env = 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect
});

async function checkColumns() {
    try {
        const desc = await sequelize.getQueryInterface().describeTable('LaporanAkhirs');
        console.log("Columns in LaporanAkhirs:", Object.keys(desc));
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await sequelize.close();
    }
}

checkColumns();
