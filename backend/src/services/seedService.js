'use strict';
const bcrypt = require('bcrypt');

const seedInitialData = async (db) => {
    const queryInterface = db.sequelize.getQueryInterface();
    const timestamp = new Date();
    const passwordHash = await bcrypt.hash('123456', 10);

    try {
        console.log("Starting automatic database seeding...");

        // 1. Periodes
        await queryInterface.bulkInsert('Periodes', [
            { nama: '2024/2025 Ganjil', isActive: true, tanggalMulai: '2024-09-01', tanggalSelesai: '2025-02-28', createdAt: timestamp, updatedAt: timestamp },
            { nama: '2024/2025 Genap', isActive: false, tanggalMulai: '2025-03-01', tanggalSelesai: '2025-08-31', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 2. Prodis
        await queryInterface.bulkInsert('Prodis', [
            { nama: 'Teknik Informatika', jenjang: 'S1', createdAt: timestamp, updatedAt: timestamp },
            { nama: 'Sistem Informasi', jenjang: 'S1', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 3. KriteriaNilais
        await queryInterface.bulkInsert('KriteriaNilais', [
            { nama: 'Kedisiplinan', bobot: 20, role: 'INSTANSI', tipe: 'PKL1', createdAt: timestamp, updatedAt: timestamp },
            { nama: 'Teknis Pekerjaan', bobot: 40, role: 'PEMBIMBING', tipe: 'PKL1', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 4. Panduans
        await queryInterface.bulkInsert('Panduans', [
            { judul: 'Panduan PKL 2024', deskripsi: 'Tata cara pelaksanaan PKL.', fileUrl: 'panduan-pkl.pdf', kategori: 'PKL', isActive: true, createdAt: timestamp, updatedAt: timestamp },
            { judul: 'Panduan MBKM', deskripsi: 'Panduan program MBKM.', fileUrl: 'panduan-mbkm.pdf', kategori: 'MBKM', isActive: true, createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 5. Jadwals
        await queryInterface.bulkInsert('Jadwals', [
            { namaKegiatan: 'Pembekalan PKL', tanggal: '2024-08-15', kategori: 'PKL1', createdAt: timestamp, updatedAt: timestamp },
            { namaKegiatan: 'Sosialisasi MBKM', tanggal: '2024-08-20', kategori: 'MBKM', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 6. Kegiatans
        await queryInterface.bulkInsert('Kegiatans', [
            { judul: 'Sharing Alumnus', deskripsi: 'Diskusi bersama alumni sukses.', lokasi: 'Aula STIKOM', tanggal: timestamp, status: 'OPEN', createdAt: timestamp, updatedAt: timestamp },
            { judul: 'Workshop Resume', deskripsi: 'Pelatihan pembuatan CV.', lokasi: 'Lab Komputer', tanggal: timestamp, status: 'UPCOMING', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 7. Lombas
        await queryInterface.bulkInsert('Lombas', [
            { judul: 'Hackathon 2024', deskripsi: 'Lomba koding 24 jam.', penyelenggara: 'HIMA TI', tanggalMulai: '2024-10-01', tanggalSelesai: '2024-10-02', status: 'OPEN', createdAt: timestamp, updatedAt: timestamp },
            { judul: 'UI/UX Design', deskripsi: 'Lomba desain antarmuka.', penyelenggara: 'HIMA SI', tanggalMulai: '2024-11-10', tanggalSelesai: '2024-11-11', status: 'UPCOMING', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 8. Users
        await queryInterface.bulkInsert('Users', [
            { username: 'admin_demo', password: passwordHash, role: 'ADMIN', createdAt: timestamp, updatedAt: timestamp },
             { username: 'mhs_demo1', password: passwordHash, role: 'MAHASISWA', createdAt: timestamp, updatedAt: timestamp },
            { username: 'instansi_demo1', password: passwordHash, role: 'INSTANSI', createdAt: timestamp, updatedAt: timestamp },
        ], { ignoreDuplicates: true });

        const [userRows] = await db.sequelize.query(`SELECT id, username FROM Users`);
        const [prodiRows] = await db.sequelize.query(`SELECT id, nama FROM Prodis`);
        const [periodeRows] = await db.sequelize.query(`SELECT id, nama FROM Periodes`);
        const [kriteriaRows] = await db.sequelize.query(`SELECT id, nama FROM KriteriaNilais`);

        const getUserId = (u) => userRows.find(row => row.username === u).id;
        const getProdiId = (n) => prodiRows.find(row => row.nama === n).id;

        // 9. Dosens
        await queryInterface.bulkInsert('Dosens', [
            { userId: getUserId('dosen_demo1'), nidn: '111111', nama: 'Dosen Pembimbing 1', createdAt: timestamp, updatedAt: timestamp },
            { userId: getUserId('dosen_demo2'), nidn: '222222', nama: 'Dosen Penguji 1', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 10. Mahasiswas
        await queryInterface.bulkInsert('Mahasiswas', [
            { userId: getUserId('mhs_demo1'), nim: '123456', nama: 'Mahasiswa 1', prodiId: getProdiId('Teknik Informatika'), kelas: 'TI-A', angkatan: '2021', createdAt: timestamp, updatedAt: timestamp },
            { userId: getUserId('mhs_demo2'), nim: '654321', nama: 'Mahasiswa 2', prodiId: getProdiId('Sistem Informasi'), kelas: 'SI-B', angkatan: '2021', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 11. Instansis
        await queryInterface.bulkInsert('Instansis', [
            { userId: getUserId('instansi_demo1'), nama: 'PT Solusi Digital', alamat: 'Banyuwangi', kontak: 'hrd@solusi.com', posisi: 'Fullstack Dev', createdAt: timestamp, updatedAt: timestamp },
            { userId: getUserId('instansi_demo2'), nama: 'CV Media Kreatif', alamat: 'Banyuwangi', kontak: 'hrd@media.com', posisi: 'Graphic Designer', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        const [dosenRows] = await db.sequelize.query(`SELECT id, nidn FROM Dosens`);
        const [mhsRows] = await db.sequelize.query(`SELECT id, nim FROM Mahasiswas`);
        const [instansiRows] = await db.sequelize.query(`SELECT id, nama FROM Instansis`);

        const getDosenId = (n) => dosenRows.find(row => row.nidn === n).id;
        const getMhsId = (n) => mhsRows.find(row => row.nim === n).id;
        const getInstansiId = (n) => instansiRows.find(row => row.nama === n).id;
        const getPeriodeId = (n) => periodeRows.find(row => row.nama === n).id;

        // 12. Lokers
        await queryInterface.bulkInsert('Lokers', [
            { instansiId: getInstansiId('PT Solusi Digital'), posisi: 'Backend Dev', jenisLowongan: 'Magang Reguler', kuota: 5, status: 'OPEN', createdAt: timestamp, updatedAt: timestamp },
            { instansiId: getInstansiId('CV Media Kreatif'), posisi: 'UI Designer', jenisLowongan: 'MBKM', kuota: 2, status: 'OPEN', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        const [lokerRows] = await db.sequelize.query(`SELECT id, posisi FROM Lokers`);
        const getLokerId = (p) => lokerRows.find(row => row.posisi === p).id;

        // 13. Pendaftarans
        await queryInterface.bulkInsert('Pendaftarans', [
            { mahasiswaId: getMhsId('123456'), instansiId: getInstansiId('PT Solusi Digital'), dosenPembimbingId: getDosenId('111111'), periodeId: getPeriodeId('2024/2025 Ganjil'), lokerId: getLokerId('Backend Dev'), tipe: 'PKL1', status: 'ACTIVE', createdAt: timestamp, updatedAt: timestamp },
            { mahasiswaId: getMhsId('654321'), instansiId: getInstansiId('CV Media Kreatif'), dosenPembimbingId: getDosenId('222222'), periodeId: getPeriodeId('2024/2025 Genap'), lokerId: getLokerId('UI Designer'), tipe: 'MBKM', status: 'PENDING', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        const [pendaftaranRows] = await db.sequelize.query(`SELECT id FROM Pendaftarans`);
        const p1Id = pendaftaranRows[0].id;
        const p2Id = pendaftaranRows[1].id;

        // 14. LaporanHarians
        await queryInterface.bulkInsert('LaporanHarians', [
            { pendaftaranId: p1Id, tanggal: '2024-09-02', kegiatan: 'Setup Laptop', status: 'APPROVED', createdAt: timestamp, updatedAt: timestamp },
            { pendaftaranId: p2Id, tanggal: '2024-09-02', kegiatan: 'Briefing Project', status: 'DRAFT', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 15. LaporanMingguans
        await queryInterface.bulkInsert('LaporanMingguans', [
            { pendaftaranId: p1Id, mingguKe: 1, fileUrl: 'week1.pdf', status: 'APPROVED', createdAt: timestamp, updatedAt: timestamp },
            { pendaftaranId: p2Id, mingguKe: 1, fileUrl: 'week1-mbkm.pdf', status: 'PENDING', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 16. LaporanTengahs
        await queryInterface.bulkInsert('LaporanTengahs', [
            { pendaftaranId: p1Id, fileUrl: 'mid-report.pdf', status: 'SUBMITTED', createdAt: timestamp, updatedAt: timestamp },
            { pendaftaranId: p2Id, fileUrl: 'mid-report-mbkm.pdf', status: 'SUBMITTED', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 17. LaporanAkhirs
        await queryInterface.bulkInsert('LaporanAkhirs', [
            { pendaftaranId: p1Id, fileUrl: 'final-report.pdf', status: 'APPROVED', createdAt: timestamp, updatedAt: timestamp },
            { pendaftaranId: p2Id, fileUrl: 'final-report-mbkm.pdf', status: 'SUBMITTED', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 18. Sidangs
        await queryInterface.bulkInsert('Sidangs', [
            { pendaftaranId: p1Id, dosenPengujiId: getDosenId('222222'), tanggal: '2025-02-10', ruang: 'Rapat 1', sesi: 'Siang', status: 'BELUM', createdAt: timestamp, updatedAt: timestamp },
            { pendaftaranId: p2Id, dosenPengujiId: getDosenId('111111'), tanggal: '2025-02-11', ruang: 'Lab 2', sesi: 'Pagi', status: 'BELUM', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 19. KomponenNilais
        await queryInterface.bulkInsert('KomponenNilais', [
            { pendaftaranId: p1Id, kriteriaNilaiId: kriteriaRows[0].id, jenis: 'INSTANSI', nilai: 90, createdAt: timestamp, updatedAt: timestamp },
            { pendaftaranId: p1Id, kriteriaNilaiId: kriteriaRows[1].id, jenis: 'PEMBIMBING', nilai: 85, createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        // 20. Sppds
        await queryInterface.bulkInsert('Sppds', [
            { dosenId: getDosenId('111111'), pendaftaranId: p1Id, tanggal: '2024-10-10', lokasi: 'Kantor PT Solusi', yangDitemui: 'Manajer HRD', createdAt: timestamp, updatedAt: timestamp },
            { dosenId: getDosenId('222222'), pendaftaranId: p2Id, tanggal: '2024-11-12', lokasi: 'Studio CV Media', yangDitemui: 'CEO', createdAt: timestamp, updatedAt: timestamp }
        ], { ignoreDuplicates: true });

        console.log("Automatic database seeding completed successfully.");
    } catch (error) {
        console.error("Automatic database seeding failed:", error);
    }
};

const runSeedIfEmpty = async (db) => {
    try {
        const userCount = await db.User.count();
        if (userCount === 0) {
            console.log("Database is empty. Running initial seeds...");
            await seedInitialData(db);
        } else {
            console.log("Database already has data. Skipping automatic seeds.");
        }
    } catch (error) {
        console.error("Error checking database for seeding:", error);
    }
};

module.exports = {
    runSeedIfEmpty
};
