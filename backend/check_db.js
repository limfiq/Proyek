const db = require('./src/models');

const check = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connected.');
        const instansis = await db.Instansi.findAll();
        console.log(`Found ${instansis.length} instansi records.`);
        if (instansis.length > 0) {
            console.log('Sample keys:', Object.keys(instansis[0].dataValues));
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
check();
