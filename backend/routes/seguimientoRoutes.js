const express = require('express');
const router = express.Router();
const seguimientoController = require('../controllers/seguimientoController');

router.post('/seguimiento', seguimientoController.createSeguimiento);
router.get('/seguimiento/inconformidad/:inconformidad_id', seguimientoController.getSeguimientosByInconformidad);

module.exports = router;