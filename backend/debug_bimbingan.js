const db = require('./src/models');
require('dotenv').config();

const bcrypt = require('bcrypt');

async function testGetBimbingan() {
    try {
        await db.sequelize.authenticate();
        console.log('Database connected.');

        // 1. Ensure a Dosen exists
        let userDosen = await db.User.findOne({ where: { username: 'dosen_test_debug' } });
        if (!userDosen) {
            console.log('Creating test DOSEN...');
            userDosen = await db.User.create({
                username: 'dosen_test_debug',
                password: await bcrypt.hash('123456', 8),
                role: 'DOSEN'
            });
            await db.Dosen.create({
                userId: userDosen.id,
                nama: 'Dosen Debug',
                nip: '123456789'
            });
        }

        const dosenProfile = await db.Dosen.findOne({ where: { userId: userDosen.id } });

        // 2. Ensure a Period exists
        let periode = await db.Periode.findOne({ where: { isActive: true } });
        if (!periode) {
            console.log('Creating active period...');
            periode = await db.Periode.create({
                nama: '2024/2025',
                isActive: true,
                tanggalMulai: new Date(),
                tanggalSelesai: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            });
        }

        // 3. Ensure a Mahasiswa exists
        let userMhs = await db.User.findOne({ where: { username: 'mhs_test_debug' } });
        if (!userMhs) {
            console.log('Creating test MAHASISWA...');
            userMhs = await db.User.create({
                username: 'mhs_test_debug',
                password: await bcrypt.hash('123456', 8),
                role: 'MAHASISWA'
            });
            await db.Mahasiswa.create({
                userId: userMhs.id,
                nama: 'Mahasiswa Debug',
                nim: '11223344'
            });
        }
        const mhsProfile = await db.Mahasiswa.findOne({ where: { userId: userMhs.id } });

        // 4. Ensure Pendaftaran exists
        let pendaftaran = await db.Pendaftaran.findOne({
            where: { mahasiswaId: mhsProfile.id, periodeId: periode.id }
        });

        if (!pendaftaran) {
            console.log('Creating test Pendaftaran...');
            pendaftaran = await db.Pendaftaran.create({
                mahasiswaId: mhsProfile.id,
                periodeId: periode.id,
                dosenPembimbingId: dosenProfile.id, // Assign to our debug dosen
                tipe: 'PKL1',
                status: 'ACTIVE'
            });
        } else {
            // Update to ensure it is assigned to our debug dosen
            if (pendaftaran.dosenPembimbingId !== dosenProfile.id) {
                pendaftaran.dosenPembimbingId = dosenProfile.id;
                await pendaftaran.save();
            }
        }

        console.log('Testing with user:', userDosen.username, 'ID:', userDosen.id);
        const userId = userDosen.id;

        // --- Replicating getBimbingan logic ---
        const userFull = await db.User.findByPk(userId, { include: ['dosen', 'instansi'] });

        let whereClause = {};
        if (!userFull.dosen) throw new Error('Dosen profile not found');
        whereClause.dosenPembimbingId = userFull.dosen.id;

        console.log('Where clause:', whereClause);

        const pendaftarans = await db.Pendaftaran.findAll({
            where: whereClause,
            include: ['mahasiswa', 'instansi']
        });

        console.log('Pendaftarans found:', pendaftarans.length);

        const data = await Promise.all(pendaftarans.map(async (p) => {
            const pId = p.id;
            console.log('Processing Pendaftaran ID:', pId);

            // 1. Logbook Count
            try {
                const logbookCount = await db.LaporanHarian.count({ where: { pendaftaranId: pId } });
                console.log('Logbook count:', logbookCount);
            } catch (e) { console.error('Error logging logbook:', e); }

            // 1.5 Mingguan Count
            try {
                // HERE IS THE SUSPECT. Check actual table name vs model definition
                const mingguanCount = await db.LaporanMingguan.count({ where: { pendaftaranId: pId } });
                console.log('Mingguan count:', mingguanCount);
            } catch (e) {
                console.error('Error logging mingguan:', e.message);
                console.error(e);
            }

            // 2. Laporan Tengah Exists
            try {
                const lapTengah = await db.LaporanTengah.findOne({ where: { pendaftaranId: pId } });
                console.log('LapTengah:', !!lapTengah);
            } catch (e) { console.error('Error logging lapTengah:', e.message); }

            // 3. Laporan Akhir Exists
            try {
                const lapAkhir = await db.LaporanAkhir.findOne({ where: { pendaftaranId: pId } });
                console.log('LapAkhir:', !!lapAkhir);
            } catch (e) { console.error('Error logging lapAkhir:', e.message); }

            // 4. Grading
            try {
                const relevantGrades = await db.KomponenNilai.findAll({
                    where: { pendaftaranId: pId },
                    include: [{ model: db.KriteriaNilai, as: 'kriteria' }]
                });
                console.log('Grades found:', relevantGrades.length);
            } catch (e) {
                console.error('Error logging grades:', e.message);
                // console.error(e);
            }

            return { id: p.id };
        }));

        console.log('Success!');
    } catch (err) {
        console.error('CRASH:', err);
    } finally {
        // Cleanup? Maybe keep for debugging.
        await db.sequelize.close();
    }
}

testGetBimbingan();
