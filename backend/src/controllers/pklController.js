const db = require('../models');
const Pendaftaran = db.Pendaftaran;
const Periode = db.Periode;
const User = db.User;
const Mahasiswa = db.Mahasiswa;

exports.register = async (req, res) => {
    try {
        const userId = req.userId;
        const { instansiId, tipe, judulProject } = req.body; // instansiId can be new if proposed?

        // Find Mahasiswa ID
        const user = await User.findByPk(userId, { include: ['mahasiswa'] });
        if (!user || user.role !== 'MAHASISWA') {
            return res.status(403).json({ message: 'Only Mahasiswa can register' });
        }
        const mahasiswaId = user.mahasiswa.id;

        // Check Active Period
        const activePeriode = await Periode.findOne({ where: { isActive: true } });
        if (!activePeriode) {
            return res.status(400).json({ message: 'No active period found!' });
        }

        // Check existing registration
        const existing = await Pendaftaran.findOne({
            where: {
                mahasiswaId,
                periodeId: activePeriode.id
            }
        });
        if (existing) {
            return res.status(400).json({ message: 'Already registered for this period!' });
        }

        const pendaftaran = await Pendaftaran.create({
            mahasiswaId,
            instansiId, // If proposed, instansiId created separately and passed here
            periodeId: activePeriode.id,
            tipe,
            judulProject, // Only for PKL2
            status: 'PENDING'
        });

        res.status(201).send(pendaftaran);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }

};

exports.createByAdmin = async (req, res) => {
    try {
        const { mahasiswaId, instansiId, dosenPembimbingId, tipe, judulProject } = req.body;

        // Check Active Period
        const activePeriode = await Periode.findOne({ where: { isActive: true } });
        if (!activePeriode) {
            return res.status(400).json({ message: 'No active period found!' });
        }

        // Check existing registration
        const existing = await Pendaftaran.findOne({
            where: {
                mahasiswaId,
                periodeId: activePeriode.id
            }
        });
        if (existing) {
            return res.status(400).json({ message: 'Mahasiswa already registered for this period!' });
        }

        // Sanitize dosenPembimbingId (handle "0" or empty string)
        let finalDosenId = null;
        if (dosenPembimbingId && String(dosenPembimbingId) !== '0') {
            finalDosenId = dosenPembimbingId;
        }

        const pendaftaran = await Pendaftaran.create({
            mahasiswaId,
            instansiId,
            dosenPembimbingId: finalDosenId,
            periodeId: activePeriode.id,
            tipe,
            judulProject,
            status: finalDosenId ? 'ACTIVE' : 'APPROVED' // Auto-approve if created by admin, Active if dosen assigned
        });

        res.status(201).send(pendaftaran);
    } catch (err) {
        console.error('Error in createByAdmin:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.myPendaftaran = async (req, res) => {
    try {
        const userId = req.userId;
        console.log('myPendaftaran called for userId:', userId);

        const user = await User.findByPk(userId, { include: ['mahasiswa'] });
        console.log('User found:', user ? user.username : 'null');

        if (!user || !user.mahasiswa) {
            console.log('No mahasiswa profile found');
            return res.status(200).send([]);
        }

        console.log('Fetching pendaftaran for mhsId:', user.mahasiswa.id);
        const pendaftaran = await Pendaftaran.findAll({
            where: { mahasiswaId: user.mahasiswa.id },
            include: ['instansi', 'pembimbing', 'periode']
        });
        console.log('Pendaftaran found:', pendaftaran.length);

        res.send(pendaftaran);
    } catch (err) {
        console.error('CRASH in myPendaftaran:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.assignDosen = async (req, res) => {
    try {
        const { id } = req.params;
        const { dosenPembimbingId } = req.body;

        await Pendaftaran.update({ dosenPembimbingId, status: 'APPROVED', status: 'ACTIVE' }, { where: { id } });
        // Note: Logic simplified. 
        res.send({ message: 'Dosen assigned and PKL activated' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getBimbingan = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole; // 'DOSEN', 'INSTANSI'
        const user = await User.findByPk(userId, { include: ['dosen', 'instansi'] });

        let whereClause = {};
        // Define variable to hold the specific ROLE string for KomponenNilai check
        let gradingRole = '';

        if (userRole === 'DOSEN') {
            if (!user.dosen) return res.status(403).json({ message: 'Dosen profile not found' });
            whereClause.dosenPembimbingId = user.dosen.id;
            gradingRole = 'PEMBIMBING';
        } else if (userRole === 'INSTANSI') {
            if (!user.instansi) return res.status(403).json({ message: 'Instansi profile not found' });
            whereClause.instansiId = user.instansi.id;
            gradingRole = 'INSTANSI';
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const pendaftarans = await Pendaftaran.findAll({
            where: whereClause,
            include: ['mahasiswa', 'instansi'] // Removed 'dosen' if not needed or add back if needed
        });

        // Enhance with stats
        const data = await Promise.all(pendaftarans.map(async (p) => {
            const pId = p.id;

            // 1. Logbook Count
            const logbookCount = await db.LaporanHarian.count({ where: { pendaftaranId: pId } });

            // 1.5 Mingguan Count
            const mingguanCount = await db.LaporanMingguan.count({ where: { pendaftaranId: pId } });

            // 2. Laporan Tengah Exists
            const lapTengah = await db.LaporanTengah.findOne({ where: { pendaftaranId: pId } });

            // 3. Laporan Akhir Exists
            const lapAkhir = await db.LaporanAkhir.findOne({ where: { pendaftaranId: pId } });

            // 4. Grading Status (Has this user graded this student?)
            // Check based on 'gradingRole'
            // We check if there is ANY KomponenNilai for this Pendaftaran that is either:
            // - Created with jenis = gradingRole (Legacy/Direct)
            // - Created with kriteria.role = gradingRole

            const relevantGrades = await db.KomponenNilai.findAll({
                where: { pendaftaranId: pId },
                include: [{ model: db.KriteriaNilai, as: 'kriteria' }]
            });

            const alreadyGraded = relevantGrades.some(g => {
                if (g.jenis === gradingRole) return true;
                if (g.kriteria && g.kriteria.role === gradingRole) return true;
                return false;
            });

            return {
                id: p.id,
                mahasiswa: p.mahasiswa,
                instansi: p.instansi,
                tipe: p.tipe,
                judulProject: p.judulProject,
                stats: {
                    logbookCount,
                    mingguanCount,
                    hasLaporanTengah: !!lapTengah,
                    hasLaporanAkhir: !!lapAkhir
                },
                alreadyGraded
            };
        }));

        res.send(data);
    } catch (err) {
        console.error("getBimbingan Error:", err);
        res.status(500).send({ message: err.message });
    }
};

exports.getAllPendaftaran = async (req, res) => {
    try {
        const pendaftaran = await Pendaftaran.findAll({
            include: ['mahasiswa', 'instansi', 'pembimbing', 'periode']
        });
        res.send(pendaftaran);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.validatePendaftaran = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, dosenPembimbingId } = req.body;

        const updateData = { status };
        if (dosenPembimbingId) {
            updateData.dosenPembimbingId = dosenPembimbingId;
        }
        if (status === 'APPROVED') {
            updateData.status = 'ACTIVE';
        }

        await Pendaftaran.update(updateData, { where: { id } });
        res.send({ message: 'Pendaftaran updated' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getUjian = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId, { include: ['dosen'] });

        if (!user || !user.dosen) return res.status(403).json({ message: 'Only Dosen' });

        // Find Sidang where dosenPengujiId is user.dosen.id
        const sidang = await db.Sidang.findAll({
            where: { dosenPengujiId: user.dosen.id },
            include: [
                {
                    model: Pendaftaran,
                    as: 'pendaftaran',
                    include: ['mahasiswa', 'instansi']
                }
            ]
        });

        // Check if grades exist for this Dosen (Penguji)
        // We need to fetch KomponenNilai related to these pendaftarans
        const pendaftaranIds = sidang.map(s => s.pendaftaranId);
        const grades = await db.KomponenNilai.findAll({
            where: {
                pendaftaranId: pendaftaranIds
            },
            include: [{ model: db.KriteriaNilai, as: 'kriteria' }]
        });

        // Map to flat structure for frontend compatibility
        const data = sidang.map(s => {
            // Check if ANY grade exists for this pendaftaran that is related to PENGUJI role
            // Since this is the Examiner's view, we check for PENGUJI grades.
            const hasGrade = grades.some(g => {
                if (g.pendaftaranId !== s.pendaftaran.id) return false;
                // Check if grade is PENGUJI
                if (g.jenis === 'PENGUJI') return true;
                if (g.kriteria && g.kriteria.role === 'PENGUJI') return true;
                return false;
            });

            return {
                id: s.pendaftaran.id,
                mahasiswa: s.pendaftaran.mahasiswa,
                instansi: s.pendaftaran.instansi,
                judulProject: s.pendaftaran.judulProject,
                tipe: s.pendaftaran.tipe,
                tanggalSidang: s.tanggal,
                alreadyGraded: hasGrade
            };
        });

        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Get Active Period
        const activePeriode = await Periode.findOne({ where: { isActive: true } });

        let stats = {
            periode: activePeriode,
            totalMahasiswa: 0,
            breakdown: { PKL1: 0, PKL2: 0, MBKM: 0 },
            statusStats: [], // Legacy format just in case
            chartData: [], // New format for grouped bar chart
            recent: []
        };

        if (activePeriode) {
            if (req.userRole === 'DOSEN') {
                const user = await User.findByPk(req.userId, { include: ['dosen'] });
                if (user && user.dosen) {
                    const dosenId = user.dosen.id;

                    // Count Bimbingan
                    const bimbinganCount = await Pendaftaran.count({
                        where: {
                            periodeId: activePeriode.id,
                            dosenPembimbingId: dosenId,
                            status: 'ACTIVE' // Only active students? Or all assigned? Let's count all assigned for now or status not REJECTED
                        }
                    });

                    // Count Ujian (Sidang)
                    const ujianCount = await db.Sidang.count({
                        where: { dosenPengujiId: dosenId },
                        include: [{
                            model: Pendaftaran,
                            as: 'pendaftaran',
                            where: { periodeId: activePeriode.id }
                        }]
                    });

                    return res.json({
                        userRole: 'DOSEN',
                        periode: activePeriode,
                        bimbinganCount,
                        ujianCount
                    });
                }
            }

            // ADMIN Logic (Rest of the code)
            // 2. Count Pendaftaran for this period
            const pendaftarans = await Pendaftaran.findAll({
                where: { periodeId: activePeriode.id },
                include: ['mahasiswa', 'instansi']
            });

            stats.totalMahasiswa = pendaftarans.length;

            // Initialize chart data structure
            const statuses = ['PENDING', 'APPROVED', 'ACTIVE', 'REJECTED', 'COMPLETED'];
            const chartMap = statuses.reduce((acc, status) => {
                acc[status] = { name: status, PKL1: 0, PKL2: 0, MBKM: 0 };
                return acc;
            }, {});

            // Iterate pendaftarans
            pendaftarans.forEach(p => {
                // Breakdown Count
                if (p.tipe === 'PKL1') stats.breakdown.PKL1++;
                else if (p.tipe === 'PKL2') stats.breakdown.PKL2++;
                else if (p.tipe === 'MBKM') stats.breakdown.MBKM++;

                // Chart Data Populate
                if (chartMap[p.status]) {
                    if (p.tipe === 'PKL1') chartMap[p.status].PKL1++;
                    else if (p.tipe === 'PKL2') chartMap[p.status].PKL2++;
                    else if (p.tipe === 'MBKM') chartMap[p.status].MBKM++;
                }
            });

            stats.chartData = Object.values(chartMap);

            // Legacy statusStats (Aggregate)
            stats.statusStats = stats.chartData.map(item => ({
                name: item.name,
                value: item.PKL1 + item.PKL2 + item.MBKM
            }));

            // 5. Recent registrations (last 5)
            stats.recent = pendaftarans.slice(0, 5).map(p => ({
                id: p.id,
                nama: p.mahasiswa?.nama,
                instansi: p.instansi?.nama,
                status: p.status
            }));
        }

        res.json(stats);
    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).send({ message: err.message });
    }
};
