"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Film, 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Clock, 
  FileText, 
  Loader2,
  CheckCircle,
  X
} from "lucide-react";

interface MovieData {
  title: string;
  description: string;
  duration: string;
}

interface ApiError {
  error: string;
  details?: string[];
}

export default function EditMoviePage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [formData, setFormData] = useState<MovieData>({
    title: "",
    description: "",
    duration: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch movie data
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/movies/${id}`);
        const data = await res.json();

        if (!res.ok) {
          const errorData = data as ApiError;
          setError(errorData.error || "Gagal mengambil data film");
          return;
        }

        setFormData({
          title: data.title || "",
          description: data.description || "",
          duration: data.duration || ""
        });
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Gagal mengambil data film");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovie();
    }
  }, [id]);

  const handleInputChange = (field: keyof MovieData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) {
      errors.push("Judul film harus diisi");
    } else if (formData.title.length > 255) {
      errors.push("Judul film maksimal 255 karakter");
    }
    
    if (!formData.description.trim()) {
      errors.push("Deskripsi film harus diisi");
    } else if (formData.description.length > 1000) {
      errors.push("Deskripsi film maksimal 1000 karakter");
    }
    
    if (!formData.duration.trim()) {
      errors.push("Durasi film harus diisi");
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);
    setValidationErrors([]);

    try {
      const res = await fetch(`/api/movies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorData = data as ApiError;
        if (errorData.details) {
          setValidationErrors(errorData.details);
        } else {
          setError(errorData.error || "Gagal memperbarui film");
        }
        return;
      }

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/movies");
      }, 1500);

    } catch (err) {
      console.error("Update error:", err);
      setError("Gagal memperbarui film");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/movies");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xl text-gray-300">Memuat data film...</span>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-800 rounded-3xl p-8 text-center border border-gray-700">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          
          <div className="flex items-center gap-3">
            <Film className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold text-white">Edit Film</h1>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-900 border border-green-700 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-green-300 font-semibold">Film berhasil diperbarui!</p>
              <p className="text-green-400 text-sm">Mengalihkan ke daftar film...</p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Error Messages */}
            {error && (
              <div className="mb-6 bg-red-900 border border-red-700 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-semibold">Terjadi Kesalahan</p>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-6 bg-yellow-900 border border-yellow-700 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 font-semibold mb-2">Data Tidak Valid</p>
                    <ul className="text-yellow-400 text-sm space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <X className="w-3 h-3" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  <Film className="w-4 h-4 inline mr-2" />
                  Judul Film
                </label>
                <input
                  type="text"
                  placeholder="Masukkan judul film..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  maxLength={255}
                  required
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Deskripsi Film
                </label>
                <textarea
                  placeholder="Ceritakan tentang film ini..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                  maxLength={1000}
                  required
                />
              </div>

              {/* Duration Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Durasi Film
                </label>
                <input
                  type="text"
                  placeholder="contoh: 2h 30m, 150 menit, dsb..."
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  maxLength={50}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg"
              >
                <X className="w-5 h-5" />
                Batal
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Perbarui Film
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Pastikan semua informasi sudah benar sebelum menyimpan
          </p>
        </div>
      </div>
    </div>
  );
}