const db = require('./db');

class Seguimiento {
  static async findByInconformidadId(inconformidad_id) {
    const [rows] = await db.query(`
      SELECT s.*, e.nombre as empleado_nombre
      FROM seguimiento s
      JOIN empleados e ON s.empleado_id = e.id
      WHERE s.inconformidad_id = ?
      ORDER BY s.fecha_accion DESC
    `, [inconformidad_id]);
    return rows;
  }

  static async create({ inconformidad_id, empleado_id, accion, comentario }) {
    const [result] = await db.query(
      'INSERT INTO seguimiento (inconformidad_id, empleado_id, accion, comentario) VALUES (?, ?, ?, ?)',
      [inconformidad_id, empleado_id, accion, comentario]
    );
    return { id: result.insertId };
  }
}

module.exports = Seguimiento;