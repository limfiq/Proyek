const { Prodi } = require('../models');

module.exports = {
    async getAll(req, res) {
        try {
            const prodi = await Prodi.findAll();
            return res.status(200).json(prodi);
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error', error });
        }
    },

    async create(req, res) {
        try {
            const { nama, jenjang } = req.body;
            const newProdi = await Prodi.create({ nama, jenjang });
            return res.status(201).json(newProdi);
        } catch (error) {
            return res.status(500).json({ message: 'Failed to create prodi', error });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const updated = await Prodi.update(req.body, { where: { id } });
            if (updated[0] === 0) return res.status(404).json({ message: 'Prodi not found' });
            return res.status(200).json({ message: 'Prodi updated' });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to update', error });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await Prodi.destroy({ where: { id } });
            if (!deleted) return res.status(404).json({ message: 'Prodi not found' });
            return res.status(200).json({ message: 'Prodi deleted' });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to delete', error });
        }
    }
};
