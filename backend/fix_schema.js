const db = require('./src/models');

const fix = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connected.');
        const queryInterface = db.sequelize.getQueryInterface();

        // Add columns if they don't exist
        try { await queryInterface.addColumn('Instansis', 'posisi', { type: db.Sequelize.STRING }); console.log('Added posisi'); } catch (e) { console.log('posisi exists or error'); }
        try { await queryInterface.addColumn('Instansis', 'kota', { type: db.Sequelize.STRING }); console.log('Added kota'); } catch (e) { console.log('kota exists or error'); }
        try { await queryInterface.addColumn('Instansis', 'jenisLowongan', { type: db.Sequelize.STRING }); console.log('Added jenisLowongan'); } catch (e) { console.log('jenisLowongan exists or error'); }
        try { await queryInterface.addColumn('Instansis', 'isActive', { type: db.Sequelize.BOOLEAN, defaultValue: true }); console.log('Added isActive'); } catch (e) { console.log('isActive exists or error'); }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
fix();
