"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, Film, Clock, FileText, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  description: string;
  duration: string;
}

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchMovies = async () => {
    try {
      const res = await fetch("/api/movies");
      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setMovies(data);
    } catch (err) {
      console.error("Gagal mengambil data film:", err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus film "${title}"?`)) return;

    try {
      const res = await fetch(`/api/movies?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setMovies((prev) => prev.filter((movie) => movie.id !== id));
    } catch (err) {
      console.error("Gagal menghapus film:", err);
      alert("Gagal menghapus film, coba lagi.");
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Filter dan pagination logic
  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovies = filteredMovies.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-300">Memuat data film...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Film className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">Daftar Film</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari film..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            
            {/* Add Movie Button */}
            <button
              onClick={() => router.push("movies/new")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              <Plus className="w-4 h-4" />
              Tambah Film
            </button>
          </div>
        </div>

        {/* Movies List */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Daftar Film ({filteredMovies.length})
            </h2>
            {searchTerm && (
              <span className="text-sm text-gray-400">
                Hasil pencarian "{searchTerm}"
              </span>
            )}
          </div>

          {/* Empty State */}
          {filteredMovies.length === 0 ? (
            <div className="p-8 text-center">
              <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                {searchTerm ? "Film tidak ditemukan" : "Belum ada film"}
              </h3>
              <p className="text-gray-500 mb-4 text-sm">
                {searchTerm 
                  ? `Tidak ada film yang cocok dengan "${searchTerm}"`
                  : "Mulai tambahkan film pertama Anda"
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push("/movies/new")}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Film Pertama
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Movies List */}
              <div className="divide-y divide-gray-700">
                {paginatedMovies.map((movie, index) => (
                  <div
                    key={movie.id}
                    className="p-4 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Movie Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-gray-700 rounded-full text-gray-300 text-sm font-medium">
                            {startIndex + index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Film className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              <h3 className="text-white font-semibold text-sm truncate">
                                {movie.title}
                              </h3>
                            </div>
                            <div className="flex items-start gap-2 mb-2">
                              <FileText className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed">
                                {movie.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-400 text-xs">
                                {movie.duration} menit
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => router.push(`movies/${movie.id}/edit`)}
                          className="inline-flex items-center justify-center gap-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-medium text-xs transition-all duration-300 hover:shadow-lg"
                          title="Edit Film"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(movie.id, movie.title)}
                          className="inline-flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium text-xs transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
                          title="Hapus Film"
                        >
                          <Trash2 className="w-3 h-3" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredMovies.length)} dari {filteredMovies.length} film
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {getVisiblePages().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && goToPage(page)}
                        disabled={page === '...'}
                        className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : page === '...'
                            ? 'text-gray-400 cursor-default'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}