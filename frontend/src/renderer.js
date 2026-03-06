const API_URL = 'http://localhost:3000/api';

// Variables globales
let tiposInconformidad = [];
let empleados = [];
let inconformidades = [];
let chartTipos = null;
let chartDepartamentos = null;
let chartEvolucion = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Sistema de Inconformidades iniciado');
  initTabs();
  cargarTipos();
  cargarEmpleados();
  cargarInconformidades();
  configurarFormularios();
});

// Configuración de tabs
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
      
      if (tabId === 'empleados') cargarEmpleados();
      if (tabId === 'inconformidades') cargarInconformidades();
      if (tabId === 'reportes') generarReportes();
    });
  });
}

// Configurar formularios
function configurarFormularios() {
  document.getElementById('formInconformidad').addEventListener('submit', async (e) => {
    e.preventDefault();
    await crearInconformidad();
  });

  document.getElementById('formEmpleado').addEventListener('submit', async (e) => {
    e.preventDefault();
    await crearEmpleado();
  });

  document.getElementById('filtroEstado').addEventListener('change', () => {
    filtrarInconformidades();
  });
}

// API Calls
async function cargarTipos() {
  console.log('📥 Cargando tipos de inconformidad...');
  try {
    const response = await fetch(`${API_URL}/tipos`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    tiposInconformidad = await response.json();
    console.log('✅ Tipos cargados:', tiposInconformidad);
    actualizarSelectsTipos();
  } catch (error) {
    console.error('❌ Error cargando tipos:', error);
  }
}

async function cargarEmpleados() {
  console.log('📥 Cargando empleados...');
  try {
    const response = await fetch(`${API_URL}/empleados`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    empleados = await response.json();
    console.log('✅ Empleados cargados:', empleados);
    actualizarSelectsEmpleados();
    renderizarEmpleados();
    actualizarEstadisticas();
  } catch (error) {
    console.error('❌ Error cargando empleados:', error);
    document.getElementById('listaEmpleados').innerHTML = `
      <div class="error" style="color: red; padding: 20px; text-align: center;">
        <i class="fas fa-exclamation-circle"></i> Error cargando empleados
      </div>
    `;
  }
}

async function cargarInconformidades() {
  console.log('📥 Cargando inconformidades...');
  try {
    document.getElementById('listaInconformidades').innerHTML = `
      <div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>
    `;
    
    const response = await fetch(`${API_URL}/inconformidades`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    inconformidades = await response.json();
    console.log('✅ Inconformidades cargadas:', inconformidades);
    renderizarInconformidades(inconformidades);
    actualizarEstadisticas();
  } catch (error) {
    console.error('❌ Error cargando inconformidades:', error);
    document.getElementById('listaInconformidades').innerHTML = `
      <div class="error" style="color: red; padding: 20px; text-align: center;">
        <i class="fas fa-exclamation-circle"></i> Error cargando inconformidades
      </div>
    `;
  }
}

async function crearEmpleado() {
  const nombre = document.getElementById('nombreEmpleado').value;
  const email = document.getElementById('emailEmpleado').value;
  const departamento = document.getElementById('departamentoEmpleado').value;
  const puesto = document.getElementById('puestoEmpleado').value;

  try {
    const response = await fetch(`${API_URL}/empleados`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, departamento, puesto })
    });

    if (response.ok) {
      alert('✅ Empleado registrado exitosamente');
      document.getElementById('formEmpleado').reset();
      cargarEmpleados();
    } else {
      const error = await response.json();
      alert(`❌ Error: ${error.error}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al registrar empleado');
  }
}

async function crearInconformidad() {
  const empleado_id = document.getElementById('empleadoSelect').value;
  const tipo_id = document.getElementById('tipoSelect').value;
  const titulo = document.getElementById('tituloInconformidad').value;
  const descripcion = document.getElementById('descripcionInconformidad').value;
  const prioridad = document.getElementById('prioridadSelect').value;

  if (!empleado_id || !tipo_id) {
    alert('⚠️ Selecciona empleado y tipo de inconformidad');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/inconformidades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empleado_id, tipo_id, titulo, descripcion, prioridad })
    });

    if (response.ok) {
      alert('✅ Inconformidad registrada exitosamente');
      document.getElementById('formInconformidad').reset();
      cargarInconformidades();
    } else {
      const error = await response.json();
      alert(`❌ Error: ${error.error}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al registrar inconformidad');
  }
}

async function verDetalle(id) {
  try {
    const response = await fetch(`${API_URL}/inconformidades/${id}`);
    const data = await response.json();
    mostrarModalDetalle(data);
  } catch (error) {
    console.error('Error cargando detalle:', error);
    alert('❌ Error al cargar el detalle');
  }
}

async function cambiarEstadoInconformidad() {
  const inconformidadId = document.getElementById('detalleContenido').dataset.id;
  const nuevoEstado = document.getElementById('cambioEstadoSelect').value;
  const comentario = document.getElementById('cambioEstadoComentario').value;
  const empleadoId = document.getElementById('cambioEstadoEmpleado').value;

  if (!empleadoId) {
    alert('⚠️ Selecciona un empleado para realizar el cambio');
    return;
  }

  if (!confirm(`¿Estás seguro de cambiar el estado a "${nuevoEstado.replace('_', ' ')}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/inconformidades/${inconformidadId}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        estado: nuevoEstado, 
        empleado_id: parseInt(empleadoId),
        comentario: comentario || `Estado cambiado a: ${nuevoEstado.replace('_', ' ')}`
      })
    });

    if (response.ok) {
      document.getElementById('cambioEstadoComentario').value = '';
      await verDetalle(inconformidadId);
      await cargarInconformidades();
      alert('✅ Estado actualizado correctamente');
    } else {
      const error = await response.json();
      alert(`❌ Error: ${error.error || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error de conexión con el servidor');
  }
}

async function agregarSeguimiento() {
  const inconformidadId = document.getElementById('detalleContenido').dataset.id;
  const accion = document.getElementById('seguimientoAccion').value;
  const comentario = document.getElementById('seguimientoComentario').value;
  const empleadoId = document.getElementById('seguimientoEmpleado').value;

  if (!comentario) {
    alert('⚠️ Escribe un comentario');
    return;
  }

  if (!empleadoId) {
    alert('⚠️ Selecciona un empleado');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/seguimiento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inconformidad_id: parseInt(inconformidadId),
        empleado_id: parseInt(empleadoId),
        accion: accion,
        comentario: comentario
      })
    });

    if (response.ok) {
      document.getElementById('seguimientoComentario').value = '';
      document.getElementById('seguimientoEmpleado').value = '';
      await verDetalle(inconformidadId);
      alert('✅ Comentario agregado correctamente');
    } else {
      const error = await response.json();
      alert(`❌ Error: ${error.error || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error de conexión con el servidor');
  }
}

// Renderizado
function actualizarSelectsTipos() {
  const select = document.getElementById('tipoSelect');
  if (!select) return;
  
  if (!tiposInconformidad || tiposInconformidad.length === 0) {
    select.innerHTML = '<option value="">No hay tipos disponibles</option>';
    return;
  }
  
  let options = '<option value="">Selecciona tipo</option>';
  tiposInconformidad.forEach(tipo => {
    options += `<option value="${tipo.id}">${tipo.nombre}</option>`;
  });
  select.innerHTML = options;
}

function actualizarSelectsEmpleados() {
  const select = document.getElementById('empleadoSelect');
  if (!select) return;
  
  if (!empleados || empleados.length === 0) {
    select.innerHTML = '<option value="">No hay empleados disponibles</option>';
    return;
  }
  
  let options = '<option value="">Selecciona empleado</option>';
  empleados.forEach(emp => {
    options += `<option value="${emp.id}">${emp.nombre} (${emp.departamento})</option>`;
  });
  select.innerHTML = options;
}

function renderizarEmpleados() {
  const container = document.getElementById('listaEmpleados');
  
  if (!empleados || empleados.length === 0) {
    container.innerHTML = '<div class="loading">No hay empleados registrados</div>';
    return;
  }

  container.innerHTML = empleados.map(emp => `
    <div class="empleado-item">
      <div class="empleado-info">
        <h3><i class="fas fa-user"></i> ${emp.nombre}</h3>
        <p><i class="fas fa-envelope"></i> ${emp.email}</p>
        <p><i class="fas fa-building"></i> ${emp.departamento} - ${emp.puesto}</p>
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="editarEmpleado(${emp.id})">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="delete-btn" onclick="eliminarEmpleado(${emp.id})">
          <i class="fas fa-trash"></i> Eliminar
        </button>
      </div>
    </div>
  `).join('');
}

function renderizarInconformidades(lista) {
  const container = document.getElementById('listaInconformidades');
  
  if (!lista || lista.length === 0) {
    container.innerHTML = '<div class="loading">No hay inconformidades registradas</div>';
    return;
  }

  container.innerHTML = lista.map(inc => {
    const colorPrioridad = {
      'baja': '#2ecc71',
      'media': '#f39c12',
      'alta': '#e67e22',
      'critica': '#e74c3c'
    }[inc.prioridad] || '#3498db';

    return `
    <div class="inconformidad-item" style="border-left-color: ${colorPrioridad}">
      <div class="inconformidad-info">
        <h3>${inc.titulo}</h3>
        <p><i class="fas fa-user"></i> ${inc.empleado_nombre} (${inc.departamento})</p>
        <p><i class="fas fa-tag"></i> ${inc.tipo_nombre}</p>
        <p>
          <span class="estado-badge estado-${inc.estado.replace('_', '-')}">
            ${inc.estado.replace('_', ' ')}
          </span>
          <span class="prioridad-badge prioridad-${inc.prioridad}">
            ${inc.prioridad}
          </span>
          <span><i class="fas fa-calendar"></i> ${new Date(inc.fecha_reporte).toLocaleDateString()}</span>
        </p>
      </div>
      <div class="item-actions">
        <button class="btn-ver" onclick="verDetalle(${inc.id})">
          <i class="fas fa-eye"></i> Ver
        </button>
      </div>
    </div>
  `}).join('');
}

function filtrarInconformidades() {
  const estado = document.getElementById('filtroEstado').value;
  if (estado === 'todos') {
    renderizarInconformidades(inconformidades);
  } else {
    const filtradas = inconformidades.filter(inc => inc.estado === estado);
    renderizarInconformidades(filtradas);
  }
}

function mostrarModalDetalle(data) {
  const modal = document.getElementById('modalDetalle');
  const detalle = document.getElementById('detalleContenido');
  const seguimiento = document.getElementById('listaSeguimiento');
  const seguimientoEmpleadoSelect = document.getElementById('seguimientoEmpleado');
  const cambioEstadoEmpleadoSelect = document.getElementById('cambioEstadoEmpleado');
  const cambioEstadoSelect = document.getElementById('cambioEstadoSelect');
  
  detalle.dataset.id = data.id;
  
  if (cambioEstadoSelect) {
    cambioEstadoSelect.value = data.estado || 'pendiente';
  }
  
  if (seguimientoEmpleadoSelect) {
    seguimientoEmpleadoSelect.innerHTML = '<option value="">Selecciona un empleado</option>';
    empleados.forEach(emp => {
      seguimientoEmpleadoSelect.innerHTML += `<option value="${emp.id}">${emp.nombre} (${emp.departamento})</option>`;
    });
  }
  
  if (cambioEstadoEmpleadoSelect) {
    cambioEstadoEmpleadoSelect.innerHTML = '<option value="">Selecciona empleado</option>';
    empleados.forEach(emp => {
      cambioEstadoEmpleadoSelect.innerHTML += `<option value="${emp.id}">${emp.nombre} (${emp.departamento})</option>`;
    });
  }
  
  const estadoColors = {
    'pendiente': '#f39c12',
    'en_proceso': '#3498db',
    'resuelta': '#27ae60',
    'cerrada': '#95a5a6'
  };
  const estadoColor = estadoColors[data.estado] || '#95a5a6';
  
  detalle.innerHTML = `
    <div class="detalle-grid">
      <div class="detalle-item">
        <strong>Empleado</strong>
        <p>${data.empleado_nombre || 'N/A'}</p>
      </div>
      <div class="detalle-item">
        <strong>Departamento</strong>
        <p>${data.departamento || 'N/A'}</p>
      </div>
      <div class="detalle-item">
        <strong>Tipo</strong>
        <p>${data.tipo_nombre || 'N/A'}</p>
      </div>
      <div class="detalle-item">
        <strong>Prioridad</strong>
        <p><span class="prioridad-badge prioridad-${data.prioridad || 'media'}">${data.prioridad || 'media'}</span></p>
      </div>
      <div class="detalle-item" style="grid-column: span 2;">
        <strong>Estado Actual</strong>
        <p>
          <span class="estado-badge-large" style="background: ${estadoColor}; color: white;">
            ${(data.estado || 'pendiente').replace('_', ' ')}
          </span>
        </p>
      </div>
      <div class="detalle-item">
        <strong>Fecha Reporte</strong>
        <p>${data.fecha_reporte ? new Date(data.fecha_reporte).toLocaleString() : 'N/A'}</p>
      </div>
      <div class="detalle-item">
        <strong>Fecha Cierre</strong>
        <p>${data.fecha_cierre ? new Date(data.fecha_cierre).toLocaleString() : 'No cerrada'}</p>
      </div>
      <div class="detalle-item detalle-descripcion">
        <strong>Descripción</strong>
        <p>${data.descripcion || 'Sin descripción'}</p>
      </div>
    </div>
  `;
  
  if (data.seguimiento && data.seguimiento.length > 0) {
    seguimiento.innerHTML = data.seguimiento.map(s => {
      let icono = 'fa-comment';
      if (s.accion === 'CAMBIO_ESTADO') icono = 'fa-exchange-alt';
      if (s.accion === 'CIERRE') icono = 'fa-check-circle';
      if (s.accion === 'AVANCE') icono = 'fa-forward';
      
      return `
      <div class="seguimiento-item">
        <div class="seguimiento-header">
          <span class="seguimiento-accion">
            <i class="fas ${icono}"></i> ${s.accion || 'Comentario'}
          </span>
          <span>${s.fecha_accion ? new Date(s.fecha_accion).toLocaleString() : 'Fecha desconocida'}</span>
        </div>
        <div class="seguimiento-comentario">${s.comentario || 'Sin comentario'}</div>
        <small>Por: ${s.empleado_nombre || 'Sistema'}</small>
      </div>
    `}).join('');
  } else {
    seguimiento.innerHTML = '<p class="loading">No hay seguimiento registrado</p>';
  }
  
  modal.style.display = 'flex';
}

function cerrarModal() {
  document.getElementById('modalDetalle').style.display = 'none';
}

function actualizarEstadisticas() {
  const pendientes = inconformidades.filter(i => i.estado === 'pendiente').length;
  const enProceso = inconformidades.filter(i => i.estado === 'en_proceso').length;
  const resueltas = inconformidades.filter(i => i.estado === 'resuelta' || i.estado === 'cerrada').length;
  
  document.getElementById('totalPendientes').textContent = pendientes;
  document.getElementById('totalEnProceso').textContent = enProceso;
  document.getElementById('totalResueltas').textContent = resueltas;
}

// Funciones de Reportes
function generarReportes() {
  console.log('📊 Generando reportes...');
  if (!inconformidades || inconformidades.length === 0) {
    console.log('No hay datos para mostrar');
    return;
  }
  
  const periodo = document.getElementById('periodoReportes')?.value || 'mes';
  const datosFiltrados = filtrarPorPeriodo(inconformidades, periodo);
  
  generarReporteTipos(datosFiltrados);
  generarReporteDepartamentos(datosFiltrados);
  generarReporteEvolucion(datosFiltrados);
  generarResumenGeneral(datosFiltrados);
}

function filtrarPorPeriodo(data, periodo) {
  if (periodo === 'todo') return data;
  
  const ahora = new Date();
  const fechaLimite = new Date();
  
  switch(periodo) {
    case 'semana':
      fechaLimite.setDate(ahora.getDate() - 7);
      break;
    case 'mes':
      fechaLimite.setMonth(ahora.getMonth() - 1);
      break;
    case 'trimestre':
      fechaLimite.setMonth(ahora.getMonth() - 3);
      break;
    case 'año':
      fechaLimite.setFullYear(ahora.getFullYear() - 1);
      break;
    default:
      return data;
  }
  
  return data.filter(inc => new Date(inc.fecha_reporte) >= fechaLimite);
}

function generarReporteTipos(data) {
  const tipos = {};
  data.forEach(inc => {
    const tipo = inc.tipo_nombre || 'Sin tipo';
    tipos[tipo] = (tipos[tipo] || 0) + 1;
  });
  
  const labels = Object.keys(tipos);
  const valores = Object.values(tipos);
  
  const ctx = document.getElementById('chartTipos')?.getContext('2d');
  if (!ctx) return;
  
  if (chartTipos) chartTipos.destroy();
  
  chartTipos = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: valores,
        backgroundColor: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
  
  const statsDiv = document.getElementById('statsTipos');
  if (statsDiv) {
    statsDiv.innerHTML = labels.map((label, i) => 
      `<span><strong>${label}:</strong> ${valores[i]}</span>`
    ).join('');
  }
}

function generarReporteDepartamentos(data) {
  const deptos = {};
  data.forEach(inc => {
    const depto = inc.departamento || 'Sin departamento';
    deptos[depto] = (deptos[depto] || 0) + 1;
  });
  
  const sorted = Object.entries(deptos).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(item => item[0]);
  const valores = sorted.map(item => item[1]);
  
  const ctx = document.getElementById('chartDepartamentos')?.getContext('2d');
  if (!ctx) return;
  
  if (chartDepartamentos) chartDepartamentos.destroy();
  
  chartDepartamentos = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Inconformidades',
        data: valores,
        backgroundColor: '#3498db'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
  
  const statsDiv = document.getElementById('statsDepartamentos');
  if (statsDiv) {
    statsDiv.innerHTML = labels.map((label, i) => 
      `<span><strong>${label}:</strong> ${valores[i]}</span>`
    ).join('');
  }
}

function generarReporteEvolucion(data) {
  const fechas = {};
  data.forEach(inc => {
    const fecha = new Date(inc.fecha_reporte).toLocaleDateString();
    fechas[fecha] = (fechas[fecha] || 0) + 1;
  });
  
  const sorted = Object.entries(fechas).sort((a, b) => 
    new Date(a[0]) - new Date(b[0])
  );
  
  const labels = sorted.map(item => item[0]);
  const valores = sorted.map(item => item[1]);
  
  let acumulado = [];
  let sum = 0;
  valores.forEach(v => {
    sum += v;
    acumulado.push(sum);
  });
  
  const ctx = document.getElementById('chartEvolucion')?.getContext('2d');
  if (!ctx) return;
  
  if (chartEvolucion) chartEvolucion.destroy();
  
  chartEvolucion = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Nuevas por día',
          data: valores,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Acumulado',
          data: acumulado,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Nuevas por día' } },
        y1: { position: 'right', beginAtZero: true, title: { display: true, text: 'Acumulado' } }
      }
    }
  });
  
  const total = data.length;
  const promedioDiario = (total / labels.length).toFixed(1);
  const maxDiario = Math.max(...valores);
  
  const statsDiv = document.getElementById('statsEvolucion');
  if (statsDiv) {
    statsDiv.innerHTML = `
      <span><strong>Total:</strong> ${total}</span>
      <span><strong>Promedio:</strong> ${promedioDiario}/día</span>
      <span><strong>Máximo:</strong> ${maxDiario}</span>
    `;
  }
}

function generarResumenGeneral(data) {
  const total = data.length;
  const pendientes = data.filter(i => i.estado === 'pendiente').length;
  const enProceso = data.filter(i => i.estado === 'en_proceso').length;
  const resueltas = data.filter(i => i.estado === 'resuelta').length;
  const cerradas = data.filter(i => i.estado === 'cerrada').length;
  
  document.getElementById('resumenTotal').textContent = total;
  document.getElementById('resumenPendientes').textContent = pendientes;
  document.getElementById('resumenProceso').textContent = enProceso;
  document.getElementById('resumenResueltas').textContent = resueltas;
  document.getElementById('resumenCerradas').textContent = cerradas;
  document.getElementById('resumenTiempo').textContent = '0 días';
}

function actualizarReportes() {
  generarReportes();
}

// Funciones globales para botones
window.verDetalle = verDetalle;
window.cerrarModal = cerrarModal;
window.agregarSeguimiento = agregarSeguimiento;
window.cambiarEstadoInconformidad = cambiarEstadoInconformidad;
window.actualizarReportes = actualizarReportes;

window.editarEmpleado = async (id) => {
  alert('Función de edición en desarrollo');
};

window.eliminarEmpleado = async (id) => {
  if (confirm('¿Estás seguro de eliminar este empleado?')) {
    try {
      const response = await fetch(`${API_URL}/empleados/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('✅ Empleado eliminado');
        cargarEmpleados();
      } else {
        alert('❌ Error al eliminar empleado');
      }
    } catch (error) {
      alert('❌ Error de conexión');
    }
  }
};