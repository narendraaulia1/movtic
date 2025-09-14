import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET movie by ID
export async function GET(req: NextRequest, context: any) {
  try {
    const { id } = context.params;
    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie)
      return NextResponse.json({ error: "Film tidak ditemukan" }, { status: 404 });
    return NextResponse.json(movie);
  } catch (err) {
    const error = err instanceof Error ? err.message : "Gagal mengambil data film";
    return NextResponse.json({ error }, { status: 500 });
  }
}

// PUT movie by ID
export async function PUT(req: NextRequest, context: any) {
  try {
    const { id } = context.params;
    const { title, description, duration } = await req.json();
    const movie = await prisma.movie.update({
      where: { id },
      data: { title, description, duration },
    });
    return NextResponse.json(movie);
  } catch (err) {
    const error = err instanceof Error ? err.message : "Gagal memperbarui film";
    return NextResponse.json({ error }, { status: 500 });
  }
}
