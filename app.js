// Load data from global window or fallback
const rawData = window.HDS_DATA || [];

// Persistent localStorage for HDS PDF URLs
let localHdsUrls = {};
try { localHdsUrls = JSON.parse(localStorage.getItem('portal_hds_urls') || '{}') || {}; } catch (_) { /* A corrupt local override must not prevent loading the portal. */ }
function productKey(item) { return JSON.stringify([item.producto, item.area || '', item.ubicacion || '', item.estado || '']); }

// Enhance raw data with local storage overrides
const data = rawData.map(item => {
  const key = productKey(item);
  const legacyKey = `${item.producto}||${item.area || ''}`;
  const uniqueLegacy = rawData.filter(x => `${x.producto}||${x.area || ''}` === legacyKey).length === 1;
  const override = Object.prototype.hasOwnProperty.call(localHdsUrls,key) ? localHdsUrls[key] : uniqueLegacy ? localHdsUrls[legacyKey] : undefined;
  return {
    ...item,
    hdsUrl: override !== undefined ? override : item.hdsUrl || ''
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
const modalPdfTitle = document.getElementById('modalPdfTitle');
const modalPdfSub = document.getElementById('modalPdfSub');
const modalViewPdfBtn = document.getElementById('modalViewPdfBtn');
const inputPdfUrl = document.getElementById('inputPdfUrl');
const savePdfUrlBtn = document.getElementById('savePdfUrlBtn');

// NFPA Diamond selectors

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
  { code: 'clase-none', name: 'Sin clase registrada', color: 'var(--color-none)' }
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
    const source = getSourceDocument(x);
    const hay = norm([x.producto, source?.sections?.components?.text || x.componentes, x.ubicacion, x.clase, x.area].join(' '));
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
    const doc = getSourceDocument(x);
    const hazardLabel = doc ? 'Peligros según HDS · Ver ficha' : 'HDS pendiente de lectura';
    
    return `
    <article class="card ${hazardCode}" data-key="${escapeHtml(productKey(x))}">
      <div class="card-title">
        <h4>${escapeHtml(x.producto)}</h4>
      </div>
      
      <div class="meta">
        ${x.area ? `<span class="tag tag-area">${escapeHtml(x.area)}</span>` : ''}
        ${x.estado ? `<span class="tag tag-estado">${escapeHtml(x.estado)} · uso interno</span>` : ''}
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
        <button class="card-action-btn" data-key="${escapeHtml(productKey(x))}">
          Ver ficha HDS
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

// Open details modal
function openProductModal(key) {
  const item = data.find(x => productKey(x) === key);
  if (!item) return;

  activeModalItemKey = key;
  const hazardCode = getHazardClass(item.clase);

  // Set standard text details
  modalTitle.textContent = item.producto;
  modalAreaBadge.textContent = item.area || 'Sin Área';
  modalLocationText.textContent = item.ubicacion || 'No especificada';
  renderHdsInformation(item);

  // PDF Status setup
  if (item.hdsUrl) {
    modalPdfTitle.textContent = "Hoja de Datos de Seguridad (HDS)";
    modalPdfSub.textContent = "El documento PDF está listo para visualizar.";
    modalViewPdfBtn.href = item.hdsUrl;
    modalViewPdfBtn.className = "btn btn-primary";
    modalViewPdfBtn.style.pointerEvents = "auto";
  } else {
    modalPdfTitle.textContent = "HDS pendiente de cargar";
    modalPdfSub.textContent = "Puedes vincular el PDF en administración.";
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
  const datasetItem = data.find(x => productKey(x) === activeModalItemKey);
  if (datasetItem) {
    datasetItem.hdsUrl = urlValue;
  }

  if (datasetItem) renderHdsInformation(datasetItem);

  // Refresh modal elements for PDF
  if (urlValue) {
    modalPdfTitle.textContent = "Hoja de Datos de Seguridad (HDS)";
    modalPdfSub.textContent = "El documento PDF está listo para visualizar.";
    modalViewPdfBtn.href = urlValue;
    modalViewPdfBtn.className = "btn btn-primary";
    modalViewPdfBtn.style.pointerEvents = "auto";
  } else {
    modalPdfTitle.textContent = "HDS pendiente de cargar";
    modalPdfSub.textContent = "Puedes vincular el PDF en administración.";
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

// Advice controls
const mascotBubble = document.getElementById('mascotBubble');
const mascotInteractive = document.getElementById('mascotInteractive');
const adviceMobileBtn = document.getElementById('adviceMobileBtn');

// Advice handling (previously modal based)
const adviceList = [
  'Antes de usar un producto, revisa su etiqueta y su hoja de datos de seguridad.',
  '¿No encuentras la HDS? Solicítala antes de manipular el producto.',
  'Revisa los pictogramas de peligro antes de comenzar tu tarea.',
  'Antes de usar un químico nuevo, conoce sus riesgos y medidas de control.',
  'Si no entiendes una indicación de la etiqueta, consulta a tu supervisión.',
  'Una etiqueta dañada o ilegible debe ser informada y reemplazada según el procedimiento.',
  'Antes de comenzar, asegúrate de haber recibido capacitación para la tarea.',
  'Usa los elementos de protección indicados para el producto y la tarea.',
  'Revisa que tus elementos de protección estén en buen estado antes de usarlos.',
  'Si tu EPP está dañado o contaminado, avisa y sigue el procedimiento de tu área.',
  'No manipules un producto si no sabes qué contiene.',
  'No mezcles productos químicos sin verificar las indicaciones y el procedimiento.',
  'Usa solo la cantidad necesaria para realizar tu tarea.',
  'Mantén los envases cerrados cuando no los estés utilizando, según la HDS.',
  'Evita inhalar vapores, gases, aerosoles o polvos del producto.',
  'Antes de trabajar, verifica que las medidas de ventilación indicadas estén funcionando.',
  'Nunca uses envases de alimentos o bebidas para guardar productos químicos.',
  'Si trasvasijas un producto, utiliza un envase compatible y correctamente identificado.',
  'Al terminar tu tarea, lávate las manos antes de comer o beber.',
  'No comas ni bebas en las áreas donde se manipulan sustancias peligrosas.',
  'Guarda cada producto en el lugar establecido para él.',
  'Revisa la compatibilidad antes de almacenar productos juntos.',
  'Mantén despejadas las vías de evacuación y los accesos a equipos de emergencia.',
  'Si ves un envase dañado o con filtraciones, avisa de inmediato.',
  'Mantén la etiqueta visible y en buen estado.',
  'Sigue las condiciones de almacenamiento indicadas en la HDS.',
  'Antes de mover un envase, revisa que esté cerrado y en buen estado.',
  'Usa los equipos y procedimientos definidos para transportar productos químicos.',
  'Si detectas un derrame, avisa y sigue el procedimiento de emergencia de tu área.',
  'No intentes controlar un derrame si no estás capacitado o autorizado.',
  'Conoce la ubicación de la ducha y el lavaojos de emergencia de tu área.',
  'Mantén libre el acceso a los equipos de emergencia.',
  'Si ocurre una exposición, informa de inmediato y activa el procedimiento correspondiente.',
  'Conoce las vías de evacuación y el punto de encuentro de tu área.',
  'Elimina los residuos químicos según el procedimiento de tu planta.'
];
let adviceIndex = -1; // start before first advice
const ADVICE_INACTIVITY_MS = 60000;
let adviceTimer = null;
const greetingText = '¡Hola! Haz clic en mí para ver un consejo de seguridad.';
function resetAdviceTimer() {
  if (adviceTimer) clearTimeout(adviceTimer);
  adviceTimer = setTimeout(() => {
    if (mascotBubble) mascotBubble.textContent = greetingText;
  }, ADVICE_INACTIVITY_MS);
}

// Initialize bubble with greeting text
if (mascotBubble) {
  mascotBubble.textContent = greetingText;
}

// Show next advice in bubble
function showNextAdvice() {
  adviceIndex = (adviceIndex + 1) % adviceList.length;
  const advice = adviceList[adviceIndex];
  if (mascotBubble) mascotBubble.textContent = advice;
  // Reset inactivity timer so greeting appears after 60s of no clicks
  resetAdviceTimer();
  // Mobile alert removed: advice shown directly in the bubble for all devices.
}

// Attach click listeners
if (mascotBubble) mascotBubble.addEventListener('click', showNextAdvice);
if (mascotInteractive) mascotInteractive.addEventListener('click', showNextAdvice);
if (adviceMobileBtn) adviceMobileBtn.addEventListener('click', showNextAdvice);
// Start the inactivity timer after initial setup
resetAdviceTimer();

// The previous modal elements are no longer used


// ESC Key press listener to close modals
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDetailModalFn();
    closeEmergencyModalFn();
    // closeAdviceModalFn removed - not needed
  }
});

// Initialize on page load
updateUrlParams(); // Check URL parameters state
renderAreas();
renderHazards();
render();

// Back-to-top button functionality
const backToTopBtn = document.getElementById('backToTopBtn');
if (backToTopBtn) {
  const toggleBackToTop = () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  };
  // Initial check
  toggleBackToTop();
  window.addEventListener('scroll', toggleBackToTop);

  backToTopBtn.addEventListener('click', (e) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
// A source record applies only to its exact PDF ID. Changing a link invalidates the displayed extract.
function getSourceDocument(item) {
  if (!item || !item.hdsUrl) return null;
  try {
    const url = new URL(item.hdsUrl);
    if (url.hostname !== 'drive.google.com') return null;
    const match = url.pathname.match(/\/file\/d\/([^/]+)/);
    const id = match ? match[1] : url.searchParams.get('id');
    return (window.HDS_DOCUMENTS || {})[id] || null;
  } catch (_) { return null; }
}

function hdsSection(doc, key, title, expanded) {
  const section = doc.sections[key];
  if (!section || !section.text) return `<section class="hds-section"><h4>${escapeHtml(title)}</h4><p class="hds-empty">Consulta este apartado en el PDF. No hay un extracto disponible.</p></section>`;
  return `<section class="hds-section"><h4>${escapeHtml(title)}</h4>
    <p class="hds-caption">${escapeHtml(section.title)}${section.page ? ' · página ' + section.page : ''}</p>
    <details class="hds-raw" ${expanded ? 'open' : ''}><summary>Leer texto de la HDS</summary><div class="hds-excerpt">${escapeHtml(section.text)}</div></details>
  </section>`;
}

// Visual grouping only: all instructions remain verbatim from their own source HDS.
function hdsIcon(name) {
  const paths = {
    eyes: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    skin: '<path d="M8 13V6a1.5 1.5 0 0 1 3 0v6-8a1.5 1.5 0 0 1 3 0v8-6a1.5 1.5 0 0 1 3 0v7-4a1.5 1.5 0 0 1 3 0v7c0 4-2 6-6 6h-2c-2 0-3-1-4-3l-4-6c-1-2 1-3 2-2Z"/>',
    inhalation: '<path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 17h6a3 3 0 1 1-3 3"/>',
    ingestion: '<path d="M3 12c3-6 6-7 9-3 3-4 6-3 9 3-4 7-14 7-18 0Z"/><path d="M3 12h18"/>',
    aid: '<rect x="3" y="6" width="18" height="15" rx="3"/><path d="M8 6V3h8v3M12 10v7M8.5 13.5h7"/>',
    flask: '<path d="M9 3h6M10 3v7l-6 9c-1 1 0 2 1 2h14c1 0 2-1 1-2l-6-9V3M8 15h8"/>',
    danger: '<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5M12 17h.01"/>',
    doc: '<path d="M14 2H5v20h14V7l-5-5Z"/><path d="M14 2v6h5M8 12h8M8 16h8"/>'
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.doc}</svg>`;
}

function splitHdsAid(doc) {
  const output = { eyes: [], skin: [], inhalation: [], ingestion: [], general: [] };
  function keyFor(label) {
    const x = norm(label);
    return /ojos|ocular/.test(x) ? 'eyes' : /piel|cutane/.test(x) ? 'skin' : /inhal/.test(x) ? 'inhalation' : /ingest/.test(x) ? 'ingestion' : 'general';
  }
  if (doc.summary && doc.sha256 && doc.summary.reviewedSha256 === doc.sha256 && Array.isArray(doc.summary.aid)) {
    doc.summary.aid.forEach(x => output[keyFor(x.route)].push(x.text));
    return output;
  }
  // A changed/unreviewed PDF must not be split into clinical instructions by heuristics.
  // The full source remains available in the original-section accordion.
  return output;
}

function renderAidCards(doc) {
  const aid = splitHdsAid(doc);
  const routes = [['eyes', 'Ojos'], ['skin', 'Piel'], ['inhalation', 'Inhalación'], ['ingestion', 'Ingestión']];
  return `<section class="hds-section hds-aid-section"><h4>${hdsIcon('aid')}Primeros auxilios</h4><p class="hds-caption">Abre el tipo de contacto. Puedes consultar varios a la vez.</p>
    <div class="hds-aid-cards">${routes.map(([key,title])=>`<details class="hds-route hds-route-${key}"><summary>${hdsIcon(key)}<span><strong>${title}</strong><small>Primeros auxilios de la HDS</small></span><span class="hds-chevron" aria-hidden="true">⌄</span></summary><div class="hds-route-body">${aid[key].length ? aid[key].map(t=>`<p>${escapeHtml(t)}</p>`).join('') : '<p>No hay una instrucción separada disponible para esta vía en la lectura incorporada. Consulta el apartado completo del documento original.</p>'}</div></details>`).join('')}</div>
    <details class="hds-extra"><summary>${hdsIcon('doc')}Información general y atención médica<span class="hds-chevron" aria-hidden="true">⌄</span></summary><div class="hds-extra-body">${aid.general.map(t=>`<p>${escapeHtml(t)}</p>`).join('')}<p class="hds-caption">Sección 4 completa: incluye información general, síntomas y atención médica cuando están declarados en la HDS.</p><div class="hds-excerpt">${escapeHtml(doc.sections?.aid?.text || 'Consulta el documento original.')}</div></div></details>
  </section>`;
}

function renderHdsInformation(item) {
  const container = document.getElementById('modalHdsContent');
  if (!container) return;
  const doc = getSourceDocument(item);
  const internal = `<p class="hds-internal"><strong>Uso interno:</strong> ${escapeHtml(item.estado || 'Sin estado registrado')} · ${escapeHtml(item.ubicacion || item.area || '')}<br>La HDS describe el producto suministrado; sus concentraciones pueden diferir de una dilución de uso.</p>`;
  if (!doc) {
    const pending = item.hdsUrl ? 'HDS pendiente de lectura' : 'HDS pendiente de vincular';
    container.innerHTML = `<div class="hds-empty">${hdsIcon('doc')}<strong>${pending}</strong><p>${item.hdsUrl ? 'Consulta la señalización, composición y primeros auxilios en el PDF disponible.' : 'Aún no se ha asociado un documento a este producto. La clase del listado interno no reemplaza su HDS.'}</p></div>
      <section class="hds-section hds-hazard-card"><h4>${hdsIcon('danger')}Peligros según HDS</h4><div class="hds-card-content"><p>Pendiente de verificar en la HDS del producto.</p></div></section>
      <section class="hds-section hds-composition-card"><h4>${hdsIcon('flask')}Composición según HDS</h4><div class="hds-card-content"><p>Pendiente de verificar en la HDS del producto.</p></div></section>` + renderAidCards({sections:{}, summary:null, url:item.hdsUrl || ''}) +
      (item.hdsUrl ? `<a class="hds-pdf-button" href="${escapeHtml(item.hdsUrl)}" target="_blank" rel="noopener">${hdsIcon('doc')}Abrir HDS completa ↗</a>` : '') + internal;
    return;
  }
  let content = `<div class="hds-source-strip">${hdsIcon('doc')}<span>HDS${doc.documentDate ? ' · '+escapeHtml(doc.documentDate) : ''}</span><span class="hds-read-badge">Documento vinculado</span></div>`;
  const summary = doc.summary?.reviewedSha256 === doc.sha256 ? doc.summary : null;
  content += `<section class="hds-section hds-hazard-card"><h4>${hdsIcon('danger')}Peligros según HDS</h4><div class="hds-card-content">`;
  if (summary) {
    const pictures = (summary.pictograms || []).map((x,i)=>`<button type="button" class="hds-picto-zoom" data-hds-image="${escapeHtml(x.data)}" aria-label="Ampliar pictograma original ${i+1}"><img src="${escapeHtml(x.data)}" alt="Señalización SGA original, página ${x.page}"></button>`).join('');
    content += `<div class="hds-danger-overview"><div class="hds-picto-group">${pictures}${summary.signalWord ? `<span class="hds-signal">${escapeHtml(summary.signalWord)}</span>` : ''}</div></div>`;
    if (summary.nfpa) content += renderSourceNfpa(summary.nfpa);
    if (summary.hmis) content += `<div class="hds-hmis"><strong>HMIS III · HDS original</strong>${['Salud','Inflamabilidad','Peligro físico'].map((name,i)=>`<div class="hds-hmis-row hds-hmis-${i}"><span>${name}</span><b>${escapeHtml(summary.hmis[i])}</b></div>`).join('')}${summary.hmis[0].includes('*') ? '<small>* Crónico, según la etiqueta original.</small>' : ''}</div>`;
    if (summary.transportImage) content += `<div class="hds-transport"><strong>Transporte · NCh 2190</strong><button type="button" data-hds-image="${escapeHtml(summary.transportImage)}" aria-label="Ampliar distintivos originales de transporte"><img src="${escapeHtml(summary.transportImage)}" alt="Distintivos originales de transporte: corrosivo clase 8 y líquido inflamable clase 3"></button></div>`;
    content += `<ul class="hds-classifications">${(summary.classifications || []).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`;
    if (summary.hazardCodes) content += `<div class="hds-code-strip"><strong>Indicaciones declaradas</strong><span>${escapeHtml(summary.hazardCodes)}</span></div>`;
    content += `<div class="hds-hazards-list">${(summary.hazardStatements || []).map(x=>{const m=x.match(/^(H-?\d{3}(?:\s*\+\s*H\d{3})*)\s*[:—–-]?\s*(.*)$/s);return `<div class="hds-hazard-row">${m?`<strong>${escapeHtml(m[1])}</strong><span>${escapeHtml(m[2])}</span>`:`<span>${escapeHtml(x)}</span>`}</div>`;}).join('')}</div>`;
    if (summary.sourceNote) content += `<p class="hds-source-note"><strong>Revisión del documento pendiente:</strong> ${escapeHtml(summary.sourceNote)}</p>`;
    content += `<p class="hds-caption">Transcripción de esta versión de la HDS. La señalización original se conserva abajo.</p>`;
  } else {
    content += `<p class="hds-source-note">Esta versión del PDF aún no tiene una ficha resumida verificada. Consulta los apartados originales; no se reutilizan datos de otra versión.</p>`;
    content += hdsSection(doc,'hazards','Clasificación y peligros declarados',true);
  }
  content += renderOriginalLabels(doc);
  content += '</div></section>';
  content += `<section class="hds-section hds-composition-card"><h4>${hdsIcon('flask')}Composición según HDS</h4><div class="hds-card-content">`;
  if(summary?.components?.length) {
    content += `<div class="hds-table-wrap"><table><thead><tr><th>Componente</th><th>CAS</th><th>${escapeHtml(summary.concentrationLabel || "Concentración declarada")}</th></tr></thead><tbody>${summary.components.map(x=>`<tr><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.cas)}</td><td>${escapeHtml(x.percentage)}</td></tr>`).join('')}</tbody></table></div><p class="hds-caption">Producto suministrado · composición declarada en la HDS</p>`;
  } else {
    content += summary?.componentNote ? `<p class="hds-composition-note">${escapeHtml(summary.componentNote)}</p>` : '';
    content += `<details class="hds-raw"><summary>Ver componentes de la HDS<span class="hds-chevron" aria-hidden="true">⌄</span></summary><div class="hds-excerpt">${escapeHtml(doc.sections?.components?.text || 'Consulta la composición en el documento original.')}</div></details>`;
  }
  content += '</div></section>';
  content += renderAidCards(doc);
  content += `<details class="hds-extra"><summary>${hdsIcon('doc')}Ver extracto original<span class="hds-chevron" aria-hidden="true">⌄</span></summary><div class="hds-extra-body">${(doc.labelImages||[]).map(img=>`<button class="hds-original-image" type="button" data-hds-image="${escapeHtml(img.data)}" aria-label="Ampliar página ${img.page}"><img class="hds-label-page" loading="lazy" src="${img.data}" alt="Sección de peligros, página ${img.page}"></button>`).join('')}${hdsSection(doc,'hazards','Peligros',false)}${hdsSection(doc,'components','Composición',false)}${hdsSection(doc,'aid','Primeros auxilios',false)}</div></details>`;
  content += `<details class="hds-extra hds-source"><summary>${hdsIcon('doc')}Información del documento<span class="hds-chevron" aria-hidden="true">⌄</span></summary><div class="hds-extra-body"><p>${escapeHtml(doc.fileName)}</p><p>Fecha declarada: ${escapeHtml(doc.documentDate || 'Consultar HDS')}</p><p>Lectura incorporada al portal: ${escapeHtml(doc.processedAt)}</p><a href="${escapeHtml(doc.url)}" target="_blank" rel="noopener">Abrir documento original ↗</a></div></details>`;
  content += `<p class="hds-caption">Consulta la HDS completa para todas las indicaciones.</p><a class="hds-pdf-button" href="${escapeHtml(doc.url)}" target="_blank" rel="noopener">${hdsIcon('doc')}Abrir HDS completa ↗</a>` + internal;
  container.innerHTML = content;
}

function renderSourceNfpa(n) {
  const h=escapeHtml(n.health), f=escapeHtml(n.fire), r=escapeHtml(n.reactivity);
  return `<div class="hds-nfpa-panel"><div><strong>Rombo NFPA</strong><p>Valores declarados en la HDS</p></div><div class="hds-nfpa-layout"><svg class="hds-nfpa-diamond" viewBox="0 0 200 200" role="img" aria-label="NFPA: salud ${h}, inflamabilidad ${f}, inestabilidad ${r}. Campo especial sin indicación."><path d="M100 4 196 100 100 196 4 100Z" fill="white" stroke="#23324a" stroke-width="2"/><path d="M100 4 148 52 100 100 52 52Z" fill="#ed2634"/><path d="M4 100 52 52 100 100 52 148Z" fill="#125bce"/><path d="M100 100 148 52 196 100 148 148Z" fill="#ffe438"/><path d="M100 4v192M4 100h192" stroke="none"/><path d="m52 52 96 96M148 52 52 148" stroke="#23324a" stroke-width="1.5"/><text x="100" y="64" text-anchor="middle" fill="white">${f}</text><text x="52" y="112" text-anchor="middle" fill="white">${h}</text><text x="148" y="112" text-anchor="middle" fill="#15213b">${r}</text></svg><dl class="hds-nfpa-values"><div><dt>Salud</dt><dd>${h}</dd></div><div><dt>Inflamabilidad</dt><dd>${f}</dd></div><div><dt>Inestabilidad</dt><dd>${r}</dd></div><div><dt>Especial</dt><dd>Sin indicación</dd></div></dl></div></div>`;
}
function renderOriginalLabels(doc) {
  return `<details class="hds-extra hds-original-label"><summary>${hdsIcon('doc')}Ver señalización original<span class="hds-chevron" aria-hidden="true">⌄</span></summary><div class="hds-extra-body"><p class="hds-caption">Toca una imagen para ampliarla. Puedes ver su tamaño completo y desplazarte para leerla.</p>${(doc.labelImages || []).map(img=>`<button type="button" class="hds-original-image" data-hds-image="${escapeHtml(img.data)}" aria-label="Ampliar señalización original, página ${img.page}"><img loading="lazy" class="hds-label-page" src="${escapeHtml(img.data)}" alt="Señalización original, página ${img.page}"></button>`).join('')}</div></details>`;
}
document.addEventListener('click', event => {
  const button=event.target.closest('[data-hds-image]');
  if (!button) return;
  let viewer=document.getElementById('hdsImageViewer');
  if (!viewer) {
    viewer=document.createElement('dialog'); viewer.id='hdsImageViewer'; viewer.className='hds-image-viewer';
    viewer.innerHTML='<div class="hds-viewer-bar"><strong>Señalización original de la HDS</strong><button type="button" data-image-size>Tamaño completo</button><button type="button" data-image-close aria-label="Cerrar imagen">✕</button></div><div class="hds-viewer-scroll"><img alt="Señalización original ampliada"></div>';
    document.body.appendChild(viewer);
    viewer.querySelector('[data-image-close]').addEventListener('click',()=>viewer.close());
    viewer.querySelector('[data-image-size]').addEventListener('click',e=>{viewer.classList.toggle('hds-full-size');e.target.textContent=viewer.classList.contains('hds-full-size')?'Ajustar a pantalla':'Tamaño completo';});
    viewer.addEventListener('close',()=>{if(viewer._opener?.isConnected)viewer._opener.focus();});
    viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close();});
  }
  viewer._opener=button; viewer.classList.remove('hds-full-size');viewer.querySelector('[data-image-size]').textContent='Tamaño completo';
  viewer.querySelector('img').src=button.dataset.hdsImage; viewer.showModal();
});
