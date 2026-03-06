const express = require('express');
const router = express.Router();
const TipoInconformidad = require('../models/tipoInconformidad');

router.get('/tipos', async (req, res) => {
  try {
    const tipos = await TipoInconformidad.findAll();
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tipos', async (req, res) => {
  try {
    const { nombre, descripcion, nivel_gravedad } = req.body;
    const nuevo = await TipoInconformidad.create({ nombre, descripcion, nivel_gravedad });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;