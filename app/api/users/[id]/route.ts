import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: any) {
  try {
    const { id } = context.params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Gagal menghapus user";
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: any) {
  try {
    const { id } = context.params;
    const body = await req.json();
    const { name, email, phone, role, password } = body;

    const user = await prisma.user.update({
      where: { id },
      data: { name, email, phone, role, password },
    });

    return NextResponse.json(user);
  } catch (err) {
    const error = err instanceof Error ? err.message : "Gagal mengupdate user";
    return NextResponse.json({ error }, { status: 500 });
  }
}
