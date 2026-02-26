const db = require('../models');
const LaporanHarian = db.LaporanHarian;
const LaporanTengah = db.LaporanTengah;
const LaporanAkhir = db.LaporanAkhir;
const Pendaftaran = db.Pendaftaran;

const googleDriveService = require('../services/googleDriveService');

// Harian
exports.createHarian = async (req, res) => {
    try {
        const { pendaftaranId, tanggal, kegiatan, lokasi } = req.body;

        const pendaftaran = await Pendaftaran.findByPk(pendaftaranId);
        if (!pendaftaran || pendaftaran.status === 'PENDING') {
            return res.status(403).send({ message: 'Tidak dapat mengisi laporan saat status pendaftaran PENDING.' });
        }

        let fotoUrls = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResult = await googleDriveService.uploadFile(file);
                fotoUrls.push(uploadResult.webViewLink);
            }
        }

        const laporan = await LaporanHarian.create({
            pendaftaranId, tanggal, kegiatan, lokasi, foto: JSON.stringify(fotoUrls), status: 'DRAFT'
        });
        res.status(201).send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.updateHarian = async (req, res) => {
    try {
        const { id } = req.params;
        const { tanggal, kegiatan, lokasi } = req.body;
        const laporan = await LaporanHarian.findByPk(id, {
            include: [{ model: Pendaftaran, as: 'pendaftaran' }]
        });
        if (!laporan) return res.status(404).send({ message: 'Logbook not found' });
        if (laporan.status === 'APPROVED') {
            return res.status(403).send({ message: 'Tidak dapat mengubah laporan yang sudah disetujui.' });
        }

        if (laporan.pendaftaran?.status === 'PENDING') {
            return res.status(403).send({ message: 'Tidak dapat mengubah laporan saat status pendaftaran PENDING.' });
        }

        let fotoUrls = [];
        try {
            if (laporan.foto) {
                const parsed = JSON.parse(laporan.foto);
                fotoUrls = Array.isArray(parsed) ? parsed : [laporan.foto];
            }
        } catch (e) {
            if (laporan.foto) fotoUrls = [laporan.foto];
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResult = await googleDriveService.uploadFile(file);
                fotoUrls.push(uploadResult.webViewLink);
            }
        }

        laporan.tanggal = tanggal || laporan.tanggal;
        laporan.kegiatan = kegiatan || laporan.kegiatan;
        laporan.lokasi = lokasi || laporan.lokasi;
        laporan.foto = JSON.stringify(fotoUrls);

        // If it was rejected, reset to DRAFT after edit
        if (laporan.status === 'REJECTED') {
            laporan.status = 'DRAFT';
        }

        await laporan.save();
        res.send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.listHarian = async (req, res) => {
    try {
        const { pendaftaranId } = req.query;
        const laporan = await LaporanHarian.findAll({
            where: { pendaftaranId },
            order: [['tanggal', 'DESC']]
        });
        res.send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.approveHarian = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, feedback } = req.body; // Accept status
        const laporan = await LaporanHarian.findByPk(id);
        if (!laporan) return res.status(404).send({ message: 'Logbook not found' });

        // Default to APPROVED if not provided for backward compatibility, or use provided status (e.g. REJECTED for Revisi)
        laporan.status = status || 'APPROVED';
        if (feedback) laporan.feedback = feedback;

        await laporan.save();
        res.send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.updateFeedbackHarian = async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback } = req.body;
        const laporan = await LaporanHarian.findByPk(id);
        if (!laporan) return res.status(404).send({ message: 'Logbook not found' });

        laporan.feedback = feedback;
        await laporan.save();
        res.send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Tengah
// Tengah
exports.submitTengah = async (req, res) => {
    try {
        const { pendaftaranId, fileUrl } = req.body;

        const pendaftaran = await Pendaftaran.findByPk(pendaftaranId);
        if (!pendaftaran || pendaftaran.status === 'PENDING') {
            return res.status(403).send({ message: 'Tidak dapat mengisi laporan saat status pendaftaran PENDING.' });
        }

        // Check if exists
        let laporan = await LaporanTengah.findOne({ where: { pendaftaranId } });

        if (laporan) {
            laporan.fileUrl = fileUrl;
            laporan.status = 'SUBMITTED'; // Re-submit resets status if needed, or keeps it. 
            await laporan.save();
        } else {
            laporan = await LaporanTengah.create({
                pendaftaranId, fileUrl, status: 'SUBMITTED'
            });
        }
        res.status(200).send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Akhir
exports.submitAkhir = async (req, res) => {
    try {
        const { pendaftaranId, fileUrl, type_iku, ikuUrl, finalUrl } = req.body;

        const pendaftaran = await Pendaftaran.findByPk(pendaftaranId);
        if (!pendaftaran || pendaftaran.status === 'PENDING') {
            return res.status(403).send({ message: 'Tidak dapat mengisi laporan saat status pendaftaran PENDING.' });
        }

        // Check if exists
        let laporan = await LaporanAkhir.findOne({ where: { pendaftaranId } });

        if (laporan) {
            laporan.fileUrl = fileUrl;
            if (type_iku) laporan.type_iku = type_iku;
            if (ikuUrl) laporan.ikuUrl = ikuUrl;
            if (finalUrl) laporan.finalUrl = finalUrl;
            laporan.status = 'SUBMITTED';
            await laporan.save();
        } else {
            laporan = await LaporanAkhir.create({
                pendaftaranId, fileUrl, type_iku, ikuUrl, finalUrl, status: 'SUBMITTED'
            });
        }
        res.status(200).send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getTengah = async (req, res) => {
    try {
        const { pendaftaranId } = req.query;
        const laporan = await LaporanTengah.findOne({ where: { pendaftaranId } });
        res.send(laporan); // Returns object or null
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getAkhir = async (req, res) => {
    try {
        const { pendaftaranId } = req.query;
        const laporan = await LaporanAkhir.findOne({ where: { pendaftaranId } });
        res.send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Mingguan
const LaporanMingguan = db.LaporanMingguan;

exports.createMingguan = async (req, res) => {
    try {
        const { pendaftaranId, mingguKe, fileUrl } = req.body;

        const pendaftaran = await Pendaftaran.findByPk(pendaftaranId);
        if (!pendaftaran || pendaftaran.status === 'PENDING') {
            return res.status(403).send({ message: 'Tidak dapat mengisi laporan saat status pendaftaran PENDING.' });
        }

        const laporan = await LaporanMingguan.create({
            pendaftaranId, mingguKe, fileUrl, status: 'PENDING'
        });
        res.status(201).send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.listMingguan = async (req, res) => {
    try {
        const { pendaftaranId } = req.query;
        const laporan = await LaporanMingguan.findAll({
            where: { pendaftaranId },
            order: [['mingguKe', 'DESC']]
        });
        res.send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.approveMingguan = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, signedFileUrl, feedback } = req.body; // Accept status and feedback
        const laporan = await LaporanMingguan.findByPk(id);
        if (!laporan) return res.status(404).send({ message: 'Logbook not found' });

        laporan.status = status || 'APPROVED';
        if (signedFileUrl) laporan.signedFileUrl = signedFileUrl;
        if (feedback) laporan.feedback = feedback;

        await laporan.save();
        res.send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
exports.updateMingguan = async (req, res) => {
    try {
        const { id } = req.params;
        const { mingguKe, fileUrl } = req.body;
        const laporan = await LaporanMingguan.findByPk(id, {
            include: [{ model: Pendaftaran, as: 'pendaftaran' }]
        });
        if (!laporan) return res.status(404).send({ message: 'Laporan mingguan not found' });

        if (laporan.pendaftaran?.status === 'PENDING') {
            return res.status(403).send({ message: 'Tidak dapat mengubah laporan saat status pendaftaran PENDING.' });
        }

        laporan.mingguKe = mingguKe || laporan.mingguKe;
        laporan.fileUrl = fileUrl || laporan.fileUrl;

        // If it was rejected, reset to PENDING after edit
        if (laporan.status === 'REJECTED') {
            laporan.status = 'PENDING';
        }

        await laporan.save();
        res.send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
