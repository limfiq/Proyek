'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const timestamp = new Date();
        await queryInterface.bulkInsert('Mahasiswas', [
            {
                userId: null,
                nim: '12345678',
                nama: 'Mahasiswa Belum Daftar',
                kelas: 'TI-3C',
                angkatan: '2021',
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                userId: null,
                nim: '87654321',
                nama: 'Siti Belum Punya Akun',
                kelas: 'TI-3C',
                angkatan: '2021',
                createdAt: timestamp,
                updatedAt: timestamp
            }
        ], { ignoreDuplicates: true });
    },

    async down(queryInterface, Sequelize) {
        // Ideally we would delete these specific records, but for now we can leave them or delete by ID if we tracked it.
        // For safety in dev environment, we might skip bulkDelete all to avoid wiping other data effectively.
        // But following pattern:
        await queryInterface.bulkDelete('Mahasiswas', { nim: ['12345678', '87654321'] }, {});
    }
};
