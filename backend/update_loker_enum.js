const db = require('./src/models');

async function updateLokerEnum() {
    try {
        await db.sequelize.query(`
            ALTER TABLE Lokers 
            MODIFY COLUMN jenisLowongan ENUM('Magang Reguler', 'Magang Bersertifikat', 'Magang Mandiri', 'MBKM', 'Lowongan Pekerjaan') 
            NOT NULL;
        `);
        console.log("Column 'jenisLowongan' updated successfully in Lokers table.");
    } catch (error) {
        console.error("Error updating column:", error);
    } finally {
        await db.sequelize.close();
    }
}

updateLokerEnum();
