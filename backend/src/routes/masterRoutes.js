const express = require('express');
const router = express.Router();
const periodeController = require('../controllers/periodeController');
const instansiController = require('../controllers/instansiController');
const userController = require('../controllers/userController');
const kriteriaController = require('../controllers/kriteriaController');
const kemahasiswaanController = require('../controllers/kemahasiswaanController');
const lokerController = require('../controllers/lokerController');
const { verifyToken, isAdmin, isContentManager } = require('../middleware/authMiddleware');

// Periode Routes
router.get('/periode', verifyToken, periodeController.findAll);
router.post('/periode', [verifyToken, isAdmin], periodeController.create);
router.put('/periode/:id', [verifyToken, isAdmin], periodeController.update);
router.delete('/periode/:id', [verifyToken, isAdmin], periodeController.delete);

// Prodi Routes
const prodiController = require('../controllers/prodiController');
router.get('/prodi', verifyToken, prodiController.getAll);
router.post('/prodi', [verifyToken, isAdmin], prodiController.create);
router.put('/prodi/:id', [verifyToken, isAdmin], prodiController.update);
router.delete('/prodi/:id', [verifyToken, isAdmin], prodiController.delete);

// Instansi Routes
router.get('/instansi', verifyToken, instansiController.findAll);
router.post('/instansi', verifyToken, instansiController.create); // Student can propose
router.put('/instansi/:id', [verifyToken, isContentManager], instansiController.update);
router.delete('/instansi/:id', [verifyToken, isContentManager], instansiController.delete);

// User Routes
router.get('/users', [verifyToken, isAdmin], userController.findAll);
router.post('/users', [verifyToken, isAdmin], userController.create);
router.put('/users/:id', [verifyToken, isAdmin], userController.update);
router.delete('/users/:id', [verifyToken, isAdmin], userController.delete);

// Kriteria Routes
router.get('/kriteria', verifyToken, kriteriaController.findAll);
router.post('/kriteria', [verifyToken, isAdmin], kriteriaController.create);
router.put('/kriteria/:id', [verifyToken, isAdmin], kriteriaController.update);
router.delete('/kriteria/:id', [verifyToken, isAdmin], kriteriaController.delete);

// Kemahasiswaan Routes (Lomba & Kegiatan)
router.get('/lomba', verifyToken, kemahasiswaanController.getAllLomba);
router.post('/lomba', [verifyToken, isContentManager], kemahasiswaanController.createLomba);
router.put('/lomba/:id', [verifyToken, isContentManager], kemahasiswaanController.updateLomba);
router.delete('/lomba/:id', [verifyToken, isContentManager], kemahasiswaanController.deleteLomba);

router.get('/kegiatan', verifyToken, kemahasiswaanController.getAllKegiatan);
router.post('/kegiatan', [verifyToken, isContentManager], kemahasiswaanController.createKegiatan);
router.put('/kegiatan/:id', [verifyToken, isContentManager], kemahasiswaanController.updateKegiatan);
router.delete('/kegiatan/:id', [verifyToken, isContentManager], kemahasiswaanController.deleteKegiatan);

// Loker Routes (Dedicated Table)
router.get('/loker', verifyToken, lokerController.findAll);
// Allow INSTANSI to create/manage their own lokers, ContentManager can manage all
const canManageLoker = (req, res, next) => {
    if (['ADMIN', 'SUPERADMIN', 'ADMINPRODI', 'ADMINKEMAHASISWAAN', 'INSTANSI'].includes(req.userRole)) {
        next();
        return;
    }
    res.status(403).send({ message: "Unauthorized to manage Loker" });
};

router.post('/loker', [verifyToken, canManageLoker], lokerController.create);
router.put('/loker/:id', [verifyToken, canManageLoker], lokerController.update);
router.delete('/loker/:id', [verifyToken, canManageLoker], lokerController.delete);
router.post('/loker/apply', verifyToken, lokerController.apply);
router.get('/loker/:id/applicants', [verifyToken, canManageLoker], lokerController.getApplicants);
router.put('/loker/application/:id', [verifyToken, canManageLoker], lokerController.updateApplicationStatus);

module.exports = router;
