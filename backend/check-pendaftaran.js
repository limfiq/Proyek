const db = require('./src/models');
async function test() {
    try {
        const pendaftaran = await db.Pendaftaran.findOne({
            include: ['pembimbing']
        });
        console.log(JSON.stringify(pendaftaran, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
test();
