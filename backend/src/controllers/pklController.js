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
            include: ['instansi', 'pembimbing', 'periode', 'sidang', 'loker']
        });
        console.log('Pendaftaran found:', JSON.stringify(pendaftaran, null, 2));

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
        console.log('getBimbingan START');
        const userId = req.userId;
        const userRole = req.userRole; // 'DOSEN', 'INSTANSI'
        console.log(`User ID: ${userId}, Role: ${userRole}`);

        const user = await User.findByPk(userId, { include: ['dosen', 'instansi'] });
        console.log('User found:', user ? user.username : 'null');

        if (!user) return res.status(404).json({ message: 'User not found in getBimbingan' });

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
            return res.status(403).json({ message: 'UnauthorizedRole' });
        }
        console.log('Where clause:', whereClause);

        const pendaftarans = await Pendaftaran.findAll({
            where: whereClause,
            include: ['mahasiswa', 'instansi', 'periode'] // [NEW] Include periode for dates
        });
        console.log(`Found ${pendaftarans.length} pendaftarans`);

        // Enhance with stats
        const data = await Promise.all(pendaftarans.map(async (p) => {
            try {
                const pId = p.id;
                // console.log(`Processing pId: ${pId}`);

                // 1. Logbook Count
                const logbookCount = await db.LaporanHarian.count({ where: { pendaftaranId: pId } });

                // [NEW] Calculate Missing Logbooks
                let missingLogbooks = 0;
                if (p.periode && p.periode.tanggalMulai) {
                    const startDate = new Date(p.periode.tanggalMulai);
                    const endDate = p.periode.tanggalSelesai ? new Date(p.periode.tanggalSelesai) : new Date();
                    const now = new Date();

                    // Effective end date is min(now, endDate)
                    const effectiveEnd = now < endDate ? now : endDate;

                    if (startDate <= effectiveEnd) {
                        // Calculate days difference (inclusive of start date? usually logbook is daily)
                        const diffTime = Math.abs(effectiveEnd - startDate);
                        const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day

                        // Exclude weekends? Assuming logbook is 7 days/week for now or let's assume simple days elapsed
                        missingLogbooks = Math.max(0, daysElapsed - logbookCount);
                    }
                }

                // 1.5 Mingguan Count
                const mingguanCount = await db.LaporanMingguan.count({ where: { pendaftaranId: pId } });

                // 2. Laporan Tengah Exists
                let lapTengah = null;
                try {
                    lapTengah = await db.LaporanTengah.findOne({ where: { pendaftaranId: pId } });
                } catch (e) {
                    console.error(`Error finding LaporanTengah for pId ${pId}:`, e.message);
                }

                // 3. Laporan Akhir Exists
                let lapAkhir = null;
                try {
                    lapAkhir = await db.LaporanAkhir.findOne({ where: { pendaftaranId: pId } });
                } catch (e) {
                    console.error(`Error finding LaporanAkhir for pId ${pId}:`, e.message);
                }

                // 4. Grading Status (Has this user graded this student?)
                let alreadyGraded = false;
                try {
                    const relevantGrades = await db.KomponenNilai.findAll({
                        where: { pendaftaranId: pId },
                        include: [{ model: db.KriteriaNilai, as: 'kriteria' }]
                    });

                    alreadyGraded = relevantGrades.some(g => {
                        if (g.jenis === gradingRole) return true;
                        if (g.kriteria && g.kriteria.role === gradingRole) return true;
                        return false;
                    });
                } catch (e) {
                    console.error(`Error checking grades for pId ${pId}:`, e.message);
                }

                return {
                    id: p.id,
                    mahasiswa: p.mahasiswa,
                    instansi: p.instansi,
                    periode: p.periode, // [NEW] Return the whole period object
                    periodeId: p.periodeId, // [NEW] Needed for filtering
                    tipe: p.tipe,
                    judulProject: p.judulProject,
                    stats: {
                        logbookCount,
                        missingLogbooks, // [NEW]
                        mingguanCount,
                        hasLaporanTengah: !!lapTengah,
                        hasLaporanAkhir: !!lapAkhir
                    },
                    alreadyGraded
                };
            } catch (innerErr) {
                console.error(`Error processing pId ${p.id}:`, innerErr);
                return {
                    id: p.id,
                    error: innerErr.message
                };
            }
        }));

        res.send(data);
    } catch (err) {
        console.error("getBimbingan CRITICAL Error:", err);
        res.status(500).send({ message: err.message, stack: err.stack });
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
        console.log('getUjian called for userId:', req.userId);
        const userId = req.userId;
        const user = await User.findByPk(userId, { include: ['dosen'] });

        console.log('User found:', user ? user.username : 'null');

        if (!user || !user.dosen) {
            console.log('User or Dosen profile missing');
            return res.status(403).json({ message: 'Only Dosen' });
        }

        console.log('Dosen ID:', user.dosen.id);

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
        const pendaftaranIds = sidang.map(s => s.pendaftaranId);
        const grades = await db.KomponenNilai.findAll({
            where: {
                pendaftaranId: pendaftaranIds
            },
            include: [{ model: db.KriteriaNilai, as: 'kriteria' }]
        });

        // Map to flat structure for frontend compatibility
        const data = sidang.map(s => {
            const hasGrade = grades.some(g => {
                if (g.pendaftaranId !== s.pendaftaran.id) return false;
                if (g.jenis === 'PENGUJI') return true;
                if (g.kriteria && g.kriteria.role === 'PENGUJI') return true;
                return false;
            });

            return {
                id: s.pendaftaran.id,
                mahasiswa: s.pendaftaran.mahasiswa,
                instansi: s.pendaftaran.instansi,
                periodeId: s.pendaftaran.periodeId, // [NEW] Needed for filtering
                judulProject: s.pendaftaran.judulProject,
                tipe: s.pendaftaran.tipe,
                tanggalSidang: s.tanggal,
                alreadyGraded: hasGrade
            };
        });

        res.send(data);
    } catch (err) {
        console.error('CRASH in getUjian:', err);
        res.status(500).send({ message: err.message });
    }
};

const countWorkDays = (start, end) => {
    let count = 0;
    let cur = new Date(start);
    const stop = new Date(end);
    cur.setHours(0, 0, 0, 0);
    stop.setHours(0, 0, 0, 0);

    while (cur <= stop) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) {
            count++;
        }
        cur.setDate(cur.getDate() + 1);
    }
    return count;
};

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Get Active Period
        const activePeriode = await Periode.findOne({ where: { isActive: true } });

        let stats = {
            periode: activePeriode,
            totalMahasiswa: 0,
            breakdown: { PKL1: 0, PKL2: 0, MBKM: 0, MBKM2: 0 },
            statusStats: [], // Legacy format just in case
            chartData: [], // New format for grouped bar chart
            recent: []
        };

        if (activePeriode) {
            if (req.userRole === 'DOSEN') {
                const user = await User.findByPk(req.userId, { include: ['dosen'] });
                if (user && user.dosen) {
                    const dosenId = user.dosen.id;

                    const pendaftarans = await Pendaftaran.findAll({
                        where: {
                            periodeId: activePeriode.id,
                            dosenPembimbingId: dosenId,
                            status: 'ACTIVE'
                        },
                        include: ['periode', 'mahasiswa', 'instansi']
                    });

                    const bimbinganCount = pendaftarans.length;
                    const bimbinganList = pendaftarans.map(p => ({
                        id: p.id,
                        nama: p.mahasiswa?.nama,
                        nim: p.mahasiswa?.nim,
                        noHp: p.mahasiswa?.noHp,
                        instansi: p.instansi?.nama // Already included in some queries, but pklRes/me usually has it
                    }));

                    // Calculate detailed logbook stats
                    let logbookStats = {
                        daily: { target: 0, filled: 0, pending: 0 },
                        weekly: { target: 0, filled: 0, pending: 0 }
                    };

                    const now = new Date();
                    const activeEnd = activePeriode.tanggalSelesai ? new Date(activePeriode.tanggalSelesai) : now;
                    const effectiveEnd = now < activeEnd ? now : activeEnd;

                    for (const p of pendaftarans) {
                        const pId = p.id;

                        // Daily Stats
                        const filledDaily = await db.LaporanHarian.count({ where: { pendaftaranId: pId } });
                        const pendingDaily = await db.LaporanHarian.count({
                            where: {
                                pendaftaranId: pId,
                                status: 'SUBMITTED' // Assuming SUBMITTED = needs response
                            }
                        });

                        if (p.periode && p.periode.tanggalMulai) {
                            const start = new Date(p.periode.tanggalMulai);
                            if (start <= effectiveEnd) {
                                logbookStats.daily.target += countWorkDays(start, effectiveEnd);
                            }
                        }
                        logbookStats.daily.filled += filledDaily;
                        logbookStats.daily.pending += pendingDaily;

                        // Weekly Stats
                        const filledWeekly = await db.LaporanMingguan.count({ where: { pendaftaranId: pId } });
                        const pendingWeekly = await db.LaporanMingguan.count({
                            where: {
                                pendaftaranId: pId,
                                status: 'PENDING' // Weekly model uses PENDING as default
                            }
                        });

                        if (p.periode && p.periode.tanggalMulai) {
                            const start = new Date(p.periode.tanggalMulai);
                            if (start <= effectiveEnd) {
                                const totalDays = Math.ceil(Math.abs(effectiveEnd - start) / (1000 * 60 * 60 * 24)) + 1;
                                const diffWeeks = Math.ceil(totalDays / 7);
                                logbookStats.weekly.target += diffWeeks;
                            }
                        }
                        logbookStats.weekly.filled += filledWeekly;
                        logbookStats.weekly.pending += pendingWeekly;
                    }

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
                        ujianCount,
                        logbookStats,
                        bimbinganList
                    });
                }
            } else if (req.userRole === 'MAHASISWA') {
                const user = await User.findByPk(req.userId, { include: ['mahasiswa'] });
                if (user && user.mahasiswa) {
                    const pendaftaran = await Pendaftaran.findOne({
                        where: {
                            mahasiswaId: user.mahasiswa.id,
                            periodeId: activePeriode.id,
                            status: 'ACTIVE'
                        },
                        include: ['periode']
                    });

                    if (pendaftaran) {
                        const pId = pendaftaran.id;
                        const logbookStats = {
                            daily: { target: 0, filled: 0, pending: 0 },
                            weekly: { target: 0, filled: 0, pending: 0 }
                        };

                        const now = new Date();
                        const activeEnd = activePeriode.tanggalSelesai ? new Date(activePeriode.tanggalSelesai) : now;
                        const effectiveEnd = now < activeEnd ? now : activeEnd;

                        // Daily
                        logbookStats.daily.filled = await db.LaporanHarian.count({ where: { pendaftaranId: pId } });
                        logbookStats.daily.pending = await db.LaporanHarian.count({
                            where: { pendaftaranId: pId, status: 'SUBMITTED' }
                        });

                        if (pendaftaran.periode && pendaftaran.periode.tanggalMulai) {
                            const start = new Date(pendaftaran.periode.tanggalMulai);
                            if (start <= effectiveEnd) {
                                logbookStats.daily.target = countWorkDays(start, effectiveEnd);
                            }
                        }

                        // Weekly
                        logbookStats.weekly.filled = await db.LaporanMingguan.count({ where: { pendaftaranId: pId } });
                        logbookStats.weekly.pending = await db.LaporanMingguan.count({
                            where: { pendaftaranId: pId, status: 'PENDING' }
                        });

                        if (pendaftaran.periode && pendaftaran.periode.tanggalMulai) {
                            const start = new Date(pendaftaran.periode.tanggalMulai);
                            if (start <= effectiveEnd) {
                                const totalDays = Math.ceil(Math.abs(effectiveEnd - start) / (1000 * 60 * 60 * 24)) + 1;
                                const diffWeeks = Math.ceil(totalDays / 7);
                                logbookStats.weekly.target = diffWeeks;
                            }
                        }

                        return res.json({
                            userRole: 'MAHASISWA',
                            periode: activePeriode,
                            logbookStats
                        });
                    }
                }
            }

            // ADMIN Logic
            const pendaftarans = await Pendaftaran.findAll({
                where: { periodeId: activePeriode.id },
                include: ['mahasiswa', 'instansi']
            });

            stats.totalMahasiswa = pendaftarans.length;

            const statuses = ['PENDING', 'APPROVED', 'ACTIVE', 'REJECTED', 'COMPLETED'];
            const chartMap = statuses.reduce((acc, status) => {
                acc[status] = { name: status, PKL1: 0, PKL2: 0, MBKM: 0, MBKM2: 0 };
                return acc;
            }, {});

            pendaftarans.forEach(p => {
                if (p.tipe === 'PKL1') stats.breakdown.PKL1++;
                else if (p.tipe === 'PKL2') stats.breakdown.PKL2++;
                else if (p.tipe === 'MBKM') stats.breakdown.MBKM++;
                else if (p.tipe === 'MBKM2') stats.breakdown.MBKM2++;

                if (chartMap[p.status]) {
                    if (p.tipe === 'PKL1') chartMap[p.status].PKL1++;
                    else if (p.tipe === 'PKL2') chartMap[p.status].PKL2++;
                    else if (p.tipe === 'MBKM') chartMap[p.status].MBKM++;
                    else if (p.tipe === 'MBKM2') chartMap[p.status].MBKM2++;
                }
            });

            stats.chartData = Object.values(chartMap);

            stats.statusStats = stats.chartData.map(item => ({
                name: item.name,
                value: item.PKL1 + item.PKL2 + item.MBKM + item.MBKM2
            }));

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
