"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Loader2, 
  Film, 
  FileText, 
  Clock, 
  AlertCircle,
  CheckCircle,
  X 
} from "lucide-react";

interface FormData {
  title: string;
  description: string;
  duration: string;
}

interface ApiError {
  error: string;
  details?: string[];
}

export default function NewMoviePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    duration: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
    if (error) {
      setError(null);
    }
  };

  // Fix for ESLint no-explicit-any error: specify type for err in catch block
  // Change catch (err: any) to catch (err: unknown) and handle accordingly
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorData = data as ApiError;
        if (errorData.details) {
          setValidationErrors(errorData.details);
        } else {
          setError(errorData.error || "Gagal menambahkan film");
        }
        return;
      }

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/movies");
      }, 1500);

    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Submit error:", err.message);
        setError("Gagal menambahkan film, periksa koneksi internet");
      } else {
        setError("Gagal menambahkan film, periksa koneksi internet");
      }
    } finally {
      setLoading(false);
    }
  };

  // Remove duplicate handleSubmit function to fix redeclaration error

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

  // Removed duplicate handleSubmit function to fix redeclaration error

  const handleCancel = () => {
    router.push("/dashboard/movies");
  };

  const isFormValid = formData.title.trim() && formData.description.trim() && formData.duration.trim();

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
            <h1 className="text-4xl font-bold text-white">Tambah Film Baru</h1>
          </div>
          <p className="text-gray-400 mt-2">Lengkapi informasi film yang ingin ditambahkan</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-900 border border-green-700 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-green-300 font-semibold">Film berhasil ditambahkan!</p>
              <p className="text-green-400 text-sm">Mengalihkan ke daftar film...</p>
            </div>
          </div>
        )}

        {/* Main Form Card */}
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
                  placeholder="Masukkan judul film yang menarik..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  maxLength={255}
                  required
                />
                <div className="mt-2 flex justify-between text-sm text-gray-400">
                  <span>Judul yang menarik akan lebih mudah ditemukan</span>
                  <span>{formData.title.length}/255</span>
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Deskripsi Film
                </label>
                <textarea
                  placeholder="Ceritakan tentang alur, genre, atau hal menarik dari film ini..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                  maxLength={1000}
                  required
                />
                <div className="mt-2 flex justify-between text-sm text-gray-400">
                  <span>Deskripsi yang detail akan membantu penonton memahami film</span>
                  <span>{formData.description.length}/1000</span>
                </div>
              </div>

              {/* Duration Input */}
              <div>
  <label className="block text-sm font-semibold text-gray-300 mb-3">
    <Clock className="w-4 h-4 inline mr-2" />
    Durasi Film
  </label>
  <input
    type="number"
    placeholder="masukkan durasi mis. 150"
    value={formData.duration}
    onChange={(e) => handleInputChange('duration', e.target.value)}
    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
    maxLength={50}
    required
  /> 
  {/* Menampilkan otomatis 'menit' */}
  {formData.duration && (
    <div className="mt-2 text-sm text-gray-400">
      {formData.duration} menit
    </div>
  )}
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
                disabled={loading || !isFormValid}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Simpan Film
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Pastikan semua informasi sudah benar sebelum menyimpan film
          </p>
        </div>
      </div>
    </div>
  );
}