import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: ambil semua member
export async function GET(req: NextRequest) {
  try {
    const members = await prisma.user.findMany({
      where: { role: "MEMBER" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(members);
  } catch (err) {
    return NextResponse.json({ error: "Gagal mengambil data member" }, { status: 500 });
  }
}

// POST: tambah user/member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, role } = body;

    const user = await prisma.user.create({
      data: { name, email, phone, role },
    });

    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

