const db = require('./src/models');

async function checkPanduan() {
    try {
        const pandas = await db.Panduan.findAll();
        console.log('Total Panduan:', pandas.length);
        pandas.forEach(p => {
            console.log(`ID: ${p.id}, Judul: ${p.judul}, Active: ${p.isActive}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkPanduan();
