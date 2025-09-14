"use client";

import { useState, useEffect } from "react";
import { 
  Film, 
  Clock, 
  Edit,
  Calendar, 
  Plus, 
  Search,
  AlertCircle,
  CheckCircle,
  Trash2,
  X
} from "lucide-react";

interface Movie {
  id: string;
  title: string;
}

interface Showtime {
  id: string;
  movie: Movie;
  startTime: string;
}

export default function ShowtimesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [movieTitle, setMovieTitle] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");

  // State untuk modal dan edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
    fetchShowtimes();
  }, []);

  const fetchMovies = async () => {
    const res = await fetch("/api/movies");
    const data = await res.json();
    setMovies(data);
  };

  const fetchShowtimes = async () => {
    const res = await fetch("/api/showtimes");
    const data = await res.json();
    setShowtimes(data);
  };

  const generateHalfHourSlots = () => {
    const slots: string[] = [];
    for (let h = 10; h <= 21; h++) {
      slots.push(`${h.toString().padStart(2, "0")}:00`);
      slots.push(`${h.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const hours = generateHalfHourSlots();

  const bookedHours = showtimes
    .filter(
      (s) =>
        s.movie.id === selectedMovieId &&
        s.startTime.startsWith(selectedDate) &&
        s.id !== editingId // biar saat edit tidak blok sendiri
    )
    .map((s) => new Date(s.startTime).toTimeString().slice(0, 5));

  const availableHours = hours.filter((h) => !bookedHours.includes(h));

  const showMessage = (message: string, type: 'error' | 'success') => {
    if (type === 'error') {
      setError(message);
      setTimeout(() => setError(""), 4000);
    } else {
      setSuccess(message);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const resetForm = () => {
    setMovieTitle("");
    setSelectedMovieId("");
    setSelectedDate("");
    setSelectedHour("");
    setSuggestions([]);
    setIsEditing(false);
    setEditingId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const addShowtime = async () => {
    if (!selectedMovieId || !selectedDate || !selectedHour) {
      return showMessage("Semua field harus diisi", 'error');
    }

    const startTime = new Date(`${selectedDate}T${selectedHour}:00`);

    if (startTime < new Date()) {
      return showMessage("Tanggal/waktu tidak boleh di masa lalu", 'error');
    }

    const overlapping = showtimes.find(
      (s) =>
        s.movie.id === selectedMovieId &&
        new Date(s.startTime).getTime() === startTime.getTime()
    );

    if (overlapping) {
      return showMessage("Jadwal bentrok dengan showtime lain", 'error');
    }

    setLoading(true);
    try {
      await fetch("/api/showtimes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: selectedMovieId, startTime }),
      });

      closeModal();
      fetchShowtimes();
      showMessage("Jadwal tayang berhasil ditambahkan", 'success');
    } catch (err) {
      showMessage("Gagal menambah jadwal tayang", 'error');
    } finally {
      setLoading(false);
    }
  };

  const startEditShowtime = (s: Showtime) => {
    setIsEditing(true);
    setEditingId(s.id);
    setMovieTitle(s.movie.title);
    setSelectedMovieId(s.movie.id);
    setSelectedDate(new Date(s.startTime).toISOString().slice(0, 10));
    setSelectedHour(new Date(s.startTime).toTimeString().slice(0, 5));
    setIsModalOpen(true);
  };

  const saveEditedShowtime = async () => {
    if (!selectedMovieId || !selectedDate || !selectedHour) {
      return showMessage("Semua field harus diisi", 'error');
    }

    const startTime = new Date(`${selectedDate}T${selectedHour}:00`);

    if (startTime < new Date()) {
      return showMessage("Tanggal/waktu tidak boleh di masa lalu", 'error');
    }

    const overlapping = showtimes.find(
      (s) =>
        s.id !== editingId &&
        s.movie.id === selectedMovieId &&
        new Date(s.startTime).getTime() === startTime.getTime()
    );

    if (overlapping) {
      return showMessage("Jadwal bentrok dengan showtime lain", 'error');
    }

    setLoading(true);
    try {
      await fetch("/api/showtimes", {
        method: "PUT", // PUT untuk update
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, movieId: selectedMovieId, startTime }),
      });

      closeModal();
      fetchShowtimes();
      showMessage("Jadwal tayang berhasil diperbarui", 'success');
    } catch {
      showMessage("Gagal memperbarui jadwal tayang", 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteShowtime = async (id: string) => {
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;

    try {
      await fetch("/api/showtimes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchShowtimes();
      showMessage("Jadwal berhasil dihapus", "success");
    } catch {
      showMessage("Gagal menghapus jadwal", "error");
    }
  };

  const isFormValid = selectedMovieId && selectedDate && selectedHour;

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Jadwal Tayang</h1>
                <p className="text-slate-400 mt-1">Kelola jadwal tayang film bioskop</p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Tambah Jadwal
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300">{success}</p>
          </div>
        )}

        {/* Showtimes List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Film className="w-5 h-5 text-blue-400" />
              Daftar Jadwal Tayang
              <span className="text-sm font-normal text-slate-400">({showtimes.length} jadwal)</span>
            </h2>
          </div>
          
          {showtimes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-6 bg-slate-700/30 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-12 h-12 text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg mb-2">Belum ada jadwal tayang</p>
              <p className="text-slate-500 text-sm">Tambahkan jadwal baru untuk memulai</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {showtimes
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((s) => (
                <div key={s.id} className="p-6 hover:bg-slate-700/30 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                        <Film className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">{s.movie.title}</h3>
                        <div className="flex items-center gap-4 text-slate-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium bg-slate-600/40 px-3 py-1 rounded-full">
                              {new Date(s.startTime).toLocaleDateString('id-ID', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-bold bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                              {new Date(s.startTime).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditShowtime(s)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                        title="Edit jadwal"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteShowtime(s.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                        title="Hapus jadwal"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Popup */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 w-full max-w-2xl shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  {isEditing ? <Edit className="w-5 h-5 text-blue-400" /> : <Plus className="w-5 h-5 text-blue-400" />}
                  {isEditing ? "Edit Jadwal" : "Tambah Jadwal Baru"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Movie Search */}
                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Film
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        placeholder="Cari film..."
                        value={movieTitle}
                        onChange={(e) => {
                          setMovieTitle(e.target.value);
                          setSuggestions(
                            movies.filter((m) =>
                              m.title.toLowerCase().includes(e.target.value.toLowerCase())
                            )
                          );
                        }}
                      />
                    </div>

                    {suggestions.length > 0 && movieTitle && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-xl max-h-40 overflow-auto z-50 shadow-lg">
                        {suggestions.map((m) => (
                          <div
                            key={m.id}
                            className="p-3 hover:bg-slate-600 cursor-pointer text-white border-b border-slate-600 last:border-b-0 transition-colors"
                            onClick={() => {
                              setMovieTitle(m.title);
                              setSelectedMovieId(m.id);
                              setSuggestions([]);
                            }}
                          >
                            {m.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date Picker */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tanggal
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        value={selectedDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Time Picker */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Waktu
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <select
                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none"
                        value={selectedHour}
                        onChange={(e) => setSelectedHour(e.target.value)}
                      >
                        <option value="">Pilih jam</option>
                        {availableHours.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl font-medium transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={isEditing ? saveEditedShowtime : addShowtime}
                    disabled={loading || !isFormValid}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                  >
                    {isEditing ? (
                      <>
                        <Clock className="w-5 h-5" />
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        {loading ? "Menyimpan..." : "Tambah Jadwal"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}