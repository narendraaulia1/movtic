import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        showtime: {
          include: { movie: true },
        },
      },
      orderBy: { seat: "asc" }, // optional, urut berdasarkan kursi
    });

    // selalu kembalikan array
    return NextResponse.json(Array.isArray(tickets) ? tickets : []);
  } catch (err) {
    console.error("Error GET /tickets:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { showtimeId, seat, price } = await req.json();

    if (!showtimeId || !seat || !price) {
      return NextResponse.json(
        { error: "showtimeId, seat, dan price wajib diisi" },
        { status: 400 }
      );
    }

    // Pastikan seat belum ada untuk showtime ini
    const existing = await prisma.ticket.findFirst({
      where: { showtimeId, seat },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Kursi ${seat} untuk showtime ini sudah ada` },
        { status: 400 }
      );
    }

    // Buat tiket baru
    const ticket = await prisma.ticket.create({
      data: {
        showtimeId,
        seat,
        price: parseFloat(price),
        isSold: false, // tiket baru selalu tersedia
      },
      include: {
        showtime: {
          include: {
            movie: true,
          },
        },
      },
    });

    return NextResponse.json(ticket);
  } catch (err) {
    console.error("Error POST /tickets:", err);
    return NextResponse.json(
      { error: "Gagal menambahkan tiket" },
      { status: 500 }
    );
  }
}


export async function PUT(req: Request) {
  try {
    const { id, showtimeId, seat, price } = await req.json();

    if (!id || !showtimeId || !seat || !price) {
      return NextResponse.json(
        { error: "id, showtimeId, seat, dan price wajib diisi" },
        { status: 400 }
      );
    }

    // Pastikan kursi belum ada di showtime lain (kecuali tiket ini sendiri)
    const existing = await prisma.ticket.findFirst({
      where: {
        showtimeId,
        seat,
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Kursi ${seat} untuk showtime ini sudah ada` },
        { status: 400 }
      );
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        showtimeId,
        seat,
        price: parseFloat(price),
      },
      include: {
        showtime: { include: { movie: true } },
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (err) {
    console.error("Error PUT /tickets:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui tiket" },
      { status: 500 }
    );
  }
}
