const express = require('express');
const router = express.Router();
const periodeController = require('../controllers/periodeController');
const instansiController = require('../controllers/instansiController');
const userController = require('../controllers/userController');
const kriteriaController = require('../controllers/kriteriaController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Periode Routes
router.get('/periode', verifyToken, periodeController.findAll);
router.post('/periode', [verifyToken, isAdmin], periodeController.create);
router.put('/periode/:id', [verifyToken, isAdmin], periodeController.update);
router.delete('/periode/:id', [verifyToken, isAdmin], periodeController.delete);

// Instansi Routes
router.get('/instansi', verifyToken, instansiController.findAll);
router.post('/instansi', verifyToken, instansiController.create); // Student can propose
router.put('/instansi/:id', [verifyToken, isAdmin], instansiController.update);
router.delete('/instansi/:id', [verifyToken, isAdmin], instansiController.delete);

// User Routes
router.get('/users', [verifyToken, isAdmin], userController.findAll);
router.post('/users', [verifyToken, isAdmin], userController.create);
router.delete('/users/:id', [verifyToken, isAdmin], userController.delete);

// Kriteria Routes
router.get('/kriteria', verifyToken, kriteriaController.findAll);
router.post('/kriteria', [verifyToken, isAdmin], kriteriaController.create);
router.put('/kriteria/:id', [verifyToken, isAdmin], kriteriaController.update);
router.delete('/kriteria/:id', [verifyToken, isAdmin], kriteriaController.delete);

module.exports = router;
