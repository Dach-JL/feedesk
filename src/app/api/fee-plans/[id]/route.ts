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
    const { name, amount, dueDate, classId } = body;

    // Build the update object dynamically
    const dataToUpdate: any = {};
    if (name && name.trim() !== "") dataToUpdate.name = name.trim();
    if (typeof amount === 'number' && amount > 0) dataToUpdate.amount = amount;
    if (dueDate) dataToUpdate.dueDate = new Date(dueDate);
    if (classId !== undefined) dataToUpdate.classId = classId || null;

    const updatedFeePlan = await prisma.feePlan.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: { class: true }
    });

    return NextResponse.json(updatedFeePlan);
  } catch {
    return NextResponse.json({ error: "Failed to update fee plan" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.feePlan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Fee plan deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete fee plan. It may have associated payments attached." }, { status: 500 });
  }
}
