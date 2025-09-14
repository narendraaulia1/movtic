import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET semua member
export async function GET(req: NextRequest) {
  try {
    const members = await prisma.user.findMany({
      where: { role: "MEMBER" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(members);
  } catch (err) {
    const error = err instanceof Error ? err.message : "Gagal mengambil data member";
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST tambah member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, role, password } = body; // tambahkan password

    const user = await prisma.user.create({
      data: { name, email, phone, role, password },
    });

    return NextResponse.json(user);
  } catch (err) {
    const error = err instanceof Error ? err.message : "Gagal menambah member";
    return NextResponse.json({ error }, { status: 500 });
  }
}
