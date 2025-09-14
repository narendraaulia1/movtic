import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client"; // Import enum dari Prisma Client

// GET: fetch transaksi dengan pagination
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 15;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: today, lt: tomorrow } },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    include: { showtime: { include: { movie: true } } },
  });

  const total = await prisma.transaction.count({
    where: { createdAt: { gte: today, lt: tomorrow } },
  });

  return NextResponse.json({ data: transactions, total, page, pageSize });
}

// POST: tambah transaksi
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { showtimeId, seats, total, paymentType, customerPhone, customerName } = body;

  if (!showtimeId || !seats || !total || !paymentType) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const showtime = await prisma.showtime.findUnique({ where: { id: showtimeId } });
  if (!showtime) return NextResponse.json({ error: "Showtime tidak ditemukan" }, { status: 404 });

  const showtimeDate = new Date(showtime.startTime);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (!(showtimeDate >= today && showtimeDate < tomorrow)) {
    return NextResponse.json({ error: "Hanya bisa menjual tiket untuk hari ini" }, { status: 400 });
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        showtimeId,
        seats,
        totalPrice: total,
        // --- PERBAIKAN DI SINI ---
        // Ubah input 'cash'/'debit' menjadi 'CASH'/'DEBIT'
        paymentMethod: paymentType.toUpperCase() as PaymentMethod,
        // -------------------------
        customerPhone: customerPhone || null,
        customerName: customerName || null,
        status: "COMPLETED", // Langsung gunakan string yang sesuai dengan enum
      },
    });
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat transaksi:", error);
    return NextResponse.json({ error: "Gagal memproses transaksi" }, { status: 500 });
  }
}

// PUT: batalkan transaksi
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "ID transaksi dibutuhkan" }, { status: 400 });
  }

  try {
    const transaction = await prisma.transaction.update({
      where: { id },
      data: { status: "CANCELLED" }, // Gunakan string yang sesuai dengan enum
    });
    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Gagal membatalkan transaksi:", error);
    return NextResponse.json({ error: "Transaksi tidak ditemukan atau gagal diupdate" }, { status: 404 });
  }
}