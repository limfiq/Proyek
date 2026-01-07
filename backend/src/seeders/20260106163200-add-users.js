'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('123456', salt);
        const timestamp = new Date();

        // 1. Seed Users
        const users = [
            // Mahasiswa (5)
            { username: 'mhs_andi', password: passwordHash, role: 'MAHASISWA', createdAt: timestamp, updatedAt: timestamp },
            { username: 'mhs_budi', password: passwordHash, role: 'MAHASISWA', createdAt: timestamp, updatedAt: timestamp },
            { username: 'mhs_citra', password: passwordHash, role: 'MAHASISWA', createdAt: timestamp, updatedAt: timestamp },
            { username: 'mhs_dewi', password: passwordHash, role: 'MAHASISWA', createdAt: timestamp, updatedAt: timestamp },
            { username: 'mhs_eko', password: passwordHash, role: 'MAHASISWA', createdAt: timestamp, updatedAt: timestamp },

            // Dosen (5)
            { username: 'dosen_fajar', password: passwordHash, role: 'DOSEN', createdAt: timestamp, updatedAt: timestamp },
            { username: 'dosen_gita', password: passwordHash, role: 'DOSEN', createdAt: timestamp, updatedAt: timestamp },
            { username: 'dosen_hendra', password: passwordHash, role: 'DOSEN', createdAt: timestamp, updatedAt: timestamp },
            { username: 'dosen_inda', password: passwordHash, role: 'DOSEN', createdAt: timestamp, updatedAt: timestamp },
            { username: 'dosen_joko', password: passwordHash, role: 'DOSEN', createdAt: timestamp, updatedAt: timestamp },

            // Instansi (3)
            { username: 'instansi_telkom', password: passwordHash, role: 'INSTANSI', createdAt: timestamp, updatedAt: timestamp },
            { username: 'instansi_pln', password: passwordHash, role: 'INSTANSI', createdAt: timestamp, updatedAt: timestamp },
            { username: 'instansi_kai', password: passwordHash, role: 'INSTANSI', createdAt: timestamp, updatedAt: timestamp },

            // Admin (1)
            { username: 'admin_prodi', password: passwordHash, role: 'ADMIN', createdAt: timestamp, updatedAt: timestamp },
        ];

        await queryInterface.bulkInsert('Users', users, { ignoreDuplicates: true });

        // Fetch newly created User IDs
        const userRecords = await queryInterface.sequelize.query(
            `SELECT id, username FROM Users WHERE username IN (
        'mhs_andi', 'mhs_budi', 'mhs_citra', 'mhs_dewi', 'mhs_eko',
        'dosen_fajar', 'dosen_gita', 'dosen_hendra', 'dosen_inda', 'dosen_joko',
        'instansi_telkom', 'instansi_pln', 'instansi_kai',
        'admin_prodi'
      );`
        );
        const userRows = userRecords[0];
        const getUserId = (username) => userRows.find(u => u.username === username)?.id;

        // 2. Seed Mahasiswa
        const mahasiswas = [
            { userId: getUserId('mhs_andi'), nim: '2101001', nama: 'Andi Saputra', kelas: 'TI-3A', angkatan: '2021', createdAt: timestamp, updatedAt: timestamp },
            { userId: getUserId('mhs_budi'), nim: '2101002', nama: 'Budi Santoso', kelas: 'TI-3A', angkatan: '2021', createdAt: timestamp, updatedAt: timestamp },
            { userId: getUserId('mhs_citra'), nim: '2101003', nama: 'Citra Kirana', kelas: 'TI-3B', angkatan: '2021', createdAt: timestamp, updatedAt: timestamp },
            { userId: getUserId('mhs_dewi'), nim: '2101004', nama: 'Dewi Ayu', kelas: 'TI-3B', angkatan: '2021', createdAt: timestamp, updatedAt: timestamp },
            { userId: getUserId('mhs_eko'), nim: '2101005', nama: 'Eko Prasetyo', kelas: 'TI-3C', angkatan: '2021', createdAt: timestamp, updatedAt: timestamp },
        ];
        await queryInterface.bulkInsert('Mahasiswas', mahasiswas, {});

        // 3. Seed Dosen
        const dosens = [
            { userId: getUserId('dosen_fajar'), nidn: '0411001', nama: 'Fajar Nugraha, M.Kom', createdAt: timestamp, updatedAt: timestamp },
            { userId: getUserId('dosen_gita'), nidn: '0411002', nama: 'Gita Pertiwi, M.T.', createdAt: timestamp, updatedAt: timestamp },
            { userId: getUserId('dosen_hendra'), nidn: '0411003', nama: 'Hendra Wijaya, M.Cs', createdAt: timestamp, updatedAt: timestamp },
            { userId: getUserId('dosen_inda'), nidn: '0411004', nama: 'Inda Lestari, M.Kom', createdAt: timestamp, updatedAt: timestamp },
            { userId: getUserId('dosen_joko'), nidn: '0411005', nama: 'Joko Susilo, M.T.', createdAt: timestamp, updatedAt: timestamp },
        ];
        await queryInterface.bulkInsert('Dosens', dosens, {});

        // 4. Seed Instansi
        const instansis = [
            {
                userId: getUserId('instansi_telkom'),
                nama: 'PT Telkom Indonesia',
                alamat: 'Jl. Japati No. 1, Bandung',
                pimpinan: 'Ririek Adriansyah',
                kontak: '022-1234567',
                isProposed: false,
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                userId: getUserId('instansi_pln'),
                nama: 'PT PLN (Persero)',
                alamat: 'Jl. Trunojoyo Blok M-I/135, Jakarta',
                pimpinan: 'Darmawan Prasodjo',
                kontak: '021-7654321',
                isProposed: false,
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                userId: getUserId('instansi_kai'),
                nama: 'PT Kereta Api Indonesia',
                alamat: 'Jl. Perintis Kemerdekaan No. 1, Bandung',
                pimpinan: 'Didiek Hartantyo',
                kontak: '022-9876543',
                isProposed: false,
                createdAt: timestamp,
                updatedAt: timestamp
            },
        ];
        await queryInterface.bulkInsert('Instansis', instansis, {});
    },

    async down(queryInterface, Sequelize) {
        // Delete in reverse order of creation to avoid FK constraints

        // Get IDs of users we created to only delete their data
        const userRecords = await queryInterface.sequelize.query(
            `SELECT id FROM Users WHERE username IN (
        'mhs_andi', 'mhs_budi', 'mhs_citra', 'mhs_dewi', 'mhs_eko',
        'dosen_fajar', 'dosen_gita', 'dosen_hendra', 'dosen_inda', 'dosen_joko',
        'instansi_telkom', 'instansi_pln', 'instansi_kai'
      );`
        );
        // If no users found, nothing to delete (safe check)
        if (!userRecords[0].length) return;

        const userIds = userRecords[0].map(u => u.id);

        // Delete details first
        await queryInterface.bulkDelete('Mahasiswas', { userId: userIds }, {});
        await queryInterface.bulkDelete('Dosens', { userId: userIds }, {});
        await queryInterface.bulkDelete('Instansis', { userId: userIds }, {});

        // Delete Users
        await queryInterface.bulkDelete('Users', { id: userIds }, {});
    }
};
