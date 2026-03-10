const express = require('express');
const router = express.Router();
const pklController = require('../controllers/pklController');
const laporanController = require('../controllers/laporanController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Validations can be added here
router.post('/pkl/register', verifyToken, pklController.register);
router.get('/pkl/me', verifyToken, pklController.myPendaftaran);
router.get('/pkl/bimbingan', verifyToken, pklController.getBimbingan);
router.get('/pkl/all', [verifyToken, isAdmin], pklController.getAllPendaftaran);
router.post('/pkl/admin/register', [verifyToken, isAdmin], pklController.createByAdmin);
router.put('/pkl/:id/assign', [verifyToken, isAdmin], pklController.assignDosen);
router.put('/pkl/:id/validate', [verifyToken, isAdmin], pklController.validatePendaftaran);
router.get('/pkl/ujian', [verifyToken], pklController.getUjian);
router.get('/pkl/stats', [verifyToken], pklController.getDashboardStats);

const sidangController = require('../controllers/sidangController');
router.get('/sidang/all', [verifyToken, isAdmin], sidangController.getAllSidang);
router.post('/sidang/schedule', [verifyToken, isAdmin], sidangController.createSchedule);

const path = require('path');
const multer = require('multer');

// Configure Multer
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/laporan/harian', verifyToken, upload.array('foto', 5), laporanController.createHarian);
router.put('/laporan/harian/:id', verifyToken, upload.array('foto', 5), laporanController.updateHarian); // [NEW]
router.get('/laporan/harian', verifyToken, laporanController.listHarian); // ?pendaftaranId=x
router.put('/laporan/harian/:id/approve', verifyToken, laporanController.approveHarian);
router.put('/laporan/harian/:id/feedback', verifyToken, laporanController.updateFeedbackHarian);
router.post('/laporan/tengah', verifyToken, laporanController.submitTengah);
router.get('/laporan/tengah', verifyToken, laporanController.getTengah);
router.put('/laporan/tengah/:id/approve', verifyToken, laporanController.approveTengah);
router.post('/laporan/akhir', verifyToken, laporanController.submitAkhir);
router.get('/laporan/akhir', verifyToken, laporanController.getAkhir);

router.post('/laporan/mingguan', verifyToken, laporanController.createMingguan);
router.get('/laporan/mingguan', verifyToken, laporanController.listMingguan);
router.put('/laporan/mingguan/:id/approve', verifyToken, laporanController.approveMingguan);
router.put('/laporan/mingguan/:id', verifyToken, laporanController.updateMingguan);

const sppdController = require('../controllers/sppdController');
router.post('/sppd', verifyToken, upload.array('foto', 5), sppdController.createSppd);
router.get('/sppd', verifyToken, sppdController.getSppdList);
router.get('/sppd/bimbingan', verifyToken, sppdController.getBimbinganLocations);
router.get('/sppd/admin/all', verifyToken, sppdController.getAllSppd);

module.exports = router;
