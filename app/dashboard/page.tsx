"use client"

import { useEffect, useState } from "react"
import { Clapperboard, Clock, Ticket, Receipt, Users, TrendingUp, Calendar, Star } from "lucide-react"

// Tambahkan interface tipe data dashboard
interface Showtime {
  id: string
  movie: {
    title: string
    genre?: string
  }
  startTime: string
}

interface DashboardData {
  moviesCount: number
  showtimesCount: number
  ticketsCount: number
  transactionsCount: number
  usersCount: number
  todayShowtimes: Showtime[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null) // kasih tipe null atau DashboardData
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard")
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded-lg w-64 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800/50 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-6 bg-gray-800 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-800/50 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Failed to load dashboard data</p>
        </div>
      </div>
    )
  }

  const items = [
    { 
      title: "Film", 
      value: data.moviesCount || 0, 
      icon: Clapperboard, 
      color: "from-purple-500 to-indigo-600",
      trend: "+12%",
      description: "Total film tersedia"
    },
    { 
      title: "Jadwal", 
      value: data.showtimesCount || 0, 
      icon: Clock, 
      color: "from-blue-500 to-cyan-600",
      trend: "+8%",
      description: "Jadwal tayang aktif"
    },
    { 
      title: "Tiket", 
      value: data.ticketsCount || 0, 
      icon: Ticket, 
      color: "from-green-500 to-emerald-600",
      trend: "+24%",
      description: "Tiket terjual"
    },
    { 
      title: "Transaksi", 
      value: data.transactionsCount || 0, 
      icon: Receipt, 
      color: "from-orange-500 to-red-600",
      trend: "+15%",
      description: "Total transaksi"
    },
    { 
      title: "Pengguna", 
      value: data.usersCount || 0, 
      icon: Users, 
      color: "from-pink-500 to-rose-600",
      trend: "+6%",
      description: "User terdaftar"
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Dashboard Bioskop
            </h1>
          </div>
          <p className="text-gray-400">Kelola dan monitor sistem bioskop Anda</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          {items.map((item) => (
            <div
              key={item.title}
              className="group bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-lg hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`}></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {item.trend}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{item.value.toLocaleString()}</h2>
                  <p className="text-gray-400 text-sm font-medium">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Film Tayang Hari Ini */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Tayang Hari Ini</h2>
              <p className="text-gray-400">Film yang sedang tayang hari ini</p>
            </div>
          </div>

          {!data.todayShowtimes || data.todayShowtimes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clapperboard className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 text-lg">Tidak ada film yang tayang hari ini</p>
              <p className="text-gray-500 text-sm mt-1">Tambahkan jadwal tayang untuk melihat film disini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.todayShowtimes.map((show: Showtime) => ( // <--- tambahkan tipe Showtime
                <div
                  key={show.id}
                  className="group bg-gray-800/60 border border-gray-700/40 rounded-2xl p-6 shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-400">Now Playing</span>
                      </div>
                      <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                        <Clock className="w-3 h-3 text-white inline mr-1" />
                        <span className="text-xs text-white font-medium">
                          {new Date(show.startTime).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                        {show.movie.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(show.startTime).toLocaleDateString("id-ID", {
                              weekday: "short",
                              day: "numeric",
                              month: "short"
                            })}
                          </span>
                        </div>
                        {show.movie.genre && (
                          <div className="px-2 py-1 bg-gray-700/50 rounded-lg text-xs">
                            {show.movie.genre}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
