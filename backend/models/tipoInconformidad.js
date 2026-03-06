const db = require('./db');

class TipoInconformidad {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM tipos_inconformidad WHERE activo = true ORDER BY nivel_gravedad DESC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM tipos_inconformidad WHERE id = ?', [id]);
    return rows[0];
  }

  static async create({ nombre, descripcion, nivel_gravedad }) {
    const [result] = await db.query(
      'INSERT INTO tipos_inconformidad (nombre, descripcion, nivel_gravedad) VALUES (?, ?, ?)',
      [nombre, descripcion, nivel_gravedad || 1]
    );
    return { id: result.insertId, nombre, descripcion, nivel_gravedad };
  }
}

module.exports = TipoInconformidad;