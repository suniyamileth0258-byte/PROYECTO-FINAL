const Empleado = require('../models/empleado');

const getAllEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.findAll();
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEmpleado = async (req, res) => {
  try {
    const { nombre, email, departamento, puesto } = req.body;
    if (!nombre || !email || !departamento || !puesto) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const nuevo = await Empleado.create({ nombre, email, departamento, puesto });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, departamento, puesto } = req.body;
    const actualizado = await Empleado.update(id, { nombre, email, departamento, puesto });
    if (!actualizado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json({ message: 'Empleado actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Empleado.delete(id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json({ message: 'Empleado eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado
};