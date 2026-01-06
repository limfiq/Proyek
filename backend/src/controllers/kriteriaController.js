const db = require('../models');
const KriteriaNilai = db.KriteriaNilai;

exports.findAll = async (req, res) => {
    try {
        const { tipe } = req.query;
        let whereClause = {};
        if (tipe) whereClause.tipe = tipe;

        const data = await KriteriaNilai.findAll({
            where: whereClause,
            order: [['tipe', 'ASC'], ['role', 'ASC']]
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nama, bobot, role, tipe } = req.body;
        const data = await KriteriaNilai.create({ nama, bobot, role, tipe });
        res.status(201).send(data);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        await KriteriaNilai.update(req.body, { where: { id } });
        res.send({ message: "Kriteria updated" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await KriteriaNilai.destroy({ where: { id } });
        res.send({ message: "Kriteria deleted" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
