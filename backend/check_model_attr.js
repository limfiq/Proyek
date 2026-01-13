const db = require('./src/models');

async function checkModel() {
    try {
        const attributes = db.LaporanAkhir.rawAttributes;
        if (attributes.finalUrl) {
            console.log("SUCCESS: 'finalUrl' attribute exists in LaporanAkhir model.");
        } else {
            console.error("FAILURE: 'finalUrl' attribute MISSING in LaporanAkhir model.");
        }
    } catch (err) {
        console.error(err);
    }
}

checkModel();
