// Load data from global window or fallback
const rawData = window.HDS_DATA || [];

// Persistent localStorage for HDS PDF URLs
const localHdsUrls = JSON.parse(localStorage.getItem('portal_hds_urls') || '{}');

// Enhance raw data with local storage overrides
const data = rawData.map(item => {
  const key = `${item.producto}||${item.area || ''}`;
  return {
    ...item,
    hdsUrl: localHdsUrls[key] !== undefined ? localHdsUrls[key] : (item.hdsUrl || '')
  };
});

// Selectors
const areasEl = document.getElementById('areas');
const hazardsEl = document.getElementById('hazards');
const cardsEl = document.getElementById('cards');
const searchEl = document.getElementById('search');
const clearSearchEl = document.getElementById('clearSearch');
const countEl = document.getElementById('count');
const resultTitle = document.getElementById('resultTitle');
const emptyEl = document.getElementById('empty');
const emptyResetBtn = document.getElementById('emptyReset');
const clearAreaBtn = document.getElementById('clearArea');
const clearHazardBtn = document.getElementById('clearHazard');
const resetAllFiltersBtn = document.getElementById('resetAllFilters');

// Modals selectors
const detailModal = document.getElementById('detailModal');
const closeDetailModal = document.getElementById('closeDetailModal');
const modalTitle = document.getElementById('modalTitle');
const modalAreaBadge = document.getElementById('modalAreaBadge');
const modalLocationText = document.getElementById('modalLocationText');
const modalHazardTag = document.getElementById('modalHazardTag');
const modalEstadoBadge = document.getElementById('modalEstadoBadge');
const modalComponents = document.getElementById('modalComponents');
const modalProtocol = document.getElementById('modalProtocol');
const modalPdfTitle = document.getElementById('modalPdfTitle');
const modalPdfSub = document.getElementById('modalPdfSub');
const modalViewPdfBtn = document.getElementById('modalViewPdfBtn');
const inputPdfUrl = document.getElementById('inputPdfUrl');
const savePdfUrlBtn = document.getElementById('savePdfUrlBtn');

// NFPA Diamond selectors
const nfpaSalud = document.getElementById('nfpaSalud');
const nfpaInflamabilidad = document.getElementById('nfpaInflamabilidad');
const nfpaInestabilidad = document.getElementById('nfpaInestabilidad');
const nfpaEspecial = document.getElementById('nfpaEspecial');
const nfpaSaludTxt = document.getElementById('nfpaSaludTxt');
const nfpaInflamabilidadTxt = document.getElementById('nfpaInflamabilidadTxt');
const nfpaInestabilidadTxt = document.getElementById('nfpaInestabilidadTxt');
const nfpaEspecialTxt = document.getElementById('nfpaEspecialTxt');

// Emergency Modal selectors
const emergencyBtn = document.getElementById('emergencyBtn');
const emergencyModal = document.getElementById('emergencyModal');
const closeEmergencyModal = document.getElementById('closeEmergencyModal');

// Active State
const params = new URLSearchParams(location.search);
let selectedArea = params.get('area') || '';
let selectedHazardClass = params.get('hazard') || '';
let activeModalItemKey = null; // Track which item is active in the modal

// Hazard definitions for NCh 382
const hazardSpecs = [
  { code: 'clase-3', name: 'Líq. Inflamables (Clase 3)', color: 'var(--color-clase3)' },
  { code: 'clase-8', name: 'Corrosivos (Clase 8)', color: 'var(--color-clase8)' },
  { code: 'clase-2', name: 'Gases (Clase 2)', color: 'var(--color-clase2)' },
  { code: 'clase-6', name: 'Tóxicos (Clase 6)', color: 'var(--color-clase6)' },
  { code: 'clase-9', name: 'Otros Riesgos (Clase 9)', color: 'var(--color-clase9)' },
  { code: 'clase-none', name: 'No Peligroso', color: 'var(--color-none)' }
];

// String normalization for searches
function norm(v = '') {
  return v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Get general hazard class from string
function getHazardClass(claseText = '') {
  const text = norm(claseText);
  if (text.includes('clase 3')) return 'clase-3';
  if (text.includes('clase 8')) return 'clase-8';
  if (text.includes('clase 2')) return 'clase-2';
  if (text.includes('clase 6')) return 'clase-6';
  if (text.includes('clase 9')) return 'clase-9';
  if (text.includes('no aplica')) return 'clase-none';
  if (text === '') return 'clase-none';
  return 'clase-9';
}

// Get hazard friendly Spanish label
function getHazardLabel(claseCode) {
  const spec = hazardSpecs.find(s => s.code === claseCode);
  return spec ? spec.name : 'No clasificado';
}

// Extract unique areas from data
const areas = [...new Set(data.map(x => x.area).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
if (selectedArea && !areas.some(a => norm(a) === norm(selectedArea))) selectedArea = '';
if (selectedArea) selectedArea = areas.find(a => norm(a) === norm(selectedArea)) || selectedArea;

// Render Areas Sidebar
function renderAreas() {
  areasEl.innerHTML = areas.map(area => {
    // Count items matching the area under the base list
    const n = data.filter(x => x.area === area).length;
    const active = area === selectedArea ? ' active' : '';
    return `<button class="area-btn${active}" data-area="${escapeHtml(area)}">
      <strong>${escapeHtml(area)}</strong>
      <span>${n}</span>
    </button>`;
  }).join('');

  document.querySelectorAll('.area-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedArea = btn.dataset.area;
      updateUrlParams();
      renderAreas();
      renderHazards();
      render();
      document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// Render Hazards Sidebar
function renderHazards() {
  hazardsEl.innerHTML = hazardSpecs.map(spec => {
    // Count items matching this hazard code
    const n = data.filter(x => getHazardClass(x.clase) === spec.code).length;
    const active = spec.code === selectedHazardClass ? ' active' : '';
    return `<button class="hazard-btn${active}" data-hazard="${spec.code}">
      <span class="hazard-color-dot" style="background-color: ${spec.color}"></span>
      <strong>${escapeHtml(spec.name)}</strong>
      <span>${n}</span>
    </button>`;
  }).join('');

  document.querySelectorAll('.hazard-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedHazardClass = btn.dataset.hazard;
      updateUrlParams();
      renderAreas();
      renderHazards();
      render();
      document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// Helper to update URL search parameters
function updateUrlParams() {
  const u = new URL(location.href);
  if (selectedArea) {
    u.searchParams.set('area', selectedArea);
  } else {
    u.searchParams.delete('area');
  }

  if (selectedHazardClass) {
    u.searchParams.set('hazard', selectedHazardClass);
  } else {
    u.searchParams.delete('hazard');
  }
  history.replaceState({}, '', u);

  // Show/Hide reset button
  if (selectedArea || selectedHazardClass) {
    resetAllFiltersBtn.style.display = 'inline-flex';
  } else {
    resetAllFiltersBtn.style.display = 'none';
  }
}

// Render Cards
function render() {
  const q = norm(searchEl.value.trim());

  // Show/hide search clear button
  if (q) {
    clearSearchEl.style.display = 'block';
  } else {
    clearSearchEl.style.display = 'none';
  }

  const filtered = data.filter(x => {
    const areaOk = !selectedArea || x.area === selectedArea;
    const hazardCode = getHazardClass(x.clase);
    const hazardOk = !selectedHazardClass || hazardCode === selectedHazardClass;
    const hay = norm([x.producto, x.componentes, x.ubicacion, x.clase, x.area].join(' '));
    return areaOk && hazardOk && (!q || hay.includes(q));
  });

  // Title update
  let titleParts = [];
  if (selectedArea) titleParts.push(selectedArea);
  if (selectedHazardClass) titleParts.push(getHazardLabel(selectedHazardClass));
  resultTitle.textContent = titleParts.length > 0 ? `Sustancias · ${titleParts.join(' · ')}` : 'Todas las sustancias';
  
  countEl.textContent = `${filtered.length} registro${filtered.length === 1 ? '' : 's'}`;

  // Render cards
  cardsEl.innerHTML = filtered.map(x => {
    const hazardCode = getHazardClass(x.clase);
    const hazardLabel = x.clase ? x.clase.split(' ')[0] + ' ' + (x.clase.split(' ').slice(1).join(' ') || '') : 'Sin Clasificar';
    
    return `
    <article class="card ${hazardCode}" data-key="${escapeHtml(x.producto)}||${escapeHtml(x.area || '')}">
      <div class="card-title">
        <h4>${escapeHtml(x.producto)}</h4>
      </div>
      
      <div class="meta">
        ${x.area ? `<span class="tag tag-area">${escapeHtml(x.area)}</span>` : ''}
        ${x.estado ? `<span class="tag tag-estado">${escapeHtml(x.estado)}</span>` : ''}
      </div>

      <div class="card-details">
        ${x.ubicacion ? `
        <div class="detail">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span><strong>Ubicación:</strong> ${escapeHtml(x.ubicacion)}</span>
        </div>` : ''}
        
        ${x.clase ? `
        <div class="detail">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span class="hazard-tag ${hazardCode}">
            ${escapeHtml(hazardLabel)}
          </span>
        </div>` : ''}
      </div>

      <div class="card-footer">
        ${x.hdsUrl ? `
          <span class="pdf-indicator available">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            PDF Listo
          </span>
        ` : `
          <span class="pdf-indicator missing">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Sin PDF
          </span>
        `}
        <button class="card-action-btn" data-key="${escapeHtml(x.producto)}||${escapeHtml(x.area || '')}">
          Ficha Técnica
        </button>
      </div>
    </article>
  `;
  }).join('');

  // Setup click listeners on cards for details modal
  document.querySelectorAll('.card, .card-action-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      // Prevents opening twice if clicking the button inside the card
      e.stopPropagation();
      const key = el.dataset.key;
      if (key) {
        openProductModal(key);
      }
    });
  });

  emptyEl.classList.toggle('hidden', filtered.length > 0);
}

// NFPA 704 Estimation Logic
function getNfpaEstimates(hazardClass, productName = '') {
  const name = norm(productName);
  
  switch(hazardClass) {
    case 'clase-3': // Inflamable
      return { salud: 2, inflamabilidad: 3, reactividad: 0, especial: '-' };
    case 'clase-8': // Corrosivo
      // Acids / Bases
      if (name.includes('acido nitrico')) {
        return { salud: 3, inflamabilidad: 0, reactividad: 1, especial: 'OX' };
      }
      return { salud: 3, inflamabilidad: 0, reactividad: 1, especial: 'COR' };
    case 'clase-2': // Gases
      if (name.includes('nitrogeno') || name.includes('carbono')) {
        return { salud: 1, inflamabilidad: 0, reactividad: 0, especial: 'SA' }; // Simple Asphyxiant
      }
      return { salud: 1, inflamabilidad: 0, reactividad: 0, especial: '-' };
    case 'clase-6': // Toxico
      return { salud: 3, inflamabilidad: 1, reactividad: 0, especial: '-' };
    case 'clase-9': // Varios
      return { salud: 1, inflamabilidad: 1, reactividad: 0, especial: '-' };
    case 'clase-none':
    default:
      return { salud: 0, inflamabilidad: 0, reactividad: 0, especial: '-' };
  }
}

// NFPA Level text descriptions in Spanish
function getNfpaLevelTxt(dimension, val) {
  const desc = {
    salud: {
      0: "Sin riesgo",
      1: "Poco peligroso",
      2: "Peligroso",
      3: "Muy peligroso",
      4: "Mortal"
    },
    inflamabilidad: {
      0: "No inflama",
      1: "Sobre 93°C",
      2: "Bajo 93°C",
      3: "Bajo 37°C",
      4: "Bajo 25°C"
    },
    inestabilidad: {
      0: "Estable",
      1: "Inestable al calor",
      2: "Cambio químico violento",
      3: "Detona por golpe/calor",
      4: "Puede detonar"
    },
    especial: {
      '-': "Ninguno",
      'COR': "Corrosivo",
      'OX': "Oxidante",
      'W': "Reacciona con agua",
      'SA': "Asfixiante simple"
    }
  };
  return desc[dimension][val] || "Desconocido";
}

// Emergency measure protocols in Spanish based on risk
function getEmergencyProtocol(hazardClass) {
  switch (hazardClass) {
    case 'clase-3':
      return `
        <div class="protocol-item">
          <span class="protocol-label">🔥 FUEGO:</span>
          <span class="protocol-text">Usar espuma resistente al alcohol, CO2 o polvo químico seco. Detener la fuga si es seguro. Enfriar envases con agua pulverizada.</span>
        </div>
        <div class="protocol-item">
          <span class="protocol-label">💨 INHALACIÓN:</span>
          <span class="protocol-text">Llevar al paciente al aire fresco. Si no respira, aplicar RCP. Buscar atención médica.</span>
        </div>
        <div class="protocol-item">
          <span class="protocol-label">🧼 PIEL:</span>
          <span class="protocol-text">Retirar ropa contaminada. Lavar con abundante agua corriente y jabón por 15 minutos.</span>
        </div>
        <div class="protocol-item">
          <span class="protocol-label">🧪 DERRAME:</span>
          <span class="protocol-text">Eliminar fuentes de ignición. Absorber con arena seca u otro material inerte no inflamable. Ventilar.</span>
        </div>
      `;
    case 'clase-8':
      return `
        <div class="protocol-item">
          <span class="protocol-label">👁️ OJOS:</span>
          <span class="protocol-text">Enjuagar inmediatamente con abundante agua corriente por 20 minutos manteniendo los párpados abiertos. Acudir al oftalmólogo de urgencia.</span>
        </div>
        <div class="protocol-item">
          <span class="protocol-label">🧼 PIEL:</span>
          <span class="protocol-text">Quitar ropa y calzado contaminados bajo ducha de emergencia. Enjuagar con agua corriente durante mínimo 20 minutos.</span>
        </div>
        <div class="protocol-item">
          <span class="protocol-label">💨 INHALACIÓN:</span>
          <span class="protocol-text">Llevar al paciente a una zona ventilada. Si hay dificultad respiratoria, suministrar oxígeno (sólo personal capacitado).</span>
        </div>
        <div class="protocol-item">
          <span class="protocol-label">🤢 INGESTIÓN:</span>
          <span class="protocol-text">Lavar la boca. NO inducir el vómito. Dar a beber 1 o 2 vasos de agua. Llamar de inmediato al CITUC (+56 2 2635 3800).</span>
        </div>
      `;
    case 'clase-2':
      return `
        <div class="protocol-item">
          <span class="protocol-label">💨 INHALACIÓN:</span>
          <span class="protocol-text">Asfixia por desplazamiento de oxígeno. Llevar a la persona al aire libre de inmediato. Usar equipo de respiración autónoma si hay sospecha de alta concentración.</span>
        </div>
        <div class="protocol-item">
          <span class="protocol-label">🥶 CONGELACIÓN:</span>
          <span class="protocol-text">Para gases criogénicos (líquidos): Enjuagar la zona con abundante agua tibia. No aplicar calor seco. Trasladar a un centro asistencial.</span>
        </div>
        <div class="protocol-item">
          <span class="protocol-label">🧪 DERRAME:</span>
          <span class="protocol-text">Cerrar la válvula de paso si es seguro hacerlo. Ventilar ampliamente el área afectada. Evacuar.</span>
        </div>
      `;
    case 'clase-6':
      return `
        <div class="protocol-item">
          <span class="protocol-label">🤢 INGESTIÓN:</span>
          <span class="protocol-text">¡PELIGRO DE ENVENENAMIENTO! Llamar urgentemente al CITUC y trasladar al paciente. No provocar vómito a menos que lo indique un médico.</span>
        </div>
        <div class="protocol-item">
          <span class="protocol-label">💨 INHALACIÓN:</span>
          <span class="protocol-text">Llevar a un lugar ventilado. Suministrar ventilación artificial si deja de respirar.</span>
        </div>
        <div class="protocol-item">
          <span class="protocol-label">🧼 PIEL/OJOS:</span>
          <span class="protocol-text">Lavar con abundante agua durante 15 minutos. Usar guantes gruesos para socorrer al afectado y no contaminarse.</span>
        </div>
      `;
    default:
      return `
        <div class="protocol-item">
          <span class="protocol-label">ℹ️ PREVENCIÓN:</span>
          <span class="protocol-text">Evitar contacto ocular prolongado y uso de ropa de protección estándar. Lavar las manos tras manipular la sustancia.</span>
        </div>
        <div class="protocol-item">
          <span class="protocol-label">🧼 ATENCIÓN:</span>
          <span class="protocol-text">En caso de malestar o salpicadura en ojos, enjuagar con abundante agua limpia. Si persisten molestias, acudir al médico.</span>
        </div>
      `;
  }
}

// Open details modal
function openProductModal(key) {
  const item = data.find(x => `${x.producto}||${x.area || ''}` === key);
  if (!item) return;

  activeModalItemKey = key;
  const hazardCode = getHazardClass(item.clase);

  // Set standard text details
  modalTitle.textContent = item.producto;
  modalAreaBadge.textContent = item.area || 'Sin Área';
  modalLocationText.textContent = item.ubicacion || 'No especificada';
  modalEstadoBadge.textContent = item.estado || 'No especificado';
  
  // Class tag styling
  modalHazardTag.className = `hazard-badge-large ${hazardCode}`;
  modalHazardTag.textContent = item.clase || 'No aplica según NCh 382';

  // Components list formatting
  if (item.componentes) {
    const listHtml = item.componentes.split('\n').filter(Boolean).map(c => `
      <div class="component-item">${escapeHtml(c.trim())}</div>
    `).join('');
    modalComponents.innerHTML = listHtml;
  } else {
    modalComponents.innerHTML = `<div class="component-item" style="color: var(--text-light); font-style: italic;">Sin componentes cargados en el listado.</div>`;
  }

  // Emergency protocols
  const protocolContainer = document.getElementById('modalProtocol');
  protocolContainer.innerHTML = getEmergencyProtocol(hazardCode);
  
  // Styling safety colors inside protocol box based on class
  if (hazardCode === 'clase-none') {
    protocolContainer.className = 'protocol-box safe-protocol';
  } else {
    protocolContainer.className = 'protocol-box';
  }

  // NFPA 704 Diamond values setup
  const nfpa = getNfpaEstimates(hazardCode, item.producto);
  
  nfpaSalud.textContent = nfpa.salud;
  nfpaSaludTxt.textContent = `${nfpa.salud} (${getNfpaLevelTxt('salud', nfpa.salud)})`;

  nfpaInflamabilidad.textContent = nfpa.inflamabilidad;
  nfpaInflamabilidadTxt.textContent = `${nfpa.inflamabilidad} (${getNfpaLevelTxt('inflamabilidad', nfpa.inflamabilidad)})`;

  nfpaInestabilidad.textContent = nfpa.reactividad;
  nfpaInestabilidadTxt.textContent = `${nfpa.reactividad} (${getNfpaLevelTxt('inestabilidad', nfpa.reactividad)})`;

  nfpaEspecial.textContent = nfpa.especial;
  nfpaEspecialTxt.textContent = nfpa.especial !== '-' ? `${nfpa.especial} (${getNfpaLevelTxt('especial', nfpa.especial)})` : 'Ninguno';

  // PDF Status setup
  if (item.hdsUrl) {
    modalPdfTitle.textContent = "Hoja de Datos de Seguridad (HDS)";
    modalPdfSub.textContent = "El documento PDF está listo para visualizar.";
    modalViewPdfBtn.href = item.hdsUrl;
    modalViewPdfBtn.className = "btn btn-primary";
    modalViewPdfBtn.style.pointerEvents = "auto";
  } else {
    modalPdfTitle.textContent = "HDS pendiente de cargar";
    modalPdfSub.textContent = "Configura el enlace PDF abajo.";
    modalViewPdfBtn.href = "#";
    modalViewPdfBtn.className = "btn btn-secondary disabled";
    modalViewPdfBtn.style.pointerEvents = "none";
  }

  // Update input text field
  inputPdfUrl.value = item.hdsUrl || '';

  // Show Modal
  detailModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // block page scrolling
}

// Save HDS PDF link
function saveHdsPdfUrl() {
  if (!activeModalItemKey) return;
  const urlValue = inputPdfUrl.value.trim();

  // Validate URL format if not empty
  if (urlValue !== '') {
    try {
      new URL(urlValue);
    } catch (_) {
      alert("Por favor, ingresa una dirección URL válida que empiece con http:// o https://");
      return;
    }
  }

  // Save to local storage object
  localHdsUrls[activeModalItemKey] = urlValue;
  localStorage.setItem('portal_hds_urls', JSON.stringify(localHdsUrls));

  // Update working dataset
  const datasetItem = data.find(x => `${x.producto}||${x.area || ''}` === activeModalItemKey);
  if (datasetItem) {
    datasetItem.hdsUrl = urlValue;
  }

  // Refresh modal elements for PDF
  if (urlValue) {
    modalPdfTitle.textContent = "Hoja de Datos de Seguridad (HDS)";
    modalPdfSub.textContent = "El documento PDF está listo para visualizar.";
    modalViewPdfBtn.href = urlValue;
    modalViewPdfBtn.className = "btn btn-primary";
    modalViewPdfBtn.style.pointerEvents = "auto";
  } else {
    modalPdfTitle.textContent = "HDS pendiente de cargar";
    modalPdfSub.textContent = "Configura el enlace PDF abajo.";
    modalViewPdfBtn.href = "#";
    modalViewPdfBtn.className = "btn btn-secondary disabled";
    modalViewPdfBtn.style.pointerEvents = "none";
  }

  // Show a mini confirmation visual indicator on button
  const originalTxt = savePdfUrlBtn.textContent;
  savePdfUrlBtn.textContent = "¡Guardado!";
  savePdfUrlBtn.className = "btn btn-success";
  setTimeout(() => {
    savePdfUrlBtn.textContent = originalTxt;
    savePdfUrlBtn.className = "btn btn-success";
  }, 1500);

  // Re-render main list cards
  render();
}

// Close Product Detail Modal
function closeDetailModalFn() {
  detailModal.classList.add('hidden');
  document.body.style.overflow = ''; // restore scrolling
  activeModalItemKey = null;
}

// Close Emergency Modal
function closeEmergencyModalFn() {
  emergencyModal.classList.add('hidden');
  document.body.style.overflow = '';
}

// HTML Escaping Helpers
function escapeHtml(v = '') {
  return String(v).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[c]));
}

// Event Listeners
searchEl.addEventListener('input', render);

// Clear Search box
clearSearchEl.addEventListener('click', () => {
  searchEl.value = '';
  render();
  searchEl.focus();
});

// Clear Area filters
clearAreaBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  selectedArea = '';
  updateUrlParams();
  renderAreas();
  renderHazards();
  render();
});

// Clear Hazard filters
clearHazardBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  selectedHazardClass = '';
  updateUrlParams();
  renderAreas();
  renderHazards();
  render();
});

// Reset all filters
function resetFilters() {
  selectedArea = '';
  selectedHazardClass = '';
  searchEl.value = '';
  updateUrlParams();
  renderAreas();
  renderHazards();
  render();
}
resetAllFiltersBtn.addEventListener('click', resetFilters);
emptyResetBtn.addEventListener('click', resetFilters);

// Modal save action click
savePdfUrlBtn.addEventListener('click', saveHdsPdfUrl);

// Modal closures
closeDetailModal.addEventListener('click', closeDetailModalFn);
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) closeDetailModalFn();
});

// Emergency Modal actions
emergencyBtn.addEventListener('click', () => {
  emergencyModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
});
closeEmergencyModal.addEventListener('click', closeEmergencyModalFn);
emergencyModal.addEventListener('click', (e) => {
  if (e.target === emergencyModal) closeEmergencyModalFn();
});

// ESC Key press listener to close modals
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDetailModalFn();
    closeEmergencyModalFn();
  }
});

// Initialize on page load
updateUrlParams(); // Check URL parameters state
renderAreas();
renderHazards();
render();