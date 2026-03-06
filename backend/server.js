require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const empleadoRoutes = require('./routes/empleadoRoutes');
const inconformidadRoutes = require('./routes/inconformidadRoutes');
const tipoRoutes = require('./routes/tipoRoutes');
const seguimientoRoutes = require('./routes/seguimientoRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Rutas
app.use('/api', empleadoRoutes);
app.use('/api', inconformidadRoutes);
app.use('/api', tipoRoutes);
app.use('/api', seguimientoRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Sistema de Inconformidades funcionando',
    version: '1.0.0'
  });
});

// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});