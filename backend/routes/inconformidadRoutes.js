const express = require('express');
const router = express.Router();
const inconformidadController = require('../controllers/inconformidadController');

router.get('/inconformidades', inconformidadController.getAllInconformidades);
router.get('/inconformidades/:id', inconformidadController.getInconformidadById);
router.post('/inconformidades', inconformidadController.createInconformidad);
router.put('/inconformidades/:id', inconformidadController.updateInconformidad);
router.patch('/inconformidades/:id/estado', inconformidadController.updateEstado);

module.exports = router;