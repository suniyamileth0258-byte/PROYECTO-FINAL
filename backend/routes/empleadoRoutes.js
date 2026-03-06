const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');

router.get('/empleados', empleadoController.getAllEmpleados);
router.post('/empleados', empleadoController.createEmpleado);
router.put('/empleados/:id', empleadoController.updateEmpleado);
router.delete('/empleados/:id', empleadoController.deleteEmpleado);

module.exports = router;