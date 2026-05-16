// BASE DE DATOS MOCK EXPANDIDA
const DATA = [
    { id: 1, title: "Brasil vs Uruguay", year: 2024, category: "Partido", status: "LIVE", rating: 4.8, host: "Mariano Closs", desc: "El Clásico del Río de la Plata en una edición eliminatoria vibrante hacia 2026." },
    { id: 2, title: "Colombia vs Ecuador", year: 2024, category: "Partido", status: "LIVE", rating: 4.5, host: "Eduardo Luis", desc: "Duelo directo por los puestos altos de la tabla en el infierno de Barranquilla." },
    { id: 3, title: "Argentina vs Chile", year: 2023, category: "Partido", status: "CLASSIC", rating: 4.6, host: "Rodolfo De Paoli", desc: "Reedición de las finales continentales con un Messi estelar liderando al campeón." },
    { id: 50, title: "Messi: El Último Baile", year: 2024, category: "Documental", status: "TOP", rating: 5.0, host: "Martin Liberman", desc: "Documental íntimo sobre el cierre de ciclo del mejor jugador de todos los tiempos." },
    { id: 51, title: "CR7: El Legado", year: 2024, category: "Documental", status: "NEW", rating: 4.7, host: "Fabrizio Romano", desc: "Cómo Cristiano Ronaldo cambió para siempre la mentalidad y el físico del fútbol." },
    { id: 52, title: "Maradona: 1986", year: 1986, category: "Documental", status: "LEGEND", rating: 4.9, host: "Víctor Hugo Morales", desc: "El relato remasterizado de la mayor hazaña individual en la historia de los mundiales." },
    { id: 200, title: "México vs A confirmar (Inauguración)", year: 2026, category: "Próximamente", status: "OPENING", rating: 5.0, host: "Estadio Azteca", desc: "El histórico Estadio Azteca abre las puertas al primer mundial de 48 selecciones. ¡El mundo se detiene aquí!" },
    { id: 201, title: "USA vs A confirmar", year: 2026, category: "Próximamente", status: "GROUP A", rating: 4.9, host: "SoFi Stadium", desc: "El debut del anfitrión norteamericano en una de las joyas arquitectónicas de Los Ángeles." },
    { id: 202, title: "Canadá vs A confirmar", year: 2026, category: "Próximamente", status: "GROUP B", rating: 4.8, host: "BC Place", desc: "Vancouver se viste de gala para recibir la primera cita mundialista en suelo canadiense." },
    { id: 203, title: "Gran Final 2026", year: 2026, category: "Próximamente", status: "FINAL", rating: 5.0, host: "MetLife Stadium", desc: "El partido que todos sueñan. Nueva Jersey será el epicentro de la gloria eterna el 19 de julio de 2026." },
    { id: 101, title: "Estadios de Norteamérica", year: 2026, category: "Documental", status: "PREVIEW", rating: 4.2, host: "Enrique Bermúdez", desc: "Un recorrido exclusivo por las sedes tecnológicas que albergarán el próximo mundial." }
];

// ESTADO GLOBAL
let categoryFilter = "Todos";
let searchTerm = "";
let currentSort = "default";

// CARGAR LISTA DESDE LOCALSTORAGE
let watchlist = JSON.parse(localStorage.getItem('mundialPlayWatchlist')) || [];

// PERSISTENCIA Y LISTA
const saveWatchlist = () => {
    localStorage.setItem('mundialPlayWatchlist', JSON.stringify(watchlist));
    document.getElementById('watchlist-count').innerText = watchlist.length;
    
    const badge = document.getElementById('watchlist-count');
    badge.classList.add('scale-125');
    setTimeout(() => badge.classList.remove('scale-125'), 200);
};

const toggleWatchlist = (id, event) => {
    if(event) event.stopPropagation();
    const index = watchlist.indexOf(id);
    if(index > -1) watchlist.splice(index, 1);
    else watchlist.push(id);
    saveWatchlist();
    render();
    if(!document.getElementById('detail-modal').classList.contains('hidden')) updateModalButtons(id);
};

// HELPERS UI
const getInitials = (t) => t.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
const generateStars = (r) => {
    let s = '';
    for (let i = 1; i <= 5; i++) {
        s += `<svg class="w-3 h-3 ${i <= Math.round(r) ? 'star-active' : 'star-inactive'}" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg>`;
    }
    return s;
};

// FILTRADO Y ORDEN
const setFilter = (cat) => {
    categoryFilter = cat;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.toggle('active-filter', btn.dataset.cat === cat));
    document.getElementById('hero-section').classList.toggle('hidden', cat !== 'Todos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
};

const handleSortChange = () => {
    currentSort = document.getElementById('sort-select').value;
    render();
};

const resetFilters = () => {
    searchTerm = "";
    categoryFilter = "Todos";
    document.getElementById('search-input').value = "";
    document.getElementById('clear-search').classList.add('hidden');
    setFilter('Todos');
};

// RENDERIZADO PRINCIPAL
const render = () => {
    const grid = document.getElementById('main-grid');
    const noResults = document.getElementById('no-results');
    let filtered = DATA.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = categoryFilter === "Todos" ? true : (categoryFilter === "Mi Lista" ? watchlist.includes(item.id) : item.category === categoryFilter);
        return matchesSearch && matchesCat;
    });

    if(currentSort === 'title-asc') filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if(currentSort === 'rating-desc') filtered.sort((a, b) => b.rating - a.rating);
    else if(currentSort === 'year-desc') filtered.sort((a, b) => b.year - a.year);

    document.getElementById('content-counter').innerText = `${filtered.length} CONTENIDOS`;

    if(filtered.length === 0) {
        grid.innerHTML = '';
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        grid.innerHTML = filtered.map(item => {
            const inWatchlist = watchlist.includes(item.id);
            const isUpcoming = item.category === "Próximamente";
            return `
            <div class="card-hover relative group bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer" onclick="openModal(${item.id})">
                <div class="relative h-48 poster-placeholder">
                    <div class="poster-initials">${getInitials(item.title)}</div>
                    ${isUpcoming ? `<div class="absolute top-4 left-4 z-20 bg-accent-2 text-[7px] font-black uppercase px-2 py-1 rounded">2026 EVENT</div>` : ''}
                    <div class="absolute top-4 right-4 z-20">
                        <button onclick="toggleWatchlist(${item.id}, event)" class="btn-watchlist-card ${inWatchlist ? 'active' : ''} w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                            <span class="text-xs font-bold">${inWatchlist ? '✓' : '＋'}</span>
                        </button>
                    </div>
                    <div class="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/95 via-black/40 to-transparent">
                        <div class="flex gap-1 mb-1">${generateStars(item.rating)}</div>
                        <h3 class="font-black text-[10px] uppercase italic truncate">${item.title}</h3>
                        <div class="text-[7px] text-gray-500 font-bold uppercase mt-1 tracking-widest">${item.category} • ${item.year}</div>
                    </div>
                </div>
            </div>`;
        }).join('');
    }
};

const updateModalButtons = (id) => {
    const btn = document.getElementById('modal-watchlist-btn');
    if(btn) {
        const inWatchlist = watchlist.includes(id);
        btn.innerHTML = inWatchlist ? '✓ En mi lista' : '＋ Ver más tarde';
        btn.classList.toggle('bg-white/10', inWatchlist);
        btn.classList.toggle('text-accent-1', inWatchlist);
    }
};

const openModal = (id) => {
    const item = DATA.find(i => i.id === id);
    const inWatchlist = watchlist.includes(item.id);
    const isUpcoming = item.category === "Próximamente";

    document.getElementById('modal-content').innerHTML = `
        <div class="flex flex-col md:flex-row max-h-[90vh]">
            <div class="w-full md:w-1/2 bg-black flex items-center justify-center poster-placeholder relative min-h-[300px]">
                <div class="poster-initials text-8xl opacity-10">${getInitials(item.title)}</div>
                <div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent"></div>
                ${isUpcoming ? `<div class="absolute inset-0 flex items-center justify-center"><span class="text-[10px] font-black uppercase tracking-[0.3em] bg-accent-1/80 px-6 py-2 rounded-full border border-white/20">Evento Futuro</span></div>` : ''}
            </div>
            <div class="w-full md:w-1/2 p-10 bg-zinc-900 overflow-y-auto">
                <div class="flex justify-between items-start mb-6">
                    <span class="bg-accent-1 text-white text-[8px] font-black px-3 py-1 rounded uppercase tracking-widest">${item.status}</span>
                    <button onclick="closeModal()" class="text-white/40 hover:text-white text-xl p-2">✕</button>
                </div>
                <h2 class="text-4xl font-black italic uppercase leading-[0.9] mb-4 tracking-tighter">${item.title}</h2>
                <div class="flex items-center gap-4 mb-6">
                    <div class="flex">${generateStars(item.rating)}</div>
                    <span class="text-xs font-black text-accent-2">${item.rating} / 5.0</span>
                </div>
                <div class="mb-6">
                    <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Localidad / Host</p>
                    <p class="text-sm font-black text-white italic">${item.host}</p>
                </div>
                <p class="text-gray-400 text-sm leading-relaxed mb-10 italic border-l-2 border-accent-1 pl-4">${item.desc}</p>
                <div class="flex flex-col sm:flex-row gap-4">
                    ${isUpcoming ? 
                        `<button class="flex-[3] bg-zinc-800 text-gray-400 font-black py-4 rounded-xl text-[10px] uppercase cursor-not-allowed">Notificarme</button>` :
                        `<button class="flex-[3] bg-white text-black font-black py-4 rounded-xl text-[10px] uppercase hover:bg-accent-1 hover:text-white transition-all shadow-xl active:scale-95">Ver Ahora</button>`
                    }
                    <button id="modal-watchlist-btn" onclick="toggleWatchlist(${item.id})" class="flex-[2] border border-white/10 rounded-xl text-[9px] font-black uppercase hover:bg-white/5 transition px-4 active:scale-95 ${inWatchlist ? 'bg-white/10 text-accent-1' : ''}">${inWatchlist ? '✓ En mi lista' : '＋ Ver más tarde'}</button>
                </div>
            </div>
        </div>`;
    document.getElementById('detail-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

const closeModal = () => {
    document.getElementById('detail-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
};

// Cerrar modal usando la tecla Escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

const cycleThemes = () => {
    const themes = ['default', 'theme-verde-morado', 'theme-rosa-blanco', 'theme-naranja-amarillo', 'theme-azul-violeta'];
    const current = Array.from(document.body.classList).find(c => themes.includes(c)) || 'default';
    let next = themes[(themes.indexOf(current) + 1) % themes.length];
    document.body.classList.remove(...themes.filter(t => t !== 'default'));
    if(next !== 'default') document.body.classList.add(next);
};

document.getElementById('search-input').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    document.getElementById('clear-search').classList.toggle('hidden', searchTerm === "");
    render();
});

document.getElementById('clear-search').addEventListener('click', () => {
    document.getElementById('search-input').value = "";
    searchTerm = "";
    document.getElementById('clear-search').classList.add('hidden');
    render();
});

window.onload = () => {
    document.getElementById('watchlist-count').innerText = watchlist.length;
    render();
};