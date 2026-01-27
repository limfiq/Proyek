const db = require('../models');
const Lomba = db.Lomba;
const Kegiatan = db.Kegiatan;

// --- Lomba Controller ---

exports.getAllLomba = async (req, res) => {
    try {
        const data = await Lomba.findAll({ order: [['createdAt', 'DESC']] });
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.createLomba = async (req, res) => {
    try {
        const { judul, deskripsi, penyelenggara, tanggalMulai, tanggalSelesai, linkPendaftaran, posterUrl, status } = req.body;
        const lomba = await Lomba.create({
            judul, deskripsi, penyelenggara, tanggalMulai, tanggalSelesai, linkPendaftaran, posterUrl, status
        });
        res.send(lomba);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.updateLomba = async (req, res) => {
    try {
        const id = req.params.id;
        await Lomba.update(req.body, { where: { id: id } });
        res.send({ message: "Lomba updated successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.deleteLomba = async (req, res) => {
    try {
        const id = req.params.id;
        await Lomba.destroy({ where: { id: id } });
        res.send({ message: "Lomba deleted successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// --- Kegiatan Controller ---

exports.getAllKegiatan = async (req, res) => {
    try {
        const data = await Kegiatan.findAll({ order: [['createdAt', 'DESC']] });
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.createKegiatan = async (req, res) => {
    try {
        const { judul, deskripsi, lokasi, tanggal, posterUrl, status } = req.body;
        const kegiatan = await Kegiatan.create({
            judul, deskripsi, lokasi, tanggal, posterUrl, status
        });
        res.send(kegiatan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.updateKegiatan = async (req, res) => {
    try {
        const id = req.params.id;
        await Kegiatan.update(req.body, { where: { id: id } });
        res.send({ message: "Kegiatan updated successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.deleteKegiatan = async (req, res) => {
    try {
        const id = req.params.id;
        await Kegiatan.destroy({ where: { id: id } });
        res.send({ message: "Kegiatan deleted successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
