import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, classId, password } = body;

    const dataToUpdate: Record<string, string | null> = {};
    if (name && name.trim() !== "") dataToUpdate.name = name.trim();
    if (email !== undefined) dataToUpdate.email = email && email.trim() !== "" ? email.trim() : null;
    if (classId) dataToUpdate.classId = classId;
    
    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedStudent = await prisma.student.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: { class: true }
    });

    return NextResponse.json(updatedStudent);
  } catch {
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.student.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete student. Financial records might be attached." }, { status: 500 });
  }
}
