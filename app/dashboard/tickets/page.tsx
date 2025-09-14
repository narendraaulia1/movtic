"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Film, 
  Users, 
  Plus, 
  Pencil,
  Clock,
  MapPin,
  Coins,
  Search,
  Armchair,
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

interface Ticket {
  id: string;
  seat: string;
  price: number;
  showtime: Showtime;
  transactionId?: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form tambah tiket
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShowtime, setNewShowtime] = useState("");
  const [newSeat, setNewSeat] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [showtimeQuery, setShowtimeQuery] = useState("");
  const [filteredShowtimes, setFilteredShowtimes] = useState<Showtime[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Form edit tiket
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editQuery, setEditQuery] = useState("");
  const [filteredEditShowtimes, setFilteredEditShowtimes] = useState<Showtime[]>([]);
  const [showEditDropdown, setShowEditDropdown] = useState(false);

  // Refs for handling clicks outside
  const addDropdownRef = useRef<HTMLDivElement>(null);
  const editDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
    fetchShowtimes();
  }, []);

  useEffect(() => {
    const filtered = showtimes.filter((s) =>
      s.movie.title.toLowerCase().includes(showtimeQuery.toLowerCase())
    );
    setFilteredShowtimes(filtered);
    setShowDropdown(showtimeQuery.length > 0 && filtered.length > 0);
  }, [showtimeQuery, showtimes]);

  useEffect(() => {
    const filtered = showtimes.filter((s) =>
      s.movie.title.toLowerCase().includes(editQuery.toLowerCase())
    );
    setFilteredEditShowtimes(filtered);
    setShowEditDropdown(editQuery.length > 0 && filtered.length > 0);
  }, [editQuery, showtimes]);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addDropdownRef.current && !addDropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (editDropdownRef.current && !editDropdownRef.current.contains(event.target as Node)) {
        setShowEditDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      setTickets(data);
    } catch {
      setError("Gagal mengambil data tiket");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimes = async () => {
    try {
      const res = await fetch("/api/showtimes");
      const data = await res.json();
      setShowtimes(Array.isArray(data) ? data : []);
    } catch {
      setError("Gagal mengambil data showtime");
      setTimeout(() => setError(""), 3000);
    }
  };

  const resetAddForm = () => {
    setNewSeat("");
    setNewPrice("");
    setNewShowtime("");
    setShowtimeQuery("");
    setShowDropdown(false);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetAddForm();
  };

  const addTicket = async () => {
    if (!newShowtime || !newSeat || !newPrice) {
      setError("Lengkapi semua field");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId: newShowtime,
          seat: newSeat,
          price: parseFloat(newPrice),
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setTimeout(() => setError(""), 3000);
      } else {
        setSuccess("Tiket berhasil ditambahkan");
        setTimeout(() => setSuccess(""), 3000);
        closeAddModal();
        fetchTickets();
      }
    } catch {
      setError("Gagal menambahkan tiket");
      setTimeout(() => setError(""), 3000);
    }
  };

  const deleteTicket = async (id: string) => {
    if (!confirm("Yakin ingin menghapus tiket ini?")) return;
    try {
      await fetch("/api/tickets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setSuccess("Tiket berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
      fetchTickets();
    } catch {
      setError("Gagal menghapus tiket");
      setTimeout(() => setError(""), 3000);
    }
  };

  const updateTicket = async () => {
    if (!editingTicket) return;
    const { id, showtime, seat, price } = editingTicket;

    try {
      const res = await fetch("/api/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          showtimeId: showtime.id,
          seat,
          price,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setTimeout(() => setError(""), 3000);
      } else {
        setSuccess("Tiket berhasil diperbarui");
        setTimeout(() => setSuccess(""), 3000);
        setEditingTicket(null);
        setEditQuery("");
        setShowEditDropdown(false);
        fetchTickets();
      }
    } catch {
      setError("Gagal memperbarui tiket");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleAddShowtimeSelect = (showtime: Showtime) => {
    setNewShowtime(showtime.id);
    setShowtimeQuery(showtime.movie.title);
    setShowDropdown(false);
  };

  const handleEditShowtimeSelect = (showtime: Showtime) => {
    if (editingTicket) {
      setEditingTicket({ ...editingTicket, showtime });
      setEditQuery(showtime.movie.title);
      setShowEditDropdown(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Film className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Manajemen Tiket</h1>
                <p className="text-slate-400 mt-1">Kelola tiket bioskop dan jadwal tayang</p>
              </div>
            </div>
            {/* Tombol Tambah Tiket */}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Tambah Tiket
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

        {/* Ticket List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-400" />
              Daftar Tiket
              <span className="text-sm font-normal text-slate-400">({tickets.length} tiket)</span>
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-slate-400">Memuat tiket...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-6 bg-slate-700/30 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg mb-2">Belum ada tiket</p>
              <p className="text-slate-500 text-sm">Tambahkan tiket baru untuk memulai</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-6 hover:bg-slate-700/30 transition-all duration-200 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                        <Film className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-2">
                          {ticket.showtime.movie.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatDateTime(ticket.showtime.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Armchair className="w-4 h-4" />
                            <span>{ticket.seat} kursi</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-400 font-medium">
                            <span>{formatCurrency(ticket.price)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTicket(ticket);
                          setEditQuery(ticket.showtime.movie.title);
                          setShowEditDropdown(false);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200 group/edit"
                        title="Edit tiket"
                      >
                        <Pencil className="w-5 h-5 group-hover/edit:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group/delete"
                        title="Hapus tiket"
                      >
                        <Trash2 className="w-5 h-5 group-hover/delete:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Tambah Tiket */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  <Plus className="w-5 h-5 text-green-400" />
                  Tambah Tiket Baru
                </h2>
                <button
                  onClick={closeAddModal}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Showtime Selector */}
                <div className="relative" ref={addDropdownRef}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Film & Jadwal
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari judul film..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      value={showtimeQuery}
                      onChange={(e) => setShowtimeQuery(e.target.value)}
                      onFocus={() => showtimeQuery && setShowDropdown(true)}
                    />
                  </div>

                  {showDropdown && filteredShowtimes.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-xl max-h-60 overflow-auto z-50 shadow-lg">
                      {filteredShowtimes.map((s) => (
                        <div
                          key={s.id}
                          className="p-4 hover:bg-slate-600 cursor-pointer text-white border-b border-slate-600 last:border-b-0 transition-colors"
                          onClick={() => handleAddShowtimeSelect(s)}
                        >
                          <div className="font-medium text-sm">{s.movie.title}</div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(s.startTime)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seat Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Jumlah Kursi
                  </label>
                  <div className="relative">
                    <Armchair className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Contoh: 50"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      value={newSeat}
                      onChange={(e) => setNewSeat(e.target.value)}
                    />
                  </div>
                </div>

                {/* Price Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Harga Tiket
                  </label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" /> 
                    <input
                      type="number"
                      placeholder="35000"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={addTicket}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Tiket
                </button>
                <button
                  onClick={closeAddModal}
                  className="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  <X className="w-4 h-4" />
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Edit Tiket */}
        {editingTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  <Pencil className="w-5 h-5 text-blue-400" />
                  Edit Tiket
                </h2>
                <button
                  onClick={() => {
                    setEditingTicket(null);
                    setEditQuery("");
                    setShowEditDropdown(false);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Edit Showtime Selector */}
                <div className="relative" ref={editDropdownRef}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Film & Jadwal
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari judul film..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      value={editQuery}
                      onChange={(e) => setEditQuery(e.target.value)}
                      onFocus={() => editQuery && setShowEditDropdown(true)}
                    />
                  </div>

                  {showEditDropdown && filteredEditShowtimes.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-xl max-h-60 overflow-auto shadow-lg" style={{ zIndex: 9999 }}>
                      {filteredEditShowtimes.map((s) => (
                        <div
                          key={s.id}
                          className="p-4 hover:bg-slate-600 cursor-pointer text-white border-b border-slate-600 last:border-b-0 transition-colors"
                          onClick={() => handleEditShowtimeSelect(s)}
                        >
                          <div className="font-medium text-sm">{s.movie.title}</div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(s.startTime)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Edit Seat */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Jumlah Kursi
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      value={editingTicket.seat}
                      onChange={(e) =>
                        setEditingTicket({ ...editingTicket, seat: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Edit Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Harga Tiket
                  </label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="number"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      value={editingTicket.price}
                      onChange={(e) =>
                        setEditingTicket({ ...editingTicket, price: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={updateTicket}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
                >
                  <CheckCircle className="w-4 h-4" />
                  Simpan Perubahan
                </button>
                <button
                  onClick={() => {
                    setEditingTicket(null);
                    setEditQuery("");
                    setShowEditDropdown(false);
                  }}
                  className="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  <X className="w-4 h-4" />
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}