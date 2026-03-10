const { Op } = require('sequelize');
const db = require('../models');
const Sppd = db.Sppd;
const Pendaftaran = db.Pendaftaran;
const User = db.User;
const googleDriveService = require('../services/googleDriveService');

exports.createSppd = async (req, res) => {
    try {
        const { pendaftaranId, tanggal, lokasi, yangDitemui, koordinat, keterangan } = req.body;
        const userId = req.userId;

        const user = await User.findByPk(userId, { include: ['dosen'] });
        if (!user || user.role !== 'DOSEN' || !user.dosen) {
            return res.status(403).json({ message: 'Only lecturers can create SPPD' });
        }

        let fotoUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResult = await googleDriveService.uploadFile(file);
                fotoUrls.push(uploadResult.webViewLink);
            }
        }

        const sppd = await Sppd.create({
            dosenId: user.dosen.id,
            pendaftaranId: pendaftaranId || null,
            tanggal,
            lokasi,
            yangDitemui,
            koordinat,
            fotoUrl: JSON.stringify(fotoUrls),
            keterangan
        });

        res.status(201).json(sppd);
    } catch (err) {
        console.error('Create SPPD Error:', err);
        res.status(500).json({ message: 'Error creating SPPD', error: err.message });
    }
};

exports.getSppdList = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId, { include: ['dosen'] });
        if (!user || !user.dosen) return res.status(404).json({ message: 'Dosen record not found' });

        const list = await Sppd.findAll({
            where: { dosenId: user.dosen.id },
            include: [
                {
                    model: Pendaftaran,
                    as: 'pendaftaran',
                    include: [
                        { model: db.Mahasiswa, as: 'mahasiswa' },
                        { model: db.Instansi, as: 'instansi' }
                    ]
                }
            ],
            order: [['tanggal', 'DESC']]
        });

        res.json(list);
    } catch (err) {
        console.error('getSppdList Error:', err);
        res.status(500).json({ message: 'Error fetching SPPD list', error: err.message });
    }
};

exports.getBimbinganLocations = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId, { include: ['dosen'] });
        if (!user || !user.dosen) {
            return res.status(404).json({ message: 'Dosen record not found' });
        }

        const activePeriode = await db.Periode.findOne({ where: { isActive: true } });
        if (!activePeriode) {
            return res.json([]);
        }

        const bimbingan = await Pendaftaran.findAll({
            where: {
                dosenPembimbingId: user.dosen.id,
                periodeId: activePeriode.id,
                status: { [Op.in]: ['ACTIVE', 'APPROVED', 'COMPLETED'] }
            },
            include: [
                { model: db.Mahasiswa, as: 'mahasiswa' },
                { model: db.Instansi, as: 'instansi' }
            ]
        });

        res.json(bimbingan);
    } catch (err) {
        console.error('getBimbinganLocations Error:', err);
        res.status(500).json({ message: 'Error fetching bimbingan locations', error: err.message });
    }
};

exports.getAllSppd = async (req, res) => {
    try {
        const { periodeId, dosenId } = req.query;
        let where = {};
        let pendaftaranWhere = {};

        if (dosenId) where.dosenId = dosenId;
        if (periodeId) pendaftaranWhere.periodeId = periodeId;

        const list = await Sppd.findAll({
            where,
            include: [
                {
                    model: db.Dosen,
                    as: 'dosen',
                    include: [{ model: db.User, as: 'user' }]
                },
                {
                    model: Pendaftaran,
                    as: 'pendaftaran',
                    where: Object.keys(pendaftaranWhere).length > 0 ? pendaftaranWhere : null,
                    required: Object.keys(pendaftaranWhere).length > 0,
                    include: [
                        { model: db.Mahasiswa, as: 'mahasiswa' },
                        { model: db.Instansi, as: 'instansi' },
                        { model: db.Periode, as: 'periode' }
                    ]
                }
            ],
            order: [['tanggal', 'DESC']]
        });

        res.json(list);
    } catch (err) {
        console.error('getAllSppd Error:', err);
        res.status(500).json({ message: 'Error fetching all SPPD', error: err.message });
    }
};
