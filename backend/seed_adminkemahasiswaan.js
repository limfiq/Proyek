const db = require('./src/models');
const bcrypt = require('bcrypt');

async function seedAdminKemahasiswaan() {
    try {
        const username = 'adminkemahasiswaan';
        const password = 'password123'; // Default password
        const hashedPassword = await bcrypt.hash(password, 8);

        const [user, created] = await db.User.findOrCreate({
            where: { username: username },
            defaults: {
                username: username,
                password: hashedPassword,
                role: 'ADMINKEMAHASISWAAN'
            }
        });

        if (created) {
            console.log(`AdminKemahasiswaan created successfully!`);
            console.log(`Username: ${username}`);
            console.log(`Password: ${password}`);
        } else {
            console.log('AdminKemahasiswaan account already exists.');
            if (user.role !== 'ADMINKEMAHASISWAAN') {
                user.role = 'ADMINKEMAHASISWAAN';
                await user.save();
                console.log('Existing user updated to ADMINKEMAHASISWAAN role.');
            }
        }
    } catch (error) {
        console.error("Error seeding adminkemahasiswaan:", error);
    } finally {
        await db.sequelize.close();
    }
}

seedAdminKemahasiswaan();
