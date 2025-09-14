import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const movie = await prisma.movie.findUnique({ where: { id: params.id } });
    if (!movie) return NextResponse.json({ error: "Film tidak ditemukan" }, { status: 404 });
    return NextResponse.json(movie);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengambil data film" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, description, duration } = await req.json();
    const movie = await prisma.movie.update({
      where: { id: params.id },
      data: { title, description, duration },
    });
    return NextResponse.json(movie);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal memperbarui film" }, { status: 500 });
  }
}
