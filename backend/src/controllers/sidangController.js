const db = require('../models');
const Sidang = db.Sidang;
const Pendaftaran = db.Pendaftaran;
const Dosen = db.Dosen;
const Mahasiswa = db.Mahasiswa;

exports.getAllSidang = async (req, res) => {
    try {
        const sidangs = await Sidang.findAll({
            include: [
                {
                    model: Pendaftaran,
                    as: 'pendaftaran',
                    include: ['mahasiswa']
                },
                {
                    model: Dosen,
                    as: 'penguji'
                }
            ]
        });
        res.send(sidangs);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.createSchedule = async (req, res) => {
    try {
        const { pendaftaranId, dosenPengujiId, tanggal } = req.body;

        // Check availability, etc. omitted for brevity

        // Check if exists
        const existing = await Sidang.findOne({ where: { pendaftaranId } });
        if (existing) {
            await existing.update({ dosenPengujiId, tanggal });
            return res.send({ message: 'Jadwal sidang updated' });
        }

        await Sidang.create({
            pendaftaranId,
            dosenPengujiId,
            tanggal
        });

        res.status(201).send({ message: 'Jadwal sidang created' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
