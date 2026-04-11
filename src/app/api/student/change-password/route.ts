import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "student" || !session.user.studentId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
    }

    const studentId = session.user.studentId;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || !student.password) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, student.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.student.update({
      where: { id: studentId },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
