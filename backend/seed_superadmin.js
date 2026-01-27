const db = require('./src/models');
const bcrypt = require('bcrypt');

async function seedSuperAdmin() {
    try {
        const username = 'superadmin';
        const password = 'password123'; // Default password
        const hashedPassword = await bcrypt.hash(password, 8);

        const [user, created] = await db.User.findOrCreate({
            where: { username: username },
            defaults: {
                username: username,
                password: hashedPassword,
                role: 'SUPERADMIN'
            }
        });

        if (created) {
            console.log(`Superadmin created successfully!`);
            console.log(`Username: ${username}`);
            console.log(`Password: ${password}`);
        } else {
            console.log('Superadmin account already exists.');
            // Optional: Force update role if it exists but isn't superadmin
            if (user.role !== 'SUPERADMIN') {
                user.role = 'SUPERADMIN';
                await user.save();
                console.log('Existing user updated to SUPERADMIN role.');
            }
        }
    } catch (error) {
        console.error("Error seeding superadmin:", error);
    } finally {
        await db.sequelize.close();
    }
}

seedSuperAdmin();
