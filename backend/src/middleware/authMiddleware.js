const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    console.log('verifyToken middleware called');
    const token = req.headers['authorization'];

    if (!token) {
        console.log('No token provided');
        return res.status(403).send({ message: 'No token provided!' });
    }

    // Bearer <token>
    const splitToken = token.split(' ');
    if (splitToken.length !== 2 || splitToken[0] !== 'Bearer') {
        return res.status(401).send({ message: 'Unauthorized! Format: Bearer <token>' });
    }

    jwt.verify(splitToken[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

const isAdmin = (req, res, next) => {
    // Current ADMIN is equivalent to ADMINPRODI
    if (req.userRole === 'ADMIN' || req.userRole === 'ADMINPRODI' || req.userRole === 'SUPERADMIN') {
        next();
        return;
    }
    res.status(403).send({ message: 'Require Admin Role!' });
};

const isSuperAdmin = (req, res, next) => {
    if (req.userRole === 'SUPERADMIN') {
        next();
        return;
    }
    res.status(403).send({ message: 'Require Super Admin Role!' });
};

const isAdminKemahasiswaan = (req, res, next) => {
    if (req.userRole === 'ADMINKEMAHASISWAAN' || req.userRole === 'SUPERADMIN') {
        next();
        return;
    }
    res.status(403).send({ message: 'Require Admin Kemahasiswaan Role!' });
};

const isContentManager = (req, res, next) => {
    // Allows ADMINPRODI (legacy/admin) and ADMINKEMAHASISWAAN
    if (['ADMIN', 'ADMINPRODI', 'SUPERADMIN', 'ADMINKEMAHASISWAAN'].includes(req.userRole)) {
        next();
        return;
    }
    res.status(403).send({ message: 'Require Content Manager Role!' });
};

module.exports = {
    verifyToken,
    isAdmin,
    isSuperAdmin,
    isAdminKemahasiswaan,
    isContentManager
};
