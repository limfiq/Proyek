const db = require('./src/models');

async function addLokerIdColumn() {
    try {
        await db.sequelize.query(`
            ALTER TABLE Pendaftarans 
            ADD COLUMN lokerId INTEGER NULL AFTER periodeId,
            ADD CONSTRAINT fk_loker_pendaftaran FOREIGN KEY (lokerId) REFERENCES Lokers(id) ON DELETE SET NULL ON UPDATE CASCADE;
        `);
        console.log("Column 'lokerId' added successfully to Pendaftarans table.");
    } catch (error) {
        if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
            console.log("Column 'lokerId' already exists.");
        } else {
            console.error("Error adding column:", error);
        }
    } finally {
        await db.sequelize.close();
    }
}

addLokerIdColumn();
