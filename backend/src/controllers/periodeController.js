const db = require('../models');
const Periode = db.Periode;

exports.findAll = async (req, res) => {
    try {
        const data = await Periode.findAll();
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nama, tanggalMulai, tanggalSelesai, isActive } = req.body;
        const periode = await Periode.create({ nama, tanggalMulai, tanggalSelesai, isActive });
        res.send(periode);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { nama, tanggalMulai, tanggalSelesai, isActive } = req.body;
        await Periode.update({ nama, tanggalMulai, tanggalSelesai, isActive }, { where: { id: id } });
        res.send({ message: "Periode was updated successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await Periode.destroy({ where: { id: id } });
        res.send({ message: "Periode was deleted successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
