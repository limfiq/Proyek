const db = require('../models');
const Instansi = db.Instansi;

exports.findAll = async (req, res) => {
    try {
        const data = await Instansi.findAll();
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nama, alamat, kontak, isProposed, posisi, kota, jenisLowongan } = req.body;
        const instansi = await Instansi.create({
            nama, alamat, kontak, isProposed, posisi, kota, jenisLowongan
        });
        res.send(instansi);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.findPublic = async (req, res) => {
    try {
        const data = await Instansi.findAll({
            where: { isActive: true },
            attributes: ['id', 'nama', 'posisi', 'kota', 'jenisLowongan', 'logoUrl']
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.findPublicOne = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Instansi.findOne({
            where: { id: id, isActive: true },
            attributes: ['id', 'nama', 'alamat', 'kontak', 'posisi', 'kota', 'jenisLowongan', 'logoUrl', 'updatedAt']
        });
        if (!data) {
            return res.status(404).send({ message: "Lowongan detail not found" });
        }
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        await Instansi.update(req.body, { where: { id: id } });
        res.send({ message: "Instansi was updated successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await Instansi.destroy({ where: { id: id } });
        res.send({ message: "Instansi was deleted successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
