const db = require('../models');
const Loker = db.Loker;
const Instansi = db.Instansi;

exports.findAll = async (req, res) => {
    try {
        let options = {
            include: [{
                model: Instansi,
                as: 'instansi',
                attributes: ['id', 'nama', 'alamat', 'logoUrl']
            }],
            order: [['createdAt', 'DESC']]
        };

        // If requester is INSTANSI, only show their own lokers
        if (req.userRole === 'INSTANSI') {
            const userInstansi = await Instansi.findOne({ where: { userId: req.userId } });
            if (!userInstansi) return res.send([]); // Or error
            options.where = { instansiId: userInstansi.id };
        }

        const data = await Loker.findAll(options);
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { instansiId, posisi, jenisLowongan, kota, deskripsi, kuota, status } = req.body;

        if (req.userRole === 'INSTANSI') {
            const userInstansi = await Instansi.findOne({ where: { userId: req.userId } });
            if (!userInstansi) return res.status(404).send({ message: "Profile Instansi not found" });

            // Override instansiId from body, ensure they create for themselves
            const loker = await Loker.create({
                instansiId: userInstansi.id, posisi, jenisLowongan, kota, deskripsi, kuota, status
            });
            return res.send(loker);
        }

        // Ensure Instansi exists (for Admins)
        const instansi = await Instansi.findByPk(instansiId);
        if (!instansi) return res.status(404).send({ message: "Instansi not found" });

        const loker = await Loker.create({
            instansiId, posisi, jenisLowongan, kota, deskripsi, kuota, status
        });
        res.send(loker);
    } catch (err) {
        console.error("Create Loker Error:", err);
        res.status(500).send({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const whereClause = { id: id };

        if (req.userRole === 'INSTANSI') {
            const userInstansi = await Instansi.findOne({ where: { userId: req.userId } });
            if (!userInstansi) return res.status(403).send({ message: "Forbidden" });
            whereClause.instansiId = userInstansi.id;
        }

        const [updated] = await Loker.update(req.body, { where: whereClause });
        if (!updated) return res.status(404).send({ message: "Loker not found or unauthorized" });

        res.send({ message: "Loker updated successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const whereClause = { id: id };

        if (req.userRole === 'INSTANSI') {
            const userInstansi = await Instansi.findOne({ where: { userId: req.userId } });
            if (!userInstansi) return res.status(403).send({ message: "Forbidden" });
            whereClause.instansiId = userInstansi.id;
        }

        const deleted = await Loker.destroy({ where: whereClause });
        if (!deleted) return res.status(404).send({ message: "Loker not found or unauthorized" });

        res.send({ message: "Loker deleted successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.apply = async (req, res) => {
    try {
        // 1. Get Mahasiswa ID
        const db = require('../models');
        const Mahasiswa = db.Mahasiswa;
        const Pendaftaran = db.Pendaftaran;

        const mahasiswa = await Mahasiswa.findOne({ where: { userId: req.userId } });
        if (!mahasiswa) return res.status(404).send({ message: "Mahasiswa profile not found" });

        // 2. Check if already has active/pending application
        const activePendaftaran = await Pendaftaran.findOne({
            where: {
                mahasiswaId: mahasiswa.id,
                status: ['PENDING', 'APPROVED', 'ACTIVE']
            }
        });

        if (activePendaftaran) {
            return res.status(400).send({ message: "Anda sudah memiliki pendaftaran aktif atau pending." });
        }

        // 3. Get Loker Details
        const lokerId = req.body.lokerId;
        const loker = await Loker.findByPk(lokerId);
        if (!loker) return res.status(404).send({ message: "Loker not found" });

        // 4. Create Pendaftaran
        // Note: Defaulting to 'PKL1' or 'MBKM' based on Loker type, or user input needed?
        // For now, mapping Loker type to Pendaftaran tipe loosely
        let tipe = 'PKL1';
        if (loker.jenisLowongan === 'MBKM') tipe = 'MBKM';

        await Pendaftaran.create({
            mahasiswaId: mahasiswa.id,
            instansiId: loker.instansiId,
            lokerId: loker.id,
            tipe: tipe,
            status: 'PENDING',
            judulProject: loker.posisi // Temporary use of title to store position applied
        });

        res.send({ message: "Berhasil mendaftar lowongan ini." });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getApplicants = async (req, res) => {
    try {
        const id = req.params.id;

        // Security check for INSTANSI: ensure they own the loker
        if (req.userRole === 'INSTANSI') {
            const loker = await Loker.findByPk(id, { include: ['instansi'] });
            if (!loker || !loker.instansi || loker.instansi.userId !== req.userId) {
                return res.status(403).send({ message: "Unauthorized access to this Loker" });
            }
        }

        const applicants = await db.Pendaftaran.findAll({
            where: { lokerId: id },
            include: [
                {
                    model: db.Mahasiswa,
                    as: 'mahasiswa',
                    attributes: ['id', 'nama', 'nim', 'prodiId']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.send(applicants);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const id = req.params.id; // pendaftaranId
        const { status } = req.body; // 'APPROVED' | 'REJECTED'

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).send({ message: "Invalid status. Use APPROVED or REJECTED." });
        }

        const db = require('../models');
        const Pendaftaran = db.Pendaftaran;

        const pendaftaran = await Pendaftaran.findByPk(id, { include: ['loker'] });
        if (!pendaftaran) return res.status(404).send({ message: "Application not found" });

        // Security Check
        // If INSTANSI, ensure they own the Loker associated with this application
        if (req.userRole === 'INSTANSI') {
            const loker = await db.Loker.findByPk(pendaftaran.lokerId, { include: ['instansi'] });
            if (!loker || !loker.instansi || loker.instansi.userId !== req.userId) {
                return res.status(403).send({ message: "Unauthorized to manage this application" });
            }
        }

        // Logic notes: 
        // If APPROVED, we might want to check if the student already has another active PKL?
        // But for "Loker" usually there is a selection process.
        // If 'APPROVED', we can set it to APPROVED. System auto-sets to ACTIVE when Dosen is assigned?
        // Or if this is purely for the Loker selection, APPROVED means "Selected".

        // Let's just update the status for now.
        pendaftaran.status = status;
        await pendaftaran.save();

        res.send({ message: `Application ${status} successfully.` });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
