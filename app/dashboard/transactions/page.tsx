"use client";

import { useState, useEffect } from "react";
import { 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Film, 
  Users, 
  Plus, 
  Phone,
  User,
  Armchair,
  CreditCard,
  Clock,
  Calendar,
  Coins,
  ChevronLeft,
  ChevronRight,
  Receipt,
  X,
  ShoppingCart
} from "lucide-react";

interface Movie {
  id: string;
  title: string;
}

interface Showtime {
  id: string;
  movie: Movie;
  startTime: string; // ISO string
}

interface Ticket {
  id: string;
  showtime: Showtime;
  price: number;
  seat: string; // dari DB string
}

interface Member {
  id: string;
  name: string;
  phone?: string;
}

interface Transaction {
  id: string;
  customerName?: string;
  customerPhone?: string;
  showtime: Showtime;
  seats: number;
  totalPrice: number;
  paymentMethod: "CASH" | "DEBIT";
  status: "completed" | "cancelled";
  createdAt: string;
}

export default function TransactionsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [seats, setSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "debit">("cash");

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await fetchTransactions();
    await fetchTickets();
    await fetchShowtimes();
    await fetchMembers();
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      const data: Ticket[] = await res.json();
      setTickets(data);
    } catch {
      setError("Gagal mengambil tiket");
      setTimeout(() => setError(""), 3000);
    }
  };

  const fetchShowtimes = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch("/api/showtimes");
      const data: Showtime[] = await res.json();
      setShowtimes(data.filter((s) => s.startTime.slice(0, 10) === today));
    } catch {
      setError("Gagal mengambil showtime");
      setTimeout(() => setError(""), 3000);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/users");
      const data: Member[] = await res.json();
      setMembers(data);
    } catch {
      setError("Gagal mengambil data member");
      setTimeout(() => setError(""), 3000);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions");
      const result = await res.json();
      setTransactions(result.data || []);
    } catch {
      setError("Gagal mengambil transaksi");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (phone: string) => {
    setCustomerPhone(phone);
    const member = members.find((m) => m.phone === phone);
    setCustomerName(member ? member.name : "");
  };

  const totalPrice = selectedShowtime
    ? seats * (tickets.find((t) => t.showtime.id === selectedShowtime.id)?.price || 0)
    : 0;

  const resetForm = () => {
    setSeats(1);
    setCustomerName("");
    setCustomerPhone("");
    setSelectedShowtime(null);
    setPaymentMethod("cash");
  };

  const addTransaction = async () => {
    if (!selectedShowtime) {
      setError("Pilih showtime terlebih dahulu");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    if (seats < 1 || seats > 6) {
      setError("Jumlah kursi harus antara 1-6");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const ticket = tickets.find((t) => t.showtime.id === selectedShowtime.id);
    if (!ticket) {
      setError("Tiket tidak ditemukan");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const totalSeats = Number(ticket.seat);
    const bookedSeats = transactions
      .filter((tr) => tr.showtime.id === selectedShowtime.id && tr.status === "completed")
      .reduce((sum, tr) => sum + tr.seats, 0);

    if (bookedSeats + seats > totalSeats) {
      setError("Kursi tidak cukup tersedia");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          showtimeId: selectedShowtime.id,
          seats,
          total: totalPrice,
          paymentType: paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setTimeout(() => setError(""), 3000);
      } else {
        setSuccess("Transaksi berhasil ditambahkan");
        setTimeout(() => setSuccess(""), 3000);
        resetForm();
        setShowPopup(false);
        fetchAll();
      }
    } catch {
      setError("Gagal menambahkan transaksi");
      setTimeout(() => setError(""), 3000);
    }
  };

  const cancelTransaction = async (id: string) => {
    if (!confirm("Yakin ingin membatalkan transaksi ini?")) return;
    try {
      await fetch("/api/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "cancelled" }),
      });
      setSuccess("Transaksi berhasil dibatalkan");
      setTimeout(() => setSuccess(""), 3000);
      fetchAll();
    } catch {
      setError("Gagal membatalkan transaksi");
      setTimeout(() => setError(""), 3000);
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
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'cancelled':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    return method.toLowerCase() === 'cash' ? Coins : CreditCard;
  };

  const totalPages = Math.ceil(transactions.length / perPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm">
                <Receipt className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Kasir</h1>
                <p className="text-slate-400 mt-1">Kelola penjualan tiket bioskop</p>
              </div>
            </div>
            
            {/* Tombol Transaksi Baru */}
            <button
              onClick={() => setShowPopup(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Transaksi Baru
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300">{success}</p>
            <button onClick={() => setSuccess("")} className="ml-auto text-green-400 hover:text-green-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* History Transaksi */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                Riwayat Transaksi
                <span className="text-sm font-normal text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
                  {transactions.length} transaksi
                </span>
              </h2>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage > totalPages - 3) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 text-sm rounded-lg transition-all ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-slate-400">Memuat transaksi...</p>
            </div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-6 bg-slate-700/30 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Receipt className="w-12 h-12 text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg mb-2">Belum ada transaksi</p>
              <p className="text-slate-500 text-sm">Transaksi baru akan muncul di sini</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/30">
              {paginatedTransactions.map((tr) => {
                const PaymentIcon = getPaymentMethodIcon(tr.paymentMethod);
                return (
                  <div
                    key={tr.id}
                    className="p-4 hover:bg-slate-700/20 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Movie Icon */}
                        <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors flex-shrink-0">
                          <Film className="w-4 h-4 text-blue-400" />
                        </div>
                        
                        {/* Movie Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-medium text-sm truncate">{tr.showtime.movie.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(tr.status)}`}>
                              {tr.status.toUpperCase() === 'COMPLETED' ? 'SELESAI' : 'BATAL'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(tr.showtime.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Armchair className="w-3 h-3" />
                              <span>{tr.seats} kursi</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(tr.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                            </div>
                          </div>
                          
                          {(tr.customerName || tr.customerPhone) && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-300">
                              <User className="w-3 h-3" />
                              <span className="truncate">
                                {tr.customerName} {tr.customerPhone && `(${tr.customerPhone})`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-green-400 font-medium text-sm">
                            <PaymentIcon className="w-3 h-3" />
                            <span>{formatCurrency(tr.totalPrice)}</span>
                          </div>
                          <div className="text-xs text-slate-400">{tr.paymentMethod}</div>
                        </div>
                        
                        {tr.status === "completed" && (
                          <button
                            onClick={() => cancelTransaction(tr.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group/delete"
                            title="Batalkan transaksi"
                          >
                            <Trash2 className="w-4 h-4 group-hover/delete:scale-110 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                  Transaksi Baru
                </h2>
                <button
                  onClick={() => {
                    setShowPopup(false);
                    resetForm();
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              {/* Showtime Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Pilih Jadwal Hari Ini
                </label>
                <div className="relative">
                  <Film className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none"
                    value={selectedShowtime?.id || ""}
                    onChange={(e) => {
                      const s = showtimes.find((s) => s.id === e.target.value) || null;
                      setSelectedShowtime(s);
                    }}
                  >
                    <option value="">-- Pilih Jadwal --</option>
                    {showtimes.map((s) => {
                      const ticket = tickets.find((t) => t.showtime.id === s.id);
                      const totalSeats = ticket ? Number(ticket.seat) : 0;

                      const bookedSeats = transactions
                        .filter((tr) => tr.showtime.id === s.id && tr.status === "completed")
                        .reduce((sum, tr) => sum + tr.seats, 0);

                      const isFull = bookedSeats >= totalSeats;
                      const startDate = new Date(s.startTime);
                      const timeStr = startDate.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <option key={s.id} value={s.id} disabled={isFull}>
                          {s.movie.title} ({timeStr}) | {bookedSeats}/{totalSeats} kursi
                          {isFull ? " - PENUH" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nomor Telepon (Opsional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="08XXXXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                  />
                </div>
                {customerName && (
                  <div className="mt-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2 text-blue-300 text-sm">
                      <User className="w-4 h-4" />
                      <span>Member: {customerName}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Seats and Payment in row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Seats */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Jumlah Kursi
                  </label>
                  <div className="relative">
                    <Armchair className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="number"
                      placeholder="1"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      value={seats}
                      min={1}
                      max={6}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSeats(isNaN(val) ? 1 : Math.max(1, Math.min(6, val)));
                      }}
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Pembayaran
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as "cash" | "debit")}
                    >
                      <option value="cash">Cash</option>
                      <option value="debit">Debit Card</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Total Price */}
              {totalPrice > 0 && (
                <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Total Harga:</span>
                    <span className="text-green-400 font-bold text-2xl">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={addTransaction}
                  disabled={!selectedShowtime || totalPrice === 0}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-600 disabled:to-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                >
                  <CheckCircle className="w-4 h-4" />
                  Proses Transaksi
                </button>
                <button
                  onClick={() => {
                    setShowPopup(false);
                    resetForm();
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-medium transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}