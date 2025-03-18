// Elementos del DOM
const asociadoForm = document.getElementById('asociadoForm');
const dniInput = document.getElementById('dni');
const nombreInput = document.getElementById('nombre');
const apellidoInput = document.getElementById('apellido');
const direccionInput = document.getElementById('direccion');
const celularInput = document.getElementById('celular');
const montoPagarInput = document.getElementById('montoPagar');
const editIndexInput = document.getElementById('editIndex');
const cancelarBtn = document.getElementById('cancelarBtn');
const asociadosTableBody = document.getElementById('asociadosTableBody');
const buscarInput = document.getElementById('buscarInput');
const buscarBtn = document.getElementById('buscarBtn');

// Cargar asociados al iniciar
let asociados = [];
loadAsociados();

async function loadAsociados() {
  try {
    asociados = await window.ipcApi.getAsociados();
    renderAsociados();
    window.notifications.info(`${asociados.length} asociados cargados`);
  } catch (error) {
    console.error('Error al cargar asociados:', error);
    window.notifications.error('Error al cargar los asociados');
  }
}

// Renderizar tabla de asociados
function renderAsociados(filteredAsociados) {
  const dataToRender = filteredAsociados || asociados;
  asociadosTableBody.innerHTML = '';

  if (dataToRender.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="7" class="text-center">No hay asociados registrados</td>';
    asociadosTableBody.appendChild(emptyRow);
    return;
  }

  dataToRender.forEach((asociado, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${asociado.dni}</td>
      <td>${asociado.nombre}</td>
      <td>${asociado.apellido}</td>
      <td>${asociado.direccion}</td>
      <td>${asociado.celular}</td>
      <td>$${asociado.montoPagar}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1 edit-btn" data-index="${index}">Editar</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Eliminar</button>
      </td>
    `;
    asociadosTableBody.appendChild(row);
  });

  // Añadir event listeners a los botones
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', handleEdit);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', handleDelete);
  });
}

// Manejar envío del formulario (agregar o editar)
asociadoForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const asociado = {
    dni: dniInput.value,
    nombre: nombreInput.value,
    apellido: apellidoInput.value,
    direccion: direccionInput.value,
    celular: celularInput.value,
    montoPagar: parseFloat(montoPagarInput.value)
  };

  const editIndex = parseInt(editIndexInput.value);

  try {
    if (editIndex >= 0) {
      // Editar
      await window.ipcApi.updateAsociado(editIndex, asociado);
      asociados[editIndex] = asociado;
      window.notifications.success(`Asociado ${asociado.nombre} ${asociado.apellido} actualizado correctamente`);
    } else {
      // Agregar nuevo
      await window.ipcApi.addAsociado(asociado);
      asociados.push(asociado);
      window.notifications.success(`Asociado ${asociado.nombre} ${asociado.apellido} agregado correctamente`);
    }

    resetForm();
    renderAsociados();
  } catch (error) {
    console.error('Error al guardar:', error);
    window.notifications.error('Error al guardar los datos');
  }
});

// Editar asociado
function handleEdit(e) {
  const index = parseInt(e.target.dataset.index);
  const asociado = asociados[index];

  dniInput.value = asociado.dni;
  nombreInput.value = asociado.nombre;
  apellidoInput.value = asociado.apellido;
  direccionInput.value = asociado.direccion;
  celularInput.value = asociado.celular;
  montoPagarInput.value = asociado.montoPagar;
  editIndexInput.value = index;

  cancelarBtn.style.display = 'inline-block';
  window.notifications.info(`Editando datos de ${asociado.nombre} ${asociado.apellido}`);
}

// Eliminar asociado
async function handleDelete(e) {
  if (confirm('¿Está seguro que desea eliminar este asociado?')) {
    const index = parseInt(e.target.dataset.index);
    const asociado = asociados[index];
    
    try {
      await window.ipcApi.deleteAsociado(index);
      asociados.splice(index, 1);
      renderAsociados();
      window.notifications.warning(`Asociado ${asociado.nombre} ${asociado.apellido} eliminado`);
    } catch (error) {
      console.error('Error al eliminar:', error);
      window.notifications.error('Error al eliminar el asociado');
    }
  }
}

// Botón cancelar edición
cancelarBtn.addEventListener('click', resetForm);

function resetForm() {
  asociadoForm.reset();
  editIndexInput.value = -1;
  cancelarBtn.style.display = 'none';
}

// Búsqueda
buscarBtn.addEventListener('click', handleSearch);
buscarInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
});

// Exportar datos a CSV
document.getElementById('exportBtn').addEventListener('click', () => {
  if (window.exportUtils && window.exportUtils.exportToCSV) {
    window.exportUtils.exportToCSV(asociados, 'asociados-fleteros-necochea.csv');
  } else {
    console.error('La utilidad de exportación no está disponible');
    if (window.notifications) {
      window.notifications.error('Error en la exportación');
    }
  }
});

function handleSearch() {
  const searchTerm = buscarInput.value.toLowerCase().trim();
  
  if (!searchTerm) {
    renderAsociados();
    return;
  }

  const filteredAsociados = asociados.filter(asociado => {
    return (
      asociado.dni.toLowerCase().includes(searchTerm) ||
      asociado.nombre.toLowerCase().includes(searchTerm) ||
      asociado.apellido.toLowerCase().includes(searchTerm) ||
      asociado.direccion.toLowerCase().includes(searchTerm) ||
      asociado.celular.toLowerCase().includes(searchTerm)
    );
  });

  renderAsociados(filteredAsociados);
  window.notifications.info(`Se encontraron ${filteredAsociados.length} resultados`);
}