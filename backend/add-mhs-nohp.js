const db = require('./src/models');
async function fix() {
    try {
        console.log("Adding 'noHp' column to Mahasiswas table...");
        await db.sequelize.query("ALTER TABLE Mahasiswas ADD COLUMN noHp VARCHAR(255) AFTER angkatan;");
        console.log("Column added successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Column add failed (maybe it already exists?):", err.message);
        process.exit(1);
    }
}
fix();
