const db = require('../models');
const LaporanHarian = db.LaporanHarian;
const LaporanTengah = db.LaporanTengah;
const LaporanAkhir = db.LaporanAkhir;
const Pendaftaran = db.Pendaftaran;

// Harian
exports.createHarian = async (req, res) => {
    try {
        const { pendaftaranId, tanggal, kegiatan } = req.body;
        // Check ownership logic here ideal
        const laporan = await LaporanHarian.create({
            pendaftaranId, tanggal, kegiatan, status: 'DRAFT'
        });
        res.status(201).send(laporan);
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
        const { feedback } = req.body;
        const laporan = await LaporanHarian.findByPk(id);
        if (!laporan) return res.status(404).send({ message: 'Logbook not found' });

        laporan.status = 'APPROVED';
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
exports.submitTengah = async (req, res) => {
    try {
        const { pendaftaranId, fileUrl } = req.body;
        const laporan = await LaporanTengah.create({
            pendaftaranId, fileUrl, status: 'SUBMITTED'
        });
        res.status(201).send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Akhir
exports.submitAkhir = async (req, res) => {
    try {
        const { pendaftaranId, fileUrl } = req.body;
        const laporan = await LaporanAkhir.create({
            pendaftaranId, fileUrl, status: 'SUBMITTED'
        });
        res.status(201).send(laporan);
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
            order: [['mingguKe', 'ASC']]
        });
        res.send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.approveMingguan = async (req, res) => {
    try {
        const { id } = req.params;
        const { signedFileUrl } = req.body;
        const laporan = await LaporanMingguan.findByPk(id);
        if (!laporan) return res.status(404).send({ message: 'Logbook not found' });

        laporan.status = 'APPROVED';
        if (signedFileUrl) laporan.signedFileUrl = signedFileUrl;

        await laporan.save();
        res.send(laporan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
