import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Class name is required" }, { status: 400 });
    }

    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: { name: name.trim() },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.class.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete class. It may have associated students or payments attached." }, { status: 500 });
  }
}
