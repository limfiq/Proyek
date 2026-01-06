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

router.post('/laporan/harian', verifyToken, laporanController.createHarian);
router.get('/laporan/harian', verifyToken, laporanController.listHarian); // ?pendaftaranId=x
router.put('/laporan/harian/:id/approve', verifyToken, laporanController.approveHarian);
router.put('/laporan/harian/:id/feedback', verifyToken, laporanController.updateFeedbackHarian);
router.post('/laporan/tengah', verifyToken, laporanController.submitTengah);
router.get('/laporan/tengah', verifyToken, laporanController.getTengah);
router.post('/laporan/akhir', verifyToken, laporanController.submitAkhir);
router.get('/laporan/akhir', verifyToken, laporanController.getAkhir);

router.post('/laporan/mingguan', verifyToken, laporanController.createMingguan);
router.get('/laporan/mingguan', verifyToken, laporanController.listMingguan);
router.put('/laporan/mingguan/:id/approve', verifyToken, laporanController.approveMingguan);

module.exports = router;
