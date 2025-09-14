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

  // Hanya satu deklarasi handleDelete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus film &ldquo;${title}&rdquo;?`)) return;

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
      {/* … sisanya sama persis seperti kode sebelumnya … */}
      {/* Pastikan semua pemanggilan handleDelete menggunakan handleDelete tunggal */}
    </div>
  );
}
