const db = require('../models');
const Panduan = db.Panduan;
const googleDriveService = require('../services/googleDriveService');

exports.findAll = async (req, res) => {
    try {
        const data = await Panduan.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.findPublic = async (req, res) => {
    try {
        const data = await Panduan.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']]
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { judul, deskripsi, kategori, isActive } = req.body;
        let fileUrl = null;

        if (req.file) {
            const uploadResult = await googleDriveService.uploadFile(req.file);
            fileUrl = uploadResult.webViewLink;
        }

        const panduan = await Panduan.create({
            judul,
            deskripsi,
            kategori,
            fileUrl,
            isActive: isActive === 'false' ? false : true
        });

        res.status(201).send(panduan);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { judul, deskripsi, kategori, isActive, existingFileUrl } = req.body;
        const panduan = await Panduan.findByPk(id);

        if (!panduan) return res.status(404).send({ message: "Panduan not found" });

        let fileUrl = existingFileUrl || panduan.fileUrl;

        if (req.file) {
            const uploadResult = await googleDriveService.uploadFile(req.file);
            fileUrl = uploadResult.webViewLink;
        }

        await Panduan.update({
            judul: judul || panduan.judul,
            deskripsi: deskripsi || panduan.deskripsi,
            kategori: kategori || panduan.kategori,
            fileUrl: fileUrl,
            isActive: isActive !== undefined ? (isActive === 'false' ? false : true) : panduan.isActive
        }, { where: { id } });

        res.send({ message: "Panduan updated successfully" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await Panduan.destroy({ where: { id } });
        res.send({ message: "Panduan deleted successfully" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
