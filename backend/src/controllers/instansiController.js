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
        // Determine if it's a proposal (student) or admin entry
        const { nama, alamat, kontak, isProposed } = req.body;
        // req.userId comes from auth middleware if we link it

        // Logic: if created by student, isProposed=true (default in FE/BE logic)
        // Here just basic create
        const instansi = await Instansi.create({
            nama, alamat, kontak, isProposed
        });
        res.send(instansi);
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
