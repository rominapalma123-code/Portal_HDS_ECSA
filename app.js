// Load data from global window or fallback
const rawData = window.HDS_DATA || [];

// Persistent localStorage for HDS PDF URLs
const localHdsUrls = JSON.parse(localStorage.getItem('portal_hds_urls') || '{}');

// Enhance raw data with local storage overrides
const data = rawData.map(item => {
  const key = `${item.producto}||${item.area || ''}`;
  return {
    ...item,
    hdsUrl: localHdsUrls[key] || item.hdsUrl || ''
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
    const doc = getSourceDocument(x);
    const hazardLabel = doc ? 'Peligros según HDS · Ver ficha' : 'HDS pendiente de lectura';
    
    return `
    <article class="card ${hazardCode}" data-key="${escapeHtml(x.producto)}||${escapeHtml(x.area || '')}">
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
        <button class="card-action-btn" data-key="${escapeHtml(x.producto)}||${escapeHtml(x.area || '')}">
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
  const item = data.find(x => `${x.producto}||${x.area || ''}` === key);
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
  if (doc.summary && Array.isArray(doc.summary.aid)) {
    doc.summary.aid.forEach(x => output[keyFor(x.route)].push(x.text));
    return output;
  }
  const original = doc.sections?.aid?.text || '';
  // Limit route grouping to first-aid instructions, before symptoms or physician notes.
  const stop = original.search(/(?:4\.2\s+|(?:^|\n)\s*(?:Efectos agudos previstos|Principales s[ií]ntomas|S[ií]ntomas\/efectos|Notas para el m[eé]dico|Protecci[oó]n de los socorristas|Protecci[oó]n de quienes|Notas especiales para))/im);
  const text = (stop < 0 ? original : original.slice(0, stop)).replace(/(\d\s*\/\s*\d+)(En caso de)/g, '$1\n$2');
  const label = /(^|\n|\.\s+)((?:En caso de\s+)?(?:[Cc]ontacto\s+(?:con\s+(?:los\s+ojos|la\s+piel)|ocular)|[Ii]nhalaci[oó]n|[Ii]ngesti[oó]n)|Despu[eé]s de\s+(?:inhalaci[oó]n|contacto\s+con\s+(?:la\s+piel|los\s+ojos)|ingesti[oó]n))(?:[ \t]*:[ \t]*\n?[ \t]*|[ \t]*\n+[ \t]*|[ \t]+(?=[A-ZÁÉÍÓÚ]))/gm;
  const matches = [...text.matchAll(label)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const instruction = text.slice(m.index + m[0].length, end).trim();
    if (instruction) output[keyFor(m[2])].push(instruction);
  }
  // General information is shown in full in the source accordion. Do not re-use
  // displaced NFPA tables or page headers as clinical instructions.
  return output;
}

function renderAidCards(doc) {
  const aid = splitHdsAid(doc);
  const routes = [['eyes', 'Ojos'], ['skin', 'Piel'], ['inhalation', 'Inhalación'], ['ingestion', 'Ingestión']];
  return `<section class="hds-section hds-aid-section"><h4>${hdsIcon('aid')}Primeros auxilios</h4><p class="hds-caption">Abre el tipo de contacto. Puedes consultar varios a la vez.</p>
    <div class="hds-aid-cards">${routes.map(([key,title])=>`<details class="hds-route hds-route-${key}"><summary>${hdsIcon(key)}<span><strong>${title}</strong><small>Sección 4 de la HDS</small></span><span class="hds-chevron" aria-hidden="true">⌄</span></summary><div class="hds-route-body">${aid[key].length ? aid[key].map(t=>`<p>${escapeHtml(t)}</p>`).join('') : '<p>No se pudo separar una indicación para esta vía. Revisa la sección 4 completa de la HDS.</p><a href="'+escapeHtml(doc.url)+'" target="_blank" rel="noopener">Abrir HDS completa ↗</a>'}</div></details>`).join('')}</div>
    <details class="hds-extra"><summary>${hdsIcon('doc')}Información general y atención médica<span class="hds-chevron" aria-hidden="true">⌄</span></summary><div class="hds-extra-body">${aid.general.map(t=>`<p>${escapeHtml(t)}</p>`).join('')}<p class="hds-caption">Sección 4 completa: incluye información general, síntomas y atención médica cuando están declarados en la HDS.</p><div class="hds-excerpt">${escapeHtml(doc.sections?.aid?.text || 'Consulta el documento original.')}</div></div></details>
  </section>`;
}

function renderHdsInformation(item) {
  const container = document.getElementById('modalHdsContent');
  if (!container) return;
  const doc = getSourceDocument(item);
  const internal = `<p class="hds-internal"><strong>Uso interno:</strong> ${escapeHtml(item.estado || 'Sin estado registrado')} · ${escapeHtml(item.ubicacion || item.area || '')}<br>La HDS describe el producto suministrado; sus concentraciones pueden diferir de una dilución de uso.</p>`;
  if (!doc) {
    container.innerHTML = `<div class="hds-empty">${hdsIcon('doc')}<strong>HDS pendiente de lectura</strong><p>${item.hdsUrl ? 'El PDF está disponible. Consulta en él la señalización, composición y primeros auxilios.' : 'Aún no se ha asociado una HDS a este producto.'}</p></div>` + internal;
    return;
  }
  let content = `<div class="hds-source-strip">${hdsIcon('doc')}<span>HDS${doc.documentDate ? ' · '+escapeHtml(doc.documentDate) : ''}</span><a href="${escapeHtml(doc.url)}" target="_blank" rel="noopener">Ver original ↗</a></div>`;
  const summary = doc.summary;
  content += `<section class="hds-section hds-hazard-card"><h4>${hdsIcon('danger')}Peligros según HDS</h4><div class="hds-card-content">`;
  if (summary) {
    content += `<div class="hds-danger-overview"><div class="hds-picto-group">${doc.pictogramImage ? `<img class="hds-pictogram" src="${doc.pictogramImage}" alt="Pictograma de corrosión de la HDS">` : ''}<span class="hds-signal">${escapeHtml(summary.signalWord)}</span></div><ul>${summary.classifications.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div><div class="hds-hazards-list">${summary.hazardStatements.map(x=>{const m=x.match(/^(H\d{3}(?:\s*\+\s*H\d{3})*)\s*[—–-]?\s*(.*)$/s);return `<div class="hds-hazard-row">${m?`<strong>${escapeHtml(m[1])}</strong><span>${escapeHtml(m[2])}</span>`:`<span>${escapeHtml(x)}</span>`}</div>`;}).join('')}</div>`;
  } else {
    content += `<p class="hds-caption">Señalización original del producto. Toca para ampliar y leer todos sus detalles.</p>`;
    const first=doc.labelImages?.[0];
    if(first) content += `<details class="hds-signal-preview"><summary><img src="${first.data}" alt="Señalización original, página ${first.page} de la HDS"><span>Ampliar etiqueta original ⌄</span></summary><div>${doc.labelImages.map(img=>`<img class="hds-label-page" loading="lazy" src="${img.data}" alt="Peligros declarados, página ${img.page}">`).join('')}</div></details>`;
    content += hdsSection(doc,'hazards','Clasificación y peligros declarados',false);
  }
  content += '</div></section>';
  content += `<section class="hds-section hds-composition-card"><h4>${hdsIcon('flask')}Composición según HDS</h4><div class="hds-card-content">`;
  if(summary?.components?.length) {
    content += `<table><thead><tr><th>Componente</th><th>CAS</th><th>% en peso</th></tr></thead><tbody>${summary.components.map(x=>`<tr><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.cas)}</td><td>${escapeHtml(x.percentage)}</td></tr>`).join('')}</tbody></table><p class="hds-caption">Producto suministrado · sección 3 de la HDS</p>`;
  } else {
    content += `<details class="hds-raw"><summary>Ver componentes de la HDS<span class="hds-chevron" aria-hidden="true">⌄</span></summary><div class="hds-excerpt">${escapeHtml(doc.sections?.components?.text || 'Consulta la composición en el documento original.')}</div></details>`;
  }
  content += '</div></section>';
  content += renderAidCards(doc);
  content += `<details class="hds-extra"><summary>${hdsIcon('doc')}Ver extracto original<span class="hds-chevron" aria-hidden="true">⌄</span></summary><div class="hds-extra-body">${(doc.labelImages||[]).map(img=>`<img class="hds-label-page" loading="lazy" src="${img.data}" alt="Sección de peligros, página ${img.page}">`).join('')}${hdsSection(doc,'hazards','Peligros',false)}${hdsSection(doc,'components','Composición',false)}${hdsSection(doc,'aid','Primeros auxilios',false)}</div></details>`;
  content += `<details class="hds-extra hds-source"><summary>${hdsIcon('doc')}Información del documento<span class="hds-chevron" aria-hidden="true">⌄</span></summary><div class="hds-extra-body"><p>${escapeHtml(doc.fileName)}</p><p>Fecha declarada: ${escapeHtml(doc.documentDate || 'Consultar HDS')}</p><p>Lectura incorporada al portal: ${escapeHtml(doc.processedAt)}</p><a href="${escapeHtml(doc.url)}" target="_blank" rel="noopener">Abrir documento original ↗</a></div></details>`;
  content += `<p class="hds-caption">Consulta la HDS completa para todas las indicaciones.</p><a class="hds-pdf-button" href="${escapeHtml(doc.url)}" target="_blank" rel="noopener">${hdsIcon('doc')}Abrir HDS completa ↗</a>` + internal;
  container.innerHTML = content;
}
