// Base de datos de contenido (imágenes optimizadas del fútbol mundial)
const DATA = [
    { id: 1, title: "Final: Argentina vs Francia", year: 2022, category: "Partido", narrator: "Andrés Cantor", rating: 5.0, desc: "El partido de fútbol más épico de todos los tiempos. Un duelo inolvidable entre Messi y Mbappé que se definió por la vía de los penales bajo el cielo de Lusail.", thumb: "[https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80](https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80)" },
    { id: 2, title: "Marruecos: Sueño Africano", year: 2022, category: "Documental", narrator: "FIFA Films", rating: 4.8, desc: "La hazaña histórica de la selección de Marruecos convirtiéndose en la primera selección del continente africano en alcanzar una semifinal mundialista.", thumb: "[https://images.unsplash.com/photo-1510563800743-aed2364902cb?auto=format&fit=crop&w=600&q=80](https://images.unsplash.com/photo-1510563800743-aed2364902cb?auto=format&fit=crop&w=600&q=80)" },
    { id: 3, title: "Goles de Pelé: O Rei", year: 1970, category: "Resumen", narrator: "Archivo Histórico", rating: 5.0, desc: "Un tributo cinematográfico a los mejores goles y jugadas del tres veces campeón mundial de fútbol en la mítica Copa del Mundo de México 1970.", thumb: "[https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=600&q=80](https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=600&q=80)" },
    { id: 4, title: "España: El Nacimiento de un Estilo", year: 2010, category: "Documental", narrator: "Iker Casillas", rating: 4.7, desc: "Un viaje profundo sobre el 'Tiki-Taka', el revolucionario estilo de juego que llevó a la 'Roja' a conquistar su primer campeonato del mundo en Sudáfrica.", thumb: "[https://images.unsplash.com/photo-1431324155629-1a6edd1d126c?auto=format&fit=crop&w=600&q=80](https://images.unsplash.com/photo-1431324155629-1a6edd1d126c?auto=format&fit=crop&w=600&q=80)" },
    { id: 5, title: "Brasil vs Alemania: El Silencio", year: 2014, category: "Partido", narrator: "Mariano Closs", rating: 4.5, desc: "El histórico resultado de 1-7 que sorprendió e impactó al planeta entero, marcando para siempre la historia del fútbol moderno en el estadio Mineirao.", thumb: "[https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80](https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80)" },
    { id: 6, title: "Goles de Antología de Qatar", year: 2022, category: "Resumen", narrator: "Varios narradores", rating: 4.9, desc: "La recopilación premium de las anotaciones más acrobáticas, de tiro libre y jugadas colectivas que dejaron huella en el último mundial de fútbol.", thumb: "[https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80](https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80)" }
];

// Estado global de la Aplicación reactiva
const state = {
    currentCategory: "Todos",
    searchTerm: "",
    sortBy: "newest",
    watchlistOnly: false,
    watchlist: JSON.parse(localStorage.getItem('mundialPlayWatchlist')) || []
};

// Extracción automática de las categorías reales registradas en la data
const categories = ["Todos", ...new Set(DATA.map(item => item.category))];

/**
 * Renderiza dinámicamente los botones de filtrado de categorías
 */
function renderFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => {
        const isActive = state.currentCategory === cat && !state.watchlistOnly;
        const activeClass = isActive 
            ? "bg-red-600 text-white shadow-lg shadow-red-600/30" 
            : "bg-zinc-900 text-gray-300 hover:bg-zinc-800 hover:text-white";
        
        return `
            <button 
                onclick="setCategory('${cat}')" 
                class="px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${activeClass}">
                ${cat === 'Todos' ? 'Todos' : cat + 's'}
            </button>
        `;
    }).join('');
}

/**
 * Motor Principal de Renderizado del catálogo
 */
function render() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;
    
    // 1. Filtrado en cascada
    let filtered = DATA.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(state.searchTerm.toLowerCase()) || 
                             item.desc.toLowerCase().includes(state.searchTerm.toLowerCase());
        const matchesCat = state.currentCategory === "Todos" || item.category === state.currentCategory;
        const matchesWatchlist = !state.watchlistOnly || state.watchlist.includes(item.id);
        
        return matchesSearch && matchesCat && matchesWatchlist;
    });

    // 2. Ordenamiento condicional
    if (state.sortBy === "az") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (state.sortBy === "newest") {
        filtered.sort((a, b) => b.year - a.year);
    } else if (state.sortBy === "oldest") {
        filtered.sort((a, b) => a.year - b.year);
    }

    // 3. Renderizado del DOM
    grid.innerHTML = filtered.map(item => {
        const inList = state.watchlist.includes(item.id);
        return `
            <article class="card-hover bg-zinc-950 rounded-xl overflow-hidden border border-zinc-900 group cursor-pointer flex flex-col justify-between" onclick="openModal(${item.id})">
                <div class="relative aspect-video overflow-hidden bg-zinc-900">
                    <img src="${item.thumb}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                        <span class="bg-red-600 text-white text-xs font-bold tracking-wider px-4 py-2 rounded-full transform scale-75 group-hover:scale-100 transition duration-300">
                            REPRODUCIR
                        </span>
                    </div>
                    <span class="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-[10px] text-zinc-300 px-2 py-1 rounded font-bold uppercase tracking-widest border border-white/5">
                        ${item.category}
                    </span>
                </div>
                <div class="p-4 flex-grow flex flex-col justify-between">
                    <div class="flex justify-between items-start gap-2 mb-3">
                        <h3 class="font-extrabold text-sm text-white group-hover:text-red-500 transition duration-300 line-clamp-1">${item.title}</h3>
                        <span class="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">${item.year}</span>
                    </div>
                    <div class="flex justify-between items-center mt-2 border-t border-white/5 pt-3">
                        <span class="text-[11px] text-zinc-400 font-medium">⭐ ${item.rating.toFixed(1)}</span>
                        <button 
                            onclick="event.stopPropagation(); toggleWatchlist(${item.id})" 
                            class="text-lg p-1 hover:scale-125 transition duration-200"
                            aria-label="${inList ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                            ${inList ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    // Estado vacío (Empty State)
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20 flex flex-col items-center justify-center">
                <span class="text-5xl mb-4">⚽</span>
                <h4 class="text-xl font-bold text-zinc-300">No encontramos resultados</h4>
                <p class="text-zinc-500 text-sm mt-1 max-w-sm">Prueba ajustando tus términos de búsqueda o cambiando el filtro seleccionado.</p>
                ${state.watchlistOnly ? `<button onclick="resetFilters()" class="mt-4 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-red-700 transition">Ver todo el catálogo</button>` : ''}
            </div>
        `;
    }

    // Actualización de indicadores globales en el Header
    const watchlistBadge = document.getElementById('watchlist-count');
    if (watchlistBadge) watchlistBadge.innerText = state.watchlist.length;
    
    renderFilters();
}

/**
 * Controladores y Manejadores de Estado
 */
function setCategory(category) {
    state.currentCategory = category;
    state.watchlistOnly = false;
    updateActiveMenuTab('catalogo');
    render();
}

function setViewWatchlist(onlyWatchlist) {
    state.watchlistOnly = onlyWatchlist;
    if (onlyWatchlist) {
        state.currentCategory = "Todos";
        updateActiveMenuTab('mi-lista');
    } else {
        updateActiveMenuTab('catalogo');
    }
    render();
}

function resetFilters() {
    state.currentCategory = "Todos";
    state.watchlistOnly = false;
    state.searchTerm = "";
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = "";
    updateActiveMenuTab('inicio');
    render();
}

function updateActiveMenuTab(activeTabId) {
    const tabs = {
        inicio: document.getElementById('nav-inicio'),
        catalogo: document.getElementById('nav-catalogo'),
        'mi-lista': document.getElementById('nav-mi-lista')
    };
    
    Object.keys(tabs).forEach(key => {
        if (tabs[key]) {
            if (key === activeTabId) {
                tabs[key].className = "text-white border-b-2 border-red-600 pb-1 cursor-pointer font-bold";
            } else {
                tabs[key].className = "text-gray-400 hover:text-white cursor-pointer transition pb-1";
            }
        }
    });
}

/**
 * Gestión persistente de Favoritos (Local Storage)
 */
function toggleWatchlist(id) {
    const index = state.watchlist.indexOf(id);
    if (index > -1) {
        state.watchlist.splice(index, 1);
    } else {
        state.watchlist.push(id);
    }
    localStorage.setItem('mundialPlayWatchlist', JSON.stringify(state.watchlist));
    
    render();
    
    // Actualización no destructiva del botón interno del modal si está abierto
    const modalBtn = document.getElementById(`modal-fav-btn-${id}`);
    if (modalBtn) {
        const inList = state.watchlist.includes(id);
        modalBtn.innerHTML = inList ? '❤️ Quitar de la lista' : '🤍 Ver más tarde';
    }
}

/**
 * Control del Modal Detallado con transiciones CSS
 */
function openModal(id) {
    const item = DATA.find(i => i.id === id);
    const inList = state.watchlist.includes(item.id);
    const modal = document.getElementById('detail-modal');
    const container = document.getElementById('modal-container');
    const body = document.getElementById('modal-body');

    if (!modal || !container || !body) return;

    body.innerHTML = `
        <div class="relative aspect-video w-full bg-black">
            <img src="${item.thumb}" alt="${item.title}" class="w-full h-full object-cover opacity-85">
            <button onclick="closeModal()" class="absolute top-4 right-4 bg-black/80 hover:bg-black text-white w-9 h-9 flex items-center justify-center rounded-full border border-white/10 hover:border-red-600 transition duration-300 font-bold" aria-label="Cerrar modal">✕</button>
            <div class="absolute bottom-4 left-6">
                 <span class="bg-red-600 text-white font-extrabold px-3 py-1 rounded text-[10px] uppercase tracking-widest">${item.category}</span>
            </div>
        </div>
        <div class="p-6 md:p-8">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h2 class="text-2xl md:text-3xl font-black text-white tracking-tight">${item.title}</h2>
                <button id="modal-fav-btn-${item.id}" onclick="toggleWatchlist(${item.id})" class="bg-zinc-900 border border-zinc-800 text-xs text-white px-4 py-2.5 rounded-full hover:bg-zinc-800 hover:border-red-600 transition flex items-center gap-2 font-bold whitespace-nowrap">
                    ${inList ? '❤️ Quitar de la lista' : '🤍 Ver más tarde'}
                </button>
            </div>
            <div class="flex items-center gap-4 text-xs mb-6 text-zinc-400 font-semibold">
                <span class="text-emerald-500">${item.year}</span>
                <span>•</span>
                <span>Calificación: ⭐ ${item.rating.toFixed(1)}</span>
                <span>•</span>
                <span class="text-zinc-500 font-normal">Narración: ${item.narrator}</span>
            </div>
            <p class="text-zinc-300 text-sm md:text-base leading-relaxed mb-6">${item.desc}</p>
            <button onclick="closeModal()" class="w-full bg-white text-black font-extrabold py-3.5 rounded-xl hover:bg-zinc-200 transition duration-300 tracking-wide text-xs uppercase">Cerrar Detalle</button>
        </div>
    `;

    // Activar animación de entrada quitando clases de opacidad y escala reducida
    modal.classList.remove('hidden');
    setTimeout(() => {
        container.classList.remove('scale-95', 'opacity-0');
        container.classList.add('scale-100', 'opacity-100');
    }, 10);
    
    document.body.classList.add('overflow-hidden');
}

function closeModal() {
    const modal = document.getElementById('detail-modal');
    const container = document.getElementById('modal-container');

    if (!modal || !container) return;

    container.classList.remove('scale-100', 'opacity-100');
    container.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }, 250);
}

/**
 * Escuchadores de eventos dinámicos y globales
 */
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value;
        render();
    });
}

const sortSelect = document.getElementById('sort-select');
if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        render();
    });
}

// Soporte de accesibilidad: tecla Escape para cerrar modal activo
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Control visual del Navbar sólido al hacer scroll
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    
    if (window.scrollY > 40) {
        nav.classList.add('bg-black', 'py-3');
        nav.classList.remove('bg-black/80', 'py-4');
    } else {
        nav.classList.add('bg-black/80', 'py-4');
        nav.classList.remove('bg-black', 'py-3');
    }
});

// Inicialización de la SPA cuando el DOM está completamente listo
document.addEventListener('DOMContentLoaded', () => {
    render();
});
