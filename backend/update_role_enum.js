const db = require('./src/models');

async function updateRoleEnum() {
    try {
        const queryInterface = db.sequelize.getQueryInterface();

        // Modifying ENUM in MySQL usually requires raw query or changeColumn with correct dialect options
        // We will try raw query for safety to extend the ENUM list
        await db.sequelize.query(`
            ALTER TABLE Users 
            MODIFY COLUMN role ENUM('MAHASISWA', 'DOSEN', 'INSTANSI', 'ADMIN', 'SUPERADMIN', 'ADMINPRODI', 'ADMINKEMAHASISWAAN') 
            NOT NULL;
        `);

        console.log("Column 'role' updated successfully in Users table.");
    } catch (error) {
        console.error("Error updating column:", error);
    } finally {
        await db.sequelize.close();
    }
}

updateRoleEnum();
