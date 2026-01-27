const db = require('./src/models');
const bcrypt = require('bcrypt');

async function seedInstansi() {
    try {
        const username = 'instansi_demo';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 8);

        // 1. Create User
        const [user, created] = await db.User.findOrCreate({
            where: { username: username },
            defaults: {
                username: username,
                password: hashedPassword,
                role: 'INSTANSI'
            }
        });

        if (created) {
            console.log(`User '${username}' created.`);
        } else {
            console.log(`User '${username}' already exists.`);
            // Update role if needed
            if (user.role !== 'INSTANSI') {
                user.role = 'INSTANSI';
                await user.save();
                console.log(`User role updated to INSTANSI.`);
            }
        }

        // 2. Create Instansi Profile
        const [instansi, instansiCreated] = await db.Instansi.findOrCreate({
            where: { userId: user.id },
            defaults: {
                userId: user.id,
                nama: 'PT. Teknologi Masa Depan',
                alamat: 'Jl. Sudirman No. 1, Jakarta',
                kontak: 'hrd@techfuture.com',
                pimpinan: 'Budi Santoso',
                posisi: 'Software Engineer', // Default/Example
                kota: 'Jakarta',
                jenisLowongan: 'Magang Bersertifikat',
                isActive: true
            }
        });

        if (instansiCreated) {
            console.log(`Instansi profile created for user '${username}'.`);
        } else {
            console.log(`Instansi profile already exists for user '${username}'.`);
        }

        console.log(`\nCredentials:`);
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error("Error seeding instansi:", error);
    } finally {
        await db.sequelize.close();
    }
}

seedInstansi();
