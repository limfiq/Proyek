const db = require('./src/models');

async function addStatusColumn() {
    try {
        const queryInterface = db.sequelize.getQueryInterface();
        await queryInterface.addColumn('Sidangs', 'status', {
            type: db.Sequelize.ENUM('BELUM', 'SUDAH'),
            defaultValue: 'BELUM'
        });
        console.log("Column 'status' added successfully to Sidangs table.");
    } catch (error) {
        console.error("Error adding column:", error);
    } finally {
        await db.sequelize.close();
    }
}

addStatusColumn();
