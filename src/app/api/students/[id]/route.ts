import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        class: true,
        assignments: {
          include: {
            feePlan: true,
            payments: {
              orderBy: { paymentDate: "desc" },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("[STUDENT_GET_ID_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch student details" }, { status: 500 });
  }
}

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
