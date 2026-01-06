const db = require('../models');
const User = db.User;
const Mahasiswa = db.Mahasiswa;
const Dosen = db.Dosen;
const Instansi = db.Instansi;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerMahasiswa = async (req, res) => {
    try {
        const { username, password, nim, nama, kelas, angkatan } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) return res.status(400).json({ message: 'Username already taken' });

        const hashedPassword = await bcrypt.hash(password, 8);

        const user = await User.create({
            username,
            password: hashedPassword,
            role: 'MAHASISWA'
        });

        await Mahasiswa.create({
            userId: user.id,
            nim,
            nama,
            kelas,
            angkatan
        });

        res.status(201).json({ message: 'Mahasiswa registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid Password!' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });

        // Get detailed profile
        let detail = null;
        if (user.role === 'MAHASISWA') detail = await user.getMahasiswa();
        if (user.role === 'DOSEN') detail = await user.getDosen();
        if (user.role === 'INSTANSI') detail = await user.getInstansi();

        res.status(200).json({
            id: user.id,
            username: user.username,
            role: user.role,
            accessToken: token,
            detail: detail
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.userId; // from verifyToken
        const { oldPassword, newPassword } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).send({ message: 'User not found' });

        const passwordIsValid = await bcrypt.compare(oldPassword, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: 'Password lama salah!' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 8);
        user.password = hashedPassword;
        await user.save();

        res.send({ message: 'Password berhasil diubah!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
