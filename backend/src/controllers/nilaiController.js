const db = require('../models');
const KriteriaNilai = db.KriteriaNilai;
const KomponenNilai = db.KomponenNilai;
const Pendaftaran = db.Pendaftaran;
const Sidang = db.Sidang;

exports.inputNilai = async (req, res) => {
    try {
        const { pendaftaranId, jenis, nilai } = req.body;
        // Check role permissions based on 'jenis' vs req.userRole (e.g. only DOSEN for PEMBIMBING, INSTANSI for INSTANSI)

        // Upsert logic
        const existing = await KomponenNilai.findOne({ where: { pendaftaranId, jenis } });
        if (existing) {
            existing.nilai = nilai;
            await existing.save();
        } else {
            await KomponenNilai.create({ pendaftaranId, jenis, nilai });
        }

        res.send({ message: 'Nilai saved' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const { pendaftaranId } = req.params;
        const pendaftaran = await Pendaftaran.findByPk(pendaftaranId);
        if (!pendaftaran) return res.status(404).send({ message: 'Not found' });

        const components = await KomponenNilai.findAll({ where: { pendaftaranId } });

        let scores = {
            HARIAN: 0,
            PEMBIMBING: 0,
            PENGUJI: 0,
            INSTANSI: 0
        };

        const detailed = {};

        components.forEach(c => {
            scores[c.jenis] = c.nilai;
            if (c.kriteriaNilaiId) {
                detailed[c.kriteriaNilaiId] = c.nilai;
            } else {
                detailed[c.jenis] = c.nilai;
            }
        });

        let finalScore = 0;
        if (pendaftaran.tipe === 'PKL1') {
            finalScore = (scores.HARIAN * 0.3) + (scores.PEMBIMBING * 0.3) + (scores.PENGUJI * 0.2) + (scores.INSTANSI * 0.2);
        } else if (pendaftaran.tipe === 'MBKM') {
            // MBKM: Logbook 25%, Monev 20%, Pembimbing 20%, Instansi 20%, Penguji 15%
            finalScore = (scores.LOGBOOK * 0.25) + (scores.MONEV * 0.20) + (scores.PEMBIMBING * 0.20) + (scores.INSTANSI * 0.20) + (scores.PENGUJI * 0.15);
        } else {
            // PKL 2
            finalScore = (scores.HARIAN * 0.3) + (scores.PEMBIMBING * 0.3) + (scores.PENGUJI * 0.25) + (scores.INSTANSI * 0.15);
        }

        // Fetch revision if exists in Sidang
        const sidang = await Sidang.findOne({ where: { pendaftaranId } });

        res.send({
            details: scores,
            detailed, // Add detailed structure
            finalScore: finalScore.toFixed(2),
            tipe: pendaftaran.tipe,
            revisi: sidang ? sidang.revisiPenguji : ''
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getRecap = async (req, res) => {
    try {
        const { periodeId } = req.query;
        const whereClause = {};
        if (periodeId) {
            whereClause.periodeId = periodeId;
        }

        const pendaftarans = await Pendaftaran.findAll({
            where: whereClause,
            include: [
                { model: db.Mahasiswa, as: 'mahasiswa' },
                { model: db.Dosen, as: 'pembimbing' },
                { model: db.Instansi, as: 'instansi' }
            ]
        });

        const allNilai = await KomponenNilai.findAll({
            include: [{ model: KriteriaNilai, as: 'kriteria' }]
        });

        const recap = pendaftarans.map(p => {
            const pNilai = allNilai.filter(n => n.pendaftaranId === p.id);

            // Helper to get average score for a role
            const getRoleScore = (role) => {
                // Filter by role (either direct jenis OR via kriteria.role)
                let relevant = pNilai.filter(n => {
                    if (n.kriteria && n.kriteria.role === role) return true;
                    if (!n.kriteria && n.jenis === role) return true; // Legacy or manual
                    return false;
                });

                if (relevant.length === 0) return 0;

                // FIX: If we have specific Kriteria scores, IGNORE the legacy generic score for this role
                const hasKriteria = relevant.some(n => n.kriteria);
                if (hasKriteria) {
                    relevant = relevant.filter(n => n.kriteria);
                }

                let sumProduct = 0;
                let sumWeights = 0;

                relevant.forEach(n => {
                    if (n.kriteria) {
                        sumProduct += n.nilai * n.kriteria.bobot;
                        sumWeights += n.kriteria.bobot;
                    } else {
                        // Legacy: Assume it is the final score if no other parts exist (weight 100 or 1)
                        // If we use 100 here, it aligns with "percentage".
                        sumProduct += n.nilai * 100;
                        sumWeights += 100;
                    }
                });

                if (sumWeights === 0) return 0;

                // Normalize: (Sum(Score * Weight) / Sum(Weights)).
                return parseFloat((sumProduct / sumWeights).toFixed(2));
            };

            const harianScore = pNilai.find(n => n.jenis === 'HARIAN')?.nilai || 0;
            const logbookScore = pNilai.find(n => n.jenis === 'LOGBOOK')?.nilai || 0;
            const monevScore = pNilai.find(n => n.jenis === 'MONEV')?.nilai || 0;

            const scores = {
                HARIAN: harianScore,
                LOGBOOK: logbookScore,
                MONEV: monevScore,
                PEMBIMBING: getRoleScore('PEMBIMBING'),
                PENGUJI: getRoleScore('PENGUJI'),
                INSTANSI: getRoleScore('INSTANSI')
            };

            const status = {
                HARIAN: pNilai.some(n => n.jenis === 'HARIAN'),
                LOGBOOK: pNilai.some(n => n.jenis === 'LOGBOOK'),
                MONEV: pNilai.some(n => n.jenis === 'MONEV'),
                PEMBIMBING: pNilai.some(n => n.kriteria?.role === 'PEMBIMBING' || n.jenis === 'PEMBIMBING'),
                PENGUJI: pNilai.some(n => n.kriteria?.role === 'PENGUJI' || n.jenis === 'PENGUJI'),
                INSTANSI: pNilai.some(n => n.kriteria?.role === 'INSTANSI' || n.jenis === 'INSTANSI')
            };

            // Calc Final
            let finalScore = 0;
            // Formula: Logbook 25%, Monev 20%, Pembimbing 25%
            // PKL 1: Penguji 10%, Instansi 20%
            // PKL 2: Penguji 20%, Instansi 10%

            if (p.tipe === 'PKL1') {
                finalScore = (scores.LOGBOOK * 0.25) + (scores.MONEV * 0.20) + (scores.PEMBIMBING * 0.25) + (scores.PENGUJI * 0.10) + (scores.INSTANSI * 0.20);
            } else if (p.tipe === 'MBKM') {
                // MBKM: Logbook 25%, Monev 20%, Pembimbing 20%, Instansi 20%, Penguji 15%
                finalScore = (scores.LOGBOOK * 0.25) + (scores.MONEV * 0.20) + (scores.PEMBIMBING * 0.20) + (scores.INSTANSI * 0.20) + (scores.PENGUJI * 0.15);
            } else {
                // PKL 2 (Assuming default or explicit PKL2 check)
                finalScore = (scores.LOGBOOK * 0.25) + (scores.MONEV * 0.20) + (scores.PEMBIMBING * 0.25) + (scores.PENGUJI * 0.20) + (scores.INSTANSI * 0.10);
            }

            // Also return detailed criteria scores for the edit form? 
            // The edit form will fetch its own data (or we pass it here).
            // Let's pass `detailedScores` map: { [kriteriaId]: value, ... }
            const detailed = {};
            pNilai.forEach(n => {
                if (n.kriteriaNilaiId) detailed[n.kriteriaNilaiId] = n.nilai;
                else detailed[n.jenis] = n.nilai; // For HARIAN
            });

            return {
                id: p.id,
                mahasiswa: p.mahasiswa ? p.mahasiswa.nama : 'Unknown',
                nim: p.mahasiswa ? p.mahasiswa.nim : '-',
                tipe: p.tipe,
                scores,
                detailed, // New field for frontend edit form
                status,
                finalScore: finalScore.toFixed(2)
            };
        });

        res.send(recap);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};

exports.scheduleSidang = async (req, res) => {
    try {
        const { pendaftaranId, dosenPengujiId, tanggal } = req.body;
        const sidang = await Sidang.create({
            pendaftaranId, dosenPengujiId, tanggal
        });
        res.status(201).send(sidang);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Reusable logic for inputting scores (Admin or Batch)
const processScoreInput = async (pendaftaranId, scores) => {
    const keys = Object.keys(scores);

    for (const key of keys) {
        const val = parseFloat(scores[key]);
        if (isNaN(val)) continue;

        if (key === 'HARIAN' || key === 'LOGBOOK' || key === 'MONEV') {
            const [updatedCount] = await KomponenNilai.update(
                { nilai: val },
                { where: { pendaftaranId, jenis: key } }
            );

            if (updatedCount === 0) {
                await KomponenNilai.create({ pendaftaranId, jenis: key, nilai: val });
            }
        } else {
            // It's a Kriteria ID
            const kriteriaId = parseInt(key);
            if (isNaN(kriteriaId)) continue; // Safety check

            const kriteria = await KriteriaNilai.findByPk(kriteriaId);
            if (kriteria) {
                const [updatedCount] = await KomponenNilai.update(
                    { nilai: val, jenis: kriteria.role }, // Ensure jenis is synced
                    { where: { pendaftaranId, kriteriaNilaiId: kriteriaId } }
                );

                if (updatedCount === 0) {
                    await KomponenNilai.create({
                        pendaftaranId,
                        kriteriaNilaiId: kriteriaId,
                        jenis: kriteria.role,
                        nilai: val
                    });
                }
            }
        }
    }
};

exports.adminInputNilai = async (req, res) => {
    try {
        const { pendaftaranId, scores } = req.body;
        await processScoreInput(pendaftaranId, scores);
        res.send({ message: 'Nilai updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};

exports.batchInputNilai = async (req, res) => {
    try {
        const { pendaftaranId, scores, revisi } = req.body;
        // In future: Check if req.userId is allowed to grade this pendaftaran
        await processScoreInput(pendaftaranId, scores);

        if (revisi !== undefined) {
            // Find Sidang for this pendaftaran
            const sidang = await Sidang.findOne({ where: { pendaftaranId } });
            if (sidang) {
                sidang.revisiPenguji = revisi;
                await sidang.save();
            } else {
                // Optimization: if no sidang exists but we have revisi, maybe create one? 
                // Or just ignore for now as Sidang usually pre-exists for scheduling.
                // Let's create if not exists or just ignore? Best to ignore if not found as it implies not scheduled.
            }
        }

        res.send({ message: 'Nilai batch updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};
