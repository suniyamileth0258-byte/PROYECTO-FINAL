const Seguimiento = require('../models/seguimiento');

const createSeguimiento = async (req, res) => {
  try {
    const { inconformidad_id, empleado_id, accion, comentario } = req.body;
    
    if (!inconformidad_id || !empleado_id || !accion || !comentario) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    const result = await Seguimiento.create({ 
      inconformidad_id, 
      empleado_id, 
      accion, 
      comentario 
    });
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Seguimiento agregado correctamente' 
    });
  } catch (error) {
    console.error('Error en createSeguimiento:', error);
    res.status(500).json({ error: error.message });
  }
};

const getSeguimientosByInconformidad = async (req, res) => {
  try {
    const { inconformidad_id } = req.params;
    const seguimientos = await Seguimiento.findByInconformidadId(inconformidad_id);
    res.json(seguimientos);
  } catch (error) {
    console.error('Error en getSeguimientos:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSeguimiento,
  getSeguimientosByInconformidad
};