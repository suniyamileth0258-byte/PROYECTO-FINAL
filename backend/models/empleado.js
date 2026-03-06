const db = require('./db');

class Empleado {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM empleados ORDER BY nombre');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM empleados WHERE id = ?', [id]);
    return rows[0];
  }

  static async create({ nombre, email, departamento, puesto }) {
    const [result] = await db.query(
      'INSERT INTO empleados (nombre, email, departamento, puesto) VALUES (?, ?, ?, ?)',
      [nombre, email, departamento, puesto]
    );
    return { id: result.insertId, nombre, email, departamento, puesto };
  }

  static async update(id, { nombre, email, departamento, puesto }) {
    const [result] = await db.query(
      'UPDATE empleados SET nombre = ?, email = ?, departamento = ?, puesto = ? WHERE id = ?',
      [nombre, email, departamento, puesto, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM empleados WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Empleado;