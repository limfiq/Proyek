const db = require('../models');
const Jadwal = db.Jadwal;

exports.findAll = async (req, res) => {
    try {
        const jadwal = await Jadwal.findAll({
            order: [['tanggal', 'ASC']]
        });
        res.send(jadwal);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { namaKegiatan, tanggal, kategori } = req.body;
        const jadwal = await Jadwal.create({
            namaKegiatan,
            tanggal,
            kategori
        });
        res.status(201).send(jadwal);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { namaKegiatan, tanggal, kategori } = req.body;
        const jadwal = await Jadwal.findByPk(id);

        if (!jadwal) {
            return res.status(404).send({ message: 'Jadwal not found' });
        }

        jadwal.namaKegiatan = namaKegiatan || jadwal.namaKegiatan;
        jadwal.tanggal = tanggal || jadwal.tanggal;
        jadwal.kategori = kategori || jadwal.kategori;

        await jadwal.save();
        res.send(jadwal);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const jadwal = await Jadwal.findByPk(id);

        if (!jadwal) {
            return res.status(404).send({ message: 'Jadwal not found' });
        }

        await jadwal.destroy();
        res.send({ message: 'Jadwal deleted successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
