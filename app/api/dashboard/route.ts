import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const moviesCount = await prisma.movie.count()
    const showtimesCount = await prisma.showtime.count()
    const ticketsCount = await prisma.ticket.count()
    const transactionsCount = await prisma.transaction.count()
    const usersCount = await prisma.user.count()

    // Hitung range hari ini (00:00 - 23:59)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Ambil showtimes hari ini
    const todayShowtimes = await prisma.showtime.findMany({
      where: {
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        movie: true,
      },
      orderBy: {
        startTime: "asc",
      },
    })

    return NextResponse.json({
      moviesCount,
      showtimesCount,
      ticketsCount,
      transactionsCount,
      usersCount,
      todayShowtimes,
    })
  } catch (err) {
    console.error("Error fetch dashboard data:", err)
    return NextResponse.json({ error: "Gagal ambil data dashboard" }, { status: 500 })
  }
}
