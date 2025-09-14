import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: "desc" }, // urut dari terbaru
    });
    return NextResponse.json(movies);
  } catch (err) {
    console.error("Gagal fetch movies:", err);
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, duration } = body;

    if (!title || !description || !duration) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        duration,
      },
    });

    return NextResponse.json(movie);
  } catch (err) {
    console.error("Gagal menambahkan film:", err);
    return NextResponse.json({ error: "Gagal menambahkan film" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });

    await prisma.movie.delete({ where: { id } });
    return NextResponse.json({ message: "Movie deleted" });
  } catch (err) {
    console.error("Gagal menghapus film:", err);
    return NextResponse.json({ error: "Failed to delete movie" }, { status: 500 });
  }
}
