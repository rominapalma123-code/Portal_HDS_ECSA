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

function renderHdsInformation(item) {
  const container = document.getElementById('modalHdsContent');
  if (!container) return;
  const doc = getSourceDocument(item);
  const internal = `<p class="hds-internal"><strong>Dato de uso interno:</strong> ${escapeHtml(item.estado || 'Sin estado registrado')}. Área y ubicación corresponden al listado de planta. La HDS describe el producto suministrado; sus concentraciones no describen necesariamente una dilución de uso.</p>`;
  if (!doc) {
    container.innerHTML = `<div class="hds-empty"><strong>Información de la HDS pendiente de lectura</strong><p>${item.hdsUrl ? 'El PDF está disponible. Consulta su clasificación, composición y primeros auxilios en el documento.' : 'Aún no se ha asociado una HDS a este producto.'}</p></div>` + internal;
    return;
  }
  let content = `<div class="hds-source"><strong>Información del documento HDS</strong>
    <p>${escapeHtml(doc.fileName)}</p>
    ${doc.documentDate ? `<p>Fecha declarada en la HDS: ${escapeHtml(doc.documentDate)}</p>` : ''}
    <p>Lectura incorporada al portal: ${escapeHtml(doc.processedAt)}</p>
    <p><a href="${escapeHtml(doc.url)}" target="_blank" rel="noopener">Abrir documento fuente completo ↗</a></p>
  </div>`;
  if (doc.summary) {
    const summary = doc.summary;
    content += `<section class="hds-section"><h4>Etiqueta SGA · sección 2</h4>
      <div class="hds-label">${doc.pictogramImage ? `<img class="hds-pictogram" src="${doc.pictogramImage}" alt="SGA: corrosión. Pictograma extraído de la HDS Resource.">` : ''}
      <div><span class="hds-signal">${escapeHtml(summary.signalWord)}</span><p>${escapeHtml(summary.pictogramLabel)}</p></div></div>
      <ul>${summary.classifications.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>
      <div class="hds-excerpt">${escapeHtml(summary.hazardStatements.join('\n'))}</div>
    </section>`;
    content += `<section class="hds-section"><h4>Composición · sección 3</h4><table><thead><tr><th>Componente</th><th>CAS</th><th>% en peso</th></tr></thead><tbody>${summary.components.map(x=>`<tr><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.cas)}</td><td>${escapeHtml(x.percentage)}</td></tr>`).join('')}</tbody></table><p class="hds-caption">Rangos declarados para el producto suministrado.</p></section>`;
    content += `<section class="hds-section"><h4>Primeros auxilios · sección 4.1</h4>${summary.aid.map(x=>`<div class="hds-aid"><strong>${escapeHtml(x.route)}</strong><p>${escapeHtml(x.text)}</p></div>`).join('')}<p class="hds-caption">Revisa también los síntomas y las indicaciones para el personal médico en la sección 4 completa.</p></section>`;
  } else {
    content += `<section class="hds-section"><h4>Etiqueta y peligros declarados en la HDS</h4><p class="hds-caption">Imagen del documento fuente. Conserva sus pictogramas, clasificación y señalización tal como aparecen en el PDF.</p>`;
    if (doc.labelImages && doc.labelImages.length) {
      content += doc.labelImages.map((img,i)=>`<img class="hds-label-page" src="${img.data}" alt="Peligros declarados en ${escapeHtml(doc.fileName)}, página ${img.page}. El texto accesible se encuentra a continuación." ${i ? 'loading="lazy"' : ''}><p class="hds-caption">Página ${img.page} del documento fuente.</p>`).join('');
    }
    content += '</section>';
    content += hdsSection(doc, 'hazards', 'Identificación de los peligros', false);
    content += hdsSection(doc, 'components', 'Composición según HDS', true);
    content += hdsSection(doc, 'aid', 'Primeros auxilios según HDS', true);
  }
  if (doc.summary) {
    content += `<details class="hds-raw"><summary>Ver etiqueta y apartados originales de la HDS</summary>${(doc.labelImages||[]).map(img=>`<img class="hds-label-page" loading="lazy" src="${img.data}" alt="Sección de peligros, página ${img.page} de la HDS Resource.">`).join('')}${hdsSection(doc,'hazards','Sección 2',false)}${hdsSection(doc,'components','Sección 3',false)}${hdsSection(doc,'aid','Sección 4',false)}</details>`;
  }
  content += `<p class="hds-caption">Este extracto corresponde al documento indicado y complementa su lectura completa. Si la HDS cambia en Drive, es necesario actualizar la lectura del portal.</p>` + internal;
  container.innerHTML = content;
}
