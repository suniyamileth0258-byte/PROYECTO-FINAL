const Inconformidad = require('../models/inconformidad');
const Seguimiento = require('../models/seguimiento');

const getAllInconformidades = async (req, res) => {
  try {
    const inconformidades = await Inconformidad.findAll();
    res.json(inconformidades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getInconformidadById = async (req, res) => {
  try {
    const inconformidad = await Inconformidad.findById(req.params.id);
    if (!inconformidad) {
      return res.status(404).json({ error: 'Inconformidad no encontrada' });
    }
    const seguimiento = await Seguimiento.findByInconformidadId(req.params.id);
    res.json({ ...inconformidad, seguimiento });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createInconformidad = async (req, res) => {
  try {
    const { empleado_id, tipo_id, titulo, descripcion, prioridad } = req.body;
    if (!empleado_id || !tipo_id || !titulo || !descripcion) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes' });
    }
    
    const result = await Inconformidad.create({ empleado_id, tipo_id, titulo, descripcion, prioridad });
    
    await Seguimiento.create({
      inconformidad_id: result.id,
      empleado_id,
      accion: 'CREACIÓN',
      comentario: 'Inconformidad registrada'
    });
    
    res.status(201).json({ id: result.id, message: 'Inconformidad creada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateInconformidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_id, titulo, descripcion, estado, prioridad, empleado_id } = req.body;
    
    const actualizado = await Inconformidad.update(id, { tipo_id, titulo, descripcion, estado, prioridad });
    
    if (!actualizado) {
      return res.status(404).json({ error: 'Inconformidad no encontrada' });
    }
    
    await Seguimiento.create({
      inconformidad_id: id,
      empleado_id,
      accion: 'ACTUALIZACIÓN',
      comentario: `Estado actualizado a: ${estado}`
    });
    
    res.json({ message: 'Inconformidad actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, empleado_id, comentario } = req.body;
    
    const actualizado = await Inconformidad.updateEstado(id, estado);
    
    if (!actualizado) {
      return res.status(404).json({ error: 'Inconformidad no encontrada' });
    }
    
    await Seguimiento.create({
      inconformidad_id: id,
      empleado_id,
      accion: 'CAMBIO_ESTADO',
      comentario: comentario || `Estado cambiado a: ${estado}`
    });
    
    res.json({ message: 'Estado actualizado' });
  } catch (error) {
    console.error('Error en updateEstado:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllInconformidades,
  getInconformidadById,
  createInconformidad,
  updateInconformidad,
  updateEstado
};