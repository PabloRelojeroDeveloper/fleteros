

function exportToCSV(data, filename = 'exportacion.csv') {
    if (!data || !data.length) {
      window.notifications.error('No hay datos para exportar');
      return;
    }
  

    const headers = Object.keys(data[0]);
    

    let csvContent = headers.join(',') + '\n';
    

    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];

        const formatted = value !== null && value !== undefined ? value.toString() : '';
        return `"${formatted.replace(/"/g, '""')}"`;
      });
      csvContent += values.join(',') + '\n';
    });
    

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.notifications.success(`Datos exportados a ${filename}`);
  }
  

  window.exportUtils = {
    exportToCSV
  };
  class FilterSystem {
    constructor(tableId, data, renderCallback) {
      this.tableId = tableId;
      this.data = data;
      this.filteredData = [...data];
      this.renderCallback = renderCallback;
      
      // Configuración de paginación
      this.itemsPerPage = 10;
      this.currentPage = 1;
      this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
      
      // Filtros aplicados
      this.activeFilters = {
        searchTerm: '',
        montoPagarMin: '',
        montoPagarMax: ''
      };
    }
  
    // Actualizar los datos base
    setData(data) {
      this.data = data;
      this.applyFilters();
    }
  
    // Aplicar todos los filtros activos
    applyFilters() {
      let result = [...this.data];
      
      // Filtro de búsqueda de texto
      if (this.activeFilters.searchTerm) {
        const searchTerm = this.activeFilters.searchTerm.toLowerCase();
        result = result.filter(item => {
          return (
            (item.dni && item.dni.toLowerCase().includes(searchTerm)) ||
            (item.nombre && item.nombre.toLowerCase().includes(searchTerm)) ||
            (item.apellido && item.apellido.toLowerCase().includes(searchTerm)) ||
            (item.direccion && item.direccion.toLowerCase().includes(searchTerm)) ||
            (item.celular && item.celular.toLowerCase().includes(searchTerm))
          );
        });
      }
      
      // Filtro de monto mínimo
      if (this.activeFilters.montoPagarMin !== '') {
        const min = parseFloat(this.activeFilters.montoPagarMin);
        result = result.filter(item => parseFloat(item.montoPagar) >= min);
      }
      
      // Filtro de monto máximo
      if (this.activeFilters.montoPagarMax !== '') {
        const max = parseFloat(this.activeFilters.montoPagarMax);
        result = result.filter(item => parseFloat(item.montoPagar) <= max);
      }
      
      // Actualizar datos filtrados
      this.filteredData = result;
      
      // Actualizar paginación
      this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
      this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;
      
      // Renderizar los datos
      this.renderCurrentPage();
    }
    
    // Establecer el término de búsqueda
    setSearchTerm(term) {
      this.activeFilters.searchTerm = term;
      this.applyFilters();
    }
    
    // Establecer rango de monto a pagar
    setMontoRange(min, max) {
      this.activeFilters.montoPagarMin = min;
      this.activeFilters.montoPagarMax = max;
      this.applyFilters();
    }
    
    // Obtener los datos de la página actual
    getCurrentPageData() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredData.slice(startIndex, endIndex);
    }
    
    // Ir a una página específica
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.renderCurrentPage();
      }
    }
    
    // Página siguiente
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.renderCurrentPage();
      }
    }
    
    // Página anterior
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderCurrentPage();
      }
    }
    
    // Renderizar la página actual
    renderCurrentPage() {
      const pageData = this.getCurrentPageData();
      this.renderCallback(pageData);
      this.updatePaginationControls();
    }
    
    // Actualizar los controles de paginación
    updatePaginationControls() {
      const paginationEl = document.getElementById('pagination');
      if (!paginationEl) return;
      
      const totalResults = this.filteredData.length;
      const start = Math.min((this.currentPage - 1) * this.itemsPerPage + 1, totalResults);
      const end = Math.min(start + this.itemsPerPage - 1, totalResults);
      
      let html = '';
      
      if (totalResults > 0) {
        html = `
          <div class="d-flex justify-content-between align-items-center">
            <div>
              Mostrando ${start} a ${end} de ${totalResults} resultados
            </div>
            <ul class="pagination mb-0">
              <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <button class="page-link" id="prevPageBtn">Anterior</button>
              </li>
        `;
        
        // Mostrar un máximo de 5 páginas
        const maxPages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
        
        if (endPage - startPage + 1 < maxPages) {
          startPage = Math.max(1, endPage - maxPages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
          html += `
              <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                <button class="page-link page-number-btn" data-page="${i}">${i}</button>
              </li>
          `;
        }
        
        html += `
              <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                <button class="page-link" id="nextPageBtn">Siguiente</button>
              </li>
            </ul>
          </div>
        `;
      } else {
        html = '<div class="text-center">No hay resultados</div>';
      }
      
      paginationEl.innerHTML = html;
      
      // Agregar event listeners
      const prevBtn = document.getElementById('prevPageBtn');
      const nextBtn = document.getElementById('nextPageBtn');
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.prevPage());
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.nextPage());
      }
      
      const pageButtons = document.querySelectorAll('.page-number-btn');
      pageButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const page = parseInt(e.target.dataset.page);
          this.goToPage(page);
        });
      });
    }
    
    // Reiniciar todos los filtros
    resetFilters() {
      this.activeFilters = {
        searchTerm: '',
        montoPagarMin: '',
        montoPagarMax: ''
      };
      
      this.currentPage = 1;
      this.applyFilters();
      
      // Limpiar los inputs de filtro
      if (document.getElementById('buscarInput')) {
        document.getElementById('buscarInput').value = '';
      }
      if (document.getElementById('montoMinInput')) {
        document.getElementById('montoMinInput').value = '';
      }
      if (document.getElementById('montoMaxInput')) {
        document.getElementById('montoMaxInput').value = '';
      }
    }
  }
  
  // Exponer a la ventana
  window.FilterSystem = FilterSystem;