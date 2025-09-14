"use client";

import { useState, useEffect } from "react";
import { Trash2, CheckCircle, AlertCircle, User, X, Search, Filter, Edit3, UserPlus, Mail, Phone, Shield, Users, Calendar } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "MEMBER" | "ADMIN";
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "MEMBER" | "ADMIN">("ALL");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");

  const [editingUser, setEditingUser] = useState<User | null>(null); // NEW

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter !== "ALL") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data: User[] = await res.json();
      setUsers(data);
    } catch {
      setError("Gagal mengambil data user");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  // General function for Add / Edit
  const saveUser = async () => {
    if (!name || !email) {
      setError("Nama dan email wajib diisi");
      setTimeout(() => setError(""), 5000);
      return;
    }

    try {
      const method = editingUser ? "PUT" : "POST";
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, role }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setTimeout(() => setError(""), 5000);
      } else {
        setSuccess(editingUser ? "User berhasil diperbarui" : "User berhasil ditambahkan");
        setTimeout(() => setSuccess(""), 5000);
        setShowPopup(false);
        setEditingUser(null);
        resetForm();
        fetchUsers();
      }
    } catch {
      setError(editingUser ? "Gagal memperbarui user" : "Gagal menambahkan user");
      setTimeout(() => setError(""), 5000);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      setSuccess("User berhasil dihapus");
      setTimeout(() => setSuccess(""), 5000);
      fetchUsers();
    } catch {
      setError("Gagal menghapus user");
      setTimeout(() => setError(""), 5000);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    setRole(user.role);
    setShowPopup(true);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRole("MEMBER");
    setEditingUser(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' 
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
      : 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  };

  const getRoleIcon = (role: string) => {
    return role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />;
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Add Button */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              Manajemen User
            </h1>
            <p className="text-gray-400 mt-2">Kelola pengguna sistem dengan mudah dan efisien</p>
          </div>
          
          <button
            onClick={() => { resetForm(); setShowPopup(true); }}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
            Tambah User
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "ALL" | "MEMBER" | "ADMIN")}
              className="pl-10 pr-4 py-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">Semua Role</option>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        {(error || success) && (
          <div className={`p-4 rounded-xl border ${error ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-green-500/20 border-green-500/30 text-green-300'} flex items-center gap-3`}>
            {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            {error || success}
          </div>
        )}

        {/* Users Grid */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-gray-400">Memuat data user...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-16 text-center text-gray-400">Belum ada user</div>
          ) : (
            <div className="divide-y divide-gray-700/30">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-6 hover:bg-gray-700/20 transition-all duration-200 group flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{user.name}</p>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Phone className="w-4 h-4" />
                          {user.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(user.createdAt)}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-blue-400 rounded-lg">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteUser(user.id)} className="p-2 text-gray-400 hover:text-red-400 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                {editingUser ? "Edit User" : "Tambah User Baru"}
              </h2>
              <button onClick={() => { setShowPopup(false); resetForm(); }} className="p-2 text-gray-400 hover:text-white rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Nama Lengkap</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Nomor Telepon (Opsional)</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Role Pengguna</label>
                <select value={role} onChange={e => setRole(e.target.value as "MEMBER" | "ADMIN")} className="w-full px-4 py-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50">
                  <option value="MEMBER">Member - Akses Terbatas</option>
                  <option value="ADMIN">Admin - Akses Penuh</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => { setShowPopup(false); resetForm(); }} className="flex-1 px-4 py-3 bg-gray-700/50 text-gray-300 rounded-xl">Batal</button>
                <button onClick={saveUser} className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {editingUser ? "Simpan Perubahan" : "Tambah User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
