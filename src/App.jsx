import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Heart, 
  Star, 
  X, 
  Play, 
  Calendar, 
  User, 
  Film, 
  Flame, 
  Tv, 
  Award, 
  Sparkles 
} from 'lucide-react';

// Base de datos de contenido del Mundial
const DATA = [
  { id: 1, title: "Final: Argentina vs Francia", year: 2022, category: "Partido", narrator: "Andrés Cantor", rating: 5.0, desc: "El partido de fútbol más épico de todos los tiempos. Un duelo inolvidable entre Messi y Mbappé que se definió por la vía de los penales bajo el cielo de Lusail.", thumb: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80" },
  { id: 2, title: "Marruecos: Sueño Africano", year: 2022, category: "Documental", narrator: "FIFA Films", rating: 4.8, desc: "La hazaña histórica de la selección de Marruecos convirtiéndose en la primera selección del continente africano en alcanzar una semifinal mundialista.", thumb: "https://images.unsplash.com/photo-1510563800743-aed2364902cb?auto=format&fit=crop&w=600&q=80" },
  { id: 3, title: "Goles de Pelé: O Rei", year: 1970, category: "Resumen", narrator: "Archivo Histórico", rating: 5.0, desc: "Un tributo cinematográfico a los mejores goles y jugadas del tres veces campeón mundial de fútbol en la mítica Copa del Mundo de México 1970.", thumb: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=600&q=80" },
  { id: 4, title: "España: El Nacimiento de un Estilo", year: 2010, category: "Documental", narrator: "Iker Casillas", rating: 4.7, desc: "Un viaje profundo sobre el 'Tiki-Taka', el revolucionario estilo de juego que llevó a la 'Roja' a conquistar su primer campeonato del mundo en Sudáfrica.", thumb: "https://images.unsplash.com/photo-1431324155629-1a6edd1d126c?auto=format&fit=crop&w=600&q=80" },
  { id: 5, title: "Brasil vs Alemania: El Silencio", year: 2014, category: "Partido", narrator: "Mariano Closs", rating: 4.5, desc: "El histórico resultado de 1-7 que sorprendió e impactó al planeta entero, marcando para siempre la historia del fútbol moderno en el estadio Mineirao.", thumb: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80" },
  { id: 6, title: "Goles de Antología de Qatar", year: 2022, category: "Resumen", narrator: "Varios narradores", rating: 4.9, desc: "La recopilación premium de las anotaciones más acrobáticas, de tiro libre y jugadas colectivas que dejaron huella en el último mundial de fútbol.", thumb: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80" }
];

// Obtención dinámica de categorías disponibles
const CATEGORIES = ["Todos", ...new Set(DATA.map(item => item.category))];

export default function App() {
  // --- ESTADOS DE LA APLICACIÓN ---
  const [currentCategory, setCurrentCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio"); // 'inicio', 'catalogo', 'mi-lista'
  
  // Estado de lista de favoritos inicializado con LocalStorage
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('mundialPlayWatchlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado para controlar el modal abierto
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para el efecto de scroll en la barra de navegación
  const [scrolled, setScrolled] = useState(false);

  // Persistencia de la Watchlist en LocalStorage
  useEffect(() => {
    localStorage.setItem('mundialPlayWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Listener para el scroll del Header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar modal con la tecla de Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- MANEJADORES DE ACCIÓN ---
  const handleToggleWatchlist = (e, id) => {
    e.stopPropagation(); // Evita abrir el modal al hacer click en el corazón
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Bloquear scroll de fondo
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
      document.body.style.overflow = 'unset'; // Restaurar scroll
    }, 250); // Mismo tiempo que la animación de salida
  };

  const handleResetFilters = () => {
    setCurrentCategory("Todos");
    setWatchlistOnly(false);
    setSearchTerm("");
    setActiveTab("inicio");
  };

  const handleGoToWatchlist = () => {
    setWatchlistOnly(true);
    setCurrentCategory("Todos");
    setActiveTab("mi-lista");
  };

  const handleGoToCatalogue = () => {
    setWatchlistOnly(false);
    setActiveTab("catalogo");
  };

  // --- FILTRADO Y ORDENACIÓN DINÁMICA (Monejo eficiente mediante useMemo) ---
  const filteredAndSortedData = useMemo(() => {
    let result = DATA.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.desc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = currentCategory === "Todos" || item.category === currentCategory;
      const matchesWatchlist = !watchlistOnly || watchlist.includes(item.id);
      
      return matchesSearch && matchesCat && matchesWatchlist;
    });

    // Ordenamiento inteligente
    if (sortBy === "az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "newest") {
      result.sort((a, b) => b.year - a.year);
    } else if (sortBy === "oldest") {
      result.sort((a, b) => a.year - b.year);
    }

    return result;
  }, [currentCategory, searchTerm, sortBy, watchlistOnly, watchlist]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased selection:bg-red-600 selection:text-white">
      
      {/* 1. NAVEGACIÓN */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 px-6 md:px-12 flex items-center justify-between border-b ${
        scrolled 
          ? 'bg-black/95 py-3 border-white/10 shadow-lg backdrop-blur-md' 
          : 'bg-black/80 py-4 border-white/5 backdrop-blur-sm'
      }`}>
        <div className="flex items-center gap-8">
          <h1 
            onClick={handleResetFilters} 
            className="text-2xl font-black text-red-600 tracking-tighter uppercase italic cursor-pointer select-none"
          >
            Mundial<span className="text-blue-500">Play</span>
          </h1>
          
          <ul className="hidden md:flex gap-6 text-sm font-medium">
            <li 
              onClick={handleResetFilters} 
              className={`cursor-pointer transition-colors duration-200 pb-1 ${
                activeTab === 'inicio' 
                  ? 'text-white border-b-2 border-red-600 font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Inicio
            </li>
            <li 
              onClick={handleGoToCatalogue} 
              className={`cursor-pointer transition-colors duration-200 pb-1 ${
                activeTab === 'catalogo' 
                  ? 'text-white border-b-2 border-red-600 font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Catálogo
            </li>
            <li 
              onClick={handleGoToWatchlist} 
              className={`cursor-pointer transition-all duration-200 pb-1 flex items-center gap-2 ${
                activeTab === 'mi-lista' 
                  ? 'text-white border-b-2 border-red-600 font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mi Lista 
              <span className="bg-red-600 text-[10px] text-white px-2 py-0.5 rounded-full font-extrabold shadow-sm">
                {watchlist.length}
              </span>
            </li>
          </ul>
        </div>
        
        {/* Buscador Estilizado */}
        <div className="flex items-center gap-2.5 bg-zinc-900/95 px-4 py-2 rounded-full border border-zinc-800 focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600/30 transition-all duration-300">
          <Search size={15} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar partidos, documentales..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-32 md:w-56 text-white placeholder-gray-500 font-normal"
          />
        </div>
      </nav>

      {/* 2. HERO PRINCIPAL */}
      <header className="relative h-[65vh] w-full flex items-center px-8 md:px-16 pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=80" 
            alt="Estadio Mundialista" 
            className="w-full h-full object-cover opacity-25 scale-105 animate-[pulse_8s_infinite]"
          />
          {/* Degradado premium estilo streaming */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl mt-8">
          <span className="inline-flex items-center gap-1.5 bg-red-600/10 text-red-500 border border-red-600/25 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
            <Sparkles size={12} className="animate-spin-slow" /> Exclusivo de Mundial Play
          </span>
          <h2 className="text-5xl md:text-7xl font-black mb-4 leading-none tracking-tight mt-4 uppercase">
            EXPLORA LA<br /><span className="text-red-600 italic">HISTORIA</span>
          </h2>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light">
            Filtra, busca y guarda tus momentos favoritos del torneo más grande del planeta. Revive los goles épicos y los documentales oficiales en alta definición.
          </p>
        </div>
      </header>

      {/* 3. CATÁLOGO */}
      <main className="relative z-20 px-6 md:px-12 -mt-12">
        
        {/* Controles de Filtros y Ordenamiento */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-zinc-950/80 p-5 rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl">
          {/* Categorías Dinámicas */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const isActive = currentCategory === cat && !watchlistOnly;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCurrentCategory(cat);
                    setWatchlistOnly(false);
                    setActiveTab(cat === 'Todos' ? 'inicio' : 'catalogo');
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    isActive 
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105" 
                      : "bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {cat === 'Todos' ? 'Todos' : `${cat}s`}
                </button>
              );
            })}
          </div>

          {/* Selector de Ordenamiento */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ordenar:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900 text-white text-xs rounded-lg px-3 py-2 outline-none border border-zinc-800 focus:border-red-600 transition cursor-pointer font-medium"
            >
              <option value="newest">Más Recientes primero</option>
              <option value="oldest">Más Antiguos primero</option>
              <option value="az">Título (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Rejilla de Contenido Principal */}
        <section className="mb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredAndSortedData.map(item => {
              const isFav = watchlist.includes(item.id);
              return (
                <article 
                  key={item.id}
                  onClick={() => handleOpenModal(item)}
                  className="group relative bg-zinc-950/40 rounded-xl overflow-hidden border border-zinc-900/80 cursor-pointer flex flex-col justify-between transition-all duration-300 hover:translate-y-[-6px] hover:scale-[1.02] hover:border-red-600 hover:shadow-[0_10px_25px_-5px_rgba(226,6,19,0.25)] hover:bg-zinc-950"
                >
                  {/* Miniatura */}
                  <div className="relative aspect-video overflow-hidden bg-zinc-900">
                    <img 
                      src={item.thumb} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Overlay al hacer hover en la tarjeta */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-black tracking-wider px-4 py-2 rounded-full transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                        <Play size={12} fill="currentColor" /> REPRODUCIR
                      </span>
                    </div>

                    {/* Categoría Badge */}
                    <span className="absolute top-3 left-3 bg-black/85 backdrop-blur-md text-[9px] text-zinc-300 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-white/5">
                      {item.category}
                    </span>
                  </div>

                  {/* Detalles de la tarjeta */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <h3 className="font-extrabold text-sm text-white group-hover:text-red-500 transition-colors duration-300 line-clamp-1">
                        {item.title}
                      </h3>
                      <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        {item.year}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-3">
                      <span className="text-[11px] text-zinc-400 font-bold flex items-center gap-1">
                        <Star size={11} className="text-amber-500 fill-amber-500" /> {item.rating.toFixed(1)}
                      </span>
                      
                      <button 
                        onClick={(e) => handleToggleWatchlist(e, item.id)}
                        className="text-gray-400 hover:text-red-500 hover:scale-125 transition-all duration-200"
                        title={isFav ? "Quitar de la lista" : "Añadir a la lista"}
                      >
                        <Heart 
                          size={18} 
                          className={isFav ? "text-red-600 fill-red-600" : "text-gray-400 hover:text-red-500"} 
                        />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Estado vacío (Empty State) */}
          {filteredAndSortedData.length === 0 && (
            <div className="col-span-full text-center py-20 flex flex-col items-center justify-center">
              <span className="text-5xl mb-4 animate-bounce">⚽</span>
              <h4 className="text-xl font-bold text-zinc-300">No encontramos resultados</h4>
              <p className="text-zinc-500 text-sm mt-1 max-w-sm">
                Prueba ajustando tus términos de búsqueda o cambiando el filtro seleccionado de categorías.
              </p>
              {watchlistOnly && (
                <button 
                  onClick={handleResetFilters} 
                  className="mt-6 bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-red-700 transition shadow-lg shadow-red-600/20"
                >
                  Ver todo el catálogo
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* 4. MODAL DETALLES */}
      {selectedItem && (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${
          isModalOpen ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Fondo obscuro */}
          <div 
            className="absolute inset-0 bg-black/95 backdrop-blur-sm" 
            onClick={handleCloseModal}
          ></div>
          
          {/* Contenedor del Modal */}
          <div className={`relative bg-zinc-950 w-full max-w-2xl rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl transform transition-all duration-300 ${
            isModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}>
            <div className="relative aspect-video w-full bg-black">
              <img 
                src={selectedItem.thumb} 
                alt={selectedItem.title} 
                className="w-full h-full object-cover opacity-80"
              />
              <button 
                onClick={handleCloseModal} 
                className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white w-9 h-9 flex items-center justify-center rounded-full border border-white/10 hover:border-red-600 transition-colors duration-300 font-bold"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-4 left-6">
                <span className="bg-red-600 text-white font-extrabold px-3 py-1 rounded text-[10px] uppercase tracking-widest">
                  {selectedItem.category}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {selectedItem.title}
                </h2>
                
                <button 
                  onClick={(e) => handleToggleWatchlist(e, selectedItem.id)} 
                  className="bg-zinc-900 border border-zinc-800 text-xs text-white px-4 py-2.5 rounded-full hover:bg-zinc-800 hover:border-red-600 transition-all flex items-center gap-2 font-bold whitespace-nowrap shadow-md"
                >
                  <Heart 
                    size={14} 
                    className={watchlist.includes(selectedItem.id) ? "text-red-600 fill-red-600 animate-pulse" : "text-gray-400"} 
                  />
                  {watchlist.includes(selectedItem.id) ? 'Quitar de la lista' : 'Guardar en mi lista'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs mb-6 text-zinc-400 font-bold border-b border-zinc-900 pb-5">
                <span className="text-emerald-500 flex items-center gap-1">
                  <Calendar size={13} /> {selectedItem.year}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Star size={13} className="text-amber-500 fill-amber-500" /> {selectedItem.rating.toFixed(1)}
                </span>
                <span>•</span>
                <span className="text-zinc-500 flex items-center gap-1 font-normal">
                  <User size={13} /> {selectedItem.narrator}
                </span>
              </div>

              <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-6 font-light">
                {selectedItem.desc}
              </p>

              <button 
                onClick={handleCloseModal} 
                className="w-full bg-white text-black font-extrabold py-3.5 rounded-xl hover:bg-zinc-200 transition-all duration-300 tracking-wide text-xs uppercase"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
