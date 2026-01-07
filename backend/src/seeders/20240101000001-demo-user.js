'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('123456', salt);
        const timestamp = new Date();

        // 1. Seed Periode
        await queryInterface.bulkInsert('Periodes', [
            {
                nama: '2023/2024 Genap',
                isActive: true,
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                nama: '2023/2024 Ganjil',
                isActive: false,
                createdAt: timestamp,
                updatedAt: timestamp
            }
        ], { ignoreDuplicates: true });

        // 2. Seed Users
        const users = [
            {
                username: 'admin',
                password: passwordHash,
                role: 'ADMIN',
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                username: 'dosen1',
                password: passwordHash,
                role: 'DOSEN',
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                username: 'dosen2',
                password: passwordHash,
                role: 'DOSEN',
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                username: 'mahasiswa1',
                password: passwordHash,
                role: 'MAHASISWA',
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                username: 'mahasiswa2',
                password: passwordHash,
                role: 'MAHASISWA',
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                username: 'instansi1',
                password: passwordHash,
                role: 'INSTANSI',
                createdAt: timestamp,
                updatedAt: timestamp
            }
        ];

        await queryInterface.bulkInsert('Users', users, { ignoreDuplicates: true });

        // Get User IDs
        const userRecords = await queryInterface.sequelize.query(
            `SELECT id, username FROM Users;`
        );
        const userRows = userRecords[0];

        const getUserId = (username) => userRows.find(u => u.username === username).id;

        // 3. Seed Dosen
        await queryInterface.bulkInsert('Dosens', [
            {
                userId: getUserId('dosen1'),
                nidn: '001001001',
                nama: 'Dr. Budi Santoso, M.Kom',
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                userId: getUserId('dosen2'),
                nidn: '002002002',
                nama: 'Siti Aminah, S.T., M.T.',
                createdAt: timestamp,
                updatedAt: timestamp
            }
        ], { ignoreDuplicates: true });

        // 4. Seed Mahasiswa
        await queryInterface.bulkInsert('Mahasiswas', [
            {
                userId: getUserId('mahasiswa1'),
                nim: '10101001',
                nama: 'Ahmad Rizki',
                kelas: 'TI-3A',
                angkatan: '2021',
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                userId: getUserId('mahasiswa2'),
                nim: '10101002',
                nama: 'Dewi Lestari',
                kelas: 'TI-3B',
                angkatan: '2021',
                createdAt: timestamp,
                updatedAt: timestamp
            }
        ], { ignoreDuplicates: true });

        // 5. Seed Instansi
        await queryInterface.bulkInsert('Instansis', [
            {
                userId: getUserId('instansi1'),
                nama: 'PT Teknologi Maju',
                alamat: 'Jl. Sudirman No. 10',
                createdAt: timestamp,
                updatedAt: timestamp
            }
        ], { ignoreDuplicates: true });

        // 6. Seed Pendaftaran (Transaction Data)
        // Fetch IDs robustly using direct queries
        const [periodeRows] = await queryInterface.sequelize.query(`SELECT id, nama FROM Periodes;`);
        const [instansiRows] = await queryInterface.sequelize.query(`SELECT id, userId FROM Instansis;`);
        const [dosenRows] = await queryInterface.sequelize.query(`SELECT id, userId FROM Dosens;`);
        const [mhsRows] = await queryInterface.sequelize.query(`SELECT id, userId FROM Mahasiswas;`);

        const getPeriodeId = (nama) => periodeRows.find(p => p.nama === nama)?.id;
        const getInstansiIdByUsername = (username) => instansiRows.find(i => i.userId === getUserId(username))?.id;
        const getDosenIdByUsername = (username) => dosenRows.find(d => d.userId === getUserId(username))?.id;
        const getMhsIdByUsername = (username) => mhsRows.find(m => m.userId === getUserId(username))?.id;

        const periodeGenapId = getPeriodeId('2023/2024 Genap');
        const instansiId = getInstansiIdByUsername('instansi1');
        const dosen1Id = getDosenIdByUsername('dosen1');
        const mhs1Id = getMhsIdByUsername('mahasiswa1');
        const mhs2Id = getMhsIdByUsername('mahasiswa2');

        if (!periodeGenapId || !instansiId || !dosen1Id || !mhs1Id || !mhs2Id) {
            console.error("Missing Reference IDs:", { periodeGenapId, instansiId, dosen1Id, mhs1Id, mhs2Id });
            throw new Error("Failed to resolve foreign keys for Pendaftaran seeding");
        }

        await queryInterface.bulkInsert('Pendaftarans', [
            {
                mahasiswaId: mhs1Id,
                instansiId: instansiId,
                dosenPembimbingId: dosen1Id,
                periodeId: periodeGenapId,
                tipe: 'PKL1',
                status: 'ACTIVE',
                judulProject: 'Sistem Informasi Absensi',
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                mahasiswaId: mhs2Id,
                instansiId: instansiId, // Same instansi
                dosenPembimbingId: null, // Pending validation
                periodeId: periodeGenapId,
                tipe: 'PKL1',
                status: 'PENDING',
                judulProject: null,
                createdAt: timestamp,
                updatedAt: timestamp
            }
        ], { ignoreDuplicates: true });

        // 7. Seed Laporan Harian (For Active Student)
        // Fetch Pendaftaran ID
        const [pendaftaranRows] = await queryInterface.sequelize.query(`SELECT id, mahasiswaId FROM Pendaftarans;`);
        const pendaftaranActiveId = pendaftaranRows.find(p => p.mahasiswaId === mhs1Id)?.id;

        if (!pendaftaranActiveId) throw new Error("Active Pendaftaran not found for seeding reports");

        await queryInterface.bulkInsert('LaporanHarians', [
            {
                pendaftaranId: pendaftaranActiveId,
                tanggal: '2024-02-01',
                kegiatan: 'Introduksi dan pengenalan lingkungan kerja',
                status: 'APPROVED',
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                pendaftaranId: pendaftaranActiveId,
                tanggal: '2024-02-02',
                kegiatan: 'Setup environment development',
                status: 'PENDING',
                createdAt: timestamp,
                updatedAt: timestamp
            }
        ], { ignoreDuplicates: true });

        // 8. Seed Laporan Tengah
        await queryInterface.bulkInsert('LaporanTengahs', [
            {
                pendaftaranId: pendaftaranActiveId,
                fileUrl: 'https://example.com/laporan-tengah.pdf',
                status: 'SUBMITTED',
                createdAt: timestamp,
                updatedAt: timestamp
            }
        ], { ignoreDuplicates: true });

        // 9. Seed Sidang (Schedule Defense)
        // Need Dosen 2 as Penguji
        const dosen2Id = getDosenIdByUsername('dosen2');

        await queryInterface.bulkInsert('Sidangs', [
            {
                pendaftaranId: pendaftaranActiveId,
                dosenPengujiId: dosen2Id,
                tanggal: '2024-06-15', // Future date
                nilaiAkhir: 0,
                createdAt: timestamp,
                updatedAt: timestamp
            }
        ], { ignoreDuplicates: true });

        // 10. Seed Komponen Nilai (Sample Grades)
        await queryInterface.bulkInsert('KomponenNilais', [
            {
                pendaftaranId: pendaftaranActiveId,
                jenis: 'HARIAN',
                nilai: 85.5,
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                pendaftaranId: pendaftaranActiveId,
                jenis: 'PEMBIMBING',
                nilai: 0, // Not yet graded
                createdAt: timestamp,
                updatedAt: timestamp
            }
        ], { ignoreDuplicates: true });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('KomponenNilais', null, {});
        await queryInterface.bulkDelete('Sidangs', null, {});
        await queryInterface.bulkDelete('LaporanTengahs', null, {});
        await queryInterface.bulkDelete('LaporanHarians', null, {});
        await queryInterface.bulkDelete('Pendaftarans', null, {});
        await queryInterface.bulkDelete('Instansis', null, {});
        await queryInterface.bulkDelete('Mahasiswas', null, {});
        await queryInterface.bulkDelete('Dosens', null, {});
        await queryInterface.bulkDelete('Users', null, {});
        await queryInterface.bulkDelete('Periodes', null, {});
    }
};
