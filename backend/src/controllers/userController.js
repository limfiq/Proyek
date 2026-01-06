const db = require('../models');
const User = db.User;
const Mahasiswa = db.Mahasiswa;
const Dosen = db.Dosen;
const Instansi = db.Instansi;
const bcrypt = require('bcrypt');

exports.findAll = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'role', 'createdAt'],
            include: [
                { model: Mahasiswa, as: 'mahasiswa', attributes: ['id', 'nama', 'nim'] },
                { model: Dosen, as: 'dosen', attributes: ['id', 'nama', 'nidn'] },
                { model: Instansi, as: 'instansi', attributes: ['id', 'nama'] }
            ]
        });
        res.send(users);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { username, password, role, profileData } = req.body;

        const existing = await User.findOne({ where: { username } });
        if (existing) return res.status(400).send({ message: 'Username exists' });

        const hashedPassword = await bcrypt.hash(password, 8);

        const user = await User.create({
            username,
            password: hashedPassword,
            role
        });

        // Create Profile based on Role
        if (role === 'MAHASISWA' && profileData) {
            await Mahasiswa.create({ userId: user.id, ...profileData });
        } else if (role === 'DOSEN' && profileData) {
            await Dosen.create({ userId: user.id, ...profileData });
        } else if (role === 'INSTANSI' && profileData) {
            await Instansi.create({ userId: user.id, ...profileData });
        }

        res.status(201).send({ message: 'User created', user });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            include: ['mahasiswa', 'dosen', 'instansi']
        });

        if (!user) return res.status(404).send({ message: 'User not found' });

        // Manual Cascade Delete
        if (user.role === 'MAHASISWA' && user.mahasiswa) {
            // Delete Pendaftaran first
            await db.Pendaftaran.destroy({ where: { mahasiswaId: user.mahasiswa.id } });
            await user.mahasiswa.destroy();
        } else if (user.role === 'DOSEN' && user.dosen) {
            // Set Pembimbing to null in Pendaftaran
            await db.Pendaftaran.update({ dosenPembimbingId: null }, { where: { dosenPembimbingId: user.dosen.id } });
            // Check Sidang if needed, but for now proceed
            await user.dosen.destroy();
        } else if (user.role === 'INSTANSI' && user.instansi) {
            // Set Instansi to null in Pendaftaran
            await db.Pendaftaran.update({ instansiId: null }, { where: { instansiId: user.instansi.id } });
            await user.instansi.destroy();
        }

        await user.destroy();
        res.send({ message: 'User deleted' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send({ message: err.message });
    }
};
