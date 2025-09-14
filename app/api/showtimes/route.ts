import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Ambil semua showtimes termasuk data movie dan tiket
    const showtimes = await prisma.showtime.findMany({
      include: {
        movie: true,
        tickets: true, // jika ticket tidak dipakai bisa dihapus
      },
      orderBy: { startTime: "asc" },
    });

    // Pastikan selalu array, walaupun kosong
    return NextResponse.json(Array.isArray(showtimes) ? showtimes : []);
  } catch (err) {
    console.error("Error fetching showtimes:", err);
    // fallback: selalu return array kosong
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { movieId, startTime } = await req.json();

    // Validasi movieId
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie)
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });

    const showtime = await prisma.showtime.create({
      data: {
        movieId,
        startTime: new Date(startTime),
      },
      include: { movie: true }, // supaya front-end bisa langsung akses movie.title
    });

    return NextResponse.json(showtime);
  } catch (err) {
    console.error("Error creating showtime:", err);
    return NextResponse.json({ error: "Failed to create showtime" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, movieId, startTime } = await req.json();

    const updated = await prisma.showtime.update({
      where: { id },
      data: {
        movieId,
        startTime: new Date(startTime),
      },
      include: { movie: true }, // agar front-end tetap dapat movie info
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating showtime:", err);
    return NextResponse.json({ error: "Failed to update showtime" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    await prisma.showtime.delete({ where: { id } });

    return NextResponse.json({ message: "Showtime deleted" });
  } catch (err) {
    console.error("Error deleting showtime:", err);
    return NextResponse.json({ error: "Failed to delete showtime" }, { status: 500 });
  }
}
