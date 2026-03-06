const db = require('./db');

class Inconformidad {
  static async findAll() {
    const [rows] = await db.query(`
      SELECT i.*, e.nombre as empleado_nombre, e.departamento, 
             t.nombre as tipo_nombre, t.nivel_gravedad
      FROM inconformidades i
      JOIN empleados e ON i.empleado_id = e.id
      JOIN tipos_inconformidad t ON i.tipo_id = t.id
      ORDER BY i.fecha_reporte DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT i.*, e.nombre as empleado_nombre, e.email, e.departamento,
             t.nombre as tipo_nombre, t.descripcion as tipo_descripcion
      FROM inconformidades i
      JOIN empleados e ON i.empleado_id = e.id
      JOIN tipos_inconformidad t ON i.tipo_id = t.id
      WHERE i.id = ?
    `, [id]);
    return rows[0];
  }

  static async create({ empleado_id, tipo_id, titulo, descripcion, prioridad }) {
    const [result] = await db.query(
      'INSERT INTO inconformidades (empleado_id, tipo_id, titulo, descripcion, prioridad) VALUES (?, ?, ?, ?, ?)',
      [empleado_id, tipo_id, titulo, descripcion, prioridad || 'media']
    );
    return { id: result.insertId };
  }

  static async update(id, { tipo_id, titulo, descripcion, estado, prioridad }) {
    const [result] = await db.query(
      'UPDATE inconformidades SET tipo_id = ?, titulo = ?, descripcion = ?, estado = ?, prioridad = ? WHERE id = ?',
      [tipo_id, titulo, descripcion, estado, prioridad, id]
    );
    return result.affectedRows > 0;
  }

  static async updateEstado(id, estado) {
    const fecha_cierre = estado === 'cerrada' ? new Date() : null;
    const [result] = await db.query(
      'UPDATE inconformidades SET estado = ?, fecha_cierre = ? WHERE id = ?',
      [estado, fecha_cierre, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Inconformidad;